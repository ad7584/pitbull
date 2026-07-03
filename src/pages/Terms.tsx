import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { ILWarning } from "@/components/ui/ILWarning";
import { ANSEM_MINT, ANSEM_SYMBOL } from "@/lib/protocol";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1 · What MINOTAUR is",
    body: (
      <>
        MINOTAUR is a <strong className="text-paper">custodial</strong> service. You send SOL to a deposit address
        we assign you; those funds are swept into an operator-controlled wallet and pooled to provide liquidity on the
        canonical ${ANSEM_SYMBOL}/SOL market. You hold a redeemable claim on the pool — not a trustless on-chain
        position. You are trusting the operator’s honesty, key security, and solvency.
      </>
    ),
  },
  {
    title: "2 · Eligibility",
    body: (
      <>
        You must be of legal age in your jurisdiction and permitted under your local laws to use crypto services and
        to hold digital assets. You are solely responsible for determining whether your use is lawful where you live.
        MINOTAUR is not offered to persons in prohibited or sanctioned jurisdictions.
      </>
    ),
  },
  {
    title: "3 · Sign-in & custody",
    body: (
      <>
        Sign-in uses a Privy embedded wallet tied to your X identity. That identity wallet is{" "}
        <strong className="text-paper">self-custodial</strong> and is used only to authenticate you — it is not where
        your deposit lives. The SOL you <strong className="text-paper">deposit is custodial</strong>: it is pooled in
        an operator-controlled wallet. If you lose access to your X account and recovery options, only the identity
        holder can authorize a withdrawal of the associated balance.
      </>
    ),
  },
  {
    title: "4 · Deposits",
    body: (
      <>
        You are assigned a unique deposit address. SOL sent to it is detected on-chain and credited to your balance as
        pool <em>shares</em>, minted so no depositor is diluted. ${ANSEM_SYMBOL} (mint:{" "}
        <code className="break-all rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-lime">{ANSEM_MINT}</code>)
        may be valued at the pool’s spot price at deposit time. A small per-address network cost (rent + fees) is not
        credited. A minimum deposit applies so fees cannot eat micro-deposits.
      </>
    ),
  },
  {
    title: "5 · Pooling & liquidity",
    body: (
      <>
        Pooled SOL is provided as two-sided ${ANSEM_SYMBOL}/SOL liquidity once pending deposits cross a batch
        threshold — batching keeps swap and network costs from eating small deposits. Liquidity is only ever added to
        the one canonical ${ANSEM_SYMBOL} pool pinned in configuration; never a pool address supplied by a user. Until
        the liquidity step is active, deposits are held as SOL in the operator wallet.
      </>
    ),
  },
  {
    title: "6 · Impermanent loss — read this twice",
    body: (
      <>
        Once deposited SOL becomes ${ANSEM_SYMBOL}/SOL liquidity, its value is exposed to{" "}
        <strong className="text-amber-300">impermanent loss</strong>. If the price of ${ANSEM_SYMBOL} moves relative
        to SOL, the value you can withdraw may be <strong className="text-amber-300">less than you deposited — even
        after trading fees</strong>. IL is inherent to automated market makers, not a bug. Any fee-funded buffer is{" "}
        <strong className="text-paper">partial and capped</strong>; it does not eliminate the risk. MINOTAUR is{" "}
        <strong className="text-paper">not a savings account</strong> and no outcome is guaranteed.
      </>
    ),
  },
  {
    title: "7 · Fees",
    body: (
      <>
        The pool’s LP fee (0.20% of every swap) accrues inside the pool and compounds into the value of your share —
        there is no separate claim step. There are no MINOTAUR deposit or withdrawal fees beyond the Solana network
        fees required to move funds on-chain.
      </>
    ),
  },
  {
    title: "8 · Withdrawals",
    body: (
      <>
        Only you can withdraw your balance, authenticated against your X (Privy) identity. You may redeem your share
        of the pool to any address you choose. Withdrawals are checked for solvency before your share is debited; if
        the pool cannot currently cover the amount, you may need to withdraw less or try again later. The value you
        receive reflects the pool’s state at withdrawal time and may differ from what you deposited.
      </>
    ),
  },
  {
    title: "9 · The underlying asset",
    body: (
      <>
        ${ANSEM_SYMBOL} (“The Black Bull”) is an attention-backed community token with no team, roadmap, utility, or
        whitepaper, and is <strong className="text-paper">not affiliated with Ansem</strong>. Its value can go to
        zero. Deeper liquidity makes its market fairer and less volatile to trade — it does not make the asset
        fundamentally sound. Do not deposit money you cannot afford to lose entirely.
      </>
    ),
  },
  {
    title: "10 · No advice, no offer",
    body: (
      <>
        Nothing in this interface is financial, investment, legal, or tax advice, and nothing is an offer or
        solicitation to buy any asset. Displayed values are estimates computed from live pool and market state and can
        change at any moment. You alone are responsible for your decisions.
      </>
    ),
  },
  {
    title: "11 · Prohibited use",
    body: (
      <>
        You may not use MINOTAUR for money laundering, sanctions evasion, fraud, or any unlawful activity. We may
        decline or reverse service, and cooperate with lawful requests, where required.
      </>
    ),
  },
  {
    title: "12 · Assumption of risk & limitation of liability",
    body: (
      <>
        Custodial services carry operator risk (key compromise, insolvency, error); automated market makers carry
        impermanent-loss and smart-contract risk; blockchains can halt, fork, or congest; interfaces and data feeds
        can fail or display stale values. You use MINOTAUR at your own risk. To the maximum extent permitted by law,
        MINOTAUR contributors are not liable for any loss — including loss from impermanent loss, market movement,
        operator or smart-contract failure, key loss, or interface error. The service is provided “as is”, without
        warranties of any kind.
      </>
    ),
  },
  {
    title: "13 · Changes",
    body: (
      <>
        These terms may be updated; material changes will be reflected on this page with a new revision date.
        Continued use after changes constitutes acceptance.
      </>
    ),
  },
];

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-piggy-300">
          <FileText className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Legal</span>
        </div>
        <h1 className="mt-3 text-4xl font-semibold">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-mute">Revision · July 2026 · custodial · Solana mainnet</p>
      </motion.div>

      <div className="mt-8">
        <ILWarning />
      </div>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold text-paper">{s.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-mute">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="divider my-10" />
      <p className="text-center text-xs text-faint">
        By using MINOTAUR you accept these terms in full. If you do not accept them, do not use the service.
      </p>
    </div>
  );
}
