"""
Sniplink - a self-hosted URL shortener with free link expiry (by days and/or
clicks) and per-link QR code generation.

Run with:
    pip install -r requirements.txt
    python app.py
Then open http://localhost:5000
"""
import io
import os
import random
import sqlite3
import string
from datetime import datetime, timedelta

import qrcode
from flask import (
    Flask,
    abort,
    g,
    redirect,
    render_template,
    request,
    send_file,
    url_for,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "sniplink.db")
CODE_ALPHABET = string.ascii_letters + string.digits
CODE_LENGTH = 6

app = Flask(__name__)
app.config["DATABASE"] = DATABASE


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------
def get_db():
    """Return a per-request sqlite3 connection (rows behave like dicts)."""
    if "db" not in g:
        g.db = sqlite3.connect(app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(database_path=None):
    """Create the links table if it doesn't already exist."""
    path = database_path or app.config["DATABASE"]
    conn = sqlite3.connect(path)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            original_url TEXT NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT,
            max_clicks INTEGER,
            hit_count INTEGER NOT NULL DEFAULT 0,
            last_accessed_at TEXT,
            last_referrer TEXT,
            is_active INTEGER NOT NULL DEFAULT 1
        )
        """
    )
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Short code generation
# ---------------------------------------------------------------------------
def generate_code(db, length=CODE_LENGTH):
    """Generate a short code that isn't already used in the DB."""
    for _ in range(50):
        code = "".join(random.choices(CODE_ALPHABET, k=length))
        existing = db.execute(
            "SELECT 1 FROM links WHERE code = ?", (code,)
        ).fetchone()
        if not existing:
            return code
    # Extremely unlikely fallback: widen the code.
    return generate_code(db, length=length + 1)


# ---------------------------------------------------------------------------
# Expiry logic
# ---------------------------------------------------------------------------
def is_expired(link):
    """Check whether a link row is expired by date or by click count."""
    if not link["is_active"]:
        return True
    if link["expires_at"]:
        expires_at = datetime.fromisoformat(link["expires_at"])
        if datetime.utcnow() >= expires_at:
            return True
    if link["max_clicks"] is not None and link["hit_count"] >= link["max_clicks"]:
        return True
    return False


def deactivate(db, link_id):
    db.execute("UPDATE links SET is_active = 0 WHERE id = ?", (link_id,))
    db.commit()


def sweep_expired_links(db):
    """Deactivate any link whose expiry conditions have been met.

    Called on dashboard load to keep is_active accurate even for links
    nobody has clicked since they expired (a lightweight stand-in for a
    scheduled background job).
    """
    now_iso = datetime.utcnow().isoformat()
    db.execute(
        """
        UPDATE links
        SET is_active = 0
        WHERE is_active = 1
          AND (
                (expires_at IS NOT NULL AND expires_at <= ?)
                OR (max_clicks IS NOT NULL AND hit_count >= max_clicks)
              )
        """,
        (now_iso,),
    )
    db.commit()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/", methods=["GET", "POST"])
def index():
    db = get_db()
    short_url = None
    qr_url = None
    error = None

    if request.method == "POST":
        original_url = (request.form.get("original_url") or "").strip()
        expiry_days_raw = (request.form.get("expiry_days") or "").strip()
        expiry_clicks_raw = (request.form.get("expiry_clicks") or "").strip()

        if not original_url:
            error = "Please enter a URL to shorten."
        elif not (
            original_url.startswith("http://") or original_url.startswith("https://")
        ):
            error = "URL must start with http:// or https://"
        else:
            expires_at = None
            max_clicks = None
            try:
                if expiry_days_raw:
                    days = int(expiry_days_raw)
                    if days > 0:
                        expires_at = (
                            datetime.utcnow() + timedelta(days=days)
                        ).isoformat()
                if expiry_clicks_raw:
                    clicks = int(expiry_clicks_raw)
                    if clicks > 0:
                        max_clicks = clicks
            except ValueError:
                error = "Expiry days/clicks must be whole numbers."

            if not error:
                code = generate_code(db)
                db.execute(
                    """
                    INSERT INTO links
                        (code, original_url, created_at, expires_at, max_clicks,
                         hit_count, is_active)
                    VALUES (?, ?, ?, ?, ?, 0, 1)
                    """,
                    (code, original_url, datetime.utcnow().isoformat(), expires_at, max_clicks),
                )
                db.commit()
                short_url = url_for("redirect_short_link", code=code, _external=True)
                qr_url = url_for("qr_code", code=code)

    return render_template(
        "index.html", short_url=short_url, qr_url=qr_url, error=error
    )


@app.route("/<code>")
def redirect_short_link(code):
    db = get_db()
    link = db.execute("SELECT * FROM links WHERE code = ?", (code,)).fetchone()

    if link is None:
        abort(404)

    if is_expired(link):
        if link["is_active"]:
            deactivate(db, link["id"])
        return render_template("expired.html", link=link), 410

    referrer = request.headers.get("Referer", "Direct / unknown")
    db.execute(
        """
        UPDATE links
        SET hit_count = hit_count + 1,
            last_accessed_at = ?,
            last_referrer = ?
        WHERE id = ?
        """,
        (datetime.utcnow().isoformat(), referrer, link["id"]),
    )
    db.commit()

    # Re-check: if this click itself hit the max_clicks ceiling, deactivate
    # so the NEXT access shows the expired page.
    updated = db.execute("SELECT * FROM links WHERE id = ?", (link["id"],)).fetchone()
    if updated["max_clicks"] is not None and updated["hit_count"] >= updated["max_clicks"]:
        deactivate(db, link["id"])

    return redirect(link["original_url"], code=302)


def _build_qr_png(code):
    db = get_db()
    link = db.execute("SELECT * FROM links WHERE code = ?", (code,)).fetchone()
    if link is None:
        abort(404)
    short_url = url_for("redirect_short_link", code=code, _external=True)
    img = qrcode.make(short_url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


@app.route("/qr/<code>")
def qr_code(code):
    """Inline PNG, used as the <img> preview on the page."""
    buf = _build_qr_png(code)
    return send_file(buf, mimetype="image/png")


@app.route("/qr/<code>/download")
def qr_code_download(code):
    """Same PNG, forced as a downloadable attachment."""
    buf = _build_qr_png(code)
    return send_file(
        buf,
        mimetype="image/png",
        as_attachment=True,
        download_name=f"sniplink-{code}.png",
    )


@app.route("/dashboard")
def dashboard():
    db = get_db()
    sweep_expired_links(db)
    rows = db.execute("SELECT * FROM links ORDER BY id DESC").fetchall()

    links = []
    for row in rows:
        link = dict(row)
        link["expired"] = is_expired(row)
        link["short_url"] = url_for(
            "redirect_short_link", code=row["code"], _external=True
        )
        links.append(link)

    return render_template("dashboard.html", links=links)


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
else:
    # Ensure the DB/table exist when imported (e.g. by tests) too.
    init_db()

# Built incrementally - see git history for the development progression.
