import { motion } from "framer-motion";
import { ArrowRight, Lock, Target, Unlock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Reveal } from "@/components/ui/Reveal";
import { VAULT_KINDS } from "@/lib/protocol";
import type { VaultKind } from "@/lib/types";
import { cn } from "@/lib/cn";

const META: Record<VaultKind, { Icon: LucideIcon; ring: string; glow: string; text: string }> = {
  Open: { Icon: Unlock, ring: "border-sky-300/30", glow: "from-sky-300/15", text: "text-sky-300" },
  AmountTarget: { Icon: Target, ring: "border-lime/30", glow: "from-lime/15", text: "text-lime" },
  Timelock: { Icon: Lock, ring: "border-grape-400/30", glow: "from-grape-400/15", text: "text-grape-400" },
};

const ORDER: VaultKind[] = ["Timelock", "AmountTarget", "Open"];

export function VaultTypes() {
  const nav = useNavigate();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ORDER.map((kind, i) => {
        const m = VAULT_KINDS[kind];
        const s = META[kind];
        return (
          <Reveal key={kind} delay={i * 0.08}>
            <motion.button
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onClick={() => nav("/create")}
              className={cn("card group relative h-full w-full overflow-hidden p-6 text-left", s.ring)}
            >
              <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent opacity-0 transition group-hover:opacity-100", s.glow)} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className={cn("grid h-11 w-11 place-items-center rounded-2xl border bg-white/5", s.ring, s.text)}>
                    <s.Icon className="h-5 w-5" />
                  </span>
                  <span className={cn("chip", s.text)}>{m.rewardTier} rewards</span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold">{m.codename}</h3>
                <p className={cn("mt-1 text-sm font-medium", s.text)}>{m.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-mute">{m.description}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-paper opacity-0 transition group-hover:opacity-100">
                  Pick this <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </motion.button>
          </Reveal>
        );
      })}
    </div>
  );
}
