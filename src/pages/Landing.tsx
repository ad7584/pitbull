import { ArrowRight, Radio, ShieldCheck, Lock, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/home/Hero";
import { GlobalStats } from "@/components/home/GlobalStats";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LiquidityEngine } from "@/components/home/LiquidityEngine";
import { AnsemNarrative } from "@/components/home/AnsemNarrative";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { COPY } from "@/lib/protocol";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";

// Honest custodial disclosures — a custodial pool, not a trustless contract.
const SAFETY: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: ShieldCheck, title: "Custodial by design", body: "Deposits are pooled in an operator-controlled wallet. You hold a claim on the pool, redeemable when you withdraw — you’re trusting the operator, not a contract." },
  { Icon: Lock, title: "Owner-only withdrawal", body: "Only you can withdraw your balance, authenticated by your X (Privy) identity and verified server-side against your token." },
  { Icon: Radio, title: "Impermanent-loss risk", body: "Your SOL becomes $ANSEM/SOL liquidity. If the price moves, you can withdraw less than you put in — even after fees." },
  { Icon: MapPin, title: "Pinned venue", body: "Liquidity goes to the one canonical $ANSEM pool, pinned in config — never a client-supplied pool address." },
];

export default function Landing() {
  const nav = useNavigate();
  const auth = usePit((s) => s.auth);
  const openSignIn = useUI((s) => s.openSignIn);

  const cta = () => (auth.status !== "connected" ? openSignIn() : nav("/dashboard"));

  return (
    <div>
      <Hero />

      {/* trust / social-proof bar — real, verifiable numbers */}
      <Section id="stats" className="pt-6">
        <Reveal>
          <GlobalStats />
        </Reveal>
      </Section>

      <Section
        eyebrow="How it works"
        title="Five taps from loose SOL to durable liquidity"
        intro="Attention leaks into same-hour dumps. Pooling small, regular deposits turns saving behavior into depth that absorbs exits instead of causing them."
      >
        <HowItWorks />
      </Section>

      <Section
        id="liquidity"
        eyebrow="The liquidity engine"
        title="Where your SOL actually goes"
        intro="This is the architectural heart — and the part with real friction. No hand-waving."
      >
        <LiquidityEngine />
      </Section>

      <Section
        id="ansem"
        eyebrow="The narrative"
        title="Why $ANSEM — and who Ansem is"
        intro="The token this pools into carries a story. Here it is, sourced and honest — including what it isn’t."
      >
        <AnsemNarrative />
      </Section>

      <Section
        id="safety"
        eyebrow="What you’re trusting"
        title="Custodial — know exactly what that means"
        intro="This is irreversible where it counts, so we spell out the trust assumptions rather than hide them."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SAFETY.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05}>
              <div className="card h-full p-5">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-mute">
                  <s.Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-paper">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-mute">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* final CTA */}
      <Section className="pb-24">
        <Reveal>
          <div className="card overflow-hidden px-6 py-14 text-center sm:px-12">
            <h2 className="text-balance text-2xl font-semibold sm:text-3xl">Start stacking your floor.</h2>
            <p className="mx-auto mt-3 max-w-lg text-pretty text-[15px] leading-relaxed text-mute">{COPY.gambling}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="xl" variant="accent" onClick={cta}>
                Get started <ArrowRight className="h-4 w-4" />
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
