import { Coins, Hammer, LogIn, PiggyBank, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const STEPS: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: LogIn,
    title: "Sign in with X",
    body: "One tap. Privy creates a self-custodial embedded wallet for you — no seed phrase, no extension, keys stay yours.",
  },
  {
    Icon: PiggyBank,
    title: "Create your bank",
    body: "Pick a lock: break-anytime, savings goal, or time-lock. One active bank per identity — enforced on-chain.",
  },
  {
    Icon: Coins,
    title: "Fill it",
    body: "Deposit SOL or $ANSEM, as little or often as you like. Friends can gift into it from your share link.",
  },
  {
    Icon: Share2,
    title: "It works for you",
    body: "Deposits batch into the $ANSEM liquidity pool and earn 0.20% of every swap. Your share compounds automatically.",
  },
  {
    Icon: Hammer,
    title: "Crack it once",
    body: "When it unlocks, smash it. You receive SOL + $ANSEM directly. Terminal — then start a fresh one.",
  },
];

export function HowItWorks() {
  return (
    <div className="relative">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.07}>
            <div className="card relative h-full p-5">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-piggy to-grape text-white">
                  <s.Icon className="h-4.5 w-4.5" />
                </span>
                <span className="font-mono text-xs text-faint">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mute">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
