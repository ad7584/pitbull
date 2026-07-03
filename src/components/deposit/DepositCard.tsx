import { AlertTriangle, ArrowUpFromLine, Check, Loader2, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { api, type Balance } from "@/lib/api";
import { authBridge } from "@/lib/authBridge";
import { LAMPORTS_PER_SOL } from "@/lib/protocol";
import { fmtCompact, fmtSol } from "@/lib/format";

/**
 * The real custodial flow: the backend assigns this user a unique deposit
 * address; SOL sent there is auto-detected, credited to the shared ledger, and
 * swept into the keeper. Balances poll live. The owner can withdraw their share
 * to any address — verified against their Privy token.
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
          color: { dark: "#0A0B0D", light: "#FFFFFF" },
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
      const authToken = (await authBridge.getAccessToken()) ?? undefined;
      const r = await api.withdraw({ userId, destination: dest.trim(), lamports, authToken });
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
      <div className="card flex items-center gap-2.5 p-4 text-sm text-amber">
        <AlertTriangle className="h-4 w-4" /> Couldn’t reach the deposit service. Try again shortly.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-piggy" />
          <h3 className="text-[15px] font-semibold text-paper">Your deposit address</h3>
        </div>
        <span className="chip text-[11px]">Solana · mainnet</span>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:p-6">
        <div className="mx-auto grid h-[164px] w-[164px] place-items-center rounded-xl bg-white p-2 sm:mx-0">
          {qr ? <img src={qr} alt="Deposit address QR" className="h-full w-full" /> : <Loader2 className="h-6 w-6 animate-spin text-ink-900" />}
        </div>

        <div>
          <div className="eyebrow">Send SOL here — it credits automatically</div>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/[0.1] bg-ink-800 px-3 py-2.5">
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
      <div className="border-t border-white/[0.07] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-paper">
          <ArrowUpFromLine className="h-4 w-4 text-lime" /> Withdraw
          <span className="font-normal text-faint">— up to <span className="tnum">{redeemableSol.toFixed(4)}</span> SOL</span>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="Destination address"
            className="input flex-1 font-mono"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            inputMode="decimal"
            placeholder="SOL (blank = all)"
            className="input sm:w-44"
          />
          <Button variant="accent" onClick={withdraw} disabled={busy || !dest.trim() || redeemableSol <= 0}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />} Withdraw
          </Button>
        </div>

        {wResult && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-mint/25 bg-mint/10 px-3 py-2 text-xs text-mint">
            <Check className="h-3.5 w-3.5" /> Sent · <span className="font-mono">{wResult.slice(0, 12)}…</span>
          </div>
        )}
        {wError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-xs text-danger">
            <AlertTriangle className="h-3.5 w-3.5" /> {wError}
          </div>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-faint">
          Real SOL on Solana mainnet — send only what you intend to deposit. Balances update within ~15s of a
          confirmed transfer. Only you can withdraw your balance.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
      <div className="eyebrow">{label}</div>
      <div className="mt-1 font-mono text-base font-semibold tnum text-paper">
        {value ?? <Loader2 className="h-4 w-4 animate-spin text-mute" />}
      </div>
    </div>
  );
}
