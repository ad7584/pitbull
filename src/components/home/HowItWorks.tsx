import { ArrowUpFromLine, Coins, LogIn, Wallet, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const STEPS: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: LogIn,
    title: "Sign in with X",
    body: "One tap. Privy creates a self-custodial embedded wallet for your identity — no seed phrase, no extension.",
  },
  {
    Icon: Wallet,
    title: "Get your deposit address",
    body: "A unique address, just for you. No wallet-connect needed to fund it — just send to it.",
  },
  {
    Icon: Coins,
    title: "Send SOL",
    body: "As little or as often as you like. It’s detected on-chain and credited to your balance automatically (~15s).",
  },
  {
    Icon: Waves,
    title: "It pools into $ANSEM LP",
    body: "Your SOL joins the $ANSEM/SOL liquidity pool and earns 0.20% of every swap. Your share grows with the fees.",
  },
  {
    Icon: ArrowUpFromLine,
    title: "Withdraw anytime",
    body: "Redeem your share to any address whenever you want. Only you can withdraw your balance.",
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
