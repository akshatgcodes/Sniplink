# Engineering Decisions — Sniplink

---

## Decision 1 — Expiry checked on access, plus a sweep on dashboard load

**Context:** Links need to stop working once they pass their date or click limit, and the dashboard should show the right status.

**Decision:** Every visit to `/<code>` runs `is_expired()` before redirecting, and `/dashboard` runs one `UPDATE` that deactivates every active link past either limit.

**Reason:** A link can only be misused when someone visits it, so checking on access is enough to enforce expiry. The sweep catches links that expired while nobody visited. Neither needs a scheduler, and a serverless host doesn't offer one.

**Tradeoff:** `is_active` can be out of date in the database until the next visit or dashboard load. It's never wrong for an actual redirect.

---

## Decision 2 — Deactivate on the click that hits the limit

**Context:** With a 1-click limit, the first click should work and the second should be refused.

**Decision:** After counting a click, the app re-reads the row and deactivates it if `hit_count >= max_clicks`. Expired links are also flipped to inactive the first time they're seen.

**Reason:** Once inactive, a link stays dead even if its settings later look ambiguous, for example after a clock change.

**Tradeoff:** The read-increment-read sequence isn't atomic. Two simultaneous clicks on a 1-click link could both succeed. An `UPDATE ... RETURNING` would fix it (see v2).

---

## Decision 3 — One SQL dialect, two databases

**Context:** Production runs on Vercel, where a local SQLite file doesn't survive between invocations. Local development should still need no setup.

**Decision:** Keep the raw-SQL style and add a thin `PostgresConnection` wrapper that rewrites `?` to `%s` and returns dict rows. `DATABASE_URL` picks Postgres, and its absence picks SQLite.

**Reason:** Every query stays exactly as written, and the app runs with no database server locally. Timestamps are ISO strings, so the same comparisons work in both.

**Tradeoff:** The placeholder rewrite is a plain string replace, so a literal `?` inside a SQL string would break. None of the queries have one.

---

## Decision 4 — QR codes generated in memory

**Context:** Every link needs a QR code, both inline and as a download.

**Decision:** `qrcode.make()` renders into an `io.BytesIO` buffer that's streamed straight back with `send_file`.

**Reason:** No files are written, so it works on read-only serverless filesystems. There's also no third-party QR service and no watermark.

**Tradeoff:** The PNG is regenerated on every request. That's cheap at this scale, and caching would be the next step.

---

## Decision 5 — Landing page and app on one Vercel project

**Context:** The landing page used to be a separate site that only described the app.

**Decision:** One Vercel project. `vercel.json` serves the static landing page at `/`, and the app's shorten form moved to `/app`. The landing page has its own form that posts to `/app`.

**Reason:** Visitors can shorten a link from the first page they see, on one domain. Static routes like `/app` and `/dashboard` always win over `/<code>`, so the move is safe.

**Tradeoff:** It uses Vercel's legacy `builds` config, which shows a warning on deploy.

---

## What I'd do differently in v2

- **Accounts** — the public dashboard shows every link to everyone. Per-user dashboards should come first.
- **Rate limiting** — an open shortener is a phishing tool waiting to happen.
- **`secrets.choice` for codes** — `random` is fine for collision avoidance but not for unguessable links.

---

## Explicit non-decisions (deferred to v2)

| Feature | Why deferred |
|---|---|
| Custom aliases | Needs reserved-word checks (`app`, `dashboard`, `qr`) and abuse filtering |
| Link editing | Changing a destination after sharing is a trust problem. Create a new link instead |
| Geo / device analytics | Needs IP lookups and a privacy policy |

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
