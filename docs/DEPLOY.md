# Deploying Sniplink

> **Live:** [sniplink.akshatgcodes.in](https://sniplink.akshatgcodes.in) · **Host:** Vercel · **Auto-deploy:** on push to `master`

For local development, see [SETUP.md](SETUP.md).

---

## 1. Architecture in production

| Piece | Runs on | Notes |
|---|---|---|
| Landing page | Vercel (static) | `landing/` built with `@vercel/static-build`, served at `/` |
| Flask app | Vercel (Python function) | `app.py` through `@vercel/python`; handles `/app`, `/<code>`, `/qr/*`, `/dashboard` |
| Database | Neon Postgres | Free tier, `aws-ap-southeast-1`; compute sleeps after 5 min idle |
| DNS | GoDaddy | `sniplink.akshatgcodes.in` → CNAME to Vercel |

---

## 2. Environment variables

Set this in Vercel → Project `sniplink` → Settings → Environment Variables (Production and Preview). The name is also in [`.env.example`](../.env.example).

| Variable | Required | Where it's set |
|---|---|---|
| `DATABASE_URL` | ✅ | Vercel env vars. Neon connection string. Without it, links would go to an ephemeral SQLite file and be lost |

> After changing an env var, **redeploy**. Running deployments don't pick up new values.

---

## 3. First-time deploy

1. [vercel.com/new](https://vercel.com/new) → import `akshatgcodes/Sniplink`
2. Framework preset: **Other** · Root directory: `./` (the repo's `vercel.json` defines the builds)
3. Add `DATABASE_URL`
4. Deploy. Every push to `master` now deploys to production, and every PR gets a preview URL.

---

## 4. Database migrations

There's no migration tool. `init_db()` runs `CREATE TABLE IF NOT EXISTS` on every cold start. A schema change needs a manual `ALTER TABLE` on Neon before deploying.

---

## 5. Custom domain

`sniplink.akshatgcodes.in` is set up with the setup toolkit:

```powershell
.\scripts\setup-subdomain.ps1 -Subdomain "sniplink" -Platform Vercel -VercelProject "sniplink"
```

Manual fallback: add the domain in Vercel → Project → Domains, then create a GoDaddy CNAME `sniplink` → the target Vercel shows. HTTPS certificates are issued automatically once DNS resolves (2–10 min).

---

## 6. Verify a deploy

- [ ] `https://sniplink.akshatgcodes.in` loads the landing page with the shorten form
- [ ] Shortening a URL returns an `https://sniplink.akshatgcodes.in/<code>` link and a QR code
- [ ] A 1-click link redirects once, then shows the expired page
- [ ] `/dashboard` lists the link with its hit count

---

## 7. Rollback

| Host | How |
|---|---|
| Vercel | Dashboard → Deployments → pick the last good one → **Promote to Production** (or `vercel rollback`) |
| Database | Neon → Branches → restore from a point in time |

After rolling back, note it in a commit or PR so the next push doesn't silently re-ship the broken version.

---

## 8. Monitoring & logs

- **Logs:** Vercel → Project `sniplink` → Logs
- **Errors:** none yet beyond Vercel's function logs
- **Uptime:** none yet
- **Dependencies:** Dependabot opens weekly update PRs and a maintenance report is emailed every week (see `.github/workflows/`)

---

## Known production limitations

- The first request after Neon has been idle for 5+ minutes is slower while the database wakes up.
- The demo dashboard is public and shows every link created on the site.
- Vercel prints a warning about the legacy `builds` config on every deploy. It's expected.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
