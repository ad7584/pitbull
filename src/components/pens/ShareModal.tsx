import { Download, Loader2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Modal } from "@/components/ui/Modal";
import { unlockStatus } from "@/lib/engine";
import { APP_HOST } from "@/lib/protocol";
import { penAddress } from "@/lib/seed";
import { chunkAddress, downloadDataUrl, generateShareCard } from "@/lib/sharecard";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { cn } from "@/lib/cn";

/**
 * Share sheet (INTEGRATION.md §3): generates a real 1200x630 PNG card with
 * the pen's donate address + QR, downloadable and postable. The address is
 * printed in full — anyone can send SOL or $ANSEM to it.
 */
export function ShareModal() {
  const target = useUI((s) => s.shareTarget);
  const close = useUI((s) => s.closeShare);
  const pen = usePit((s) => (target ? s.findPen(target) : undefined));
  const worth = usePit((s) => (pen ? s.worthOf(pen) : 0));
  const now = usePit((s) => s.now);
  const vault = usePit((s) => s.vault);
  const pool = usePit((s) => s.pool);

  const [card, setCard] = useState<string | null>(null);

  const address = pen ? penAddress(pen.owner) : "";
  const url = pen ? `${APP_HOST}/pen/${pen.handle}` : "";

  useEffect(() => {
    if (!pen || !target) {
      setCard(null);
      return;
    }
    let alive = true;
    const st = unlockStatus(pen, now, vault, pool);
    generateShareCard({ pen, worth, progress: st.progress, address: penAddress(pen.owner) })
      .then((dataUrl) => alive && setCard(dataUrl))
      .catch(() => alive && setCard(null));
    return () => {
      alive = false;
    };
    // regenerate only when the modal opens for a pen — not on every tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, pen?.owner]);

  if (!pen) return <Modal open={!!target} onClose={close}>{null}</Modal>;

  const shareText = encodeURIComponent(
    `filling my PIT-BULL piggy bank 🐷 "${pen.name}" — every drop becomes locked $ANSEM liquidity, not a dump bag. fill it: https://${url}`,
  );
  const chunks = chunkAddress(address);

  return (
    <Modal open={!!target} onClose={close} labelledBy="share-title" className="max-w-lg">
      <h2 id="share-title" className="font-display text-xl font-bold">
        Share this bank
      </h2>
      <p className="mt-1 text-sm text-mute">
        A real card, a real address. Anyone can scan or send — SOL or $ANSEM.
      </p>

      {/* generated card */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
        {card ? (
          <img src={card} alt={`Share card for @${pen.handle}'s piggy bank`} className="block w-full" />
        ) : (
          <div className="grid aspect-[1200/630] w-full place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-piggy" />
          </div>
        )}
      </div>

      {/* donate address — full, chunked, ends emphasized */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">
            Donate address · pen PDA
          </span>
          <CopyButton value={address} label="Copy address" />
        </div>
        <p className="mt-2 break-all font-mono text-[13px] leading-relaxed tnum">
          {chunks.map((c, i) => (
            <span
              key={i}
              className={cn(
                "mr-1",
                i === 0 || i === chunks.length - 1 ? "font-bold text-lime" : "text-paper/80",
              )}
            >
              {c}
            </span>
          ))}
        </p>
        <p className="mt-1.5 text-[11px] text-faint">
          Verify the <span className="text-lime">first</span> and <span className="text-lime">last</span> group
          before sending — that's what spoofed addresses fake.
        </p>
      </div>

      {/* link row */}
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-mute">{url}</span>
        <CopyButton value={`https://${url}`} label="Copy link" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Button variant="ghost" size="lg" onClick={() => card && downloadDataUrl(card, `pitbull-${pen.handle}.png`)} disabled={!card}>
          <Download className="h-4.5 w-4.5" /> Download card
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${shareText}`, "_blank")}
        >
          <Share2 className="h-4.5 w-4.5" /> Post to X
        </Button>
      </div>
    </Modal>
  );
}
