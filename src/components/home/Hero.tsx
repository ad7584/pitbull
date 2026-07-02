import { motion } from "framer-motion";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { KindBadge } from "@/components/ui/Badge";
import { NumberRoll } from "@/components/ui/NumberRoll";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { unlockStatus, vaultValue } from "@/lib/engine";
import { fmtCompact, fmtSol, toSol } from "@/lib/format";
import { usePit } from "@/lib/store";
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
  const myPen = usePit((s) => s.myPen());
  const openSignIn = useUI((s) => s.openSignIn);
  const pens = usePit((s) => s.pens);
  const vault = usePit((s) => s.vault);
  const pool = usePit((s) => s.pool);
  const now = usePit((s) => s.now);
  const worthOf = usePit((s) => s.worthOf);

  const tvl = vaultValue(vault, pool);
  const cracked = 37;
  const featured = [...pens].sort((a, b) => worthOf(b) - worthOf(a))[0];

  const primaryCta = () => {
    if (auth.status !== "connected") return openSignIn();
    nav(myPen ? "/dashboard" : "/create");
  };

  return (
    <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-10 pt-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-36">
      {/* three.js coin field — behind everything, full-bleed */}
      {sceneReady && (
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      )}

      {/* copy */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="chip mb-6"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
          Solana · $ANSEM liquidity · self-custodial
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance font-display text-5xl font-bold leading-[0.98] sm:text-6xl lg:text-7xl"
        >
          The piggy bank you can <span className="text-gradient-warm text-glow-pink">only crack once.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-mute"
        >
          Fill it with small SOL deposits — yours or gifted. It pools into batched{" "}
          <span className="text-paper">$ANSEM</span> liquidity, earns fees, and stays sealed until you smash it.
          Saving as a commitment device, not a dump bag.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Button size="xl" variant="primary" glow magnetic onClick={primaryCta}>
            {myPen ? "Go to my bank" : "Open a piggy bank"}
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button size="xl" variant="outline" onClick={() => nav("/explore")}>
            <Compass className="h-5 w-5" /> Explore banks
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
        >
          <TrustStat value={<NumberRoll value={toSol(tvl)} format={(v) => fmtCompact(v)} className="text-2xl font-bold" />} label="SOL pooled" suffix />
          <TrustStat value={<NumberRoll value={pens.length} format={(v) => String(Math.round(v))} className="text-2xl font-bold" />} label="banks open" />
          <TrustStat value={<NumberRoll value={cracked} format={(v) => String(Math.round(v))} className="text-2xl font-bold" />} label="cracked open" />
        </motion.div>

        <p className="mt-6 flex items-center gap-1.5 text-sm font-medium text-piggy-300">
          <Sparkles className="h-4 w-4" /> Your floor, not your rent money.
        </p>
      </div>

      {/* visual */}
      <div className="relative z-10 mx-auto flex w-full max-w-md items-center justify-center lg:max-w-none">
        <div className="absolute inset-0 -z-10 mx-auto h-72 w-72 animate-breathe rounded-full bg-piggy/20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <PiggyMascot mood="idle" size={300} />

          {/* floating featured pen card */}
          {featured && (
            <motion.button
              onClick={() => nav(`/pen/${featured.handle}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{ opacity: { delay: 0.6 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
              className="glass-strong absolute -right-2 top-4 w-56 rounded-3xl p-4 text-left shadow-card sm:-right-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar seed={featured.avatarSeed} label={featured.displayName} size={30} />
                  <div className="text-xs">
                    <div className="font-semibold leading-tight">{featured.displayName}</div>
                    <div className="text-mute">@{featured.handle}</div>
                  </div>
                </div>
                <KindBadge kind={featured.kind} showTitle={false} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <ProgressRing progress={unlockStatus(featured, now, vault, pool).progress} size={54} stroke={6}>
                  <span className="font-mono text-[11px] font-bold">
                    {Math.round(unlockStatus(featured, now, vault, pool).progress * 100)}%
                  </span>
                </ProgressRing>
                <div>
                  <div className="text-[10px] uppercase text-faint">worth now</div>
                  <div className="font-mono text-lg font-bold text-lime">{fmtSol(worthOf(featured))}</div>
                  <div className="text-[10px] text-faint">SOL</div>
                </div>
              </div>
            </motion.button>
          )}

          {/* floating coin badge */}
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
      <div className="flex items-baseline gap-1 font-mono">
        {value}
        {suffix && <span className="text-sm text-mute">SOL</span>}
      </div>
      <div className="mt-0.5 text-xs uppercase tracking-wide text-faint">{label}</div>
    </div>
  );
}
