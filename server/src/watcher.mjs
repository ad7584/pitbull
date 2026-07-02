// Deposit watcher: polls each user's deposit address for new inbound SOL and
// credits the shared ledger — idempotent per on-chain signature. Runs inside
// the server process on an interval. Devnet.
//
// `last_sig` is the scan cursor (newest signature seen). The `deposits` table
// (sig primary key) guarantees a transfer is credited at most once, so a re-scan
// is always safe.
import { Connection, PublicKey } from "@solana/web3.js";
import { RPC_URL } from "./config.mjs";
import { creditDeposit, listUsers, setLastSig } from "./ledger.mjs";

const connection = new Connection(RPC_URL, "confirmed");

async function scanUser(u) {
  const pubkey = new PublicKey(u.depositAddress);
  const sigs = await connection.getSignaturesForAddress(pubkey, {
    until: u.lastSig || undefined,
    limit: 25,
  });
  if (!sigs.length) return;

  const newest = sigs[0].signature;
  // oldest-first so deposits apply to share math in chronological order
  for (const s of [...sigs].reverse()) {
    if (s.err) continue;
    const tx = await connection.getParsedTransaction(s.signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx?.meta) continue;
    const keys = tx.transaction.message.accountKeys.map((k) => k.pubkey.toBase58());
    const i = keys.indexOf(u.depositAddress);
    if (i < 0) continue;
    const delta = tx.meta.postBalances[i] - tx.meta.preBalances[i];
    if (delta > 0) {
      const r = await creditDeposit(u.userId, delta, s.signature);
      if (!r.skipped) console.log(`[watcher] +${delta} lamports → ${u.userId} (${s.signature.slice(0, 8)}…)`);
    }
  }
  await setLastSig(u.userId, newest);
}

export function startWatcher({ intervalMs = 15000 } = {}) {
  let running = false;
  const tick = async () => {
    if (running) return; // never overlap scans
    running = true;
    try {
      for (const u of await listUsers()) await scanUser(u);
    } catch (e) {
      console.error("[watcher]", e.message);
    } finally {
      running = false;
    }
  };
  tick();
  console.log(`[watcher] polling every ${intervalMs}ms`);
  return setInterval(tick, intervalMs);
}
