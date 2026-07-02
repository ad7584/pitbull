// Keeper wallet + deterministic per-user deposit addresses.
//
// Design (from research): each user gets their OWN unique deposit address, so
// inbound transfers attribute unambiguously. Those addresses are derived from a
// single master seed, then swept into ONE operational "keeper" wallet that holds
// funds and (on mainnet) provides LP — the "single wallet of us".
//
// SAFETY: the master seed can derive EVERY user's deposit key, and the keeper
// key controls all pooled funds. In production these belong in a KMS/HSM or an
// MPC/multisig — NEVER a flat file, NEVER in the frontend, NEVER in git.
import { Keypair } from "@solana/web3.js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SECRETS_DIR = path.join(__dirname, "..", ".secrets");
fs.mkdirSync(SECRETS_DIR, { recursive: true });

function loadOrCreate(file, make) {
  const p = path.join(SECRETS_DIR, file);
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  const val = make();
  fs.writeFileSync(p, JSON.stringify(val));
  return val;
}

// 32-byte master seed (hex), persisted once to .secrets/ (gitignored).
const masterSeedHex = loadOrCreate("master-seed.json", () =>
  crypto.randomBytes(32).toString("hex"),
);
const MASTER_SEED = Buffer.from(masterSeedHex, "hex");

// The single operational keeper wallet: receives swept deposits, provides LP.
const keeperSecret = loadOrCreate("keeper.json", () =>
  Array.from(Keypair.generate().secretKey),
);
export const keeper = Keypair.fromSecretKey(Uint8Array.from(keeperSecret));

/** Deterministic, re-derivable deposit keypair for a user (used to sweep). */
export function depositKeypairFor(userId) {
  const seed = crypto
    .createHash("sha256")
    .update(MASTER_SEED)
    .update(String(userId))
    .digest(); // 32 bytes
  return Keypair.fromSeed(seed);
}
