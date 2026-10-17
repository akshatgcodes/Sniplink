# Local Setup — Sniplink

> **Just want to try it?** Use the live demo at [sniplink.akshatgcodes.in](https://sniplink.akshatgcodes.in). No setup or sign-up needed.
> This guide is for running Sniplink locally or self-hosting it.

---

## Prerequisites

- Python 3.8+
- PostgreSQL, optional. Without it, the app uses a local SQLite file.
- Node.js 20+, only if you want to build the landing page

---

## 1. Clone and install

```bash
git clone https://github.com/akshatgcodes/Sniplink
cd Sniplink
pip install -r requirements.txt
```

---

## 2. Environment variables

There's nothing to set for local development. To use Postgres instead of SQLite, export one variable before starting the app:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Optional. A Postgres URL, for example a [Neon](https://neon.tech) connection string. Leave it unset to use `sniplink.db` |

```bash
export DATABASE_URL="postgresql://user:pass@host/sniplink"
```

---

## 3. Database setup

There's nothing to run. `init_db()` creates the `links` table on startup, either in `sniplink.db` in the project folder (gitignored) or in your Postgres database.

---

## 4. Run locally

```bash
python app.py
```

Open `http://localhost:5000`. Locally, `/` redirects to the shorten form at `/app`, since the landing page is only built at deploy time. The dashboard is at `/dashboard`.

To preview the landing page:

```bash
cd landing && npm install && npm run dev   # http://localhost:3000
```

Set `FLASK_DEBUG=1` to run with the debugger and auto-reload.

---

## 5. Deploy to production

See [DEPLOY.md](DEPLOY.md) for production deployment, custom domain and rollback steps.

---

## Testing

There's no automated test suite yet. CI checks that every Python file compiles and that the landing page lints and builds. To check a change by hand: create a link with a 1-click limit, open it once (it redirects), open it again (expired page), and check the dashboard shows it as inactive.

---

## Known local-only limitations

- `/` doesn't show the landing page locally. In production `vercel.json` routes it to the static export.
- Short links and QR codes use `http://localhost:5000` locally, and the public `https://` host in production.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
