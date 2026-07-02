// FORK TEST (production path): exercise the real provideLiquidityFromSol() +
// LP valuation against the mainnet fork. Fake fork SOL only.
// Run with the fork up + env: LP_MAINNET_RPC_URL=http://127.0.0.1:8899 LP_LIVE_ENABLED=true
import "dotenv/config";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { keeper } from "./wallets.mjs";
import { getPoolState, lpValueLamports, provideLiquidityFromSol } from "./lp.mjs";

const FORK = process.env.LP_MAINNET_RPC_URL || "http://127.0.0.1:8899";
const conn = new Connection(FORK, "confirmed");
const LP_MINT = new PublicKey("CevNeicTXqL1oAjqZ3FNmexftzKD4ozqev5DgX2sAgFq");

const lpAccounts = async () => (await conn.getParsedTokenAccountsByOwner(keeper.publicKey, { mint: LP_MINT })).value;
const uiSum = (accs) => accs.reduce((s, a) => s + (a.account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0), 0);
const rawSum = (accs) => accs.reduce((s, a) => s + Number(a.account.data.parsed?.info?.tokenAmount?.amount ?? 0), 0);

if ((await conn.getBalance(keeper.publicKey)) < 20 * LAMPORTS_PER_SOL) {
  await conn.confirmTransaction(await conn.requestAirdrop(keeper.publicKey, 100 * LAMPORTS_PER_SOL), "confirmed");
}
console.log("keeper SOL:", (await conn.getBalance(keeper.publicKey)) / LAMPORTS_PER_SOL);

const before = uiSum(await lpAccounts());
console.log("provideLiquidityFromSol(5 SOL, live) — the production function…");
const r = await provideLiquidityFromSol(keeper, 5 * LAMPORTS_PER_SOL, { live: true });
console.log("  result:", JSON.stringify(r).slice(0, 160));

const accs = await lpAccounts();
const lpHeld = uiSum(accs);
console.log("LP held:", lpHeld, "(gained", (lpHeld - before).toFixed(4) + ")");

const st = await getPoolState(conn);
const valSol = lpValueLamports(rawSum(accs), st) / LAMPORTS_PER_SOL;
console.log("LP value (via lpValueLamports):", valSol.toFixed(3), "SOL");

console.log(lpHeld > before && valSol > 0 ? "✅ PRODUCTION LP PATH PASSED (fork, no real funds)" : "❌ FAILED");
