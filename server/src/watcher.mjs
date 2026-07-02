// Deposit watcher: polls each user's deposit address for new inbound SOL,
// credits the shared ledger (idempotent per signature), then sweeps the
// balance into the single keeper wallet — the "single wallet of us" that holds
// pooled funds and pays withdrawals. Devnet.
import { Connection, PublicKey } from "@solana/web3.js";
import { RPC_URL } from "./config.mjs";
import { creditDeposit, listUsers, setLastSig } from "./ledger.mjs";
import { depositKeypairFor, keeper } from "./wallets.mjs";
import { sweepToKeeper } from "./solana-tx.mjs";

const connection = new Connection(RPC_URL, "confirmed");

async function creditNewDeposits(u) {
  const pubkey = new PublicKey(u.depositAddress);
  const sigs = await connection.getSignaturesForAddress(pubkey, {
    until: u.lastSig || undefined,
    limit: 25,
  });
  if (!sigs.length) return;
  const newest = sigs[0].signature;
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

async function sweep(u) {
  try {
    const sw = await sweepToKeeper(depositKeypairFor(u.userId), keeper.publicKey);
    if (sw.swept > 0) console.log(`[watcher] swept ${sw.swept} lamports → keeper (${sw.sig.slice(0, 8)}…)`);
  } catch (e) {
    console.error(`[watcher] sweep failed for ${u.userId}:`, e.message);
  }
}

export function startWatcher({ intervalMs = 15000 } = {}) {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      for (const u of await listUsers()) {
        await creditNewDeposits(u);
        await sweep(u); // also drains any prior, already-credited balance
      }
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
