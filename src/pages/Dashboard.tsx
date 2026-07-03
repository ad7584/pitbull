import { Button } from "@/components/ui/Button";
import { Bull } from "@/components/brand/Bull";
import { DepositCard } from "@/components/deposit/DepositCard";
import { GlobalStats } from "@/components/home/GlobalStats";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";

export default function Dashboard() {
  const auth = usePit((s) => s.auth);
  const openSignIn = useUI((s) => s.openSignIn);

  if (auth.status !== "connected") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 pb-24 pt-40 text-center">
        <Bull className="h-28 w-28" />
        <h1 className="mt-6 text-2xl font-semibold">Sign in to see your dashboard</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mute">
          Sign in with X, then send SOL to your deposit address — your balance updates automatically.
        </p>
        <Button size="lg" variant="accent" className="mt-6" onClick={openSignIn}>
          Sign in with X
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-24 sm:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-[14px] text-mute">Fund your address, watch it pool into $ANSEM, withdraw anytime.</p>
      </div>
      <DepositCard userId={auth.userId} />
      <div className="mt-10">
        <h2 className="mb-3 text-[15px] font-semibold text-paper">Protocol &amp; market</h2>
        <GlobalStats />
      </div>
    </div>
  );
}
