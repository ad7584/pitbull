import { cn } from "@/lib/cn";

/**
 * The $ANSEM "Black Bull" mark — the brand's single hero visual. A transparent
 * cutout so it seats cleanly on the near-black canvas. No glow, no animation by
 * default; motion is opt-in via className.
 */
export function Bull({
  className,
  alt = "PIT-BULL",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/bull.png"
      alt={alt}
      draggable={false}
      loading="eager"
      decoding="async"
      className={cn("select-none object-contain", className)}
    />
  );
}
