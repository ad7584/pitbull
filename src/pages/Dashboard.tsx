import { ArrowRight, PiggyBank, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { PenDetail } from "@/components/pens/PenDetail";
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
        body="Sign in with X and your self-custodial wallet appears. Then open your one piggy bank."
        cta={<Button size="lg" variant="primary" glow onClick={openSignIn}><Wallet className="h-4.5 w-4.5" /> Connect</Button>}
      />
    );
  }

  if (!myPen) {
    return (
      <Empty
        title="No piggy bank yet"
        body="Open one — pick a lock, name it, and start deepening the $ANSEM pool one small deposit at a time."
        cta={<Button size="lg" variant="primary" glow onClick={() => nav("/create")}><PiggyBank className="h-4.5 w-4.5" /> Open a piggy bank <ArrowRight className="h-4.5 w-4.5" /></Button>}
      />
    );
  }

  return <PenDetail pen={myPen} isOwner />;
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
