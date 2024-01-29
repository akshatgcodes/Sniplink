import { QrMock } from "./QrMock";

type ExpiryStatus = "active" | "expiring" | "expired";

const STATUS_STYLES: Record<ExpiryStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  expiring: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  expired: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const STATUS_LABEL: Record<ExpiryStatus, string> = {
  active: "Active",
  expiring: "Expires soon",
  expired: "Expired",
};

export function LinkCard({
  slug,
  destination,
  hits,
  lastAccessed,
  expiry,
  status,
  referrer,
  featured = false,
}: {
  slug: string;
  destination: string;
  hits: number;
  lastAccessed: string;
  expiry: string;
  status: ExpiryStatus;
  referrer: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
        featured
          ? "border-accent/30 bg-accent-soft"
          : "border-border-subtle bg-surface"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border-subtle">
          <QrMock />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              snip.link/{slug}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
          <span className="max-w-xs truncate text-sm text-foreground/60">
            → {destination}
          </span>
          <span className="text-xs text-foreground/45">
            via {referrer} · last hit {lastAccessed}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-1.5">
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {hits}
          </span>
          <span className="text-xs text-foreground/45">clicks</span>
        </div>
        <span className="text-xs font-medium text-foreground/50">
          {expiry}
        </span>
      </div>
    </div>
  );
}
