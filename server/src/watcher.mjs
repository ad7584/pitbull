// Deposit watcher. For each user's deposit address, sweep whatever balance is
// there into the keeper and credit the ledger with the amount that ACTUALLY
// reached the keeper (not the observed inbound delta). This is the key to the
// solvency invariant: pending_lamports == SOL the keeper truly holds, so a
// withdrawal can always be covered. Rent left behind in a deposit address is
// never credited (a small, honest per-address cost, like a network fee).
//
// Crediting is keyed by the sweep signature (idempotent). No signature paging,
// no scan cursor — a sweep either moves funds (credit once) or doesn't.
import { creditDeposit, listUsers } from "./ledger.mjs";
import { depositKeypairFor, keeper } from "./wallets.mjs";
import { sweepToKeeper } from "./solana-tx.mjs";

async function processUser(u) {
  try {
    const sw = await sweepToKeeper(depositKeypairFor(u.userId), keeper.publicKey);
    if (sw.swept > 0) {
      const r = await creditDeposit(u.userId, sw.swept, sw.sig);
      if (!r.skipped) console.log(`[watcher] +${sw.swept} lamports → ${u.userId} (swept ${sw.sig.slice(0, 8)}…)`);
    }
  } catch (e) {
    console.error(`[watcher] process failed for ${u.userId}:`, e.message);
  }
}

export function startWatcher({ intervalMs = 15000 } = {}) {
  let running = false;
  const tick = async () => {
    if (running) return; // never overlap
    running = true;
    try {
      for (const u of await listUsers()) await processUser(u);
    } catch (e) {
      console.error("[watcher]", e.message);
    } finally {
      running = false;
    }
  };
  tick();
  console.log(`[watcher] polling every ${intervalMs}ms (credits net swept amount)`);
  return setInterval(tick, intervalMs);
}
