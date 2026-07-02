import { ArrowRight, Droplets, Split, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const STAGES: { Icon: LucideIcon; title: string; body: string; tint: string }[] = [
  { Icon: Split, title: "Swap half", body: "SOL is a single asset; PumpSwap wants a pair. The crank swaps ~½ your SOL into $ANSEM — every fill literally bids the token up.", tint: "text-piggy" },
  { Icon: Droplets, title: "Add liquidity", body: "SOL + $ANSEM go in as one batched add-liquidity call. Batching many small deposits kills the slippage & fees of LPing each $5 alone.", tint: "text-grape-400" },
  { Icon: TrendingUp, title: "Earn the spread", body: "The pooled LP position accrues 0.20% of every swap. Your pen holds a share claim — fees compound as your share's value, no claim needed.", tint: "text-lime" },
];

export function LiquidityEngine() {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {STAGES.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <div className="card relative h-full p-6">
              <span className={cn("grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5", s.tint)}>
                <s.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold">
                <span className="font-mono text-sm text-faint">{i + 1}. </span>
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{s.body}</p>
              {i < STAGES.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-white/20 md:block" />
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-danger/20 bg-danger/[0.06] p-5 sm:flex-row sm:items-center">
          <span className="chip border-danger/30 text-danger">the honest part</span>
          <p className="text-sm leading-relaxed text-mute">
            LPing means <span className="text-paper">impermanent loss</span>: if $ANSEM falls, a cracked pen can
            return less SOL than went in — even after fees. A fee-funded buffer softens it{" "}
            <span className="text-paper">partially</span>, never fully. This is not a savings account.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
