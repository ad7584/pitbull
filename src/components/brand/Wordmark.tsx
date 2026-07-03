import { cn } from "@/lib/cn";
import { Bull } from "./Bull";

/**
 * MINOTAUR wordmark — the bull-head logo as the mark, set tight beside a clean
 * grotesk lockup.
 */
export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-display font-semibold tracking-tight", className)}>
      <Bull src="/logo.png" alt="MINOTAUR" className="h-7 w-7 shrink-0" />
      {!compact && <span className="text-[17px] leading-none tracking-[0.02em] text-paper">MINOTAUR</span>}
    </span>
  );
}
