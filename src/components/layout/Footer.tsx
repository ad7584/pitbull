import { Link } from "react-router-dom";
import { Wordmark } from "@/components/brand/Wordmark";
import { CopyButton } from "@/components/ui/CopyButton";
import { ANSEM_MINT, COPY, PROGRAM_ID } from "@/lib/protocol";
import { shortKey } from "@/lib/format";

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-mute">
              A social piggy bank on Solana. Small deposits become durable{" "}
              <span className="text-paper">$ANSEM</span> liquidity — and it can only be cracked open once.
            </p>
            <p className="mt-4 text-xs font-medium text-piggy-300">{COPY.floor}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                { to: "/create", label: "Open a bank" },
                { to: "/explore", label: "Explore" },
                { to: "/about", label: "How it works" },
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
                { to: "/about#risks", label: "Not a savings account" },
              ]}
            />
          </div>
        </div>

        <div className="divider my-8" />

        <div className="flex flex-col gap-3 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl leading-relaxed">
            Not financial advice. Not an endorsement of any token. Impermanent loss means a pen can return
            less than was deposited. Verify every contract independently ·{" "}
            <Link to="/terms" className="text-mute underline underline-offset-2 transition hover:text-paper">
              Terms & Conditions
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="chip">
              $ANSEM {shortKey(ANSEM_MINT, 5)}
              <CopyButton value={ANSEM_MINT} label="" className="-mr-1 px-1 py-0" />
            </span>
            <span className="chip">program {shortKey(PROGRAM_ID, 5)}</span>
            <span className="chip">devnet · mock-pool</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold text-paper">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-mute transition hover:text-paper">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
