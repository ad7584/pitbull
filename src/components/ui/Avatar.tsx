import { seededUnit } from "@/lib/format";
import { cn } from "@/lib/cn";

interface Props {
  seed: string;
  label?: string;
  size?: number;
  className?: string;
}

const PALETTES = [
  ["#FF4D8D", "#8E67FF"],
  ["#B6FF3C", "#35D399"],
  ["#8E67FF", "#3FE5FF"],
  ["#FFA318", "#FF4D8D"],
  ["#3FE5FF", "#B6FF3C"],
  ["#FF6EC7", "#FFD069"],
];

/** Deterministic gradient avatar from a seed, with initials. */
export function Avatar({ seed, label, size = 40, className }: Props) {
  const u = seededUnit(seed);
  const [a, b] = PALETTES[Math.floor(u * PALETTES.length)];
  const angle = Math.floor(seededUnit(seed + "x") * 360);
  const initials = (label ?? seed).replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "🐷";

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full ring-1 ring-white/15", className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(${angle}deg, ${a}, ${b})`,
      }}
      aria-hidden
    >
      <span
        className="absolute inset-0 flex items-center justify-center font-display font-semibold text-white/90 mix-blend-overlay"
        style={{ fontSize: size * 0.4 }}
      >
        {initials}
      </span>
    </div>
  );
}
