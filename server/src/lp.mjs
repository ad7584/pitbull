// LP engine — provide $ANSEM/SOL liquidity to the PumpSwap pool from the keeper.
//
// MAINNET-ONLY: pump.fun/PumpSwap + $ANSEM live on mainnet, so this uses a
// dedicated mainnet connection (separate from the devnet server). Built against
// the official @pump-fun/pump-swap-sdk@1.18.x. The SDK derives the token
// program from each mint, so $ANSEM being TOKEN-2022 is handled automatically.
//
// EXECUTION IS GATED. provideLiquidity() only SIMULATES (no funds, no signature)
// unless opts.live === true AND LP_LIVE_ENABLED === "true". That flag must never
// be set before an independent audit + a staged, tiny-amount rollout.
import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { OnlinePumpAmmSdk, PumpAmmSdk } from "@pump-fun/pump-swap-sdk";
import BN from "bn.js";

// The live $ANSEM/SOL PumpSwap pool (verified on-chain, ~$1.6M liquidity).
export const ANSEM_POOL = new PublicKey("FnzKY6x7entQ1eR3D225dQyT7ybfka4PskBMQhb8L3CC");
const SLIPPAGE_PCT = 1;

const MAINNET_RPC =
  process.env.LP_MAINNET_RPC_URL ||
  process.env.VITE_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

export function mainnetConnection() {
  return new Connection(MAINNET_RPC, "confirmed");
}

/** Read the live pool — reserves, LP mint + supply, spot price. Read-only. */
export async function getPoolState(connection) {
  const online = new OnlinePumpAmmSdk(connection);
  const pool = await online.fetchPool(ANSEM_POOL);
  const [baseAcc, quoteAcc] = await Promise.all([
    connection.getTokenAccountBalance(pool.poolBaseTokenAccount),
    connection.getTokenAccountBalance(pool.poolQuoteTokenAccount),
  ]);
  const baseReserve = BigInt(baseAcc.value.amount); // $ANSEM (6 dp)
  const quoteReserve = BigInt(quoteAcc.value.amount); // WSOL lamports
  return {
    lpMint: pool.lpMint.toBase58(),
    baseReserve,
    quoteReserve,
    lpSupply: BigInt(pool.lpSupply.toString()),
    priceSolPerAnsem: baseReserve > 0n ? Number(quoteReserve) / Number(baseReserve) : 0,
  };
}

/**
 * SOL value of an LP position at spot. A constant-product LP position is worth
 * both legs; valuing at the quote (SOL) leg, that's ~2× the quote reserve share.
 * This is what ledger.pooledValue() must call once lp_tokens > 0 (audit #7).
 */
export function lpValueLamports(lpTokens, poolState) {
  if (!poolState || poolState.lpSupply === 0n) return 0;
  const totalValueLamports = Number(poolState.quoteReserve) * 2;
  return Math.floor((Number(lpTokens) / Number(poolState.lpSupply)) * totalValueLamports);
}

/**
 * Build the deposit transaction: add `baseAmountAnsem` $ANSEM + the matching
 * SOL leg to the pool, minting LP tokens to the keeper. Returns the unsigned tx
 * plus the computed LP tokens + SOL required. (The keeper must already hold the
 * $ANSEM — acquire it first with buyWithSol / buyQuoteInput.)
 */
export async function buildDepositTx(connection, keeperPubkey, baseAmountAnsem) {
  const online = new OnlinePumpAmmSdk(connection);
  const offline = new PumpAmmSdk();
  const state = await online.liquiditySolanaState(ANSEM_POOL, keeperPubkey);
  const base = new BN(baseAmountAnsem.toString());
  const { quote, lpToken } = offline.depositAutocompleteQuoteAndLpTokenFromBase(state, base, SLIPPAGE_PCT);
  const ixs = await offline.depositInstructions(state, lpToken, SLIPPAGE_PCT);
  const { blockhash } = await connection.getLatestBlockhash();
  const msg = new TransactionMessage({
    payerKey: keeperPubkey,
    recentBlockhash: blockhash,
    instructions: ixs,
  }).compileToV0Message();
  return { tx: new VersionedTransaction(msg), lpToken: lpToken.toString(), quoteNeeded: quote.toString() };
}

/** Build a swap tx: buy $ANSEM with `solLamports` of SOL (the base for the LP). */
export async function buildBuyTx(connection, keeperPubkey, solLamports) {
  const online = new OnlinePumpAmmSdk(connection);
  const offline = new PumpAmmSdk();
  const state = await online.swapSolanaState(ANSEM_POOL, keeperPubkey);
  const ixs = await offline.buyQuoteInput(state, new BN(solLamports.toString()), SLIPPAGE_PCT);
  const { blockhash } = await connection.getLatestBlockhash();
  const msg = new TransactionMessage({
    payerKey: keeperPubkey,
    recentBlockhash: blockhash,
    instructions: ixs,
  }).compileToV0Message();
  return new VersionedTransaction(msg);
}

/**
 * Full flow from pooled SOL: buy ~half → $ANSEM, then deposit both legs.
 * SIMULATE-ONLY by default (dry-runs the buy leg against mainnet, no funds).
 * The atomic live buy→deposit is hard-gated and must not run before an audit +
 * a funded fork test (see lp-forktest.md).
 */
export async function provideLiquidityFromSol(keeper, solLamports, { live = false } = {}) {
  const connection = mainnetConnection();
  const half = Math.floor(solLamports / 2);
  if (!live) {
    const buyTx = await buildBuyTx(connection, keeper.publicKey, half);
    const sim = await connection.simulateTransaction(buyTx, { sigVerify: false, replaceRecentBlockhash: true });
    return { simulated: true, phase: "buy", solInLamports: half, err: sim.value.err, unitsConsumed: sim.value.unitsConsumed };
  }
  if (process.env.LP_LIVE_ENABLED !== "true") {
    throw new Error("LP live execution disabled. Enable only after audit + funded fork test + staged rollout.");
  }
  // Live buy→deposit is intentionally NOT wired to execute in this build — it is
  // the audited step. Implement per lp-forktest.md, gated behind LP_LIVE_ENABLED.
  throw new Error("Live LP-from-SOL execution not enabled in this build.");
}

/** Dry-run a deposit against mainnet — no funds, no signature. */
export async function simulateDeposit(connection, keeperPubkey, baseAmountAnsem) {
  const { tx, lpToken, quoteNeeded } = await buildDepositTx(connection, keeperPubkey, baseAmountAnsem);
  const sim = await connection.simulateTransaction(tx, { sigVerify: false, replaceRecentBlockhash: true });
  return { lpToken, quoteNeeded, err: sim.value.err, unitsConsumed: sim.value.unitsConsumed, logs: sim.value.logs };
}

/**
 * Provide liquidity. Default: SIMULATE only. Live execution moves REAL mainnet
 * funds and is hard-gated behind LP_LIVE_ENABLED — do not enable pre-audit.
 */
export async function provideLiquidity(keeper, baseAmountAnsem, { live = false } = {}) {
  const connection = mainnetConnection();
  if (!live) {
    return { simulated: true, ...(await simulateDeposit(connection, keeper.publicKey, baseAmountAnsem)) };
  }
  if (process.env.LP_LIVE_ENABLED !== "true") {
    throw new Error("LP live execution disabled. Set LP_LIVE_ENABLED=true only after audit + staged rollout.");
  }
  const { tx, lpToken } = await buildDepositTx(connection, keeper.publicKey, baseAmountAnsem);
  tx.sign([keeper]);
  const sig = await connection.sendTransaction(tx);
  await connection.confirmTransaction(sig, "confirmed");
  return { simulated: false, sig, lpToken };
}
