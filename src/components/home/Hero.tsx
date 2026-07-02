import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { fmtSol } from "@/lib/format";
import { usePit } from "@/lib/store";
import { useStats } from "@/lib/useStats";
import { useUI } from "@/lib/ui";

// three.js hero loads after idle so it never blocks LCP; CSS glow beneath
// acts as the fallback until the coins fade in.
const HeroScene = lazy(() => import("@/components/three/HeroScene"));

function useIdleMount(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setReady(true));
    else setTimeout(() => setReady(true), 350);
  }, []);
  return ready;
}

export function Hero() {
  const sceneReady = useIdleMount();
  const nav = useNavigate();
  const auth = usePit((s) => s.auth);
  const openSignIn = useUI((s) => s.openSignIn);
  const stats = useStats();

  const primaryCta = () => (auth.status !== "connected" ? openSignIn() : nav("/dashboard"));

  return (
    <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-10 pt-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-36">
      {sceneReady && (
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      )}

      <div className="relative z-10">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="chip mb-6">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
          Solana · $ANSEM liquidity · self-custodial
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-balance font-display text-5xl font-bold leading-[0.98] sm:text-6xl lg:text-7xl"
        >
          The piggy bank you can <span className="text-gradient-warm text-glow-pink">only crack once.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-mute"
        >
          Deposit SOL to your address. It pools into <span className="text-paper">$ANSEM</span> liquidity, earns fees,
          and you withdraw your share whenever you want. Saving as a commitment device, not a dump bag.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="xl" variant="primary" glow magnetic onClick={primaryCta}>
            {auth.status === "connected" ? "Go to my dashboard" : "Get started"}
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button size="xl" variant="outline" onClick={() => nav("/about")}>
            <BookOpen className="h-5 w-5" /> How it works
          </Button>
        </motion.div>

        {/* real numbers only */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.45 }} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <TrustStat value={stats ? fmtSol(stats.tvlLamports) : "…"} label="SOL pooled" suffix />
          <TrustStat value={stats?.ansem ? `$${stats.ansem.priceUsd.toFixed(4)}` : "…"} label="$ANSEM price" />
        </motion.div>

        <p className="mt-6 flex items-center gap-1.5 text-sm font-medium text-piggy-300">
          <Sparkles className="h-4 w-4" /> Your floor, not your rent money.
        </p>
      </div>

      {/* visual */}
      <div className="relative z-10 mx-auto flex w-full max-w-md items-center justify-center lg:max-w-none">
        <div className="absolute inset-0 -z-10 mx-auto h-72 w-72 animate-breathe rounded-full bg-piggy/20 blur-3xl" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
          <PiggyMascot mood="idle" size={300} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{ opacity: { delay: 0.7 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
            className="glass absolute -left-2 bottom-8 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold sm:-left-6"
          >
            <span className="text-lg">🪙</span>
            <span className="text-lime">+0.20% LP fees</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustStat({ value, label, suffix }: { value: React.ReactNode; label: string; suffix?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline gap-1 font-mono text-2xl font-bold">
        {value}
        {suffix && <span className="text-sm text-mute">SOL</span>}
      </div>
      <div className="mt-0.5 text-xs uppercase tracking-wide text-faint">{label}</div>
    </div>
  );
}
