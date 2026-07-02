import { motion } from "framer-motion";
import { ArrowRight, Check, Lock, Target, Unlock, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { KindBadge } from "@/components/ui/Badge";
import { ILWarning } from "@/components/ui/ILWarning";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { LAMPORTS_PER_SOL, VAULT_KINDS } from "@/lib/protocol";
import { fmtDate } from "@/lib/format";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";
import type { VaultKind } from "@/lib/types";
import { cn } from "@/lib/cn";

const ICONS: Record<VaultKind, LucideIcon> = { Timelock: Lock, AmountTarget: Target, Open: Unlock };
const ORDER: VaultKind[] = ["Timelock", "AmountTarget", "Open"];
const DAY_CHIPS = [30, 60, 90, 180, 365];

export default function CreatePen() {
  const nav = useNavigate();
  const auth = usePit((s) => s.auth);
  const myPen = usePit((s) => s.myPen());
  const createPen = usePit((s) => s.createPen);
  const openSignIn = useUI((s) => s.openSignIn);

  const [kind, setKind] = useState<VaultKind>("Timelock");
  const [name, setName] = useState("");
  const [days, setDays] = useState(90);
  const [target, setTarget] = useState("10");
  const [charity, setCharity] = useState(false);

  const unlockParam = useMemo(() => {
    if (kind === "Timelock") return Math.floor(Date.now() / 1000) + days * 86400;
    if (kind === "AmountTarget") return Math.round((parseFloat(target) || 0) * LAMPORTS_PER_SOL);
    return 0;
  }, [kind, days, target]);

  if (auth.status !== "connected") {
    return (
      <Gate
        title="Connect to open a bank"
        body="Sign in with X — a self-custodial wallet spins up underneath. Then you can create your one piggy bank."
        action={<Button size="lg" variant="primary" glow onClick={openSignIn}><Wallet className="h-4.5 w-4.5" /> Connect</Button>}
      />
    );
  }

  if (myPen) {
    return (
      <Gate
        title="You already have a live bank"
        body="One piggy per identity — enforced on-chain by the PDA. Break your current one to open a fresh pen."
        action={<Button size="lg" variant="primary" onClick={() => nav("/dashboard")}>Go to my bank <ArrowRight className="h-4.5 w-4.5" /></Button>}
      />
    );
  }

  const create = () => {
    createPen(kind, unlockParam, name, charity ? name || "Charity pen" : undefined);
    nav("/dashboard");
  };

  const valid = kind !== "AmountTarget" || (parseFloat(target) || 0) > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-piggy-300">New piggy bank</span>
        <h1 className="mt-2 font-display text-4xl font-bold">Seal your intent</h1>
        <p className="mt-2 max-w-xl text-mute">Choose a lock, name it, fund it later. You can only have one at a time.</p>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* form */}
        <div className="space-y-6">
          {/* kind picker */}
          <div className="grid gap-3 sm:grid-cols-3">
            {ORDER.map((k) => {
              const m = VAULT_KINDS[k];
              const Icon = ICONS[k];
              const active = kind === k;
              return (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={cn(
                    "card relative p-4 text-left transition",
                    active ? "border-piggy/50 shadow-glow-pink" : "hover:border-white/20",
                  )}
                >
                  {active && (
                    <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-piggy text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <Icon className={cn("h-5 w-5", active ? "text-piggy" : "text-mute")} />
                  <div className="mt-3 font-display text-lg font-bold">{m.codename}</div>
                  <div className="text-xs text-mute">{m.tagline}</div>
                </button>
              );
            })}
          </div>

          {/* name */}
          <Field label="Name your bank" hint="Shows on your share card">
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 32))}
              placeholder={kind === "Timelock" ? "Til next cycle" : kind === "AmountTarget" ? "First 10 SOL" : "Just vibing"}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base outline-none transition placeholder:text-faint focus:border-piggy/50"
            />
          </Field>

          {/* dynamic params */}
          {kind === "Timelock" && (
            <Field label="Locked for" hint={`Unlocks ${fmtDate(unlockParam)}`}>
              <div className="flex flex-wrap gap-2">
                {DAY_CHIPS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={cn(
                      "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                      days === d ? "border-grape-400/50 bg-grape-400/15 text-grape-400" : "border-white/10 bg-white/5 text-mute hover:text-paper",
                    )}
                  >
                    {d >= 365 ? "1 year" : `${d} days`}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {kind === "AmountTarget" && (
            <Field label="Savings target" hint="Unlocks when total deposits (yours + gifts) hit this">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 focus-within:border-lime/50">
                <input
                  inputMode="decimal"
                  value={target}
                  onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="h-12 w-full bg-transparent font-mono text-xl font-semibold outline-none tnum"
                />
                <span className="font-display text-lg text-mute">SOL</span>
              </div>
            </Field>
          )}

          {kind === "Open" && (
            <div className="rounded-2xl border border-sky-300/20 bg-sky-300/[0.06] p-4 text-sm text-mute">
              No lock — break anytime. The gentlest on-ramp, and the least-rewarded tier.
            </div>
          )}

          {/* charity */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div>
              <div className="text-sm font-semibold">Make it a charity pen</div>
              <div className="text-xs text-faint">Fees to a cause, principal stays locked · whitelist-gated (mock)</div>
            </div>
            <button
              type="button"
              onClick={() => setCharity((c) => !c)}
              className={cn("relative h-6 w-11 rounded-full transition", charity ? "bg-piggy" : "bg-white/15")}
            >
              <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white" style={{ left: charity ? 22 : 2 }} />
            </button>
          </label>

          <Button size="lg" variant="primary" glow full onClick={create} disabled={!valid}>
            Create piggy bank <ArrowRight className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-faint">Preview</span>
              <KindBadge kind={kind} />
            </div>
            <div className="flex flex-col items-center py-2">
              <PiggyMascot mood={kind === "Timelock" ? "locked" : "idle"} size={150} />
            </div>
            <div className="mt-2 text-center">
              <div className="font-display text-xl font-bold">“{name || "my piggy bank"}”</div>
              <div className="mt-1 text-sm text-mute">
                {kind === "Timelock" && <>sealed until {fmtDate(unlockParam)}</>}
                {kind === "AmountTarget" && <>unlocks at {target || 0} SOL saved</>}
                {kind === "Open" && <>break anytime</>}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs leading-relaxed text-faint">
              PDA <span className="font-mono text-mute">["pen", you]</span> · one at a time · owner-only break.
              Fund it after creating with SOL or $ANSEM — deposits join the pool at the next batch.
            </div>
            <ILWarning compact className="mt-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold">{label}</span>
        {hint && <span className="text-xs text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Gate({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 pb-24 pt-40 text-center">
      <PiggyMascot mood="alert" size={140} />
      <h1 className="mt-6 font-display text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-mute">{body}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
