import { LinkCard } from "./components/LinkCard";
import { QrMock } from "./components/QrMock";

const TECH_BADGES = [
  "Flask",
  "SQLite",
  "Jinja2",
  "qrcode",
  "302 Redirects",
  "Scheduled Expiry Checks",
  "Python 3",
];

const X_FACTORS = [
  {
    title: "Link expiry, on your terms",
    tag: "01 · Expiry",
    body:
      "Every link can carry an expiration rule — after N days, after N clicks, or both. Once a link crosses its limit, Sniplink stops redirecting and serves a clean, branded &ldquo;expired&rdquo; page instead of leaving a dead link out in the world.",
    points: [
      "Expire by absolute date (e.g. 7, 30, 90 days)",
      "Expire by click count (e.g. after 500 hits)",
      "A scheduled check flips status without manual cleanup",
    ],
  },
  {
    title: "QR codes, one click, free",
    tag: "02 · QR Codes",
    body:
      "Every short link gets an auto-generated QR code the moment it's created, ready to drop into a poster, slide deck, or packaging insert — no watermark, no paywall, no \"upgrade to download.\"",
    points: [
      "Generated instantly via the qrcode library",
      "Downloadable as PNG straight from the dashboard",
      "Scans through to the same expiry-aware redirect",
    ],
  },
];

export default function Home() {
  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
              S
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Sniplink
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-foreground/60">
            <a href="#x-factor" className="hover:text-foreground">
              X Factor
            </a>
            <a href="#dashboard" className="hover:text-foreground">
              Dashboard
            </a>
            <a href="#run-it" className="hover:text-foreground">
              Run it
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-grid relative overflow-hidden border-b border-border-subtle">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-24 sm:py-32">
          <span className="rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-foreground/60">
            Self-hosted · Flask + SQLite
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Short links with an{" "}
            <span className="text-accent">expiration date.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-foreground/65">
            Sniplink is a self-hosted URL shortener. Paste a long URL, get a
            short alias that redirects instantly, and track hit counts, last
            access time, and referrers per link — all from your own server,
            your own database.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#dashboard"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              See the dashboard
            </a>
            <a
              href="#run-it"
              className="rounded-full border border-border-subtle px-5 py-2.5 text-sm font-semibold text-foreground/80 transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Run it locally
            </a>
          </div>
        </div>
      </section>

      {/* X Factor */}
      <section id="x-factor" className="border-b border-border-subtle">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-12 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              The X Factor
            </span>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              The two features Bit.ly puts behind a paywall
            </h2>
            <p className="max-w-2xl text-foreground/60">
              Most shorteners stop at &ldquo;make it short.&rdquo; Sniplink
              adds the two things people actually pay for elsewhere — links
              that expire on their own, and QR codes that don&apos;t cost
              extra.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {X_FACTORS.map((factor) => (
              <div
                key={factor.title}
                className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-7"
              >
                <span className="font-mono text-xs font-semibold text-accent">
                  {factor.tag}
                </span>
                <h3 className="text-xl font-semibold tracking-tight">
                  {factor.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/60">
                  {factor.body}
                </p>
                <ul className="mt-1 flex flex-col gap-2 border-t border-border-subtle pt-4">
                  {factor.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-foreground/70"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard mockup */}
      <section id="dashboard" className="border-b border-border-subtle">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-10 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Dashboard
            </span>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Every link, its clicks, and its clock
            </h2>
            <p className="max-w-2xl text-foreground/60">
              Paste a URL, optionally set an expiry, and Sniplink hands back a
              short link plus a QR code. The dashboard tracks hits, last
              access, referrer, and expiry status for everything you&apos;ve
              created.
            </p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-muted p-4 sm:p-6">
            {/* Create bar */}
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-dashed border-border-subtle bg-surface p-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border-subtle bg-background px-3 py-2">
                <span className="text-foreground/35">🔗</span>
                <span className="truncate font-mono text-sm text-foreground/45">
                  https://example.com/a/very/long/campaign-url?utm_source=…
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-border-subtle bg-background px-3 py-2 font-mono text-xs text-foreground/50">
                  expires in 30 days
                </span>
                <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                  Shorten
                </button>
              </div>
            </div>

            {/* Links list */}
            <div className="flex flex-col gap-3">
              <LinkCard
                slug="launch-ig"
                destination="instagram.com/p/campaign-launch-2026"
                hits={1204}
                lastAccessed="4 min ago"
                expiry="expires in 12 days"
                status="active"
                referrer="instagram.com"
                featured
              />
              <LinkCard
                slug="pdf-onepager"
                destination="drive.google.com/file/d/onepager.pdf"
                hits={487}
                lastAccessed="2 hrs ago"
                expiry="47 / 500 clicks used"
                status="expiring"
                referrer="direct"
              />
              <LinkCard
                slug="promo-oct"
                destination="shop.example.com/promo/october"
                hits={2031}
                lastAccessed="19 days ago"
                expiry="expired 3 days ago"
                status="expired"
                referrer="twitter.com"
              />
            </div>
          </div>

          {/* QR callout */}
          <div className="mt-6 flex flex-col items-center gap-6 rounded-2xl border border-border-subtle bg-surface p-6 sm:flex-row">
            <div className="w-28 shrink-0 overflow-hidden rounded-lg border border-border-subtle">
              <QrMock />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">
                Every short link ships with a scannable QR code
              </span>
              <span className="text-sm text-foreground/60">
                Generated server-side with the{" "}
                <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs">
                  qrcode
                </code>{" "}
                library the instant you shorten a URL — download it as a PNG
                and it&apos;s yours, no subscription required.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tech badges */}
      <section className="border-b border-border-subtle">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <span className="mb-6 block text-xs font-semibold uppercase tracking-widest text-foreground/40">
            Built with
          </span>
          <div className="flex flex-wrap gap-2.5">
            {TECH_BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-border-subtle bg-surface px-3.5 py-1.5 font-mono text-xs text-foreground/70"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Run it */}
      <section id="run-it" className="border-b border-border-subtle">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-8 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Run it
            </span>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Up and running in three commands
            </h2>
            <p className="max-w-2xl text-foreground/60">
              Sniplink runs locally as a Flask app backed by SQLite — no
              external services, no signup, no API keys.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-[#0d0e10] text-[#e4e2dc] shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-3 font-mono text-xs text-white/40">
                zsh — sniplink
              </span>
            </div>
            <pre className="overflow-x-auto px-5 py-6 font-mono text-sm leading-relaxed">
              <code>
                <span className="text-white/35"># install dependencies</span>
                {"\n"}
                <span className="text-emerald-400">$</span> pip install flask
                qrcode
                {"\n\n"}
                <span className="text-white/35"># start the server</span>
                {"\n"}
                <span className="text-emerald-400">$</span> python app.py
                {"\n\n"}
                <span className="text-white/35">
                  # open the app locally
                </span>
                {"\n"}
                <span className="text-emerald-400">→</span>{" "}
                <span className="text-accent">http://localhost:5000</span>
              </code>
            </pre>
          </div>
          <p className="mt-4 text-sm text-foreground/50">
            That&apos;s it — paste a URL, set an optional expiry, and Sniplink
            hands back a short link and QR code from the local Flask app on
            port 5000.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 text-sm text-foreground/45 sm:flex-row sm:items-center">
          <span>Sniplink — a self-hosted URL shortener.</span>
          <span className="font-mono text-xs">
            Flask · SQLite · Licensed under GPLv3
          </span>
        </div>
      </footer>
    </div>
  );
}
