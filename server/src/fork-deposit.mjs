// FORK TEST: execute the real buy→deposit LP flow against a local mainnet fork.
// Fake fork SOL only — nothing touches mainnet. Run with the fork validator up:
//   node src/fork-deposit.mjs
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { OnlinePumpAmmSdk, PumpAmmSdk } from "@pump-fun/pump-swap-sdk";
import BN from "bn.js";
import { keeper } from "./wallets.mjs";
import { ANSEM_POOL } from "./lp.mjs";

const RPC = process.env.FORK_RPC || "http://127.0.0.1:8899";
const ANSEM = new PublicKey("9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump");
const LP_MINT = new PublicKey("CevNeicTXqL1oAjqZ3FNmexftzKD4ozqev5DgX2sAgFq");
const conn = new Connection(RPC, "confirmed");
const online = new OnlinePumpAmmSdk(conn);
const offline = new PumpAmmSdk();

async function send(ixs, label) {
  const { blockhash } = await conn.getLatestBlockhash();
  const msg = new TransactionMessage({
    payerKey: keeper.publicKey,
    recentBlockhash: blockhash,
    instructions: ixs,
  }).compileToV0Message();
  const tx = new VersionedTransaction(msg);
  tx.sign([keeper]);
  const sig = await conn.sendTransaction(tx);
  await conn.confirmTransaction(sig, "confirmed");
  console.log(`  ${label} OK ${sig.slice(0, 14)}…`);
  return sig;
}

async function tokenBal(mint) {
  const r = await conn.getParsedTokenAccountsByOwner(keeper.publicKey, { mint });
  return r.value.reduce((s, a) => s + (a.account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0), 0);
}

console.log("keeper:", keeper.publicKey.toBase58());
// 1. fund the keeper with fork SOL
if ((await conn.getBalance(keeper.publicKey)) < 20 * LAMPORTS_PER_SOL) {
  const sig = await conn.requestAirdrop(keeper.publicKey, 100 * LAMPORTS_PER_SOL);
  await conn.confirmTransaction(sig, "confirmed");
}
console.log("1) keeper SOL:", (await conn.getBalance(keeper.publicKey)) / LAMPORTS_PER_SOL);

// 2. buy $ANSEM with 5 fork-SOL
console.log("2) buying $ANSEM with 5 SOL…");
const swapState = await online.swapSolanaState(ANSEM_POOL, keeper.publicKey);
await send(await offline.buyQuoteInput(swapState, new BN(5 * LAMPORTS_PER_SOL), 1), "buy");
const ansemHeld = await tokenBal(ANSEM);
console.log("   $ANSEM held:", ansemHeld.toLocaleString());

// 3. deposit that $ANSEM + matching SOL → LP
console.log("3) depositing to LP…");
const liq = await online.liquiditySolanaState(ANSEM_POOL, keeper.publicKey);
const base = new BN(Math.floor(ansemHeld * 0.98 * 1e6).toString());
const { lpToken } = offline.depositAutocompleteQuoteAndLpTokenFromBase(liq, base, 1);
await send(await offline.depositInstructions(liq, lpToken, 1), "deposit");

// 4. assert LP tokens minted to the keeper
const lpHeld = await tokenBal(LP_MINT);
console.log("4) LP tokens held:", lpHeld);
console.log(lpHeld > 0 ? "✅ FORK TEST PASSED — LP minted, no real funds." : "❌ no LP minted");
