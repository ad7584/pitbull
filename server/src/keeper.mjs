// S3: LP keeper. When pooled SOL crosses the threshold, provide $ANSEM/SOL
// liquidity on PumpSwap. Research verdict: FEASIBLE via the official pump.fun
// PumpSwap SDK (permissionless add-liquidity for graduated tokens).
//
// ⚠️ GATED: pump.fun/PumpSwap + $ANSEM are MAINNET-ONLY, so this cannot run on
// devnet, and it moves REAL funds — so it stays DISABLED. Enabling it requires
// an audit, legal review, and secure key custody. It is never a default.
import { ANSEM_MINT, CLUSTER, CRANK_THRESHOLD_LAMPORTS } from "./config.mjs";
import { getPool } from "./ledger.mjs";
import { keeper } from "./wallets.mjs";
import { balanceOf } from "./solana-tx.mjs";

export async function keeperStatus() {
  const pool = await getPool();
  const keeperLamports = await balanceOf(keeper.publicKey.toBase58()).catch(() => 0);
  return {
    cluster: CLUSTER,
    keeper: keeper.publicKey.toBase58(),
    keeperLamports,
    pendingLamports: pool.pendingLamports,
    thresholdLamports: CRANK_THRESHOLD_LAMPORTS,
    ready: pool.pendingLamports >= CRANK_THRESHOLD_LAMPORTS,
    lpEnabled: false, // hard-off; see provideLiquidity()
    ansemMint: ANSEM_MINT,
  };
}

/**
 * Provide $ANSEM/SOL liquidity from the keeper. INTENTIONALLY DISABLED.
 * Mainnet implementation outline:
 *   1. install @pump-fun/pump-swap-sdk (or Raydium SDK for the migrated pool)
 *   2. swap ~half the pooled SOL → $ANSEM within slippage/MEV bounds
 *   3. addLiquidity(SOL leg, ANSEM leg) → receive LP tokens
 *   4. record lp_tokens in pool_state; value flows back to shares
 */
export async function provideLiquidity() {
  throw new Error(
    "LP provision is disabled: mainnet-only and requires audit + legal + secure key custody before enabling.",
  );
}
