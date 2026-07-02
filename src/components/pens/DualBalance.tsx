import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { NumberRoll } from "@/components/ui/NumberRoll";
import { COPY } from "@/lib/protocol";
import { SOL_USD } from "@/lib/seed";
import { fmtPct, fmtSol, toSol } from "@/lib/format";
import { cn } from "@/lib/cn";

interface Props {
  principal: number;
  worth: number;
  compact?: boolean;
  showDisclosure?: boolean;
}

/**
 * The dual-balance display (INTEGRATION.md §5, "non-negotiable"). We NEVER
 * blend Saved and Worth into one number — that's how "it stole my money"
 * posts about correct behavior happen.
 */
export function DualBalance({ principal, worth, compact, showDisclosure = true }: Props) {
  const delta = worth - principal;
  const pct = principal > 0 ? delta / principal : 0;
  const up = delta >= 0;

  return (
    <div>
      <div className={cn("grid grid-cols-2 gap-3", compact ? "gap-2" : "gap-4")}>
        <Stat label="Saved" hint="what went in">
          <span className={cn("font-mono font-semibold tnum", compact ? "text-xl" : "text-3xl")}>
            {fmtSol(principal)}
          </span>
          <span className="ml-1 text-sm text-mute">SOL</span>
        </Stat>

        <Stat label="Worth now" hint="share of the pool" accent>
          <NumberRoll
            value={toSol(worth)}
            mountFrom={toSol(principal)}
            format={(v) => v.toLocaleString("en-US", { maximumFractionDigits: 3 })}
            className={cn("font-mono font-semibold text-gradient-warm", compact ? "text-xl" : "text-3xl")}
          />
          <span className="ml-1 text-sm text-mute">SOL</span>
        </Stat>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <motion.span
          key={up ? "up" : "down"}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-semibold",
            up ? "bg-mint/12 text-mint" : "bg-danger/12 text-danger",
          )}
        >
          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {fmtSol(delta, { sign: true })} SOL
        </motion.span>
        <span className={cn("font-mono text-xs", up ? "text-mint" : "text-danger")}>{fmtPct(pct)}</span>
        <span className="text-xs text-faint">· ≈ ${(Math.abs(toSol(delta)) * SOL_USD).toFixed(0)}</span>
      </div>

      {showDisclosure && (
        <p className="mt-3 text-xs leading-relaxed text-faint">{COPY.worthMoves}</p>
      )}
    </div>
  );
}

function Stat({
  label,
  hint,
  accent,
  children,
}: {
  label: string;
  hint: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border p-3.5", accent ? "border-piggy/20 bg-piggy/[0.06]" : "border-white/10 bg-white/[0.03]")}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-mute">{label}</span>
      </div>
      <div className="mt-1.5 flex items-baseline">{children}</div>
      <div className="mt-1 text-[11px] text-faint">{hint}</div>
    </div>
  );
}
