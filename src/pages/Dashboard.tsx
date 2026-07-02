import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { DepositCard } from "@/components/deposit/DepositCard";
import { GlobalStats } from "@/components/home/GlobalStats";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";

export default function Dashboard() {
  const auth = usePit((s) => s.auth);
  const openSignIn = useUI((s) => s.openSignIn);

  if (auth.status !== "connected") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 pb-24 pt-40 text-center">
        <div className="animate-float">
          <PiggyMascot mood="idle" size={150} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Connect to see your dashboard</h1>
        <p className="mt-3 text-mute">
          Sign in with X, then send SOL to your deposit address — your balance updates automatically.
        </p>
        <Button size="lg" variant="primary" glow className="mt-6" onClick={openSignIn}>
          <Wallet className="h-4.5 w-4.5" /> Connect
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6">
      <DepositCard userId={auth.userId} />
      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold">Protocol &amp; market</h2>
        <GlobalStats />
      </div>
    </div>
  );
}
