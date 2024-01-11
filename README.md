# Sniplink

A self-hosted URL shortener built with Flask and SQLite. Paste any long URL
and get a short alias back. Clicking the short link redirects (HTTP 302) to
the original, while Sniplink quietly tracks hit count, last-accessed time,
and referrer for every link.

## The X factor: free link expiry + free QR codes

Bit.ly and friends put both of these behind a paywall. Sniplink gives them
to you for nothing, because it's your server:

- **Link expiry.** When you create a link you can optionally set it to
  auto-expire after **N days**, **N clicks**, or both (whichever limit is
  hit first wins). Expiry is checked on every single access — by comparing
  the current time against the stored expiry timestamp *and* by comparing
  the click count against the stored click limit. Once a link is expired,
  visiting it no longer redirects: instead it renders a clean "this link
  has expired" page, and the link is marked inactive in the database so it
  stays dead even if the expiry conditions later look ambiguous.
- **QR codes.** Every short link gets a one-click, downloadable PNG QR code
  (generated on the fly with the `qrcode` library) that encodes the short
  URL — no third-party QR service, no watermark, no premium tier.

## How it works

1. Start the app and open `http://localhost:5000`.
2. Paste a long URL into the form. Optionally set an expiry in days and/or
   a click limit.
3. Submit to get back a short link (`http://localhost:5000/<code>`) and a
   QR code image with a "Download QR (PNG)" button.
4. Visit `/dashboard` to see every link you've created, its hit count,
   last-accessed time, last referrer, and whether it's still active or has
   expired.
5. Links that have expired (by date or click count) automatically show an
   "expired" page instead of redirecting, and flip to inactive in the
   database — both the moment they're visited past expiry, and via a sweep
   that runs whenever the dashboard loads.

## Key concepts demonstrated

- **Flask routing + HTTP 302 redirects** — `/` (create), `/<code>`
  (redirect), `/qr/<code>` and `/qr/<code>/download` (QR image), and
  `/dashboard` (list view).
- **SQLite storage** via the raw `sqlite3` module, with a schema
  (`links` table) that includes `expires_at`, `max_clicks`, `hit_count`,
  `last_accessed_at`, `last_referrer`, and `is_active` fields.
- **QR code generation** with the `qrcode` library, streamed straight out
  of memory (`io.BytesIO`) as a PNG — no files written to disk.
- **Scheduled / on-access expiry checks** — expiry is evaluated both
  lazily (every time a short link is visited) and via a sweep on dashboard
  load, so `is_active` never drifts far from reality without needing an
  external cron process.
- **Jinja2 templates + basic CSS** — a shared `base.html` layout with
  `index.html` (shortener form + result), `dashboard.html` (links table),
  and `expired.html` (expired-link page), styled with a single
  `static/style.css`.

## Run it

Requires Python 3.8+.

```bash
cd "Sniplink"
pip install -r requirements.txt
python app.py
```

Then open **http://localhost:5000** in your browser.

The SQLite database (`sniplink.db`) is created automatically on first run
in the project directory, and is git-ignored.

## Project structure

```
Sniplink/
├── app.py              # Flask app: routes, DB access, expiry + QR logic
├── requirements.txt
├── templates/
│   ├── base.html
│   ├── index.html       # shorten form + result (short link + QR)
│   ├── dashboard.html    # all links, hit counts, expiry status
│   └── expired.html      # shown instead of redirecting once expired
├── static/
│   └── style.css
└── .gitignore
```
