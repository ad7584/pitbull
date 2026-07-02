import { ArrowRight, PiggyBank, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { PenDetail } from "@/components/pens/PenDetail";
import { DepositCard } from "@/components/deposit/DepositCard";
import { usePit } from "@/lib/store";
import { useUI } from "@/lib/ui";

export default function Dashboard() {
  const nav = useNavigate();
  const auth = usePit((s) => s.auth);
  const myPen = usePit((s) => s.myPen());
  const openSignIn = useUI((s) => s.openSignIn);

  if (auth.status !== "connected") {
    return (
      <Empty
        title="Connect to see your bank"
        body="Sign in with X, then send SOL to your deposit address — your balance updates automatically."
        cta={<Button size="lg" variant="primary" glow onClick={openSignIn}><Wallet className="h-4.5 w-4.5" /> Connect</Button>}
      />
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <DepositCard userId={auth.pubkey} />
      </div>
      {myPen ? (
        <PenDetail pen={myPen} isOwner />
      ) : (
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">
          <div className="card flex flex-col items-center p-8 text-center">
            <PiggyMascot mood="idle" size={110} />
            <h2 className="mt-4 font-display text-xl font-bold">No piggy bank yet</h2>
            <p className="mt-2 max-w-sm text-sm text-mute">
              Deposits sit in your balance until you open a bank. Pick a lock and start deepening the $ANSEM pool.
            </p>
            <Button size="lg" variant="primary" glow className="mt-5" onClick={() => nav("/create")}>
              <PiggyBank className="h-4.5 w-4.5" /> Open a piggy bank <ArrowRight className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function Empty({ title, body, cta }: { title: string; body: string; cta: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 pb-24 pt-40 text-center">
      <div className="animate-float">
        <PiggyMascot mood="idle" size={150} />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-mute">{body}</p>
      <div className="mt-6">{cta}</div>
    </div>
  );
}
