// The shared source of truth for the prototype: a JSON-file ledger.
// THIS is what makes the numbers real and shared — one server, one file that
// every user's balance and the pool state live in (not per-browser memory).
//
// Production target: Postgres (Supabase). The surface here is deliberately tiny
// (getUser / ensureUser / credit / snapshot) so swapping the storage layer is a
// small, contained change.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, "..", ".data", "ledger.json");
fs.mkdirSync(path.dirname(DATA), { recursive: true });

const EMPTY = {
  users: {}, // userId -> { depositAddress, creditedLamports, shares, lastSig }
  pool: { pendingLamports: 0, lpTokens: 0, totalShares: 0 },
};

function read() {
  if (!fs.existsSync(DATA)) return structuredClone(EMPTY);
  return JSON.parse(fs.readFileSync(DATA, "utf8"));
}
function write(state) {
  fs.writeFileSync(DATA, JSON.stringify(state, null, 2));
}

export function getUser(userId) {
  return read().users[userId] || null;
}

export function ensureUser(userId, depositAddress) {
  const s = read();
  if (!s.users[userId]) {
    s.users[userId] = { depositAddress, creditedLamports: 0, shares: 0, lastSig: null };
    write(s);
  }
  return s.users[userId];
}

/**
 * Credit a confirmed deposit to a user and mint shares (same no-dilution math
 * as the frontend engine: shares = amount * totalShares / pooledValue, or 1:1
 * on bootstrap). Idempotent per signature via lastSig guard by the caller.
 */
export function creditDeposit(userId, lamports, sig) {
  const s = read();
  const u = s.users[userId];
  if (!u) throw new Error("unknown user");
  const value = s.pool.pendingLamports; // Stage 1: value == pending (no LP yet)
  const minted = s.pool.totalShares === 0 || value === 0
    ? lamports
    : (lamports * s.pool.totalShares) / value;
  u.creditedLamports += lamports;
  u.shares += minted;
  u.lastSig = sig;
  s.pool.pendingLamports += lamports;
  s.pool.totalShares += minted;
  write(s);
  return { minted, user: u, pool: s.pool };
}

export function snapshot() {
  return read();
}
