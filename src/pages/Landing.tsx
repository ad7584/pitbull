import { motion } from "framer-motion";
import { ArrowRight, Radio, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/home/Hero";
import { GlobalStats } from "@/components/home/GlobalStats";
import { HowItWorks } from "@/components/home/HowItWorks";
import { VaultTypes } from "@/components/home/VaultTypes";
import { LiquidityEngine } from "@/components/home/LiquidityEngine";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { COPY } from "@/lib/protocol";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";

// Honest custodial disclosures — this is a custodial pool, not a trustless
// contract. Do not overstate. (These replaced earlier false "no key touches
// principal / no admin can withdraw LP" claims.)
const SAFETY: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: ShieldCheck, title: "Custodial by design", body: "Deposits are pooled in an operator-controlled wallet. You hold a claim on the pool, redeemable when you withdraw — you're trusting the operator, not a contract." },
  { Icon: Zap, title: "Owner-only withdrawal", body: "Only you can withdraw your balance, authenticated by your X (Privy) identity. Requests are verified server-side against your token." },
  { Icon: Radio, title: "Impermanent-loss risk", body: "Your SOL becomes $ANSEM/SOL liquidity. If the price moves, you can withdraw less than you put in — even after fees." },
  { Icon: Sparkles, title: "Pinned venue", body: "Liquidity goes to the one canonical $ANSEM pool, pinned in config — no client-supplied pool addresses." },
];

export default function Landing() {
  const nav = useNavigate();
  const auth = usePit((s) => s.auth);
  const openSignIn = useUI((s) => s.openSignIn);

  const cta = () => (auth.status !== "connected" ? openSignIn() : nav("/dashboard"));

  return (
    <div>
      <Hero />

      <Section id="stats" className="pt-6">
        <Reveal>
          <GlobalStats />
        </Reveal>
      </Section>

      <Section
        eyebrow="How it works"
        title="Five taps from lonely SOL to durable liquidity"
        intro="Attention leaks into same-hour dumps. A piggy bank you can only crack once turns saving behavior into a pool that absorbs exits instead of causing them."
      >
        <HowItWorks />
      </Section>

      <Section
        eyebrow="Vault types"
        title="Pick your lock"
        intro="Three ways to seal a pen. Longer, harder locks deepen liquidity the most — so they earn the most from the redirected creator-fee stream."
      >
        <VaultTypes />
      </Section>

      <Section
        id="liquidity"
        eyebrow="The liquidity engine"
        title="Where your SOL actually goes"
        intro="This is the architectural heart — and the part with real friction. No hand-waving."
      >
        <LiquidityEngine />
      </Section>

      {/* safety */}
      <Section id="safety" eyebrow="Safety" title="Irreversible by design — so over-invest here" intro="Because a bug is permanent, the invariant is the spine everything defends.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SAFETY.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="card h-full p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint/12 text-mint">
                  <s.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mute">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* final CTA */}
      <Section className="pb-24">
        <Reveal>
          <div className="card relative overflow-hidden px-6 py-14 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
              <div className="absolute left-1/4 top-0 h-64 w-64 animate-aurora-1 rounded-full bg-piggy/25 blur-3xl" />
              <div className="absolute right-1/4 bottom-0 h-64 w-64 animate-aurora-2 rounded-full bg-lime/15 blur-3xl" />
            </div>
            <motion.div className="mx-auto mb-2 w-fit" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}>
              <PiggyMascot mood="happy" size={120} />
            </motion.div>
            <h2 className="text-balance font-display text-4xl font-bold sm:text-5xl">Start stacking your floor.</h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-mute">{COPY.gambling}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="xl" variant="primary" glow magnetic onClick={cta}>
                Open a piggy bank <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => nav("/about")}>
                Read the honest version
              </Button>
            </div>
            <p className="mt-6 text-xs text-faint">{COPY.floor}</p>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
