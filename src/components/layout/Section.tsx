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
    <section id={id} className={cn("mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20", className)}>
      {(eyebrow || title || intro) && (
        <Reveal className={cn("mb-9 max-w-2xl", center && "mx-auto text-center")}>
          {eyebrow && (
            <div className={cn("mb-3 flex items-center gap-2", center && "justify-center")}>
              <span className="h-3 w-px bg-piggy" />
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-mute">{eyebrow}</span>
            </div>
          )}
          {title && <h2 className="text-balance text-2xl font-semibold sm:text-3xl">{title}</h2>}
          {intro && <p className="mt-3 text-pretty text-[15px] leading-relaxed text-mute">{intro}</p>}
        </Reveal>
      )}
      {children}
    </section>
  );
}
