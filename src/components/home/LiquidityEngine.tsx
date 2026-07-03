import { ArrowRight, Droplets, Split, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const STAGES: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: Split, title: "Swap half", body: "SOL is a single asset; the AMM wants a pair. The keeper swaps ~½ your SOL into $ANSEM — every fill literally bids the token up." },
  { Icon: Droplets, title: "Add liquidity", body: "SOL + $ANSEM go in as one batched add-liquidity call. Batching many small deposits kills the slippage & fees of LPing each $5 alone." },
  { Icon: TrendingUp, title: "Earn the spread", body: "The pooled position accrues 0.20% of every swap. Your balance holds a share claim — fees compound as your share's value, no claim needed." },
];

export function LiquidityEngine() {
  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3">
        {STAGES.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.07}>
            <div className="card relative h-full p-6">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-mute">
                <s.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-paper">
                <span className="font-mono text-sm text-faint tnum">{i + 1}. </span>
                {s.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-mute">{s.body}</p>
              {i < STAGES.length - 1 && (
                <ArrowRight className="absolute -right-2.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-white/15 md:block" />
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15}>
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-danger/20 bg-danger/[0.05] p-5 sm:flex-row sm:items-center">
          <span className="chip shrink-0 border-danger/30 text-danger">the honest part</span>
          <p className="text-[13px] leading-relaxed text-mute">
            LPing means <span className="text-paper">impermanent loss</span>: if $ANSEM falls, a withdrawal can
            return less SOL than went in — even after fees. A fee-funded buffer softens it{" "}
            <span className="text-paper">partially</span>, never fully. This is not a savings account.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
