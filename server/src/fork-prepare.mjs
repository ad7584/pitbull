// Enumerate every mainnet account the buy+deposit flow touches, so the fork
// validator can clone them. Read-only. Run: node src/fork-prepare.mjs
import "dotenv/config";
import { OnlinePumpAmmSdk, PumpAmmSdk } from "@pump-fun/pump-swap-sdk";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { keeper } from "./wallets.mjs";
import { ANSEM_POOL, mainnetConnection } from "./lp.mjs";

const conn = mainnetConnection();
const online = new OnlinePumpAmmSdk(conn);
const offline = new PumpAmmSdk();

const ixs = [];
try {
  const swapState = await online.swapSolanaState(ANSEM_POOL, keeper.publicKey);
  ixs.push(...(await offline.buyQuoteInput(swapState, new BN(500_000_000), 1)));
} catch (e) {
  console.error("buy build note:", e.message);
}
try {
  const liq = await online.liquiditySolanaState(ANSEM_POOL, keeper.publicKey);
  const { lpToken } = offline.depositAutocompleteQuoteAndLpTokenFromBase(liq, new BN(1_000_000), 1);
  ixs.push(...(await offline.depositInstructions(liq, lpToken.isZero?.() ? new BN(1000) : lpToken, 1)));
} catch (e) {
  console.error("deposit build note:", e.message);
}

const keys = new Set();
for (const ix of ixs) {
  keys.add(ix.programId.toBase58());
  for (const k of ix.keys) keys.add(k.pubkey.toBase58());
}
const arr = [...keys].map((k) => new PublicKey(k));
const infos = await conn.getMultipleAccountsInfo(arr);
const programs = [], accounts = [], missing = [];
arr.forEach((k, i) => {
  const info = infos[i];
  if (!info) return missing.push(k.toBase58());
  (info.executable ? programs : accounts).push(k.toBase58());
});
console.log("PROGRAMS=" + programs.join(","));
console.log("ACCOUNTS=" + accounts.join(","));
console.log("MISSING=" + missing.join(",")); // created on the fork (keeper ATAs etc.)
