import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { CopyButton } from "@/components/ui/CopyButton";
import { ANSEM_MINT, COPY } from "@/lib/protocol";
import { shortKey } from "@/lib/format";

export function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-white/[0.08]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-[13px] leading-relaxed text-mute">
              Small SOL deposits, pooled into durable <span className="text-paper">$ANSEM</span> liquidity. You earn
              the swap fees and withdraw your share anytime.
            </p>
            <p className="mt-4 text-xs font-medium text-piggy-300">{COPY.floor}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                { to: "/dashboard", label: "Dashboard" },
                { to: "/about", label: "How it works" },
                { to: "/about#ansem", label: "$ANSEM" },
              ]}
            />
            <FooterCol
              title="Protocol"
              links={[
                { to: "/about#liquidity", label: "Liquidity engine" },
                { to: "/about#safety", label: "Safety" },
                { to: "/about#rewards", label: "Rewards" },
              ]}
            />
            <FooterCol
              title="Honest"
              links={[
                { to: "/about#risks", label: "Risks" },
                { to: "/terms", label: "Terms & Conditions" },
                { to: "/about#safety", label: "Not a savings account" },
              ]}
            />
          </div>
        </div>

        <div className="divider my-8" />

        <div className="flex flex-col gap-4 text-xs text-faint sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-2xl leading-relaxed">
            Not financial advice, and not an endorsement of any token. This is a custodial product; impermanent loss
            means a withdrawal can return less than was deposited. $ANSEM is a community token, not affiliated with
            Ansem — verify every contract independently ·{" "}
            <Link to="/terms" className="text-mute underline underline-offset-2 transition hover:text-paper">
              Terms & Conditions
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip font-mono">
              $ANSEM {shortKey(ANSEM_MINT, 5)}
              <CopyButton value={ANSEM_MINT} label="" className="-mr-1 px-1 py-0" />
            </span>
            <a
              href="https://x.com/blknoiz06"
              target="_blank"
              rel="noopener noreferrer"
              className="chip transition hover:border-white/[0.16] hover:text-paper"
            >
              @blknoiz06 <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold text-paper">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-[13px] text-mute transition hover:text-paper">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
