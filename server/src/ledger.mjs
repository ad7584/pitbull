// The shared ledger, backed by Postgres (Supabase). Every user balance and the
// pool state live here — one source of truth across all users and restarts.
import { pool, query } from "./db.mjs";

function mapUser(row) {
  return {
    userId: row.user_id,
    depositAddress: row.deposit_address,
    creditedLamports: Number(row.credited_lamports),
    shares: Number(row.shares),
    lastSig: row.last_sig,
  };
}

export async function getUser(userId) {
  const r = await query(
    "select user_id, deposit_address, credited_lamports, shares, last_sig from users where user_id=$1",
    [userId],
  );
  return r.rows[0] ? mapUser(r.rows[0]) : null;
}

export async function ensureUser(userId, depositAddress) {
  await query(
    "insert into users (user_id, deposit_address) values ($1,$2) on conflict (user_id) do nothing",
    [userId, depositAddress],
  );
  return getUser(userId);
}

export async function getPool() {
  const r = await query(
    "select pending_lamports, lp_tokens, total_shares from pool_state where id=1",
  );
  const row = r.rows[0] ?? { pending_lamports: 0, lp_tokens: 0, total_shares: 0 };
  return {
    pendingLamports: Number(row.pending_lamports),
    lpTokens: Number(row.lp_tokens),
    totalShares: Number(row.total_shares),
  };
}

/**
 * Credit a confirmed deposit and mint shares — atomic + idempotent per on-chain
 * signature. Same no-dilution math as the frontend engine:
 *   minted = totalShares==0 ? amount : amount * totalShares / pendingValue
 * (Stage 2 calls this from the deposit watcher.)
 */
export async function creditDeposit(userId, lamports, sig) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const seen = await client.query("select 1 from deposits where sig=$1", [sig]);
    if (seen.rowCount) {
      await client.query("rollback");
      return { skipped: true };
    }
    const ps = await client.query(
      "select pending_lamports, total_shares from pool_state where id=1 for update",
    );
    const value = Number(ps.rows[0].pending_lamports);
    const totalShares = Number(ps.rows[0].total_shares);
    const minted = totalShares === 0 || value === 0 ? lamports : (lamports * totalShares) / value;

    await client.query(
      "update users set credited_lamports = credited_lamports + $1, shares = shares + $2, last_sig=$3 where user_id=$4",
      [lamports, minted, sig, userId],
    );
    await client.query(
      "update pool_state set pending_lamports = pending_lamports + $1, total_shares = total_shares + $2 where id=1",
      [lamports, minted],
    );
    await client.query("insert into deposits (sig, user_id, lamports) values ($1,$2,$3)", [
      sig,
      userId,
      lamports,
    ]);
    await client.query("commit");
    return { minted };
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}
