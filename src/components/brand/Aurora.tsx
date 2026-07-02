import { cn } from "@/lib/cn";

/**
 * Drifting aurora orbs behind glass + a faint dot-grid. The whole mood lives
 * here (design brief §5.1). Fixed, non-interactive, GPU-friendly blurs.
 */
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      {/* dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 75%)",
        }}
      />
      {/* orbs */}
      <div className="absolute -left-32 -top-24 h-[42rem] w-[42rem] animate-aurora-1 rounded-full bg-piggy/25 blur-[130px]" />
      <div className="absolute -right-40 top-10 h-[38rem] w-[38rem] animate-aurora-2 rounded-full bg-grape/25 blur-[140px]" />
      <div className="absolute left-1/3 top-[38rem] h-[34rem] w-[34rem] animate-aurora-3 rounded-full bg-lime/12 blur-[150px]" />
      {/* top vignette to seat the nav */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950/80 to-transparent" />
    </div>
  );
}
