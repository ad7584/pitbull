import { AlertTriangle, Coins, Shield } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ILWarning } from "@/components/ui/ILWarning";
import { LiquidityEngine } from "@/components/home/LiquidityEngine";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { ANSEM_SYMBOL, COPY } from "@/lib/protocol";

const QUICK_START: { step: string; detail: string }[] = [
  {
    step: "Sign in with X",
    detail:
      "One tap — Privy creates a self-custodial embedded wallet under your X identity. No seed phrase, no browser extension. You can export your key anytime.",
  },
  {
    step: "Get your deposit address",
    detail:
      "You’re assigned a unique deposit address. No wallet-connect needed to fund it — you simply send SOL to it.",
  },
  {
    step: `Send SOL (or $${ANSEM_SYMBOL})`,
    detail:
      "As little or as often as you like. Small and regular beats all-in. Your transfer is detected on-chain and credited to your balance in ~15s.",
  },
  {
    step: "It pools into $ANSEM liquidity",
    detail:
      "Deposits are pooled and provided as $ANSEM/SOL liquidity, which earns 0.20% of every swap. Your share of the pool grows with the fees.",
  },
  {
    step: "Withdraw anytime",
    detail:
      "Redeem your share of the pool to any address, whenever you want. Only you can withdraw your balance — verified by your X identity.",
  },
];

const PROBLEMS = [
  ["Trenches feel dead", "Launchpads turned extractive; liquidity never returns."],
  ["Airdrops dump instantly", "Free, unlocked tokens become same-hour sell pressure."],
  ["Thin pool, huge mcap", "Concentrated supply; valuation outruns real depth."],
  ["Late retail = exit liquidity", "Attention is the product; the audience is the exit."],
];

export default function About() {
  return (
    <div>
      <Section className="pt-28">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-piggy-300">The honest version</span>
            <h1 className="mt-3 text-balance font-display text-5xl font-bold leading-[1.02]">
              A commitment device disguised as nostalgia.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-mute">
              Deposit small amounts of SOL, pool them into durable $ANSEM liquidity, earn the swap fees, and withdraw
              your share whenever you like — turning saving behavior into depth instead of the dump-in-an-hour problem.
            </p>
          </div>
          <div className="hidden lg:block">
            <PiggyMascot mood="idle" size={220} />
          </div>
        </div>
      </Section>

      <Section eyebrow="Getting started" title="Five steps, deposit to withdraw">
        <div className="grid gap-3 md:grid-cols-2">
          {QUICK_START.map((q, i) => (
            <Reveal key={q.step} delay={i * 0.05}>
              <div className="card flex h-full gap-4 p-5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-piggy to-grape font-mono text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <div className="font-display font-bold">{q.step}</div>
                  <p className="mt-1 text-sm leading-relaxed text-mute">{q.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <ILWarning className="mt-4" />
        </Reveal>
      </Section>

      <Section eyebrow="The problem" title="Why the trenches feel dead">
        <div className="grid gap-3 sm:grid-cols-2">
          {PROBLEMS.map(([sym, cause], i) => (
            <Reveal key={sym} delay={i * 0.06}>
              <div className="card flex gap-4 p-5">
                <span className="font-mono text-sm text-faint">0{i + 1}</span>
                <div>
                  <div className="font-display font-bold">{sym}</div>
                  <div className="mt-1 text-sm text-mute">{cause}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-mute">
            The fix isn’t “more tokens in circulation” — it’s a{" "}
            <span className="text-paper">deeper, two-sided pool</span> that absorbs exits without cratering.
          </p>
        </Reveal>
      </Section>

      <Section id="liquidity" eyebrow="The liquidity engine" title="Where your SOL actually goes">
        <LiquidityEngine />
      </Section>

      <Section id="rewards" eyebrow="Rewards" title="0.20% of every swap">
        <Reveal>
          <div className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-lime">
              <Coins className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">Organic LP fees</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mute">
              The pool earns 0.20% of every $ANSEM swap. Those fees accrue inside the pool and grow the value of your
              share — no distribution, no claim step, just share math. Your withdrawal reflects fees earned while you
              were in.
            </p>
          </div>
        </Reveal>
      </Section>

      <Section id="safety" eyebrow="Safety" title="Custodial — know exactly what you’re trusting">
        <Reveal>
          <div className="card p-6">
            <blockquote className="border-l-2 border-piggy pl-4 text-lg leading-relaxed text-paper">
              This is a <span className="text-piggy">custodial pool</span>. Your deposit is swept into an
              operator-controlled wallet; you hold a claim on the pool, redeemable when you withdraw. You are trusting
              the operator’s honesty, key security, and solvency — not a trustless contract.
            </blockquote>
            <ul className="mt-5 grid gap-2 text-sm text-mute sm:grid-cols-2">
              <li>• Only you can withdraw your balance — verified against your X (Privy) token.</li>
              <li>• Withdrawals are checked for solvency before your share is debited.</li>
              <li>• Liquidity goes to one pinned $ANSEM pool; no client-supplied addresses.</li>
              <li>• The operator’s keys control pooled funds — custody security is on them.</li>
            </ul>
          </div>
        </Reveal>
      </Section>

      <Section id="risks" eyebrow="Risks & honest disclosures" title="Read this part twice">
        <div className="grid gap-4 md:grid-cols-3">
          {[COPY.notSavings, COPY.attentionBacked, COPY.gambling].map((r, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="card flex h-full flex-col gap-3 border-danger/20 p-6">
                <AlertTriangle className="h-5 w-5 text-danger" />
                <p className="text-sm leading-relaxed text-mute">{r}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-mute">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-mute" />
            Not financial advice, not an endorsement of any token. This is a custodial product — verify the operator,
            the pool, and your own risk tolerance before depositing anything you can’t afford to lose.
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
