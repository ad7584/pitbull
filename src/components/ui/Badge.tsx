import { Lock, Target, Unlock } from "lucide-react";
import { VAULT_KINDS } from "@/lib/protocol";
import type { VaultKind } from "@/lib/types";
import { cn } from "@/lib/cn";

const KIND_STYLE: Record<VaultKind, { cls: string; Icon: typeof Lock }> = {
  Open: { cls: "text-sky-300 border-sky-300/25 bg-sky-300/10", Icon: Unlock },
  AmountTarget: { cls: "text-lime border-lime/25 bg-lime/10", Icon: Target },
  Timelock: { cls: "text-grape-400 border-grape-400/25 bg-grape-400/10", Icon: Lock },
};

export function KindBadge({ kind, showTitle = true, className }: { kind: VaultKind; showTitle?: boolean; className?: string }) {
  const { cls, Icon } = KIND_STYLE[kind];
  const meta = VAULT_KINDS[kind];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", cls, className)}>
      <Icon className="h-3.5 w-3.5" />
      {showTitle ? meta.codename : null}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "pink" | "lime" | "mint" | "danger";
  className?: string;
}) {
  const tones = {
    neutral: "text-mute border-white/10 bg-white/5",
    pink: "text-piggy-300 border-piggy/25 bg-piggy/10",
    lime: "text-lime border-lime/25 bg-lime/10",
    mint: "text-mint border-mint/25 bg-mint/10",
    danger: "text-danger border-danger/25 bg-danger/10",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
