import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
  center,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20", className)}>
      {(eyebrow || title || intro) && (
        <Reveal className={cn("mb-10 max-w-2xl", center && "mx-auto text-center")}>
          {eyebrow && (
            <div className={cn("mb-3 flex items-center gap-2", center && "justify-center")}>
              <span className="h-1.5 w-1.5 rounded-full bg-piggy" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-piggy-300">{eyebrow}</span>
            </div>
          )}
          {title && <h2 className="text-balance font-display text-3xl font-bold sm:text-4xl">{title}</h2>}
          {intro && <p className="mt-4 text-pretty text-base leading-relaxed text-mute">{intro}</p>}
        </Reveal>
      )}
      {children}
    </section>
  );
}
