import { AlertTriangle, Coins, Gift } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ILWarning } from "@/components/ui/ILWarning";
import { VaultTypes } from "@/components/home/VaultTypes";
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
    step: "Create your piggy bank",
    detail:
      "Pick a lock type (break-anytime, savings goal, or time-lock), give it a name. One active bank per identity — the chain enforces it.",
  },
  {
    step: `Fill it with SOL or $${ANSEM_SYMBOL}`,
    detail:
      "Deposit as little or as often as you like. Small and regular beats all-in. Deposits join the liquidity pool at the next batch.",
  },
  {
    step: "Share your link",
    detail:
      "Every bank has a share card with its address and QR — friends can gift straight into it. Gifts are irreversible and lock under your rules.",
  },
  {
    step: "Watch both numbers",
    detail:
      "Saved is what went in; Worth-now is your live share of the pool. Worth moves with the market — it can be more or less than Saved.",
  },
  {
    step: "Crack it open — once",
    detail:
      "When your lock allows it, smash the bank. You receive the SOL leg + $ANSEM leg directly. It's terminal; start a fresh one after.",
  },
];

const PROBLEMS = [
  ["Trenches feel dead", "Launchpads turned extractive; liquidity never returns."],
  ["Airdrops dump instantly", "Free, unlocked tokens become same-hour sell pressure."],
  ["Thin pool, huge mcap", "Concentrated supply; valuation outruns real depth."],
  ["Late retail = exit liquidity", "Attention is the product; the audience is the exit."],
];

const REWARDS = [
  {
    Icon: Coins,
    title: "Organic — 0.20% LP fees",
    body: "Accrue inside the pool. Each pen's share grows in value — no distribution, just share math.",
    tint: "text-lime",
  },
  {
    Icon: Gift,
    title: "Creator-fee incentives",
    body: "Redirected creator-fee SOL, merkle-dropped and weighted by lock type & duration. Longer locks earn more — the fix for the airdrop-dump problem.",
    tint: "text-piggy",
  },
];

const DECISIONS = [
  {
    title: "1 · The IL model",
    body: "Is this honest savings, or LP exposure in a savings costume? We ship naive 50/50 LP for max fees, with a partial, capped, fee-funded buffer — and disclose it plainly. No free lunch, chosen consciously.",
  },
  {
    title: "2 · The custody model",
    body: "Privy embedded wallets run in self-custodial mode — your key is sharded, reassembled only client-side, exportable anytime. Neither Privy nor the app can recover or rotate it. Anything else would make us a co-signer on every pen; the honest version is the only version.",
  },
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
              Everyone already knows you don't crack a piggy bank early. That single rule turns deposits into durable
              liquidity instead of the dump-in-an-hour problem killing airdrops today.
            </p>
          </div>
          <div className="hidden lg:block">
            <PiggyMascot mood="idle" size={220} />
          </div>
        </div>
      </Section>

      <Section eyebrow="Getting started" title="Six steps, start to smash">
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
            The fix isn't “more tokens in circulation” — it's a{" "}
            <span className="text-paper">deep, two-sided pool</span> that absorbs exits without cratering. Redirect the
            creator-fee firehose toward building depth instead of scattering sell pressure.
          </p>
        </Reveal>
      </Section>

      <Section eyebrow="Vault types" title="Pick your lock">
        <VaultTypes />
        <Reveal delay={0.15}>
          <div className="mt-4 rounded-3xl border border-lime/20 bg-lime/[0.05] p-5 text-sm leading-relaxed text-mute">
            <span className="font-semibold text-lime">Synchronized-exit guard.</span> If thousands of goal pens hit
            the same target and break in one block, that's the crater we're preventing. So each unlock carries
            per-vault jitter + a cooldown window — breaks stagger over hours, not one block. A safety property, not
            optional polish.
          </div>
        </Reveal>
      </Section>

      <Section id="liquidity" eyebrow="The liquidity engine" title="Where your SOL actually goes">
        <LiquidityEngine />
      </Section>

      <Section id="rewards" eyebrow="Rewards" title="Two streams, kept distinct">
        <div className="grid gap-4 md:grid-cols-2">
          {REWARDS.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.08}>
              <div className="card h-full p-6">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 ${r.tint}`}>
                  <r.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{r.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="safety" eyebrow="Safety" title="Irreversible means over-invest here">
        <Reveal>
          <div className="card p-6">
            <blockquote className="border-l-2 border-piggy pl-4 text-lg leading-relaxed text-paper">
              No user and no admin can deploy, alter, or withdraw the LP position. Admin can pause inflow only;
              <span className="text-piggy"> break is structurally unpausable</span>; treasury sweeps can never reach
              principal, pending SOL, or the buffer.
            </blockquote>
            <ul className="mt-5 grid gap-2 text-sm text-mute sm:grid-cols-2">
              <li>• Anchor / Rust declarative constraints kill whole bug classes.</li>
              <li>• Circuit breaker halts deposits + crank, never a user's exit.</li>
              <li>• CPI / reentrancy-safe swap-and-LP; pinned pool, validated accounts.</li>
              <li>• Two independent audits + public testnet + bug bounty before mainnet.</li>
            </ul>
          </div>
        </Reveal>
      </Section>

      <Section eyebrow="Open design decisions" title="Resolved before writing a line of program code">
        <div className="grid gap-4 md:grid-cols-2">
          {DECISIONS.map((d, i) => (
            <Reveal key={d.title} delay={i * 0.08}>
              <div className="card h-full p-6">
                <h3 className="font-display text-lg font-bold text-piggy-300">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{d.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
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
          <p className="mt-8 text-center text-sm text-faint">
            This describes a system design. Not financial advice, not an endorsement of any token. Verify every
            contract, audit, and liquidity profile independently before participating.
          </p>
        </Reveal>
      </Section>
    </div>
  );
}
