// PIT-BULL custodial backend — Stage 1 config.
// SAFETY: DEVNET by default. No real funds. Mainnet is a separate, gated
// decision (audit + legal + real key custody). Do not flip PITBULL_CLUSTER to
// mainnet-beta casually — the deposit/ledger/withdrawal logic can be exercised
// on devnet, but the $ANSEM LP step is mainnet-only (pump.fun/PumpSwap).
import { clusterApiUrl } from "@solana/web3.js";

export const CLUSTER = process.env.PITBULL_CLUSTER || "devnet";
export const RPC_URL =
  process.env.PITBULL_RPC_URL ||
  (CLUSTER === "mainnet-beta" ? clusterApiUrl("mainnet-beta") : clusterApiUrl("devnet"));

export const LAMPORTS_PER_SOL = 1_000_000_000;

// Provide LP once pending deposits cross this — matches the frontend (10 SOL).
export const CRANK_THRESHOLD_LAMPORTS = 10 * LAMPORTS_PER_SOL;

// $ANSEM mint (mainnet). pump.fun/PumpSwap + this token are MAINNET-ONLY, so
// the LP step cannot run on devnet — accounting/deposits are devnet-testable.
export const ANSEM_MINT = "9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump";

// Gain split (bps) — mirrors the frontend split-destination wallets.
export const SPLIT = { ownerBps: 7000, bufferBps: 2000, treasuryBps: 1000 };

export const PORT = Number(process.env.PORT || 8787);
