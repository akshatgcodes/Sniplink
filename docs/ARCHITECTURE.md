# Sniplink — Architecture

---

## 1. Stack

| Layer | Tech |
|---|---|
| Framework | Flask 3 (Python 3.12 on Vercel) |
| Database | PostgreSQL on Neon via psycopg 3 (production) · `sqlite3` file (local fallback) |
| QR codes | `qrcode` + Pillow, rendered to an in-memory PNG |
| Templates | Jinja2 · plain CSS (`static/style.css`) |
| Landing page | Next.js 16 static export (`landing/`) · Tailwind CSS 4 |
| Hosting | Vercel: `@vercel/python` for Flask, `@vercel/static-build` for the landing page |

---

## 2. Components

```
app.py            everything server-side: DB layer, code generation, expiry, routes, QR
templates/        base layout, shorten form (index), dashboard, expired page
static/style.css  app styling
landing/          Next.js landing page with a live shorten form, exported to static HTML
vercel.json       routes "/" to the landing page and everything else to Flask
```

### Database layer

`connect()` returns a `PostgresConnection` when `DATABASE_URL` is set, and a `sqlite3` connection otherwise. The Postgres wrapper exposes the same `execute / commit / close` calls, rewrites `?` placeholders to `%s`, and uses psycopg's `dict_row` so rows behave like `sqlite3.Row`. One connection per request lives on `flask.g` and is closed in `teardown_appcontext`.

`init_db()` runs at import time and creates the `links` table if it's missing. The id column is `SERIAL PRIMARY KEY` on Postgres and `INTEGER PRIMARY KEY AUTOINCREMENT` on SQLite.

### Code generation

`generate_code()` draws 6 characters from `[A-Za-z0-9]` and retries up to 50 times on collision, then grows the length by one.

### Expiry

- `is_expired(link)` — true if the link is inactive, its `expires_at` has passed, or `hit_count >= max_clicks`.
- `sweep_expired_links()` — a single `UPDATE` that deactivates every active link past either limit. Runs on dashboard load.

### Proxy awareness

`ProxyFix(x_proto=1, x_host=1)` makes `url_for(..., _external=True)` use the public `https://sniplink.akshatgcodes.in` host behind Vercel's proxy.

---

## 3. Data Flow

```
[Landing form] POST /app (original_url, expiry_days?, expiry_clicks?)
    --> validate --> generate_code --> INSERT links --> render short URL + QR

[Visitor] GET /<code>
    --> SELECT link
        --> missing?   404
        --> expired?   mark inactive --> 410 expired.html
        --> else       hit_count+1, last_accessed_at, last_referrer
                       --> limit reached by this click? mark inactive
                       --> 302 to original_url
```

1. The landing page's form posts straight to `/app` on the same domain.
2. The app validates the URL and expiry fields, picks a unique code and stores the row.
3. The result page shows the short URL and an inline QR code from `/qr/<code>`.
4. Each visit to `/<code>` runs the expiry check before counting and redirecting.
5. The dashboard sweeps expired links and lists them all.

---

## 4. Database Schema

- `links` — `id`, `code` (unique), `original_url`, `created_at`, `expires_at` (ISO text, nullable), `max_clicks` (nullable), `hit_count` (default 0), `last_accessed_at`, `last_referrer`, `is_active` (default 1)

Timestamps are stored as ISO-8601 UTC strings. They sort and compare correctly as text, so the same SQL works on SQLite and Postgres.

**Indexes:** the `UNIQUE` constraint on `code` gives the index that every redirect lookup uses.

---

## 5. Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Landing page in production. Locally, redirects to `/app` |
| `GET/POST` | `/app` | Shorten form and result (short URL + QR) |
| `GET` | `/<code>` | Redirect, or 404 / 410 |
| `GET` | `/qr/<code>` | QR code PNG, inline |
| `GET` | `/qr/<code>/download` | QR code PNG as an attachment |
| `GET` | `/dashboard` | All links with stats, after an expiry sweep |

Werkzeug matches static paths (`/app`, `/dashboard`) before the `/<code>` variable route, so a code can never shadow them.

---

## 6. Security

- **Input:** only `http://` and `https://` URLs are accepted, so `javascript:` and `data:` links can't be stored.
- **SQL:** every query is parameterised. No string-built SQL with user input.
- **Secrets:** `DATABASE_URL` is a Vercel env var. `.env*` files are gitignored.
- **Templates:** Jinja2 autoescaping renders stored URLs and referrers as text.
- **Known gaps:** no rate limiting, no auth on the dashboard, and codes come from `random`, not `secrets`. With 62⁶ possible codes, guessing a specific one is impractical, but the dashboard lists them all anyway.

---

## 7. Error Handling & Reliability

| Failure | Behaviour |
|---|---|
| Invalid URL or expiry input | Error message on the form, nothing stored |
| Unknown code | 404 |
| Expired link | 410 with the expired page; link marked inactive |
| Code collision | Retried up to 50 times, then the code gets longer |
| Database unreachable | 500; Vercel logs the traceback |

---

## 8. Deployment

1. The Vercel project `sniplink` is linked to `akshatgcodes/Sniplink` and deploys every push to `master`.
2. `vercel.json` builds `landing/` as a static export served at `/`, serves `static/**` as files, and sends everything else to `app.py`.
3. `DATABASE_URL` points at the Neon project `sniplink`.
4. The table is created on cold start by `init_db()`.

Full steps are in [DEPLOY.md](DEPLOY.md).

---

## 9. Explicit Scope Cuts

- **Accounts** — single shared dashboard in v1.
- **Background jobs** — expiry runs on access and on dashboard load instead.
- **Rich analytics** — count, last time and last referrer only.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
