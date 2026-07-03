import { ArrowUpRight, BadgeCheck, Info } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { CopyButton } from "@/components/ui/CopyButton";
import { Bull } from "@/components/brand/Bull";
import { ANSEM_MINT } from "@/lib/protocol";
import { shortKey } from "@/lib/format";

/**
 * Narrative weight for $ANSEM — built strictly from verifiable material:
 * @blknoiz06's real, ID-linked tweets and reported track record, plus an
 * honest disclosure that "The Black Bull" is a community tribute token, not an
 * official Ansem project. No fabricated quotes.
 */

const ANSEM_X = "https://x.com/blknoiz06";

// verbatim tweets — each links to the source status (or profile where no ID)
const QUOTES: { text: string; href: string; note?: string }[] = [
  {
    text: "had to give the trenches a stimmy since pump refuses to.",
    href: ANSEM_X,
    note: "on redistributing creator fees, ~Jun 2026",
  },
  {
    text:
      "there’s enough good tokens that exist already, but sure i will airdrop portions of the creator fees that have been directed to my pump fun profile — retweet this + follow me + comment with your pump profile & ill pick randomly weekly.",
    href: "https://x.com/blknoiz06/status/2070871430191800832",
  },
  {
    text:
      "i do not pnd any coins, i am wrong on trades sometimes yes, but i have never intently shared a trade on here & then immediately thereafter sold while bullishly tweeting about it.",
    href: "https://x.com/blknoiz06/status/1790891965778678160",
    note: "on his trading ethos, May 2024",
  },
];

export function AnsemNarrative() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      {/* who + track record */}
      <div>
        <div className="flex items-center gap-4">
          <Bull className="h-16 w-16 shrink-0" />
          <div>
            <div className="flex items-center gap-1.5 text-lg font-semibold text-paper">
              Ansem
              <BadgeCheck className="h-4 w-4 text-piggy" />
            </div>
            <a
              href={ANSEM_X}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-mono text-sm text-mute transition hover:text-paper"
            >
              @blknoiz06 <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-mute">
          One of Solana’s most-followed traders — dubbed{" "}
          <span className="text-paper">“The Memecoin King”</span> by CoinDesk. He’s widely credited with
          calling Solana’s recovery from its post-FTX lows near <span className="tnum">$8</span>, and with being
          early to <span className="text-paper">WIF</span> and <span className="text-paper">BONK</span> — the two
          tokens that defined the last Solana meme cycle.
        </p>

        <p className="mt-4 text-[13px] leading-relaxed text-faint">
          <span className="text-mute">$ANSEM “The Black Bull”</span> is the community tribute token that grew out of
          his persona — the bull he’s known for. MINOTAUR pools into that live market; it doesn’t issue the token.
        </p>

        {/* honest disclosure */}
        <div className="mt-5 flex gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-mute" />
          <p className="text-[13px] leading-relaxed text-mute">
            <span className="text-paper">Not affiliated with Ansem.</span> “The Black Bull” was deployed by an
            anonymous developer on Pump.fun and is a community/meme token — no team, roadmap, or utility. Always
            verify the mint before you send anything.
          </p>
        </div>

        {/* verifiable links */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="chip font-mono">
            $ANSEM {shortKey(ANSEM_MINT, 5)}
            <CopyButton value={ANSEM_MINT} label="" className="-mr-1 px-1 py-0" />
          </span>
          <ExtLink href="https://www.coingecko.com/en/coins/the-black-bull">CoinGecko</ExtLink>
          <ExtLink href="https://www.blackbullsol.com/">Community site</ExtLink>
        </div>
      </div>

      {/* verbatim quotes */}
      <div className="flex flex-col gap-3">
        {QUOTES.map((q) => (
          <Reveal key={q.href + q.text.slice(0, 12)}>
            <a
              href={q.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover group block p-5"
            >
              <p className="text-pretty text-[15px] leading-relaxed text-paper">“{q.text}”</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-xs text-mute">
                  @blknoiz06{q.note ? ` · ${q.note}` : ""}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs text-faint transition group-hover:text-piggy">
                  View on X <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </a>
          </Reveal>
        ))}
        <p className="px-1 text-[11px] leading-relaxed text-faint">
          Quotes are verbatim from @blknoiz06 and link to the source posts. Reproduced for context, not endorsement.
        </p>
      </div>
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-mute transition hover:border-white/[0.16] hover:text-paper"
    >
      {children} <ArrowUpRight className="h-3 w-3" />
    </a>
  );
}
