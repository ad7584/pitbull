# 🐷 PIT-BULL — frontend

**The piggy bank you can only crack once.**

## Live (devnet)
- **App:** https://pitbull-mu.vercel.app
- **Backend API:** https://pitbull-server-production.up.railway.app (see [`server/`](server/))
- Deposit → detect → credit → sweep → owner-only withdraw all run on **devnet**.
  Mainnet is gated (audit + legal + key custody); the $ANSEM LP step is disabled.

A stunning, production-grade frontend for **PIT-BULL** (a.k.a. *Black Bull Piggy
Vault*) — the social piggy-bank liquidity protocol on Solana described in the
assignment brief. Users sign in with X, open one piggy bank, fill it with small
SOL deposits (their own or **gifted** via share links), which pool into batched
**$ANSEM** PumpSwap liquidity and earn fees — and the bank can only be
**cracked open once**.

This app is the missing half of the shipped repo: the on-chain Anchor program,
keeper, and tests were provided; the `app/` folder held only `INTEGRATION.md` (a
spec). This is the app that spec describes — built to be **best-in-class**.

![vaults](public/piggy.svg)

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** (custom "Junkyard Neon" design system)
- **Three.js + react-three-fiber + drei** — the lazy-loaded 3D hero (instanced metallic coin field)
- **Framer Motion** for motion & micro-interactions
- **canvas-confetti** for the crack-open celebration
- **qrcode** for share-card QR codes
- **Zustand** for state
- Fonts: **Clash Display** (display) · **Inter** (UI) · **JetBrains Mono** (all numbers, tabular)

The three.js hero is `React.lazy`-loaded after idle and code-split into its own chunk, so the
main bundle stays ~156KB gzip and three never blocks first paint. It pauses render when
scrolled out of view and respects `prefers-reduced-motion`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5178
npm run build    # typecheck + production build
```

## What's implemented (faithful to the spec)

Everything maps to `INTEGRATION.md` and the on-chain program:

| Spec | Where |
|---|---|
| **X login via Privy** → embedded self-custodial wallet (staged "creating your wallet" flow, "Protected by Privy"). No external wallets. | `components/auth/SignInModal.tsx` |
| One pen per identity, 3 vault kinds (Off-Leash / Unleashed / Time-Lock) | `pages/CreatePen.tsx`, `lib/protocol.ts` |
| **Dual-balance display** — *Saved* vs *Worth now*, never blended | `components/pens/DualBalance.tsx` |
| **Deposit SOL *or* $ANSEM** (valued at pool spot), one path for self + donations; **mandatory irreversible-gift modal** | `components/pens/FillModal.tsx` |
| **Share card** — real downloadable 1200×630 PNG with the pen's donate address + QR; postable to X | `components/pens/ShareModal.tsx`, `lib/sharecard.ts` |
| **Break = "smash the piggy bank"** — pre-sign preview, anticipation, confetti, dual-asset reveal | `components/pens/SmashModal.tsx` |
| 70/20/10 gain split · partial+capped IL buffer · dual-asset redemption | `lib/engine.ts` (`breakQuote`) |
| Leaderboard / explore with filters + sort + charity badges | `pages/Explore.tsx` |
| Live on-chain activity feed (SOL + $ANSEM aware) | `components/home/LiveActivity.tsx` |
| **IL warning** surfaced anywhere money moves (create, deposit, terms) | `components/ui/ILWarning.tsx` |
| **Terms & Conditions** — 12 sections incl. a dedicated IL clause | `pages/Terms.tsx` |
| Clean step-by-step "How it works" + "Getting started" | `components/home/HowItWorks.tsx`, `pages/About.tsx` |
| Crank-lag disclosure, "your floor not your rent money", copy rules (§8) | `lib/protocol.ts` (`COPY`) |
| Circuit-breaker & safety framing | `pages/About.tsx`, `pages/Landing.tsx` |

The canonical $ANSEM mint (`9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump`) is pinned in
`lib/protocol.ts` and surfaced on the deposit modal, footer, and terms.

## Architecture — a real protocol under the skin

The UI is not faked. `src/lib/` is a faithful TypeScript mirror of the Anchor
program so the demo behaves like the real contract:

- **`types.ts`** — mirrors `state.rs` accounts (`Pen`, `MetaVault`, `Config`, `OwnerStats`).
- **`engine.ts`** — the exact math from `lib.rs` / `pumpswap.rs`: ERC-4626 share
  minting against live vault value, the crank (swap ½ SOL → $ANSEM, then
  add-liquidity — real buy pressure), and `break_pen` settlement (70/20/10 on
  *gains only*, principal never split; partial capped IL reimbursement; both
  legs redeemed).
- **`seed.ts`** — builds a coherent demo world by *actually running* deposits +
  cranks through the engine, so every pen's "worth now" is internally
  consistent, exactly what the Helius indexer would report.
- **`store.ts`** — Zustand store + an ambient market tick (a live $ANSEM random
  walk + auto-crank + ambient deposits) so numbers move like a real market.

Swapping in the real chain is a drop-in: replace the store's `createPen` /
`deposit` / `break_` / `crank` with Anchor `program.methods.*` calls and feed
account data from Helius webhooks — the account shapes and every formula already
match `programs/pitbull/src/*.rs`.

## Honest by design

Per the assignment's legal posture, the UI **never** says "safe",
"guaranteed", or "savings account". It always shows *both* Saved and Worth-now,
discloses that worth moves with the $ANSEM market, states the buffer is partial,
and forces an explicit "this is an irreversible gift" confirmation before any
donation. This is a system-design demo — not audited software, not financial
advice.
