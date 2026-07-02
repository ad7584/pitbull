// Read-only verification of the LP engine against the LIVE mainnet pool.
// Proves SDK integration (fetchPool, reserves, LP valuation) without any funds.
// Run: node src/lp-inspect.mjs
import "dotenv/config";
import { ANSEM_POOL, getPoolState, lpValueLamports, mainnetConnection } from "./lp.mjs";

const conn = mainnetConnection();
console.log("pool:", ANSEM_POOL.toBase58());
const st = await getPoolState(conn);
console.log("lpMint        :", st.lpMint);
console.log("ANSEM reserve :", (Number(st.baseReserve) / 1e6).toLocaleString(), "ANSEM");
console.log("SOL reserve   :", (Number(st.quoteReserve) / 1e9).toFixed(2), "SOL");
console.log("LP supply     :", st.lpSupply.toString());
console.log("price         :", (st.priceSolPerAnsem * 1e9 / 1e6).toFixed(6), "SOL per ANSEM (approx)");
const onePct = st.lpSupply / 100n;
console.log("value of 1% LP:", (lpValueLamports(onePct, st) / 1e9).toFixed(3), "SOL");
console.log("OK — LP engine reads the live pool. (No funds moved.)");
