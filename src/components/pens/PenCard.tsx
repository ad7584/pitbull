import { motion } from "framer-motion";
import { Heart, PlusCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, KindBadge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { unlockStatus } from "@/lib/engine";
import { fmtCountdown, fmtSol } from "@/lib/format";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";
import type { Pen } from "@/lib/types";
import { cn } from "@/lib/cn";

export function PenCard({ pen, rank }: { pen: Pen; rank?: number }) {
  const now = usePit((s) => s.now);
  const vault = usePit((s) => s.vault);
  const pool = usePit((s) => s.pool);
  const worth = usePit((s) => s.worthOf(pen));
  const openFill = useUI((s) => s.openFill);
  const nav = useNavigate();

  const st = unlockStatus(pen, now, vault, pool);
  const delta = worth - pen.principal;
  const up = delta >= 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group card relative cursor-pointer overflow-hidden p-5"
      onClick={() => nav(`/pen/${pen.handle}`)}
    >
      {/* seam glow on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-piggy/60 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <Avatar seed={pen.avatarSeed} label={pen.displayName} size={44} />
            {rank !== undefined && rank < 3 && (
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-lime text-[10px] font-bold text-ink-950 ring-2 ring-ink-950">
                {rank + 1}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-display font-semibold">{pen.displayName}</span>
              {pen.isCharity && <Heart className="h-3.5 w-3.5 shrink-0 fill-piggy text-piggy" />}
            </div>
            <Link
              to={`/pen/${pen.handle}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate text-xs text-mute transition hover:text-piggy-300"
            >
              @{pen.handle}
            </Link>
          </div>
        </div>
        <KindBadge kind={pen.kind} />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <ProgressRing
          progress={st.progress}
          size={78}
          stroke={7}
          from={up ? "#FF4D8D" : "#F23674"}
          to={up ? "#B6FF3C" : "#FF77A8"}
        >
          <div className="text-center">
            <div className="font-mono text-sm font-semibold tnum">{Math.round(st.progress * 100)}%</div>
          </div>
        </ProgressRing>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-paper">“{pen.name}”</div>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-faint">Saved</div>
              <div className="font-mono text-sm font-semibold tnum">{fmtSol(pen.principal)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-faint">Worth</div>
              <div className={cn("font-mono text-sm font-semibold tnum", up ? "text-mint" : "text-danger")}>
                {fmtSol(worth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-mute">
          {pen.kind === "Timelock" && !st.unlocked && <>unlocks in <span className="font-mono text-paper">{fmtCountdown(st.secondsLeft ?? 0)}</span></>}
          {pen.kind === "AmountTarget" && !st.unlocked && (
            <>goal <span className="font-mono text-paper">{fmtSol(pen.unlockParam)}</span> SOL</>
          )}
          {st.unlocked && <span className="text-mint">● {st.label.toLowerCase()}</span>}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openFill(pen.owner);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-piggy-300 transition hover:bg-piggy/15 hover:text-piggy"
        >
          <PlusCircle className="h-3.5 w-3.5" /> Fill it
        </button>
      </div>

      {pen.isCharity && (
        <div className="mt-3">
          <Badge tone="pink">
            <Heart className="h-3 w-3 fill-current" /> Charity · {pen.charityName}
          </Badge>
        </div>
      )}
    </motion.div>
  );
}
