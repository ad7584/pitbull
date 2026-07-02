// PIT-BULL custodial backend — Stage 1 API (devnet).
// Endpoints: health, assign deposit address, read balance, read pool.
// Deposit DETECTION, the LP keeper, and owner-only WITHDRAWAL are Stage 2–4.
import express from "express";
import { Connection } from "@solana/web3.js";
import { CLUSTER, PORT, RPC_URL } from "./config.mjs";
import { depositKeypairFor, keeper } from "./wallets.mjs";
import { ensureUser, getUser, snapshot } from "./ledger.mjs";

const app = express();
app.use(express.json());
export const connection = new Connection(RPC_URL, "confirmed");

app.get("/health", (_req, res) =>
  res.json({ ok: true, cluster: CLUSTER, keeper: keeper.publicKey.toBase58() }),
);

// Assign (or return) a user's unique deposit address. userId = the Privy user
// id (identity only — NOT their funds wallet).
app.post("/deposit-address", (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId required" });
  const depositAddress = depositKeypairFor(userId).publicKey.toBase58();
  ensureUser(userId, depositAddress);
  res.json({ userId, depositAddress, cluster: CLUSTER });
});

// A user's credited balance + share. (Stage 4 adds auth so ONLY the owner reads
// and, critically, only the owner can trigger a withdrawal.)
app.get("/balance/:userId", (req, res) => {
  const u = getUser(req.params.userId);
  if (!u) return res.status(404).json({ error: "unknown user" });
  res.json(u);
});

// The shared, real pool numbers.
app.get("/pool", (_req, res) => res.json(snapshot().pool));

app.listen(PORT, () =>
  console.log(`pitbull-server on :${PORT} (${CLUSTER}) keeper=${keeper.publicKey.toBase58()}`),
);
