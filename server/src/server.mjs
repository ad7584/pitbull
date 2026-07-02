// PIT-BULL custodial backend — API (devnet), backed by Postgres.
// Endpoints: health, assign deposit address, read balance, read pool.
// Deposit DETECTION, the LP keeper, and owner-only WITHDRAWAL are Stage 2–4.
import "dotenv/config";
import express from "express";
import cors from "cors";
import { Connection, PublicKey } from "@solana/web3.js";
import { CLUSTER, IS_MAINNET, PORT, RPC_URL } from "./config.mjs";
import { depositKeypairFor, keeper } from "./wallets.mjs";
import {
  applyWithdrawal,
  ensureUser,
  getPool,
  getUser,
  listRecoverableWithdrawals,
  markWithdrawal,
  redeemableFor,
} from "./ledger.mjs";
import { startWatcher } from "./watcher.mjs";
import { authorizeWithdraw } from "./auth.mjs";
import { keeperStatus, lpPoolState } from "./keeper.mjs";
import { getAnsemMarket } from "./lp.mjs";
import { balanceOf, FEE, payout } from "./solana-tx.mjs";

// ---- fail-closed on mainnet misconfiguration ----
if (IS_MAINNET && !process.env.PRIVY_APP_ID) {
  throw new Error("PRIVY_APP_ID is required on mainnet (owner-only withdrawal auth).");
}
if (IS_MAINNET && process.env.ALLOW_INSECURE_WITHDRAW === "true") {
  throw new Error("ALLOW_INSECURE_WITHDRAW must never be true on mainnet.");
}
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (IS_MAINNET && CORS_ORIGINS.length === 0) {
  throw new Error("CORS_ORIGINS allowlist is required on mainnet (fail-closed).");
}

const app = express();
// dev: reflect all origins; mainnet: strict allowlist (enforced above).
app.use(cors(CORS_ORIGINS.length ? { origin: CORS_ORIGINS } : undefined));
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

// Real headline stats: TVL (pooled SOL + LP value) and the live $ANSEM price.
app.get("/stats", async (_req, res) => {
  try {
    const pool = await getPool();
    const ansem = await getAnsemMarket().catch(() => null);
    res.json({
      tvlLamports: pool.pendingLamports + pool.lpValueLamports,
      totalShares: pool.totalShares,
      lpTokens: pool.lpTokens,
      ansem, // { priceUsd, liquidityUsd, marketCap } | null
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Operator recovery: withdrawals debited but not paid (payout failed).
// Production: gate behind operator auth.
app.get("/withdrawals/recover", async (_req, res) => {
  try {
    res.json({ recoverable: await listRecoverableWithdrawals() });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Keeper / LP status (LP execution is disabled — mainnet-only, gated).
app.get("/keeper/status", async (_req, res) => {
  try {
    res.json(await keeperStatus());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Live $ANSEM PumpSwap pool state (read-only, mainnet). Proves the LP engine.
app.get("/lp/pool", async (_req, res) => {
  try {
    const s = await lpPoolState();
    res.json({
      lpMint: s.lpMint,
      ansemReserve: Number(s.baseReserve) / 1e6,
      solReserve: Number(s.quoteReserve) / 1e9,
      lpSupply: s.lpSupply.toString(),
    });
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
    try {
      new PublicKey(destination); // reject junk before moving funds
    } catch {
      return res.status(400).json({ error: "invalid destination address" });
    }

    const auth = await authorizeWithdraw(userId, authToken);
    if (!auth.ok) return res.status(401).json({ error: auth.reason });

    const redeemable = await redeemableFor(userId);
    // integer lamports only (bigint column); floor client input, cap at redeemable
    const requested = lamports == null ? redeemable : Math.floor(Number(lamports));
    if (!Number.isFinite(requested) || requested <= 0) return res.status(400).json({ error: "invalid amount" });
    const amount = Math.min(requested, redeemable);
    if (amount <= 0) return res.status(400).json({ error: "nothing to withdraw" });

    // solvency guard: the keeper must actually hold amount + fee BEFORE we burn
    // shares, so a burn can never happen without a payout that will succeed.
    const keeperBal = await balanceOf(keeper.publicKey.toBase58());
    if (keeperBal < amount + FEE) {
      return res.status(409).json({ error: "insufficient pool liquidity right now — try a smaller amount or later" });
    }

    // burn shares + record the withdrawal (pending) atomically
    const { withdrawalId } = await applyWithdrawal(userId, amount, destination);
    try {
      const { sig } = await payout(keeper, destination, amount);
      await markWithdrawal(withdrawalId, "paid", sig);
      res.json({ ok: true, sig, lamports: amount, redeemableAfter: await redeemableFor(userId) });
    } catch (e) {
      // burned but not paid — persisted as 'failed' for operator recovery
      await markWithdrawal(withdrawalId, "failed");
      console.error(`[withdraw] PAYOUT FAILED after burn: wd#${withdrawalId} ${userId} ${amount}`, e.message);
      res.status(502).json({ error: "payout failed after debit — recorded for recovery", withdrawalId, detail: String(e.message || e) });
    }
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`pitbull-server on :${PORT} (${CLUSTER}) keeper=${keeper.publicKey.toBase58()}`);
  startWatcher({ intervalMs: 15000 });
});
