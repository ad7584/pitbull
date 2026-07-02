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

// Secrets resolve from ENV first (production/Railway — stable across restarts),
// else a local .secrets/ file (dev). On ephemeral hosts, regenerating these
// would orphan every deposit address, so the env path is mandatory in prod.
const masterSeedHex =
  process.env.MASTER_SEED_HEX ||
  loadOrCreate("master-seed.json", () => crypto.randomBytes(32).toString("hex"));
const MASTER_SEED = Buffer.from(masterSeedHex, "hex");

// The single operational keeper wallet: receives swept deposits, provides LP.
// KEEPER_SECRET_KEY = JSON array of the 64-byte secret key.
const keeperSecret = process.env.KEEPER_SECRET_KEY
  ? JSON.parse(process.env.KEEPER_SECRET_KEY)
  : loadOrCreate("keeper.json", () => Array.from(Keypair.generate().secretKey));
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
