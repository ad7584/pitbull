import { AnimatePresence, motion } from "framer-motion";
import { Cog, Gift, Hammer, PiggyBank, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { VAULT_KINDS } from "@/lib/protocol";
import { fmtCompact, fmtSol, timeAgo } from "@/lib/format";
import { usePit } from "@/lib/store";
import type { Activity } from "@/lib/types";
import { cn } from "@/lib/cn";

const ICONS = {
  PenCreated: { Icon: PiggyBank, cls: "text-grape-400 bg-grape-400/10" },
  Deposited: { Icon: Plus, cls: "text-lime bg-lime/10" },
  Donated: { Icon: Gift, cls: "text-piggy bg-piggy/10" },
  PenBroken: { Icon: Hammer, cls: "text-danger bg-danger/10" },
  Provisioned: { Icon: Cog, cls: "text-mute bg-white/5" },
};

export function LiveActivity({ limit = 8, now, handle }: { limit?: number; now: number; handle?: string }) {
  const activity = usePit((s) => s.activity);
  const rows = (handle ? activity.filter((a) => a.handle === handle) : activity).slice(0, limit);

  return (
    <div className="flex flex-col gap-1.5">
      <AnimatePresence initial={false}>
        {rows.map((a) => (
          <motion.div
            key={a.id}
            layout
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
          >
            <ActivityRow a={a} now={now} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ActivityRow({ a, now }: { a: Activity; now: number }) {
  const { Icon, cls } = ICONS[a.kind];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2.5 transition hover:bg-white/[0.04]">
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", cls)}>
        <Icon className="h-4 w-4" />
      </span>
      {a.kind !== "Provisioned" && <Avatar seed={a.avatarSeed} label={a.displayName} size={26} />}
      <div className="min-w-0 flex-1 text-sm">
        <Phrase a={a} />
      </div>
      <span className="shrink-0 font-mono text-[11px] text-faint">{timeAgo(a.ts, now)}</span>
    </div>
  );
}

/** "0.5 SOL" or "132K ANSEM" depending on the deposit token. */
function depositAmount(a: Activity): string {
  if (a.token === "ANSEM" && a.tokenAmount) return `${fmtCompact(a.tokenAmount)} ANSEM`;
  return `${fmtSol(a.amount ?? 0)} SOL`;
}

function Handle({ h }: { h: string }) {
  return (
    <Link to={`/pen/${h}`} className="font-semibold text-paper transition hover:text-piggy-300">
      @{h}
    </Link>
  );
}

function Phrase({ a }: { a: Activity }) {
  switch (a.kind) {
    case "PenCreated":
      return (
        <span className="text-mute">
          <Handle h={a.handle} /> opened a{" "}
          <span className="text-paper">{a.vaultKind ? VAULT_KINDS[a.vaultKind].codename : "piggy"}</span> bank
        </span>
      );
    case "Deposited":
      return (
        <span className="text-mute">
          <Handle h={a.handle} /> dropped{" "}
          <span className="font-mono text-lime">{depositAmount(a)}</span> in
        </span>
      );
    case "Donated":
      return (
        <span className="text-mute">
          <span className="font-semibold text-piggy-300">{a.fromHandle}</span> gifted{" "}
          <span className="font-mono text-piggy">{depositAmount(a)}</span> to <Handle h={a.handle} />
        </span>
      );
    case "PenBroken":
      return (
        <span className="text-mute">
          <Handle h={a.handle} /> cracked open ·{" "}
          <span className="font-mono text-paper">{fmtSol(a.solPaid ?? 0)} SOL</span> +{" "}
          <span className="font-mono text-paper">{fmtCompact(a.ansemPaid ?? 0)} ANSEM</span>
        </span>
      );
    case "Provisioned":
      return (
        <span className="text-mute">
          keeper batched <span className="font-mono text-paper">{fmtSol(a.amount ?? 0)} SOL</span> into the pool
        </span>
      );
  }
}
