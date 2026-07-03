import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { usePit } from "@/lib/store";
import { cn } from "@/lib/cn";

const TONE = {
  success: { Icon: CheckCircle2, cls: "text-mint", ring: "border-mint/30" },
  info: { Icon: Info, cls: "text-grape-400", ring: "border-grape-400/30" },
  danger: { Icon: XCircle, cls: "text-danger", ring: "border-danger/30" },
};

export function Toasts() {
  const toasts = usePit((s) => s.toasts);
  const dismiss = usePit((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map((t) => {
          const { Icon, cls, ring } = TONE[t.tone];
          return (
            <motion.button
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={() => dismiss(t.id)}
              className={cn("pointer-events-auto flex items-start gap-3 rounded-xl border bg-ink-850 p-3.5 text-left shadow-pop", ring)}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", cls)} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-paper">{t.title}</div>
                {t.desc && <div className="mt-0.5 text-xs leading-snug text-mute">{t.desc}</div>}
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
