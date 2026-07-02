import { motion } from "framer-motion";
import { ArrowRight, Gift, Heart, Radio, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/home/Hero";
import { GlobalStats } from "@/components/home/GlobalStats";
import { HowItWorks } from "@/components/home/HowItWorks";
import { VaultTypes } from "@/components/home/VaultTypes";
import { LiquidityEngine } from "@/components/home/LiquidityEngine";
import { LiveActivity } from "@/components/home/LiveActivity";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { COPY } from "@/lib/protocol";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";

const SAFETY: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: ShieldCheck, title: "No key touches principal", body: "Admin can pause new deposits — never move, unlock, or block a break." },
  { Icon: Zap, title: "Always exitable", body: "The circuit breaker halts inflow but break_pen is structurally unpausable." },
  { Icon: Radio, title: "Contract-only liquidity", body: "No user and no admin can deploy or withdraw the LP position. Ever." },
  { Icon: Sparkles, title: "Pinned venue", body: "The $ANSEM pool is pinned in config; no client-supplied pool addresses." },
];

export default function Landing() {
  const nav = useNavigate();
  const now = usePit((s) => s.now);
  const auth = usePit((s) => s.auth);
  const myPen = usePit((s) => s.myPen());
  const openSignIn = useUI((s) => s.openSignIn);

  const cta = () => (auth.status !== "connected" ? openSignIn() : nav(myPen ? "/dashboard" : "/create"));

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

      {/* social loop */}
      <Section eyebrow="The social loop" title="Tips become locked liquidity">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="card flex h-full flex-col gap-5 p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-piggy/15 text-piggy">
                  <Gift className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold">Every pen is a share link</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">
                    A pen's address derives purely from the owner's key, so a “donate” link is just a deposit into
                    their PDA. CT tipping culture already exists — this routes it into locked liquidity instead of
                    someone's dump bag.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-piggy/15 text-piggy">
                  <Heart className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold">Charity pens do double duty</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">
                    Fees flow to a cause while principal stays locked, deepening the pool. Charity badges are
                    whitelist-gated — no social-engineered fake causes.
                  </p>
                </div>
              </div>
              <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-faint">
                Gifts are irreversible and lock under the recipient's rules. The UI always says so before you send.
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card flex h-full flex-col p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime" />
                  </span>
                  <h3 className="font-display text-lg font-bold">Live on-chain</h3>
                </div>
                <button onClick={() => nav("/explore")} className="text-sm font-semibold text-piggy-300 transition hover:text-piggy">
                  Explore all →
                </button>
              </div>
              <LiveActivity limit={7} now={now} />
            </div>
          </Reveal>
        </div>
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
