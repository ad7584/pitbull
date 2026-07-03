import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

/**
 * The impermanent-loss warning. Shown anywhere money is about to move —
 * required disclosure, not decoration. Never soften this copy.
 */
export function ILWarning({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] text-amber-200/90",
        compact ? "px-3 py-2.5 text-xs" : "p-4 text-sm",
        className,
      )}
    >
      <AlertTriangle className={cn("shrink-0 text-amber-400", compact ? "mt-0.5 h-3.5 w-3.5" : "mt-0.5 h-4.5 w-4.5")} />
      <span className="leading-relaxed">
        <span className="font-semibold text-amber-300">Impermanent loss risk:</span> your deposit becomes
        $ANSEM/SOL liquidity. If $ANSEM's price moves, withdrawing can return{" "}
        <span className="font-semibold">less than you put in</span> — even after fees. The buffer softens this
        partially; it never erases it.{" "}
        <Link to="/terms" className="underline decoration-amber-400/50 underline-offset-2 hover:text-amber-100">
          Read the risks
        </Link>
      </span>
    </div>
  );
}
