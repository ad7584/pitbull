import { cn } from "@/lib/cn";

export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-bold tracking-tight", className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-piggy to-grape shadow-[0_4px_16px_-4px_rgba(255,77,141,0.7)]">
        <span className="text-base leading-none">🐷</span>
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-lime ring-2 ring-ink-950" />
      </span>
      {!compact && (
        <span className="text-lg leading-none">
          PIT<span className="text-piggy">·</span>BULL
        </span>
      )}
    </span>
  );
}
