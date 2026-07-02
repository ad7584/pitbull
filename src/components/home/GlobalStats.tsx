import { Coins, Hammer, PiggyBank, Shield, TrendingUp, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NumberRoll } from "@/components/ui/NumberRoll";
import { Sparkline } from "@/components/ui/Sparkline";
import { vaultValue } from "@/lib/engine";
import { fmtCompact, fmtSol, fmtSolCompact, toSol } from "@/lib/format";
import { SOL_USD } from "@/lib/seed";
import { usePit } from "@/lib/store";
import { cn } from "@/lib/cn";

export function GlobalStats() {
  const vault = usePit((s) => s.vault);
  const pool = usePit((s) => s.pool);
  const pens = usePit((s) => s.pens);
  const activity = usePit((s) => s.activity);
  const priceHistory = usePit((s) => s.priceHistory);
  const ansemUsd = usePit((s) => s.ansemUsd());

  const tvl = vaultValue(vault, pool);
  const cracked = 37 + activity.filter((a) => a.kind === "PenBroken").length;
  const priceUp = priceHistory.length > 1 && priceHistory[priceHistory.length - 1] >= priceHistory[0];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        className="col-span-2 md:col-span-2"
        icon={Waves}
        label="Total pooled liquidity"
        accent
        big
        value={
          <>
            <NumberRoll value={toSol(tvl)} format={(v) => fmtCompact(v)} className="text-4xl font-bold text-gradient-warm" />
            <span className="ml-1.5 text-lg text-mute">SOL</span>
          </>
        }
        sub={`≈ $${fmtCompact(toSol(tvl) * SOL_USD)} deepening the $ANSEM pool`}
      />
      <StatCard
        icon={PiggyBank}
        label="Piggy banks open"
        value={<NumberRoll value={pens.length} format={(v) => String(Math.round(v))} className="text-3xl font-bold" />}
      />
      <StatCard
        icon={Hammer}
        label="Cracked open"
        value={<NumberRoll value={cracked} format={(v) => String(Math.round(v))} className="text-3xl font-bold" />}
      />
      <StatCard
        icon={TrendingUp}
        label="$ANSEM price"
        value={
          <span className={cn("text-2xl font-bold tnum", priceUp ? "text-mint" : "text-danger")}>
            ${ansemUsd.toFixed(5)}
          </span>
        }
        chart={<Sparkline data={priceHistory.slice(-40)} width={130} height={34} />}
      />
      <StatCard
        icon={Coins}
        label="Lifetime deposited"
        value={<span className="text-2xl font-bold tnum">{fmtSolCompact(vault.lifetimeDeposited)} SOL</span>}
      />
      <StatCard
        icon={Shield}
        label="IL buffer"
        value={<span className="text-2xl font-bold tnum text-lime">{fmtSol(vault.bufferLamports)} SOL</span>}
        sub="softens impermanent loss"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  chart,
  accent,
  big,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: string;
  chart?: React.ReactNode;
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
      {chart && <div className="mt-2">{chart}</div>}
    </div>
  );
}
