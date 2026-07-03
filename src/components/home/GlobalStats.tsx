import { fmtCompact, fmtSol } from "@/lib/format";
import { useStats } from "@/lib/useStats";
import { cn } from "@/lib/cn";

/** Real headline numbers — protocol TVL + live $ANSEM market. Flat, tabular. */
export function GlobalStats() {
  const stats = useStats();
  const ansem = stats?.ansem ?? null;
  const usd = (n: number | null | undefined) => (n == null ? "—" : `$${fmtCompact(n)}`);

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] lg:grid-cols-4">
      <StatCell
        label="Total pooled"
        accent
        value={stats ? fmtSol(stats.tvlLamports) : "—"}
        unit="SOL"
        sub="deposits in $ANSEM liquidity"
      />
      <StatCell
        label="$ANSEM price"
        value={ansem ? `$${ansem.priceUsd.toFixed(4)}` : "—"}
        sub="live market"
      />
      <StatCell label="$ANSEM market cap" value={usd(ansem?.marketCap)} sub="fully diluted" />
      <StatCell label="Pool liquidity" value={usd(ansem?.liquidityUsd)} sub="$ANSEM/SOL depth" />
    </div>
  );
}

function StatCell({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-ink-850 p-5">
      <div className="eyebrow">{label}</div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={cn("text-2xl font-semibold tnum", accent ? "text-piggy" : "text-paper")}>{value}</span>
        {unit && <span className="text-sm text-mute">{unit}</span>}
      </div>
      {sub && <div className="mt-1.5 text-xs text-faint">{sub}</div>}
    </div>
  );
}
