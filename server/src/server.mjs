// PIT-BULL custodial backend — API (devnet), backed by Postgres.
// Endpoints: health, assign deposit address, read balance, read pool.
// Deposit DETECTION, the LP keeper, and owner-only WITHDRAWAL are Stage 2–4.
import "dotenv/config";
import express from "express";
import cors from "cors";
import { Connection } from "@solana/web3.js";
import { CLUSTER, PORT, RPC_URL } from "./config.mjs";
import { depositKeypairFor, keeper } from "./wallets.mjs";
import { applyWithdrawal, ensureUser, getPool, getUser, redeemableFor } from "./ledger.mjs";
import { startWatcher } from "./watcher.mjs";
import { authorizeWithdraw } from "./auth.mjs";
import { keeperStatus } from "./keeper.mjs";
import { payout } from "./solana-tx.mjs";

const app = express();
app.use(cors()); // prototype: allow all origins (restrict before mainnet)
app.use(express.json());
export const connection = new Connection(RPC_URL, "confirmed");

app.get("/health", (_req, res) =>
  res.json({ ok: true, cluster: CLUSTER, keeper: keeper.publicKey.toBase58() }),
);

// Assign (or return) a user's unique deposit address. userId = the Privy user
// id (identity only — NOT their funds wallet).
app.post("/deposit-address", async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId required" });
    const depositAddress = depositKeypairFor(userId).publicKey.toBase58();
    await ensureUser(userId, depositAddress);
    res.json({ userId, depositAddress, cluster: CLUSTER });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// A user's credited balance + share. (Stage 4 adds auth so ONLY the owner reads
// and, critically, only the owner can trigger a withdrawal.)
app.get("/balance/:userId", async (req, res) => {
  try {
    const u = await getUser(req.params.userId);
    if (!u) return res.status(404).json({ error: "unknown user" });
    res.json(u);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// The shared, real pool numbers.
app.get("/pool", async (_req, res) => {
  try {
    res.json(await getPool());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Keeper / LP status (LP itself is disabled — mainnet-only, gated).
app.get("/keeper/status", async (_req, res) => {
  try {
    res.json(await keeperStatus());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Owner-only withdrawal. Requires a valid Privy token whose subject === userId
// (or, on devnet with ALLOW_INSECURE_WITHDRAW, no token — INSECURE, testing).
// Burns shares first, then the keeper pays out.
app.post("/withdraw", async (req, res) => {
  try {
    const { userId, destination, lamports, authToken } = req.body || {};
    if (!userId || !destination) return res.status(400).json({ error: "userId + destination required" });

    const auth = await authorizeWithdraw(userId, authToken);
    if (!auth.ok) return res.status(401).json({ error: auth.reason });

    const redeemable = await redeemableFor(userId);
    const amount = Math.min(Number(lamports) || redeemable, redeemable);
    if (amount <= 0) return res.status(400).json({ error: "nothing to withdraw" });

    await applyWithdrawal(userId, amount); // burn shares first (locks; no double-draw)
    try {
      const { sig } = await payout(keeper, destination, amount);
      res.json({ ok: true, sig, lamports: amount, redeemableAfter: await redeemableFor(userId) });
    } catch (e) {
      // burned but not paid — recoverable by the operator; do not silently drop
      console.error(`[withdraw] PAYOUT FAILED after burn: ${userId} ${amount}`, e.message);
      res.status(502).json({ error: "payout failed after debit — contact support", detail: String(e.message || e) });
    }
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`pitbull-server on :${PORT} (${CLUSTER}) keeper=${keeper.publicKey.toBase58()}`);
  startWatcher({ intervalMs: 15000 });
});
