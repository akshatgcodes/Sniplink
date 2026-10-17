<p align="center">
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"
       fill="none" stroke="#ff5a1f" stroke-width="1.5"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
</p>

<h1 align="center">Sniplink</h1>

<p align="center">
  <strong>A self-hosted URL shortener with free link expiry (by days or clicks), per-link QR codes and a hit-tracking dashboard.</strong>
</p>

<p align="center">
  <a href="https://sniplink.akshatgcodes.in">
    <img src="https://img.shields.io/badge/live_demo-ff5a1f-ff5a1f?style=flat-square" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/license-GPL--3.0-ff5a1f?style=flat-square" alt="License">
</p>

---

## What is Sniplink?

Sniplink turns a long URL into a short one that redirects instantly and counts every click. Most hosted shorteners charge for link expiry and QR codes; Sniplink gives you both. A link can die after N days, after N clicks, or whichever comes first, and every link comes with a downloadable QR code generated on the server.

> **Live demo →** [sniplink.akshatgcodes.in](https://sniplink.akshatgcodes.in)
> Shorten a link straight from the landing page. No sign-up needed.

---

## What you get

- **Expiry by days or clicks** — checked on every visit. An expired link shows an "expired" page (HTTP 410) instead of redirecting.
- **QR codes** — a PNG for every short link, built in memory with `qrcode`, with a one-click download.
- **Hit tracking** — click count, last access time and last referrer per link.
- **Dashboard** — every link with its status. A sweep on load deactivates anything that expired while nobody was looking.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Jinja2 templates · plain CSS · Next.js 16 static landing page |
| Backend | Python · Flask 3 · `qrcode` + Pillow |
| Database | PostgreSQL (Neon) via psycopg 3 · SQLite fallback for local dev |
| Infra | Vercel (Python function + static landing) · GoDaddy DNS |

---

## Engineering Decisions

**Why check expiry on access instead of with a cron job?**
Every redirect checks the date and click limits before redirecting, and the dashboard sweeps stale links when it loads. That keeps `is_active` accurate without a background worker, which a serverless host doesn't offer anyway.

**Why one SQL layer for both SQLite and Postgres?**
A thin `PostgresConnection` wrapper rewrites `?` placeholders to `%s` and returns dict rows, so every query in the app is written once and works on both databases.

**Why `ProxyFix`?**
Short URLs and QR codes are built with `url_for(..., _external=True)`. Behind Vercel's proxy, Flask would otherwise build `http://` links on the internal host.

**What would you do differently in v2?**
Add accounts so each person's dashboard shows only their own links, plus rate limiting on link creation. Right now the demo dashboard is public.

---

## Docs

| Document | Description |
|---|---|
| [PRD](docs/PRD.md) | Product requirements — goals, user stories, non-goals |
| [Architecture](docs/ARCHITECTURE.md) | System design, data flow, component breakdown |
| [Decisions](docs/DECISIONS.md) | Every major technical decision and why |
| [Setup](docs/SETUP.md) | Local dev setup and env vars |
| [Deploy](docs/DEPLOY.md) | Production deployment, domains, rollback |
| [Contributing](CONTRIBUTING.md) | How to propose changes |
| [Changelog](CHANGELOG.md) | What changed in each release |
| [Security](SECURITY.md) | How to report a vulnerability |

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
