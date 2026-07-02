import { type ReactNode, useId } from "react";
import { cn } from "@/lib/cn";

interface Props {
  progress: number; // 0..1
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
  /** gradient stops */
  from?: string;
  to?: string;
  /** show a tick marker at target (for goal-by-date UX). */
  marker?: number;
  trackClassName?: string;
}

/** Animated SVG progress ring with a gradient stroke and centered content. */
export function ProgressRing({
  progress,
  size = 220,
  stroke = 14,
  children,
  className,
  from = "#FF4D8D",
  to = "#B6FF3C",
  marker,
  trackClassName,
}: Props) {
  const id = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  const offset = c * (1 - p);

  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <filter id={`glow-${id}`}>
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={cn("stroke-white/8", trackClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#grad-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="ring-progress"
          filter={`url(#glow-${id})`}
        />
        {marker !== undefined && marker > 0 && marker < 1 && (
          <circle
            cx={size / 2 + r * Math.cos(2 * Math.PI * marker)}
            cy={size / 2 + r * Math.sin(2 * Math.PI * marker)}
            r={stroke / 2 - 1}
            className="fill-white/80"
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
