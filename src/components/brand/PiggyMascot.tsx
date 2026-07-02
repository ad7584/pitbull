import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/cn";

export type MascotMood = "idle" | "alert" | "locked" | "happy";

interface Props {
  mood?: MascotMood;
  size?: number;
  className?: string;
  /** hairline seam glow (used pre-smash). */
  cracking?: boolean;
}

/**
 * The PIT-BULL mascot: a piggy bank wearing a studded guard-dog collar.
 * Tough exterior, warm core — the brand in one shape. Reacts by mood.
 */
export function PiggyMascot({ mood = "idle", size = 220, className, cracking }: Props) {
  const id = useId();
  const earUp = mood === "alert" || mood === "happy";

  return (
    <motion.svg
      viewBox="0 0 240 210"
      width={size}
      height={(size * 210) / 240}
      className={cn("overflow-visible", className)}
      animate={mood === "idle" ? { y: [0, -8, 0] } : { y: 0 }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <radialGradient id={`body-${id}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FFA6C6" />
          <stop offset="55%" stopColor="#FF4D8D" />
          <stop offset="100%" stopColor="#E23A76" />
        </radialGradient>
        <linearGradient id={`snout-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9BC0" />
          <stop offset="100%" stopColor="#FF5F9B" />
        </linearGradient>
        <filter id={`soft-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* ground glow */}
      <ellipse cx="120" cy="192" rx="78" ry="12" fill="#FF4D8D" opacity="0.18" filter={`url(#soft-${id})`} />

      {/* ears */}
      <motion.path
        d="M62 70 L52 34 L92 58 Z"
        fill="#E23A76"
        animate={{ rotate: earUp ? -14 : -4 }}
        style={{ originX: "72px", originY: "64px" }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
      />
      <motion.path
        d="M178 70 L188 34 L148 58 Z"
        fill="#E23A76"
        animate={{ rotate: earUp ? 14 : 4 }}
        style={{ originX: "168px", originY: "64px" }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
      />

      {/* body */}
      <ellipse cx="120" cy="118" rx="86" ry="70" fill={`url(#body-${id})`} />
      {/* highlight */}
      <ellipse cx="92" cy="86" rx="34" ry="22" fill="#fff" opacity="0.18" />

      {/* coin slot */}
      <rect x="98" y="60" width="44" height="8" rx="4" fill="#0B0A0F" opacity="0.55" />
      <rect x="98" y="60" width="44" height="8" rx="4" fill="#B6FF3C" opacity={mood === "alert" ? 0.9 : 0.25} />

      {/* seam (glows when cracking) */}
      <path
        d="M50 118 Q120 108 190 118"
        stroke="#B6FF3C"
        strokeWidth={cracking ? 3 : 1.2}
        opacity={cracking ? 0.9 : 0.15}
        fill="none"
        strokeLinecap="round"
      />

      {/* legs */}
      <rect x="66" y="168" width="20" height="26" rx="9" fill="#E23A76" />
      <rect x="154" y="168" width="20" height="26" rx="9" fill="#E23A76" />

      {/* studded guard-dog collar */}
      <path d="M96 150 Q120 166 144 150" stroke="#1A1626" strokeWidth="12" fill="none" strokeLinecap="round" />
      {[104, 120, 136].map((x, i) => (
        <circle key={x} cx={x} cy={155 + (i === 1 ? 3 : 1)} r="3.2" fill="#B6FF3C" />
      ))}

      {/* snout */}
      <ellipse cx="120" cy="132" rx="30" ry="22" fill={`url(#snout-${id})`} />
      <ellipse cx="110" cy="132" rx="4.5" ry="6" fill="#0B0A0F" opacity="0.6" />
      <ellipse cx="130" cy="132" rx="4.5" ry="6" fill="#0B0A0F" opacity="0.6" />

      {/* eyes */}
      <motion.g animate={mood === "idle" ? { scaleY: [1, 1, 0.1, 1] } : { scaleY: 1 }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.92, 0.95, 1] }} style={{ originY: "100px" }}>
        <circle cx="94" cy="100" r={earUp ? 8 : 6.5} fill="#0B0A0F" />
        <circle cx="146" cy="100" r={earUp ? 8 : 6.5} fill="#0B0A0F" />
        <circle cx="96.5" cy="97.5" r="2.4" fill="#fff" />
        <circle cx="148.5" cy="97.5" r="2.4" fill="#fff" />
      </motion.g>
      {/* brow — a little tough */}
      <path d="M84 86 L104 90" stroke="#0B0A0F" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M156 86 L136 90" stroke="#0B0A0F" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

      {/* tail */}
      <path d="M204 118 q16 -4 12 -18 q-3 -10 -14 -6" stroke="#E23A76" strokeWidth="7" fill="none" strokeLinecap="round" />

      {/* lock overlay */}
      {mood === "locked" && (
        <g>
          <rect x="150" y="150" width="40" height="34" rx="9" fill="#12101A" stroke="#8E67FF" strokeWidth="2" />
          <path d="M158 150 v-6 a12 12 0 0 1 24 0 v6" fill="none" stroke="#8E67FF" strokeWidth="4" />
          <circle cx="170" cy="166" r="4" fill="#A588FF" />
        </g>
      )}
    </motion.svg>
  );
}
