// Protocol constants + copy — mirror programs/pitbull/src/state.rs and the
// legal/copy rules in app/INTEGRATION.md §8. Single source of truth for the UI.

import type { VaultKind } from "./types";

export const LAMPORTS_PER_SOL = 1_000_000_000;

// Fee split on POSITIVE gains at break (basis points). Applies to gains only —
// never to principal. (state.rs GAIN_*_BPS)
export const GAIN_DEPOSITOR_BPS = 7_000; // 70% owner
export const GAIN_BUFFER_BPS = 2_000; // 20% IL buffer
export const GAIN_TREASURY_BPS = 1_000; // 10% treasury
export const BPS_DENOM = 10_000;

// Config defaults (state.rs Config).
export const DEFAULT_MIN_DEPOSIT = 0.005 * LAMPORTS_PER_SOL;
// Provide liquidity once pending deposits cross 10 SOL worth (was time/2-SOL).
export const DEFAULT_CRANK_THRESHOLD = 10 * LAMPORTS_PER_SOL;
export const IL_REIMBURSE_BPS = 5_000; // buffer covers up to 50% of realized IL
export const IL_REIMBURSE_CAP = 0.5 * LAMPORTS_PER_SOL; // hard cap per pen

// Gain-split DESTINATION wallets (public keys only — safe to ship). The three
// keypairs were generated locally; their PRIVATE keys live OUTSIDE this repo
// (~/pitbull-keys) and must be moved to secure/cold storage. Never commit or
// bundle a private key. These addresses only ever RECEIVE here.
export const REWARDS_WALLET = "BNoGaMvndXcExKR16Yq9U2Ex2NkbFMgqyibYFRtUyA4w"; // 70% owner rewards
export const IL_BUFFER_WALLET = "8LbjQcJaSm3fMuKbNC361PCbVJqtr3eAs9VyX85wGMrZ"; // 20% IL buffer
export const TREASURY_WALLET = "EhKUtUecK1Npy8yjkTGHATPe6ktAuz4owwiT3sxcg1XG"; // 10% treasury

// Pinned identifiers (lib.rs declare_id! / pumpswap.rs / Config.ansem_mint).
export const PROGRAM_ID = "PitBu11111111111111111111111111111111111111";
export const PUMPSWAP_PROGRAM_ID = "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA";
/** Canonical $ANSEM mint — pinned in Config, never client-supplied. */
export const ANSEM_MINT = "9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump";
export const LP_FEE_BPS = 20; // 0.20% LP fee (0.25% total, 0.05% protocol)
export const ANSEM_SYMBOL = "ANSEM";
export const APP_HOST = "app.pitbull.fun";

/** Tokens accepted by the deposit path. ANSEM is valued at pool spot. */
export type DepositToken = "SOL" | "ANSEM";

export interface VaultKindMeta {
  kind: VaultKind;
  /** on-chain codename (state.rs comments). */
  codename: string;
  /** plain UI name (INTEGRATION.md §2 table). */
  title: string;
  tagline: string;
  description: string;
  /** relative reward weight for the creator-fee merkle layer. */
  rewardTier: "Low" | "Medium" | "High";
  needsParam: "none" | "amount" | "date";
  accent: string; // css var token suffix
}

export const VAULT_KINDS: Record<VaultKind, VaultKindMeta> = {
  Open: {
    kind: "Open",
    codename: "Off-Leash",
    title: "Off-Leash",
    tagline: "Break anytime",
    description:
      "No lock. Crack it open whenever you want. The gentlest on-ramp — and the least rewarded tier.",
    rewardTier: "Low",
    needsParam: "none",
    accent: "sky",
  },
  AmountTarget: {
    kind: "AmountTarget",
    codename: "Unleashed",
    title: "Goal",
    tagline: "Unlocks at a savings target",
    description:
      "Set a SOL target. The pen unlocks the moment total deposits — yours and any gifts — reach it.",
    rewardTier: "Medium",
    needsParam: "amount",
    accent: "gold",
  },
  Timelock: {
    kind: "Timelock",
    codename: "Chained",
    title: "Time-Lock",
    tagline: "Unlocks on a set date",
    description:
      "Pick a date. It stays sealed until then — predictable duration, deepest liquidity, top rewards.",
    rewardTier: "High",
    needsParam: "date",
    accent: "violet",
  },
};

// Copy rules — legal posture, enforced in UI strings (INTEGRATION.md §8).
export const COPY = {
  // Never say: "safe", "guaranteed", "protected principal", "savings account",
  // "IL-proof". Always frame honestly.
  floor: "Your floor, not your rent money.",
  worthMoves:
    "Worth moves with the $ANSEM market — it can be more or less than you saved.",
  crankLag: "Deposits join the pool at the next batch.",
  bufferPartial:
    "The buffer is partial and capped — it softens impermanent loss, it does not erase it.",
  giftIrreversible:
    "This is an irreversible gift. It locks under THEIR pen's rules, and only they can break it.",
  notSavings:
    "This is not a savings account. Impermanent loss means a pen can return less than was deposited.",
  attentionBacked:
    "$ANSEM is attention-backed — no team, roadmap, or utility. Deeper liquidity makes the market fairer, not the asset sound.",
  gambling:
    "Memecoin trading is high-risk and resembles gambling. Small amounts, regularly — the opposite of the all-in impulse.",
} as const;

export const GAIN_SPLIT_LABEL = "70% you / 20% buffer / 10% treasury";
