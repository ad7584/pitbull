// Faithful in-browser simulation of the PIT-BULL program. Pure functions over
// plain state so the React store stays reactive. Every formula mirrors
// programs/pitbull/src/{lib,pumpswap,state}.rs — this is what makes the demo
// behave like the real contract (share dilution, crank buy-pressure, the
// 70/20/10 gain split, and partial-capped IL reimbursement).

import {
  BPS_DENOM,
  GAIN_BUFFER_BPS,
  GAIN_TREASURY_BPS,
  LP_FEE_BPS,
} from "./protocol";
import type { BreakQuote, MetaVault, Pen, Pool, ProtocolConfig } from "./types";

// ---- pool / LP valuation (pumpswap.rs) --------------------------------------

/** SOL-equivalent value of LP tokens, both legs at spot. (lp_value_lamports) */
export function lpValueLamports(lpTokens: number, pool: Pool): number {
  if (pool.lpSupply === 0) return 0;
  return (lpTokens * (pool.solReserve * 2)) / pool.lpSupply;
}

/** Total vault value = undeployed SOL + LP legs. (deposit() vault_value) */
export function vaultValue(vault: MetaVault, pool: Pool): number {
  return vault.pendingLamports + lpValueLamports(vault.lpTokens, pool);
}

/** SOL price of one ANSEM base unit at spot. */
export function ansemPriceSol(pool: Pool): number {
  if (pool.ansemReserve === 0) return 0;
  return pool.solReserve / pool.ansemReserve;
}

// ---- share accounting (deposit()) -------------------------------------------

/** Shares minted for `amount` against current vault value. */
export function sharesForDeposit(
  amount: number,
  vault: MetaVault,
  pool: Pool,
): number {
  const value = vaultValue(vault, pool);
  if (vault.totalShares === 0 || value === 0) return amount; // bootstrap 1:1
  return (amount * vault.totalShares) / value;
}

/** A pen's current worth = its share slice of vault value. (INTEGRATION §5) */
export function penWorth(pen: Pen, vault: MetaVault, pool: Pool): number {
  if (vault.totalShares === 0) return 0;
  return (pen.shares / vault.totalShares) * vaultValue(vault, pool);
}

// ---- crank (crank_provision + cpi_swap + cpi_add_liquidity) -----------------

export interface CrankResult {
  vault: MetaVault;
  pool: Pool;
  batch: number;
  ansemBought: number;
  lpMinted: number;
}

/**
 * Batch pending SOL into the pool: swap ~half SOL→ANSEM on the pool itself
 * (the buy pressure), then a single add-liquidity. Constant-product with the
 * 0.20% LP fee, mirroring keeper.ts quoteMinAnsemOut + pumpswap builders.
 */
export function applyCrank(vault: MetaVault, pool: Pool): CrankResult {
  const batch = vault.pendingLamports;
  const half = Math.floor(batch / 2);
  const solLeg = batch - half;

  // ½ SOL → ANSEM swap (x*y=k with fee). This literally bids ANSEM up.
  const inAfterFee = (half * (BPS_DENOM - LP_FEE_BPS)) / BPS_DENOM;
  const ansemOut =
    (pool.ansemReserve * inAfterFee) / (pool.solReserve + inAfterFee);
  const pool1: Pool = {
    solReserve: pool.solReserve + half,
    ansemReserve: pool.ansemReserve - ansemOut,
    lpSupply: pool.lpSupply,
  };

  // add-liquidity: mint LP proportional to the smaller-priced leg.
  const lpFromQuote = (solLeg * pool1.lpSupply) / Math.max(pool1.solReserve, 1);
  const lpFromBase = (ansemOut * pool1.lpSupply) / Math.max(pool1.ansemReserve, 1);
  const lpMinted = Math.min(lpFromQuote, lpFromBase);
  const pool2: Pool = {
    solReserve: pool1.solReserve + solLeg,
    ansemReserve: pool1.ansemReserve + ansemOut,
    lpSupply: pool1.lpSupply + lpMinted,
  };

  return {
    vault: {
      ...vault,
      pendingLamports: 0,
      lpTokens: vault.lpTokens + lpMinted,
    },
    pool: pool2,
    batch,
    ansemBought: ansemOut,
    lpMinted,
  };
}

// ---- break settlement (break_pen()) -----------------------------------------

/**
 * Compute exactly what break_pen() would pay + how the gain/IL settles.
 * Pure preview — no state mutation. (Shown before signing per INTEGRATION §6.)
 */
export function breakQuote(
  pen: Pen,
  vault: MetaVault,
  pool: Pool,
  config: ProtocolConfig,
): BreakQuote {
  const fracNum = pen.shares;
  const fracDen = Math.max(vault.totalShares, 1);

  const pendingOut = (vault.pendingLamports * fracNum) / fracDen;
  const lpOut = (vault.lpTokens * fracNum) / fracDen;

  // remove-liquidity → both legs (cpi_remove_liquidity, proportional).
  const solLeg = pool.lpSupply > 0 ? (lpOut * pool.solReserve) / pool.lpSupply : 0;
  const ansemLeg =
    pool.lpSupply > 0 ? (lpOut * pool.ansemReserve) / pool.lpSupply : 0;

  // ANSEM leg valued at spot for accounting only.
  const ansemLegValue =
    pool.ansemReserve > 0 ? (ansemLeg * pool.solReserve) / pool.ansemReserve : 0;

  const redeemedValue = pendingOut + solLeg + ansemLegValue;
  const delta = redeemedValue - pen.principal;

  let solToUser = pendingOut + solLeg;
  let gainToOwner = 0;
  let gainToBuffer = 0;
  let gainToTreasury = 0;
  let ilAmount = 0;
  let ilReimbursed = 0;

  if (redeemedValue > pen.principal) {
    const gain = redeemedValue - pen.principal;
    const toBuffer = (gain * GAIN_BUFFER_BPS) / BPS_DENOM;
    const toTreasury = (gain * GAIN_TREASURY_BPS) / BPS_DENOM;
    let skim = toBuffer + toTreasury;
    skim = Math.min(skim, solToUser); // never touch the ANSEM leg
    solToUser -= skim;
    gainToBuffer =
      (skim * GAIN_BUFFER_BPS) / (GAIN_BUFFER_BPS + GAIN_TREASURY_BPS);
    gainToTreasury = skim - gainToBuffer;
    gainToOwner = gain - skim; // the 70% (plus rounding) that stays with owner
  } else if (redeemedValue < pen.principal) {
    ilAmount = pen.principal - redeemedValue;
    let reimburse = (ilAmount * config.ilReimburseBps) / BPS_DENOM;
    reimburse = Math.min(reimburse, config.ilReimburseCap, vault.bufferLamports);
    ilReimbursed = reimburse;
    solToUser += reimburse;
  }

  return {
    pendingOut,
    solLeg,
    ansemLeg,
    ansemLegValue,
    redeemedValue,
    principal: pen.principal,
    delta,
    isGain: delta >= 0,
    gainToOwner,
    gainToBuffer,
    gainToTreasury,
    ilAmount,
    ilReimbursed,
    solToUser,
    ansemToUser: ansemLeg,
  };
}

export interface BreakResult {
  vault: MetaVault;
  pool: Pool;
  quote: BreakQuote;
}

/** Apply a break: settle, remove liquidity, pay out, close the pen. */
export function applyBreak(
  pen: Pen,
  vault: MetaVault,
  pool: Pool,
  config: ProtocolConfig,
): BreakResult {
  const q = breakQuote(pen, vault, pool, config);
  const fracNum = pen.shares;
  const fracDen = Math.max(vault.totalShares, 1);
  const lpOut = (vault.lpTokens * fracNum) / fracDen;

  const nextPool: Pool = {
    solReserve: pool.solReserve - q.solLeg,
    ansemReserve: pool.ansemReserve - q.ansemLeg,
    lpSupply: pool.lpSupply - lpOut,
  };

  const nextVault: MetaVault = {
    ...vault,
    pendingLamports: vault.pendingLamports - q.pendingOut,
    lpTokens: vault.lpTokens - lpOut,
    totalShares: vault.totalShares - pen.shares,
    bufferLamports: vault.bufferLamports + q.gainToBuffer - q.ilReimbursed,
    treasuryLamports: vault.treasuryLamports + q.gainToTreasury,
    lifetimeReturned: vault.lifetimeReturned + q.solToUser,
  };

  return { vault: nextVault, pool: nextPool, quote: q };
}

// ---- unlock rules (state.rs VaultKind + break_pen guards) -------------------

export interface UnlockStatus {
  unlocked: boolean;
  /** 0..1 progress toward unlock (Open is always 1). */
  progress: number;
  label: string;
  /** seconds remaining for a timelock, else undefined. */
  secondsLeft?: number;
}

export function unlockStatus(
  pen: Pen,
  nowMs: number,
  vault: MetaVault,
  pool: Pool,
): UnlockStatus {
  const nowSec = Math.floor(nowMs / 1000);
  switch (pen.kind) {
    case "Open":
      return { unlocked: true, progress: 1, label: "Unlocked — break anytime" };
    case "Timelock": {
      const left = pen.unlockParam - nowSec;
      const total = pen.unlockParam - Math.floor(pen.createdAt / 1000);
      const progress = total > 0 ? Math.min(1, 1 - left / total) : 1;
      return {
        unlocked: left <= 0,
        progress: Math.max(0, progress),
        label: left <= 0 ? "Unlocked" : "Time-locked",
        secondsLeft: Math.max(0, left),
      };
    }
    case "AmountTarget": {
      const progress =
        pen.unlockParam > 0 ? Math.min(1, pen.principal / pen.unlockParam) : 1;
      return {
        unlocked: pen.principal >= pen.unlockParam,
        progress,
        label:
          pen.principal >= pen.unlockParam ? "Target reached" : "Filling goal",
      };
    }
    default: {
      // exhaustive
      void vault;
      void pool;
      return { unlocked: false, progress: 0, label: "" };
    }
  }
}

// ---- ambient market simulation ----------------------------------------------

/**
 * Nudge the pool with a small external trade so "worth now" ticks like a live
 * market. Positive bias drifts ANSEM up, negative down; magnitude is a
 * fraction of reserves. Constant-product preserved.
 */
export function applyExternalTrade(pool: Pool, signedFraction: number): Pool {
  if (signedFraction === 0) return pool;
  const k = pool.solReserve * pool.ansemReserve;
  if (signedFraction > 0) {
    // buy ANSEM with SOL → ANSEM up
    const solIn = pool.solReserve * signedFraction;
    const newSol = pool.solReserve + solIn;
    const newAnsem = k / newSol;
    return { ...pool, solReserve: newSol, ansemReserve: newAnsem };
  }
  const ansemIn = pool.ansemReserve * -signedFraction;
  const newAnsem = pool.ansemReserve + ansemIn;
  const newSol = k / newAnsem;
  return { ...pool, solReserve: newSol, ansemReserve: newAnsem };
}
