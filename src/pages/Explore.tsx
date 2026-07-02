import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { PenCard } from "@/components/pens/PenCard";
import { Reveal } from "@/components/ui/Reveal";
import { unlockStatus } from "@/lib/engine";
import { VAULT_KINDS } from "@/lib/protocol";
import { usePit } from "@/lib/store";
import type { VaultKind } from "@/lib/types";
import { cn } from "@/lib/cn";

type Sort = "worth" | "saved" | "progress" | "newest";
type Filter = "all" | VaultKind | "charity";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Timelock", label: VAULT_KINDS.Timelock.codename },
  { key: "AmountTarget", label: VAULT_KINDS.AmountTarget.codename },
  { key: "Open", label: VAULT_KINDS.Open.codename },
  { key: "charity", label: "Charity" },
];

const SORTS: { key: Sort; label: string }[] = [
  { key: "worth", label: "Worth" },
  { key: "saved", label: "Saved" },
  { key: "progress", label: "Progress" },
  { key: "newest", label: "Newest" },
];

export default function Explore() {
  const pens = usePit((s) => s.pens);
  const worthOf = usePit((s) => s.worthOf);
  const now = usePit((s) => s.now);
  const vault = usePit((s) => s.vault);
  const pool = usePit((s) => s.pool);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("worth");

  const list = useMemo(() => {
    let l = pens.slice();
    if (filter === "charity") l = l.filter((p) => p.isCharity);
    else if (filter !== "all") l = l.filter((p) => p.kind === filter);
    l.sort((a, b) => {
      if (sort === "worth") return worthOf(b) - worthOf(a);
      if (sort === "saved") return b.principal - a.principal;
      if (sort === "newest") return b.createdAt - a.createdAt;
      return unlockStatus(b, now, vault, pool).progress - unlockStatus(a, now, vault, pool).progress;
    });
    return l;
  }, [pens, filter, sort, worthOf, now, vault, pool]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-piggy-300">The trenches, but building</span>
        <h1 className="mt-2 font-display text-4xl font-bold">Explore piggy banks</h1>
        <p className="mt-2 max-w-xl text-mute">
          Every one is deepening the $ANSEM pool. Fill a friend's, back a charity, or find your own on the board.
        </p>
      </motion.div>

      {/* controls */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                filter === f.key ? "border-piggy/50 bg-piggy/15 text-piggy-300" : "border-white/10 bg-white/5 text-mute hover:text-paper",
              )}
            >
              {f.key === "charity" && <Heart className="h-3.5 w-3.5" />}
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                sort === s.key ? "bg-white/10 text-paper" : "text-mute hover:text-paper",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((pen, i) => (
          <Reveal key={pen.owner} delay={Math.min(i, 6) * 0.04} y={12}>
            <PenCard pen={pen} rank={sort === "worth" && filter === "all" ? i : undefined} />
          </Reveal>
        ))}
      </div>

      {list.length === 0 && <p className="mt-16 text-center text-mute">No banks match that filter yet.</p>}
    </div>
  );
}
