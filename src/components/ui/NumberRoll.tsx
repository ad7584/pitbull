import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface Props {
  value: number;
  format?: (v: number) => string;
  className?: string;
  duration?: number;
  /** value to animate up from on first mount (default 0). */
  mountFrom?: number;
}

/**
 * Smoothly interpolates to `value` on every change (and from `mountFrom` on
 * mount). tabular-nums keeps ticking digits from jittering — the detail that
 * signals "real DeFi" (per the design brief).
 */
export function NumberRoll({ value, format, className, duration = 1.1, mountFrom = 0 }: Props) {
  const [display, setDisplay] = useState(mountFrom);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    const start = prev.current ?? mountFrom;
    const controls = animate(start, value, {
      duration: Math.abs(value - start) < 1e-6 ? 0 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={cn("tnum", className)}>{format ? format(display) : display.toFixed(2)}</span>;
}
