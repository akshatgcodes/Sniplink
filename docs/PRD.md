# Sniplink — Product Requirements Document

**Status:** Final (v1 shipped)
**Owner:** Akshat Gupta
**One-liner:** A self-hosted URL shortener with free link expiry (by days or clicks), per-link QR codes and a hit-tracking dashboard.

---

## 1. Problem

Sharing a long URL is clumsy, and the popular shorteners lock the useful extras behind a subscription. You can't make a link stop working after an event, cap how many times it's used, or download a clean QR code without paying. For one-off shares like an event form, a temporary download or a limited invite, those are exactly the features that matter.

---

## 2. Goals (v1)

1. Turn any `http://` or `https://` URL into a 6-character short link that redirects with HTTP 302.
2. Optionally expire a link after N days, after N clicks, or whichever comes first.
3. Generate a QR code PNG for every link, viewable inline and downloadable.
4. Track hit count, last access time and last referrer per link.
5. List every link and its status on a dashboard.
6. Live, usable demo at [sniplink.akshatgcodes.in](https://sniplink.akshatgcodes.in).

---

## 3. Non-Goals (explicit scope cuts)

- **User accounts** — v1 is single-tenant, the way a self-hosted tool usually is. The public demo shares one dashboard.
- **Custom aliases** — codes are random. Picking your own needs collision handling and abuse checks.
- **Analytics beyond the basics** — no geo, device or time-series charts, just count, last time and last referrer.
- **Editing links** — create a new one instead.

---

## 4. Users

**Primary:** Someone self-hosting a shortener for their own links who wants expiry and QR codes without a paid plan.

**Secondary:** Recruiters and engineers trying the live demo. They can shorten a link from the landing page in one step.

---

## 5. User Stories

1. *As a user,* I paste a long URL and get a short link so that it's easy to share.
2. *As a user,* I set a link to expire after 7 days so that it stops working after the event.
3. *As a user,* I set a link to expire after 1 click so that it works as a one-time link.
4. *As a user,* I download a QR code for my link so that people can scan it from a poster or slide.
5. *As a user,* I open the dashboard so that I can see how many times each link was used and where it was clicked from.
6. *As a visitor,* I open an expired link and see a clear "expired" page instead of a broken redirect.

---

## 6. Functional Requirements

### 6.1 Shortening

- The URL must start with `http://` or `https://`, otherwise the form shows an error.
- Expiry days and clicks are optional whole numbers. Values of 0 or less are ignored, and non-numbers show an error.
- Codes are 6 characters from `[A-Za-z0-9]`, unique in the database. After 50 collisions the length grows by one.

### 6.2 Redirects

- `GET /<code>` returns 404 for unknown codes.
- If the link is expired by date or clicks, or inactive, it returns the expired page with HTTP 410 and marks the link inactive.
- Otherwise it increments `hit_count`, stores the time and `Referer` header (or "Direct / unknown"), and redirects with 302.
- If that click reaches the click limit, the link is deactivated, so the next visit is expired.

### 6.3 QR codes

- `GET /qr/<code>` returns the PNG inline. `GET /qr/<code>/download` returns it as `sniplink-<code>.png`.
- The QR code encodes the full public short URL.

### 6.4 Dashboard

- Lists every link, newest first, with its short URL, original URL, hit count, last access, last referrer, expiry settings and status.
- Deactivates any link whose expiry conditions are met before rendering.

---

## 7. Non-Functional Requirements

- **Latency:** A redirect is two indexed lookups and one update, so it feels instant once the database is awake.
- **Correctness:** The click limit is exact. The click that reaches the limit succeeds, and the next one gets 410.
- **Portability:** The same code runs on Postgres in production and SQLite locally.
- **Cost:** Free tiers only (Vercel + Neon). QR codes are generated locally, with no third-party service.

---

## 8. Success Metrics

| Metric | Target |
|---|---|
| Landing → working short link | One form submit |
| Expiry correctness | A 1-click link redirects once, then returns 410 |
| QR codes | Scanning the PNG opens the short link on the public domain (https) |

---

## 9. Risks & Open Questions

- **Abuse** — anyone can create links to any URL, which a phishing campaign could misuse. There's no rate limiting or URL reputation check yet.
- **Public dashboard** — on the demo, everyone sees everyone's links. Fine for a demo, not for real use.
- **Concurrent clicks** — two simultaneous clicks on a 1-click link could both redirect, because the check and increment aren't one atomic statement.

---

## 10. v2 Candidates

- Accounts, so each user sees only their own links.
- Rate limiting on `POST /app`.
- An atomic `UPDATE ... WHERE hit_count < max_clicks RETURNING` for exact click limits under concurrency.
- Custom aliases.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
