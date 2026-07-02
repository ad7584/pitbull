import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { ILWarning } from "@/components/ui/ILWarning";
import { ANSEM_MINT, ANSEM_SYMBOL, GAIN_SPLIT_LABEL, PROGRAM_ID } from "@/lib/protocol";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1 · What PIT-BULL is",
    body: (
      <>
        PIT-BULL is a self-custodial interface to an on-chain Solana program. Deposits are pooled into liquidity on
        the canonical ${ANSEM_SYMBOL}/SOL market. The interface never holds your funds; the program's rules — not any
        company, admin, or operator — govern what can happen to them. No admin key can move principal, unlock a pen,
        or block a break.
      </>
    ),
  },
  {
    title: "2 · Eligibility",
    body: (
      <>
        You must be of legal age in your jurisdiction and permitted under your local laws to use decentralized
        finance protocols and to hold digital assets. You are solely responsible for determining whether your use is
        lawful where you live. PIT-BULL is not offered to persons in prohibited jurisdictions.
      </>
    ),
  },
  {
    title: "3 · Wallets & custody",
    body: (
      <>
        Sign-in uses Privy embedded wallets in <strong className="text-paper">self-custodial</strong> mode: your key
        is sharded and reassembled only client-side; neither Privy nor PIT-BULL ever holds it. You may export your
        key at any time. If you lose access to your X account and your recovery options, no one can recover the
        wallet for you.
      </>
    ),
  },
  {
    title: "4 · Irreversibility",
    body: (
      <>
        Breaking a piggy bank is <strong className="text-paper">terminal</strong> — the pen closes on-chain and the
        action cannot be undone. Gifts into someone else's pen are <strong className="text-paper">permanent</strong>:
        they lock under the recipient's rules and only the recipient can ever break the pen. The interface requires
        explicit confirmation before both actions; by confirming, you accept that they are final.
      </>
    ),
  },
  {
    title: "5 · Deposits & tokens",
    body: (
      <>
        Pens accept SOL and ${ANSEM_SYMBOL} (mint:{" "}
        <code className="break-all rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-lime">{ANSEM_MINT}</code>
        ). ${ANSEM_SYMBOL} deposits are valued at the pool's spot price at deposit time. Deposits join the liquidity
        pool at the next batch (the crank) — until then they sit as pending SOL in the program vault. A minimum
        deposit applies so network and swap costs cannot eat micro-deposits.
      </>
    ),
  },
  {
    title: "6 · Impermanent loss — read this twice",
    body: (
      <>
        Your deposit becomes two-sided liquidity ({ANSEM_SYMBOL}/SOL). If the price of ${ANSEM_SYMBOL} moves relative
        to SOL between deposit and break, the value you withdraw can be{" "}
        <strong className="text-amber-300">less than the value you put in — even after trading fees</strong>. This is
        impermanent loss (IL), and it is inherent to automated market makers, not a bug. A fee-funded buffer
        reimburses a <strong className="text-paper">partial, capped</strong> share of realized IL at break time; it
        does not and cannot eliminate the risk. PIT-BULL is <strong className="text-paper">not a savings
        account</strong> and no outcome is guaranteed.
      </>
    ),
  },
  {
    title: "7 · Fees & gain split",
    body: (
      <>
        The pool's LP fee (0.20% of every swap) accrues inside the pool and compounds into each pen's share value. On
        a positive outcome at break, the realized <em>gain</em> — never principal — is split {GAIN_SPLIT_LABEL}. The
        20% funds the IL buffer that protects future breakers; the 10% funds the treasury. There are no deposit fees
        and no break fees on principal.
      </>
    ),
  },
  {
    title: "8 · The underlying asset",
    body: (
      <>
        ${ANSEM_SYMBOL} is an attention-backed memecoin with no team, roadmap, utility, or whitepaper. Its value can
        go to zero. Deeper liquidity makes its market fairer and less volatile to trade — it does not make the asset
        fundamentally sound. Do not deposit money you cannot afford to lose entirely.
      </>
    ),
  },
  {
    title: "9 · No advice, no offer",
    body: (
      <>
        Nothing in this interface is financial, investment, legal, or tax advice, and nothing is an offer or
        solicitation to buy any asset. Displayed values ("worth now", projected outcomes) are estimates computed from
        live pool state and can change at any moment. You alone are responsible for your decisions.
      </>
    ),
  },
  {
    title: "10 · Prohibited use",
    body: (
      <>
        You may not use PIT-BULL for money laundering, sanctions evasion, or any unlawful activity; to wash-farm
        rewards; or to operate fake charity pens. Charity badges are whitelist-gated and misrepresenting a charity
        pen is grounds for removal of the badge and exclusion from reward distributions.
      </>
    ),
  },
  {
    title: "11 · Assumption of risk & limitation of liability",
    body: (
      <>
        Smart contracts can contain bugs; blockchains can halt, fork, or congest; oracles, indexers, and interfaces
        can fail or display stale data. You use the protocol at your own risk. To the maximum extent permitted by
        law, PIT-BULL contributors are not liable for any loss — including loss from impermanent loss, market
        movement, smart-contract failure, key loss, or interface error. The protocol is provided "as is", without
        warranties of any kind.
      </>
    ),
  },
  {
    title: "12 · Changes",
    body: (
      <>
        These terms may be updated; material changes will be reflected on this page with a new revision date.
        Continued use after changes constitutes acceptance. The on-chain program's rules always prevail over
        anything written here.
      </>
    ),
  },
];

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-piggy-300">
          <FileText className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Legal</span>
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-mute">
          Revision · July 2026 · program{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs">{PROGRAM_ID.slice(0, 8)}…</code>
        </p>
      </motion.div>

      <div className="mt-8">
        <ILWarning />
      </div>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-lg font-bold text-paper">{s.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-mute">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="divider my-10" />
      <p className="text-center text-xs text-faint">
        By using PIT-BULL you accept these terms in full. If you do not accept them, do not use the protocol.
      </p>
    </div>
  );
}
