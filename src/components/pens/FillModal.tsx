import { AlertTriangle, Loader2, Wallet } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";

/**
 * Add funds — the REAL custodial flow. There is no "type an amount and it's
 * added" step (that was the old in-memory demo). You add funds by sending SOL
 * to your unique deposit address; the backend detects it and credits your
 * balance. This modal shows that address + QR.
 */
export function FillModal() {
  const target = useUI((s) => s.fillTarget);
  const close = useUI((s) => s.closeFill);
  const openSignIn = useUI((s) => s.openSignIn);
  const auth = usePit((s) => s.auth);

  const [address, setAddress] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!target || auth.status !== "connected" || !auth.userId) return;
    let alive = true;
    setAddress(null);
    setError(false);
    api
      .depositAddress(auth.userId)
      .then(async (d) => {
        if (!alive) return;
        setAddress(d.depositAddress);
        const url = await QRCode.toDataURL(d.depositAddress, {
          margin: 2,
          width: 220,
          color: { dark: "#0B0A0F", light: "#FFFFFF" },
        });
        if (alive) setQr(url);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [target, auth.status, auth.userId]);

  const onClose = () => {
    close();
    setAddress(null);
    setQr(null);
  };

  return (
    <Modal open={!!target} onClose={onClose} labelledBy="fill-title">
      <div className="flex items-center gap-2">
        <Wallet className="h-4.5 w-4.5 text-piggy" />
        <h2 id="fill-title" className="font-display text-lg font-bold">
          Add funds
        </h2>
      </div>

      {auth.status !== "connected" ? (
        <div className="mt-4">
          <p className="text-sm text-mute">Sign in to get your deposit address.</p>
          <Button variant="primary" size="lg" full className="mt-4" onClick={() => { onClose(); openSignIn(); }}>
            Sign in
          </Button>
        </div>
      ) : error ? (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-3.5 text-sm text-amber-200/90">
          <AlertTriangle className="h-4 w-4 text-amber-400" /> Couldn’t reach the deposit service. Try again shortly.
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            Send SOL to your address below — it’s detected and credited automatically (~15s). No amount to type here;
            the amount is however much you send.
          </p>
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="grid h-[160px] w-[160px] place-items-center rounded-2xl bg-white p-2">
              {qr ? <img src={qr} alt="Deposit address QR" className="h-full w-full" /> : <Loader2 className="h-6 w-6 animate-spin text-ink-900" />}
            </div>
            <div className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate font-mono text-sm text-paper">{address ?? "…"}</span>
              {address && <CopyButton value={address} label="Copy" />}
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-faint">
            Your balance updates on the dashboard once the transfer confirms.
          </p>
        </>
      )}
    </Modal>
  );
}
