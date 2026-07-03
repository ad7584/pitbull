import { ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Bull } from "@/components/brand/Bull";
import { fmtSol } from "@/lib/format";
import { usePit } from "@/lib/store";
import { useStats } from "@/lib/useStats";
import { useUI } from "@/lib/ui";

export function Hero() {
  const nav = useNavigate();
  const auth = usePit((s) => s.auth);
  const openSignIn = useUI((s) => s.openSignIn);
  const stats = useStats();

  const primaryCta = () => (auth.status !== "connected" ? openSignIn() : nav("/dashboard"));
  const usd = stats?.ansem ? `$${stats.ansem.priceUsd.toFixed(4)}` : "—";

  return (
    <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-8 pt-28 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-36">
      <div className="relative z-10 animate-fade-up">
        <div className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          Solana · custodial $ANSEM liquidity
        </div>

        <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-[3.35rem]">
          Turn loose SOL into durable <span className="text-piggy">$ANSEM</span> liquidity.
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-mute">
          Deposit to your own address. It pools into the $ANSEM/SOL market, earns 0.20% of every swap,
          and you withdraw your share whenever you want — saving as a commitment device, not a dump bag.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button size="xl" variant="accent" onClick={primaryCta}>
            {auth.status === "connected" ? "Go to dashboard" : "Get started"}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="xl" variant="outline" onClick={() => nav("/about")}>
            How it works
          </Button>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/[0.07] pt-6">
          <TrustStat value={stats ? fmtSol(stats.tvlLamports) : "—"} unit="SOL" label="Pooled" />
          <TrustStat value={usd} label="$ANSEM price" />
          <TrustStat value="0.20%" label="LP fee earned" />
        </div>

        <p className="mt-5 flex items-center gap-1.5 text-[13px] text-mute">
          <ShieldCheck className="h-4 w-4 text-lime" />
          Self-custodial sign-in · only you can withdraw your balance.
        </p>
      </div>

      {/* the bull — brand hero visual */}
      <div className="relative z-10 mx-auto flex w-full max-w-lg items-center justify-center lg:max-w-none">
        <div
          className="pointer-events-none absolute inset-0 -z-10 mx-auto my-auto h-64 w-64 rounded-full sm:h-80 sm:w-80"
          style={{ background: "radial-gradient(circle, rgba(255,77,141,0.14), transparent 68%)" }}
        />
        <Bull className="mx-auto w-full max-w-[440px] animate-fade-up drop-shadow-[0_24px_60px_rgba(0,0,0,0.6)]" />
      </div>
    </section>
  );
}

function TrustStat({ value, unit, label }: { value: React.ReactNode; unit?: string; label: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-1 text-xl font-semibold tnum text-paper">
        {value}
        {unit && <span className="text-xs font-normal text-mute">{unit}</span>}
      </div>
      <div className="mt-1 eyebrow">{label}</div>
    </div>
  );
}
