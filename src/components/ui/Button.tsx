import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "lime" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "xl";

interface Props {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  full?: boolean;
  /** legacy props — accepted but intentionally no-ops (glow/magnetic retired). */
  glow?: boolean;
  magnetic?: boolean;
}

// Flat fills, no gradients, no glow. One primary action per view; everything
// else is secondary/ghost.
const VARIANTS: Record<Variant, string> = {
  // white-on-dark = the "pro" primary (Jupiter terminal convention)
  primary: "bg-paper text-ink-950 hover:bg-white",
  // brand accent — reserve for the single marquee CTA
  accent: "bg-piggy text-white hover:bg-piggy-400",
  lime: "bg-lime text-ink-950 hover:bg-lime-400",
  ghost: "bg-white/[0.04] text-paper hover:bg-white/[0.08] border border-white/[0.08]",
  outline: "bg-transparent text-paper border border-white/[0.14] hover:border-white/25 hover:bg-white/[0.04]",
  danger: "bg-danger text-white hover:brightness-110",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-11 px-5 text-sm rounded-lg gap-2",
  xl: "h-12 px-6 text-base rounded-lg gap-2",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { children, variant = "primary", size = "md", className, onClick, disabled, type = "button", full },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 outline-none active:scale-[0.99]",
        "focus-visible:ring-2 focus-visible:ring-piggy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
        "disabled:cursor-not-allowed disabled:opacity-40",
        SIZES[size],
        VARIANTS[variant],
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
});
