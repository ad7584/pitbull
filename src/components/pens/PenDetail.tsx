import { motion } from "framer-motion";
import { Clock, Coins, Gift, Hammer, Heart, Lock, PieChart, Plus, Share2, Target } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, KindBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { DualBalance } from "@/components/pens/DualBalance";
import { LiveActivity } from "@/components/home/LiveActivity";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { breakQuote, penWorth, unlockStatus } from "@/lib/engine";
import { COPY, GAIN_SPLIT_LABEL } from "@/lib/protocol";
import { fmtCountdown, fmtDate, fmtPct, fmtSol, fmtCompact } from "@/lib/format";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";
import type { Pen } from "@/lib/types";
import { cn } from "@/lib/cn";

export function PenDetail({ pen, isOwner }: { pen: Pen; isOwner: boolean }) {
  const now = usePit((s) => s.now);
  const vault = usePit((s) => s.vault);
  const pool = usePit((s) => s.pool);
  const config = usePit((s) => s.config);
  const activity = usePit((s) => s.activity);
  const openFill = useUI((s) => s.openFill);
  const openShare = useUI((s) => s.openShare);
  const openSmash = useUI((s) => s.openSmash);

  const worth = penWorth(pen, vault, pool);
  const quote = breakQuote(pen, vault, pool, config);

  const st = unlockStatus(pen, now, vault, pool);
  const sharePct = vault.totalShares > 0 ? pen.shares / vault.totalShares : 0;
  const gain = worth - pen.principal;
  const penActivity = activity.filter((a) => a.handle === pen.handle);

  const mascotMood = st.unlocked ? "happy" : pen.kind === "Timelock" ? "locked" : "idle";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6">
      {/* hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-piggy/15 blur-3xl" />
        <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
          {/* left: ring + mascot */}
          <div className="flex flex-col items-center">
            <ProgressRing
              progress={st.progress}
              size={230}
              stroke={16}
              from={gain >= 0 ? "#FF4D8D" : "#F23674"}
              to={gain >= 0 ? "#B6FF3C" : "#FF77A8"}
            >
              <div className="flex flex-col items-center">
                <PiggyMascot mood={mascotMood} size={120} />
                <div className="mt-1 font-mono text-lg font-bold tnum">{Math.round(st.progress * 100)}%</div>
              </div>
            </ProgressRing>
          </div>

          {/* right: identity + balances + actions */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar seed={pen.avatarSeed} label={pen.displayName} size={44} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold">{pen.displayName}</h1>
                  {pen.isCharity && <Heart className="h-4 w-4 fill-piggy text-piggy" />}
                </div>
                <div className="text-sm text-mute">@{pen.handle} · “{pen.name}”</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <KindBadge kind={pen.kind} />
                {isOwner && <Badge tone="pink">yours</Badge>}
              </div>
            </div>

            {/* unlock status */}
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              {st.unlocked ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint" />
                  </span>
                  <span className="text-sm font-semibold text-mint">Unlocked — ready to crack</span>
                </>
              ) : pen.kind === "Timelock" ? (
                <>
                  <Clock className="h-4 w-4 text-grape-400" />
                  <span className="text-sm text-mute">
                    Unlocks in <span className="font-mono font-semibold text-paper">{fmtCountdown(st.secondsLeft ?? 0)}</span> ·{" "}
                    {fmtDate(pen.unlockParam)}
                  </span>
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 text-lime" />
                  <span className="text-sm text-mute">
                    <span className="font-mono font-semibold text-paper">{fmtSol(pen.principal)}</span> /{" "}
                    <span className="font-mono">{fmtSol(pen.unlockParam)}</span> SOL to unlock
                  </span>
                </>
              )}
            </div>

            {/* dual balance */}
            <div className="mt-5">
              <DualBalance principal={pen.principal} worth={worth} />
            </div>

            {/* actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" size="lg" glow={!isOwner} onClick={() => openFill(pen.owner)}>
                {isOwner ? <Plus className="h-4.5 w-4.5" /> : <Gift className="h-4.5 w-4.5" />}
                {isOwner ? "Add funds" : "Gift into it"}
              </Button>
              <Button variant="ghost" size="lg" onClick={() => openShare(pen.owner)}>
                <Share2 className="h-4.5 w-4.5" /> Share
              </Button>
              {isOwner &&
                (st.unlocked ? (
                  <Button variant="danger" size="lg" glow onClick={() => openSmash(pen.owner)}>
                    <Hammer className="h-4.5 w-4.5" /> Smash it
                  </Button>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-faint">
                    <Lock className="h-4 w-4" /> Smash locked
                  </div>
                ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* panels */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* position */}
        <Panel title={isOwner ? "Your position" : "Pen position"} icon={PieChart}>
          <StatRow label="Share of the pool" value={fmtPct(sharePct, 3).replace("+", "")} />
          <StatRow label="Shares held" value={fmtCompact(pen.shares)} mono />
          <StatRow label="Fees + market" value={`${fmtSol(gain, { sign: true })} SOL`} tone={gain >= 0 ? "up" : "down"} />
          <StatRow label="Opened" value={fmtDate(Math.floor(pen.createdAt / 1000))} />
          <p className="mt-3 text-xs leading-relaxed text-faint">{COPY.worthMoves}</p>
        </Panel>

        {/* break preview / unlock */}
        {isOwner ? (
          <Panel title={st.unlocked ? "If you smash now" : "To unlock"} icon={st.unlocked ? Hammer : Lock}>
            {st.unlocked ? (
              <>
                <StatRow label="You'd receive (SOL)" value={`${fmtSol(quote.solToUser)} SOL`} mono strong />
                <StatRow label="You'd receive ($ANSEM)" value={`${fmtCompact(quote.ansemToUser)}`} mono strong />
                <div className="my-2 divider" />
                {quote.isGain ? (
                  <div className="rounded-xl bg-mint/10 p-2.5 text-xs text-mint">
                    Gain <span className="font-semibold">+{fmtSol(quote.delta)} SOL</span> · split {GAIN_SPLIT_LABEL}
                  </div>
                ) : (
                  <div className="rounded-xl bg-danger/10 p-2.5 text-xs text-danger">
                    Underwater <span className="font-semibold">{fmtSol(quote.delta)} SOL</span> · buffer adds{" "}
                    {fmtSol(quote.ilReimbursed)}
                  </div>
                )}
                <Button variant="danger" size="md" full className="mt-3" onClick={() => openSmash(pen.owner)}>
                  <Hammer className="h-4 w-4" /> Crack it open
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center py-2">
                  <ProgressRing progress={st.progress} size={120} stroke={10} from="#8E67FF" to="#FF4D8D">
                    <span className="font-mono text-base font-bold">{Math.round(st.progress * 100)}%</span>
                  </ProgressRing>
                </div>
                <p className="text-center text-sm text-mute">
                  {pen.kind === "Timelock"
                    ? `Sealed until ${fmtDate(pen.unlockParam)}.`
                    : `Fill to ${fmtSol(pen.unlockParam)} SOL to unlock.`}
                </p>
                <p className="mt-2 text-center text-xs text-faint">Breaking always works in an emergency — locks apply to the unlock, not to safety.</p>
              </>
            )}
          </Panel>
        ) : (
          <Panel title="Fill this bank" icon={Coins}>
            <p className="text-sm leading-relaxed text-mute">
              Gift SOL or $ANSEM into <span className="text-paper">@{pen.handle}</span>'s pen. It locks under their
              rules and only they can break it — a permanent contribution to the pool.
            </p>
            <div className="mt-3 rounded-xl border border-piggy/20 bg-piggy/[0.06] p-3 text-xs text-piggy-300">{COPY.giftIrreversible}</div>
            <Button variant="primary" size="md" full className="mt-3" onClick={() => openFill(pen.owner)}>
              <Gift className="h-4 w-4" /> Gift into it
            </Button>
          </Panel>
        )}

        {/* activity */}
        <Panel title="This bank's activity" icon={Clock}>
          {penActivity.length > 0 ? (
            <LiveActivity limit={6} now={now} handle={pen.handle} />
          ) : (
            <p className="text-sm text-faint">No activity yet — be the first to fill it.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof PieChart; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-piggy" />
        <h3 className="font-display text-base font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatRow({
  label,
  value,
  mono,
  strong,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
  tone?: "up" | "down";
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-mute">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold",
          mono && "font-mono tnum",
          strong && "text-base",
          tone === "up" && "text-mint",
          tone === "down" && "text-danger",
          !tone && "text-paper",
        )}
      >
        {value}
      </span>
    </div>
  );
}
