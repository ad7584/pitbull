import { AlertTriangle, ArrowUpFromLine, Check, Loader2, Wallet } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { api, type Balance } from "@/lib/api";
import { LAMPORTS_PER_SOL } from "@/lib/protocol";
import { fmtCompact, fmtSol } from "@/lib/format";

/**
 * The real, custodial flow: the backend assigns this user a unique deposit
 * address; SOL sent there is auto-detected, credited to the shared ledger, and
 * swept into the keeper. Balances poll live from the backend. The owner can
 * withdraw their share to any address. Devnet.
 */
export function DepositCard({ userId }: { userId: string }) {
  const [address, setAddress] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [error, setError] = useState(false);

  // withdraw form
  const [dest, setDest] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [wResult, setWResult] = useState<string | null>(null);
  const [wError, setWError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .depositAddress(userId)
      .then(async (d) => {
        if (!alive) return;
        setAddress(d.depositAddress);
        const dataUrl = await QRCode.toDataURL(d.depositAddress, {
          margin: 2,
          width: 240,
          color: { dark: "#0B0A0F", light: "#FFFFFF" },
        });
        if (alive) setQr(dataUrl);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    let alive = true;
    const load = () => api.balance(userId).then((b) => alive && setBalance(b)).catch(() => {});
    load();
    const id = window.setInterval(load, 10_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [userId]);

  const redeemableSol = balance ? balance.creditedLamports / LAMPORTS_PER_SOL : 0;

  const withdraw = async () => {
    setBusy(true);
    setWError(null);
    setWResult(null);
    try {
      const lamports = amount ? Math.round(parseFloat(amount) * LAMPORTS_PER_SOL) : undefined;
      const r = await api.withdraw({ userId, destination: dest.trim(), lamports });
      setWResult(r.sig);
      setDest("");
      setAmount("");
      const b = await api.balance(userId);
      setBalance(b);
    } catch (e) {
      setWError(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="card flex items-center gap-2.5 p-4 text-sm text-amber-200/90">
        <AlertTriangle className="h-4 w-4 text-amber-400" /> Couldn’t reach the deposit service. Try again shortly.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-4.5 w-4.5 text-piggy" />
          <h3 className="font-display text-lg font-bold">Your deposit address</h3>
        </div>
        <span className="chip text-[11px]">devnet</span>
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="mx-auto grid h-[168px] w-[168px] place-items-center rounded-2xl bg-white p-2 sm:mx-0">
          {qr ? <img src={qr} alt="Deposit address QR" className="h-full w-full" /> : <Loader2 className="h-6 w-6 animate-spin text-ink-900" />}
        </div>

        <div>
          <div className="text-xs font-medium text-mute">Send SOL here (devnet) — it credits automatically</div>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-paper">{address ?? "…"}</span>
            {address && <CopyButton value={address} label="Copy" />}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Stat label="Credited" value={balance ? `${fmtSol(balance.creditedLamports)} SOL` : null} />
            <Stat label="Your shares" value={balance ? fmtCompact(balance.shares) : null} />
          </div>
        </div>
      </div>

      {/* withdraw — owner only */}
      <div className="mt-5 border-t border-white/10 pt-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ArrowUpFromLine className="h-4 w-4 text-lime" /> Withdraw
          <span className="text-xs font-normal text-faint">— up to {redeemableSol.toFixed(4)} SOL</span>
        </div>
        <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
          <input
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="Destination address"
            className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 font-mono text-sm outline-none placeholder:text-faint focus:border-piggy/50"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            inputMode="decimal"
            placeholder="SOL (blank = all)"
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm outline-none placeholder:text-faint focus:border-piggy/50 sm:w-40"
          />
          <Button variant="primary" onClick={withdraw} disabled={busy || !dest.trim() || redeemableSol <= 0}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />} Withdraw
          </Button>
        </div>

        {wResult && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-mint/25 bg-mint/10 px-3 py-2 text-xs text-mint">
            <Check className="h-3.5 w-3.5" /> Sent · <span className="font-mono">{wResult.slice(0, 12)}…</span>
          </div>
        )}
        {wError && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-danger/25 bg-danger/10 px-3 py-2 text-xs text-danger">
            <AlertTriangle className="h-3.5 w-3.5" /> {wError}
          </div>
        )}
        <p className="mt-2.5 text-[11px] leading-relaxed text-faint">
          Balances update within ~15s of a confirmed transfer. Devnet prototype — no real funds.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className="mt-0.5 font-mono text-base font-semibold tnum text-lime">
        {value ?? <Loader2 className="h-4 w-4 animate-spin text-mute" />}
      </div>
    </div>
  );
}
