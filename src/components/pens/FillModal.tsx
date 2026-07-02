import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Gift, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { ILWarning } from "@/components/ui/ILWarning";
import { Modal } from "@/components/ui/Modal";
import { sharesForDeposit, penWorth } from "@/lib/engine";
import { ANSEM_MINT, COPY, LAMPORTS_PER_SOL, type DepositToken } from "@/lib/protocol";
import { fmtCompact, fmtSol, shortKey } from "@/lib/format";
import { sfx } from "@/lib/sound";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { cn } from "@/lib/cn";

const SOL_CHIPS = [0.05, 0.1, 0.25, 1];
const ANSEM_CHIPS = [10_000, 50_000, 100_000, 500_000];

export function FillModal() {
  const target = useUI((s) => s.fillTarget);
  const close = useUI((s) => s.closeFill);
  const openSignIn = useUI((s) => s.openSignIn);
  const soundOn = useUI((s) => s.soundOn);

  const auth = usePit((s) => s.auth);
  const pen = usePit((s) => (target ? s.findPen(target) : undefined));
  const vault = usePit((s) => s.vault);
  const pool = usePit((s) => s.pool);
  const config = usePit((s) => s.config);
  const deposit = usePit((s) => s.deposit);

  const [token, setToken] = useState<DepositToken>("SOL");
  const [amount, setAmount] = useState("0.1");
  const [confirmGift, setConfirmGift] = useState(false);
  const [ack, setAck] = useState(false);

  // ANSEM spot price in lamports per base unit (pool is the oracle here,
  // same as the on-chain accounting).
  const ansemLamports = pool.ansemReserve > 0 ? pool.solReserve / pool.ansemReserve : 0;

  const raw = parseFloat(amount) || 0;
  // everything downstream (shares, min-deposit) works in SOL-equivalent lamports
  const lamports = Math.round(token === "SOL" ? raw * LAMPORTS_PER_SOL : raw * ansemLamports);
  const isDonation = auth.status === "connected" && !!pen && pen.owner !== auth.pubkey;
  const belowMin = lamports < config.minDeposit;

  const preview = useMemo(() => {
    if (!pen || lamports <= 0) return null;
    const minted = sharesForDeposit(lamports, vault, pool);
    const nextPen = { ...pen, principal: pen.principal + lamports, shares: pen.shares + minted };
    const nextVault = {
      ...vault,
      pendingLamports: vault.pendingLamports + lamports,
      totalShares: vault.totalShares + minted,
    };
    return { minted, newWorth: penWorth(nextPen, nextVault, pool) };
  }, [pen, lamports, vault, pool]);

  const reset = () => {
    setConfirmGift(false);
    setAck(false);
    setAmount("0.1");
    setToken("SOL");
  };
  const onClose = () => {
    close();
    reset();
  };

  const switchToken = (t: DepositToken) => {
    setToken(t);
    setAmount(t === "SOL" ? "0.1" : "50000");
  };

  const doDeposit = () => {
    if (!pen) return;
    deposit(pen.owner, lamports, {
      token,
      tokenAmount: token === "ANSEM" ? raw : undefined,
      ...(isDonation ? { donation: true, fromHandle: auth.handle || "anon" } : {}),
    });
    if (soundOn) sfx.coin();
    onClose();
  };

  const submit = () => {
    if (auth.status !== "connected") {
      openSignIn();
      return;
    }
    if (belowMin || !pen) return;
    if (isDonation) setConfirmGift(true);
    else doDeposit();
  };

  const amountLabel = `${amount || 0}${token === "ANSEM" ? "" : ""} ${token === "SOL" ? "SOL" : "$ANSEM"}`;

  if (!pen) return <Modal open={!!target} onClose={onClose}>{null}</Modal>;

  return (
    <Modal open={!!target} onClose={onClose} labelledBy="fill-title">
      <AnimatePresence mode="wait">
        {!confirmGift ? (
          <motion.div key="amount" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-3">
              <Avatar seed={pen.avatarSeed} label={pen.displayName} size={44} />
              <div>
                <h2 id="fill-title" className="font-display text-lg font-bold leading-tight">
                  {isDonation ? `Gift into ${pen.displayName}’s bank` : "Top up your bank"}
                </h2>
                <p className="text-xs text-mute">“{pen.name}” · @{pen.handle}</p>
              </div>
            </div>

            {isDonation && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-piggy/25 bg-piggy/10 px-3 py-2 text-xs text-piggy-300">
                <Gift className="h-4 w-4 shrink-0" /> You’re filling someone else’s piggy bank.
              </div>
            )}

            {/* token toggle */}
            <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
              {(["SOL", "ANSEM"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => switchToken(t)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition",
                    token === t
                      ? t === "SOL"
                        ? "bg-piggy text-white shadow-[0_4px_16px_-4px_rgba(255,77,141,0.6)]"
                        : "bg-lime text-ink-950 shadow-[0_4px_16px_-4px_rgba(182,255,60,0.5)]"
                      : "text-mute hover:text-paper",
                  )}
                >
                  {t === "SOL" ? "◎ SOL" : "🐂 $ANSEM"}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex items-end justify-between">
                <label className="text-xs font-medium text-mute">Amount</label>
                <span className="text-[11px] text-faint">
                  min {token === "SOL" ? `${fmtSol(config.minDeposit)} SOL` : `≈ ${fmtCompact(config.minDeposit / Math.max(ansemLamports, 1))} ANSEM`}
                </span>
              </div>
              <div
                className={cn(
                  "mt-1.5 flex items-center gap-2 rounded-2xl border bg-white/5 px-4 py-3 transition",
                  belowMin && amount !== "" ? "border-danger/40" : "border-white/10 focus-within:border-piggy/50",
                )}
              >
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="w-full bg-transparent font-mono text-2xl font-semibold outline-none tnum placeholder:text-faint"
                  placeholder="0.0"
                  autoFocus
                />
                <span className="shrink-0 font-display text-lg text-mute">{token === "SOL" ? "SOL" : "$ANSEM"}</span>
              </div>
              <div className="mt-2.5 flex gap-2">
                {(token === "SOL" ? SOL_CHIPS : ANSEM_CHIPS).map((c) => (
                  <button
                    key={c}
                    onClick={() => setAmount(String(c))}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-1.5 text-xs font-semibold text-mute transition hover:border-piggy/40 hover:text-paper"
                  >
                    {token === "SOL" ? c : fmtCompact(c, 0)}
                  </button>
                ))}
              </div>

              {token === "ANSEM" && (
                <div className="mt-2.5 flex items-center justify-between rounded-xl border border-lime/15 bg-lime/[0.05] px-3 py-2">
                  <span className="text-[11px] text-mute">
                    CA <span className="font-mono text-lime/90">{shortKey(ANSEM_MINT, 5)}</span>
                  </span>
                  <CopyButton value={ANSEM_MINT} label="Copy CA" />
                </div>
              )}
            </div>

            {preview && !belowMin && (
              <div className="mt-4 space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-sm">
                <Row
                  label="Value at pool spot"
                  value={`${fmtSol(lamports)} SOL${token === "ANSEM" ? " eq." : ""}`}
                />
                <Row label="Bank’s worth after" value={`${fmtSol(preview.newWorth)} SOL`} accent />
                <div className="flex items-start gap-1.5 pt-1 text-[11px] text-faint">
                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-lime" />
                  {COPY.crankLag}
                </div>
              </div>
            )}

            <ILWarning compact className="mt-4" />

            <Button variant="primary" size="lg" full glow className="mt-4" onClick={submit} disabled={belowMin}>
              {auth.status !== "connected"
                ? "Sign in to fill"
                : belowMin
                  ? "Below minimum"
                  : isDonation
                    ? `Gift ${amountLabel}`
                    : `Deposit ${amountLabel}`}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="gift" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <button onClick={() => setConfirmGift(false)} className="mb-3 inline-flex items-center gap-1.5 text-sm text-mute transition hover:text-paper">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-danger/15 text-danger">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold">This is an irreversible gift</h2>
              <p className="mt-2 text-sm leading-relaxed text-mute">{COPY.giftIrreversible}</p>

              <div className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-left text-sm">
                <Row label="You send" value={amountLabel} />
                <Row label="Locks under" value={`@${pen.handle}’s rules`} />
                <Row label="Who can break it" value="only them" accent />
              </div>

              <label className="mt-4 flex w-full cursor-pointer items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 text-left">
                <input
                  type="checkbox"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-piggy"
                />
                <span className="text-xs text-mute">
                  I understand this gift is permanent and I can’t get it back.
                </span>
              </label>

              <Button variant="primary" size="lg" full className="mt-4" disabled={!ack} onClick={doDeposit}>
                <Gift className="h-4.5 w-4.5" /> Send the gift
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-mute">{label}</span>
      <span className={cn("font-mono text-sm font-semibold tnum", accent ? "text-lime" : "text-paper")}>{value}</span>
    </div>
  );
}
