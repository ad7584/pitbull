import { AnimatePresence, motion } from "framer-motion";
import { Hammer, PartyPopper, Repeat, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NumberRoll } from "@/components/ui/NumberRoll";
import { Modal } from "@/components/ui/Modal";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { celebrate } from "@/lib/confetti";
import { ANSEM_SYMBOL, GAIN_SPLIT_LABEL } from "@/lib/protocol";
import { fmtCompact, fmtSol, toSol } from "@/lib/format";
import { sfx } from "@/lib/sound";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";
import type { BreakQuote, Pen } from "@/lib/types";
import { cn } from "@/lib/cn";

type Phase = "preview" | "charging" | "revealed";

export function SmashModal() {
  const target = useUI((s) => s.smashTarget);
  const close = useUI((s) => s.closeSmash);
  const soundOn = useUI((s) => s.soundOn);
  const livePen = usePit((s) => (target ? s.findPen(target) : undefined));
  const quoteFor = usePit((s) => s.quoteFor);
  const break_ = usePit((s) => s.break_);
  const nav = useNavigate();

  const [phase, setPhase] = useState<Phase>("preview");
  const [result, setResult] = useState<{ pen: Pen; quote: BreakQuote } | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (target) {
      setPhase("preview");
      setResult(null);
    }
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [target]);

  const pen = result?.pen ?? livePen;
  const quote = result?.quote ?? (livePen ? quoteFor(livePen) : null);
  if (!pen || !quote) return <Modal open={!!target} onClose={close} bare>{null}</Modal>;

  const onClose = () => {
    timers.current.forEach(clearTimeout);
    close();
  };

  const doSmash = () => {
    const q = break_(pen.owner);
    if (!q) return;
    setResult({ pen, quote: q });
    setPhase("charging");
    if (soundOn) sfx.charge();
    timers.current.push(
      window.setTimeout(() => {
        setPhase("revealed");
        celebrate();
        if (soundOn) {
          sfx.smash();
          setTimeout(() => sfx.cheer(), 260);
        }
      }, 1900),
    );
  };

  const shareText = encodeURIComponent(
    `just cracked my PIT-BULL piggy bank 🐷🔨 — pulled ${fmtSol(quote.solToUser)} SOL + ${fmtCompact(quote.ansemToUser)} $ANSEM. your floor, not your rent money. app.pitbull.fun`,
  );

  return (
    <Modal open={!!target} onClose={onClose} bare className="max-w-lg">
      <div className="card relative overflow-hidden p-7 text-center">
        {/* backdrop flash on reveal */}
        <AnimatePresence>
          {phase === "revealed" && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{ background: "radial-gradient(circle at 50% 45%, rgba(182,255,60,0.5), transparent 60%)" }}
            />
          )}
        </AnimatePresence>

        {/* mascot */}
        <div className="relative mx-auto grid h-48 place-items-center">
          <AnimatePresence mode="wait">
            {phase !== "revealed" ? (
              <motion.div
                key="mascot"
                exit={{ scale: 0.2, opacity: 0, rotate: 20 }}
                animate={phase === "charging" ? { rotate: [-3, 3, -3], scale: [1, 1.06, 1] } : {}}
                transition={phase === "charging" ? { duration: 0.18, repeat: Infinity } : { duration: 0.25 }}
              >
                <PiggyMascot mood={phase === "charging" ? "alert" : "idle"} cracking={phase === "charging"} size={190} />
              </motion.div>
            ) : (
              <motion.div
                key="pop"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-lime to-mint text-ink-950 shadow-glow-lime"
              >
                <PartyPopper className="h-14 w-14" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {phase === "preview" && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-display text-2xl font-bold">Smash “{pen.name}”?</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-mute">
                This is <span className="text-paper">terminal</span>. The pen closes, the seed frees, and you can
                start a fresh one right after. Here’s exactly what you’ll get:
              </p>

              <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
                <PayRow label="SOL leg" value={`${fmtSol(quote.solToUser)} SOL`} big />
                <PayRow label={`${ANSEM_SYMBOL} leg`} value={`${fmtCompact(quote.ansemToUser)} ${ANSEM_SYMBOL}`} big />
                <div className="divider my-1.5" />
                <PayRow label="You saved" value={`${fmtSol(quote.principal)} SOL`} muted />
                <PayRow
                  label="Redeemed value"
                  value={`${fmtSol(quote.redeemedValue)} SOL`}
                  muted
                />
                {quote.isGain ? (
                  <div className="flex items-start gap-2 rounded-xl bg-mint/10 p-2.5 text-xs text-mint">
                    <span className="font-semibold">Gain +{fmtSol(quote.delta)} SOL</span>
                    <span className="text-mint/70">split {GAIN_SPLIT_LABEL} · principal never split</span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-danger/10 p-2.5 text-xs text-danger">
                    <span className="font-semibold">Underwater −{fmtSol(-quote.delta)} SOL.</span>{" "}
                    <span className="text-danger/80">
                      Buffer tops up {fmtSol(quote.ilReimbursed)} SOL (partial &amp; capped).
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-3">
                <Button variant="ghost" size="lg" full onClick={onClose}>
                  Not yet
                </Button>
                <Button variant="danger" size="lg" full glow onClick={doSmash}>
                  <Hammer className="h-4.5 w-4.5" /> Smash it
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "charging" && (
            <motion.div key="charging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-display text-2xl font-bold text-glow-pink">Winding up…</h2>
              <p className="mt-2 text-sm text-mute">Light’s leaking from the seams.</p>
              <div className="mx-auto mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-piggy to-lime"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}

          {phase === "revealed" && (
            <motion.div key="revealed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Badge tone="lime" className="mx-auto">
                cracked open
              </Badge>
              <h2 className="mt-3 font-display text-3xl font-bold">You got</h2>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Payout
                  label="SOL"
                  node={
                    <NumberRoll
                      value={toSol(quote.solToUser)}
                      format={(v) => v.toLocaleString("en-US", { maximumFractionDigits: 3 })}
                      className="text-3xl font-bold text-gradient-warm"
                    />
                  }
                />
                <Payout
                  label={ANSEM_SYMBOL}
                  node={
                    <NumberRoll
                      value={quote.ansemToUser}
                      format={(v) => fmtCompact(v)}
                      className="text-3xl font-bold text-lime"
                    />
                  }
                />
              </div>

              <p className={cn("mt-4 text-sm font-medium", quote.isGain ? "text-mint" : "text-danger")}>
                {quote.isGain
                  ? `+${fmtSol(quote.delta)} SOL over what you saved 🎉`
                  : `${fmtSol(quote.delta)} SOL vs saved — buffer softened it by ${fmtSol(quote.ilReimbursed)}.`}
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                <Button
                  variant="lime"
                  size="lg"
                  full
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${shareText}`, "_blank")}
                >
                  <Share2 className="h-4.5 w-4.5" /> Flex it on X
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  full
                  onClick={() => {
                    onClose();
                    nav("/create");
                  }}
                >
                  <Repeat className="h-4.5 w-4.5" /> Start a new piggy bank
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

function PayRow({ label, value, big, muted }: { label: string; value: string; big?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-sm", muted ? "text-faint" : "text-mute")}>{label}</span>
      <span className={cn("font-mono font-semibold tnum", big ? "text-base text-paper" : "text-sm", muted && "text-mute")}>
        {value}
      </span>
    </div>
  );
}

function Payout({ label, node }: { label: string; node: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-baseline justify-center gap-1 font-mono">{node}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-mute">{label}</div>
    </div>
  );
}
