import { cn } from "@/lib/cn";

/**
 * Static depth layer for the near-black canvas — a single, very faint top
 * radial (so the page isn't a flat #000) plus a masked dot-grid. No animation,
 * no colored orbs: restraint is the brand.
 */
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      {/* faint elevation at the top so the page reads layered, not flat black */}
      <div
        className="absolute inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(255,77,141,0.05), transparent 60%)",
        }}
      />
      {/* barely-there dot grid, fading out below the fold */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(120% 70% at 50% 0%, #000 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(120% 70% at 50% 0%, #000 20%, transparent 70%)",
        }}
      />
    </div>
  );
}
