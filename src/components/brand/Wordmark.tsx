import { cn } from "@/lib/cn";
import { Bull } from "./Bull";

/**
 * PIT·BULL wordmark — the bull cutout as the mark, set tight beside a clean
 * grotesk lockup. The mid-dot is the one spot of accent pink.
 */
export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-display font-semibold tracking-tight", className)}>
      <Bull className="h-7 w-7 shrink-0" />
      {!compact && (
        <span className="text-[17px] leading-none text-paper">
          PIT<span className="text-piggy">·</span>BULL
        </span>
      )}
    </span>
  );
}
