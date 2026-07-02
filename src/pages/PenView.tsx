import { ArrowLeft, Compass } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { PenDetail } from "@/components/pens/PenDetail";
import { usePit } from "@/lib/store";

export default function PenView() {
  const { handle = "" } = useParams();
  const nav = useNavigate();
  const pen = usePit((s) => s.findPen(handle));
  const auth = usePit((s) => s.auth);

  if (!pen) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 pb-24 pt-40 text-center">
        <PiggyMascot mood="alert" size={140} />
        <h1 className="mt-6 font-display text-3xl font-bold">No bank here</h1>
        <p className="mt-3 text-mute">
          There's no live piggy bank for <span className="font-mono text-paper">@{handle}</span>. It may have been
          cracked open, or never existed.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="ghost" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
          <Button variant="primary" onClick={() => nav("/explore")}><Compass className="h-4 w-4" /> Explore banks</Button>
        </div>
      </div>
    );
  }

  const isOwner = auth.status === "connected" && pen.owner === auth.pubkey;
  return <PenDetail pen={pen} isOwner={isOwner} />;
}
