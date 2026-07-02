import { Coins, DollarSign, TrendingUp, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fmtCompact, fmtSol } from "@/lib/format";
import { useStats } from "@/lib/useStats";
import { cn } from "@/lib/cn";

/** Real headline numbers from the backend — protocol TVL + live $ANSEM market. */
export function GlobalStats() {
  const stats = useStats();
  const ansem = stats?.ansem ?? null;
  const usd = (n: number | null | undefined) => (n == null ? "—" : `$${fmtCompact(n)}`);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        className="col-span-2"
        icon={Waves}
        label="Total pooled (this protocol)"
        accent
        big
        value={
          <>
            <span className="text-4xl font-bold text-gradient-warm">
              {stats ? fmtSol(stats.tvlLamports) : "…"}
            </span>
            <span className="ml-1.5 text-lg text-mute">SOL</span>
          </>
        }
        sub="real deposits pooled into $ANSEM liquidity"
      />
      <StatCard
        icon={TrendingUp}
        label="$ANSEM price"
        value={<span className="text-2xl font-bold tnum text-mint">{ansem ? `$${ansem.priceUsd.toFixed(4)}` : "…"}</span>}
        sub="live market price"
      />
      <StatCard
        icon={DollarSign}
        label="$ANSEM market cap"
        value={<span className="text-2xl font-bold tnum">{usd(ansem?.marketCap)}</span>}
      />
      <StatCard
        className="col-span-2"
        icon={Coins}
        label="$ANSEM pool liquidity"
        value={<span className="text-2xl font-bold tnum text-lime">{usd(ansem?.liquidityUsd)}</span>}
        sub="depth of the live $ANSEM/SOL market"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  big,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
  big?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card relative overflow-hidden p-5",
        accent && "border-piggy/20 bg-gradient-to-br from-piggy/[0.08] to-transparent",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-mute">
        <Icon className={cn("h-4 w-4", accent ? "text-piggy" : "text-mute")} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={cn("mt-3 flex items-baseline font-mono", big && "mt-4")}>{value}</div>
      {sub && <div className="mt-1.5 text-xs text-faint">{sub}</div>}
    </div>
  );
}
