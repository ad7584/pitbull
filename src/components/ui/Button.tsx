import { motion, useMotionValue, useSpring } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "lime" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "xl";

interface Props {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  glow?: boolean;
  /** magnetic hover — button eases toward the cursor. */
  magnetic?: boolean;
  full?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-piggy text-white hover:bg-piggy-400 shadow-[0_8px_30px_-8px_rgba(255,77,141,0.6)]",
  lime: "bg-lime text-ink-950 hover:bg-lime-400 shadow-[0_8px_30px_-8px_rgba(182,255,60,0.5)]",
  ghost: "bg-white/5 text-paper hover:bg-white/10 border border-white/10",
  outline: "bg-transparent text-paper border border-white/15 hover:border-white/30 hover:bg-white/5",
  danger: "bg-danger text-white hover:brightness-110 shadow-[0_8px_30px_-8px_rgba(242,54,116,0.6)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-xl gap-1.5",
  md: "h-11 px-5 text-sm rounded-2xl gap-2",
  lg: "h-13 px-6 text-base rounded-2xl gap-2 py-3.5",
  xl: "h-16 px-8 text-lg rounded-3xl gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { children, variant = "primary", size = "md", className, onClick, disabled, type = "button", glow, magnetic, full },
  ref,
) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={magnetic ? { x: sx, y: sy } : undefined}
      onMouseMove={
        magnetic
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              x.set((e.clientX - r.left - r.width / 2) * 0.25);
              y.set((e.clientY - r.top - r.height / 2) * 0.35);
            }
          : undefined
      }
      onMouseLeave={magnetic ? () => { x.set(0); y.set(0); } : undefined}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "relative inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-colors duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-piggy/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-50",
        SIZES[size],
        VARIANTS[variant],
        glow && "animate-breathe",
        full && "w-full",
        className,
      )}
    >
      {children}
    </motion.button>
  );
});
