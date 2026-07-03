import { AnimatePresence, motion } from "framer-motion";
import { Check, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Bull } from "@/components/brand/Bull";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { shortKey } from "@/lib/format";
import { pubkeyForHandle, DEMO_USER } from "@/lib/seed";

type Step = "choose" | "provisioning" | "ready";

/**
 * Privy login — X (Twitter) as the only method, embedded self-custodial
 * wallet provisioned underneath (INTEGRATION.md §1). External wallets are
 * intentionally NOT offered: one identity, one flow, one pen.
 */
export function SignInModal() {
  const open = useUI((s) => s.signInOpen);
  const close = useUI((s) => s.closeSignIn);
  const signInWithX = usePit((s) => s.signInWithX);
  const [handle, setHandle] = useState("");
  const [step, setStep] = useState<Step>("choose");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (open) setStep("choose");
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [open]);

  const previewKey = handle.trim() ? pubkeyForHandle(handle.trim()) : DEMO_USER.pubkey;

  const startLogin = () => {
    setStep("provisioning");
    // staged like the real Privy flow: OAuth → key shard ceremony → ready
    timers.current.push(
      window.setTimeout(() => setStep("ready"), 1600),
      window.setTimeout(() => {
        signInWithX(handle);
        close();
        setHandle("");
      }, 2600),
    );
  };

  return (
    <Modal open={open} onClose={close} labelledBy="signin-title" className="max-w-[26rem]">
      <div className="flex flex-col items-center text-center">
        <div className="mb-2">
          <Bull className="h-16 w-16" />
        </div>
        <h2 id="signin-title" className="text-2xl font-semibold">
          {step === "choose" && "Log in or sign up"}
          {step === "provisioning" && "Creating your wallet…"}
          {step === "ready" && "Wallet ready"}
        </h2>

        <AnimatePresence mode="wait">
          {step === "choose" && (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <p className="mt-1.5 text-sm text-mute">
                Continue with X — a <span className="text-paper">self-custodial</span> embedded wallet is created
                underneath. No seed phrase, no extension. Only you can ever break your bank.
              </p>

              <div className="mt-6 w-full space-y-3 text-left">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-mute">X handle (optional, for the demo)</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 focus-within:border-piggy/50">
                    <span className="text-mute">@</span>
                    <input
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                      placeholder="you"
                      onKeyDown={(e) => e.key === "Enter" && startLogin()}
                      className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-faint"
                    />
                  </div>
                </label>

                <Button variant="primary" size="lg" full onClick={startLogin}>
                  <XLogo /> Continue with X
                </Button>
              </div>

              <div className="mt-5 grid w-full grid-cols-2 gap-2">
                <Assurance icon={ShieldCheck} label="Self-custodial" />
                <Assurance icon={KeyRound} label="Keys exportable" />
              </div>
            </motion.div>
          )}

          {step === "provisioning" && (
            <motion.div key="prov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <p className="mt-1.5 text-sm text-mute">Sharding your key — no one ever holds the whole thing.</p>
              <div className="mt-6 space-y-2.5 text-left">
                <ProvStep label="X account verified" done />
                <ProvStep label="Generating key shares" spinning />
                <ProvStep label="Wallet address" pending />
              </div>
            </motion.div>
          )}

          {step === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <p className="mt-1.5 text-sm text-mute">Your embedded wallet:</p>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-mint/25 bg-mint/10 px-4 py-3">
                <Check className="h-4 w-4 text-mint" />
                <span className="font-mono text-sm text-paper">{shortKey(previewKey, 6)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center gap-1.5 text-[11px] text-faint">
          <ShieldCheck className="h-3.5 w-3.5" /> Protected by <span className="font-semibold text-mute">Privy</span>
        </div>
      </div>
    </Modal>
  );
}

function ProvStep({ label, done, spinning, pending }: { label: string; done?: boolean; spinning?: boolean; pending?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
      {done && <Check className="h-4 w-4 text-mint" />}
      {spinning && <Loader2 className="h-4 w-4 animate-spin text-piggy" />}
      {pending && <span className="h-4 w-4 rounded-full border border-white/20" />}
      <span className={pending ? "text-sm text-faint" : "text-sm text-paper"}>{label}</span>
    </div>
  );
}

function Assurance({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <Icon className="h-4 w-4 text-mint" />
      <span className="text-xs font-medium text-mute">{label}</span>
    </motion.div>
  );
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M18.9 1.2h3.7l-8 9.1 9.4 12.5h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9Zm-1.3 19.5h2L6.4 3.3H4.3l13.3 17.4Z" />
    </svg>
  );
}
