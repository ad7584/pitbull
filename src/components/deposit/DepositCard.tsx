import { AlertTriangle, Loader2, Wallet } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { api, type Balance } from "@/lib/api";
import { fmtCompact, fmtSol } from "@/lib/format";

/**
 * The real, custodial deposit flow: the backend assigns this user a unique
 * deposit address; sending SOL there is auto-detected and credited to the
 * shared ledger. No wallet-connect for funds — just an address. Balances are
 * polled live from the backend (the shared source of truth).
 */
export function DepositCard({ userId }: { userId: string }) {
  const [address, setAddress] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [error, setError] = useState(false);

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
    const load = () =>
      api
        .balance(userId)
        .then((b) => alive && setBalance(b))
        .catch(() => {});
    load();
    const id = window.setInterval(load, 10_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [userId]);

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
        {/* QR on a white tile */}
        <div className="mx-auto grid h-[168px] w-[168px] place-items-center rounded-2xl bg-white p-2 sm:mx-0">
          {qr ? (
            <img src={qr} alt="Deposit address QR" className="h-full w-full" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-ink-900" />
          )}
        </div>

        <div>
          <div className="text-xs font-medium text-mute">Send SOL here (devnet) — it credits automatically</div>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-paper">
              {address ?? "…"}
            </span>
            {address && <CopyButton value={address} label="Copy" />}
          </div>

          {/* live balance from the shared ledger */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Stat label="Credited" value={balance ? `${fmtSol(balance.creditedLamports)} SOL` : null} />
            <Stat label="Your shares" value={balance ? fmtCompact(balance.shares) : null} />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-faint">
            Balances update within ~15s of a confirmed transfer. This is a devnet prototype — no real funds.
          </p>
        </div>
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
