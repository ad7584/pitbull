// Demo world. We don't hand-wave the numbers: we run real deposits + cranks
// through the engine so the vault, pool, shares, and every pen's "worth now"
// are internally consistent — exactly what the indexer would report.

import { applyCrank, sharesForDeposit, applyExternalTrade } from "./engine";
import {
  DEFAULT_CRANK_THRESHOLD,
  DEFAULT_MIN_DEPOSIT,
  IL_REIMBURSE_BPS,
  IL_REIMBURSE_CAP,
  LAMPORTS_PER_SOL,
} from "./protocol";
import type {
  Activity,
  MetaVault,
  Pen,
  Pool,
  ProtocolConfig,
  VaultKind,
} from "./types";

export const SOL_USD = 236; // display-only estimate

// deterministic RNG so the demo world is stable across reloads
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(0xb1a5eba11);

// pseudo base58 key from a seed (looks like a real pubkey, stable per handle)
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function fakeKey(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  const r = mulberry32(h);
  let s = "";
  for (let i = 0; i < 44; i++) s += B58[Math.floor(r() * B58.length)];
  return s;
}

interface SeedPen {
  handle: string;
  displayName: string;
  kind: VaultKind;
  /** SOL for AmountTarget / days-from-now for Timelock / ignored for Open */
  param?: number;
  name: string;
  deposits: number[]; // SOL amounts, in order
  ageDays: number;
  charity?: string;
}

const NOW = Date.now();
const DAY = 86_400_000;

const SEED_PENS: SeedPen[] = [
  { handle: "gigabull", displayName: "gigabull", kind: "Timelock", param: 92, name: "Diamond Kennel", deposits: [12, 6, 8, 4, 5, 3], ageDays: 34 },
  { handle: "dcaqueen", displayName: "DCA Queen", kind: "AmountTarget", param: 25, name: "25 or bust", deposits: [3, 2, 2, 4, 3, 1, 2], ageDays: 21 },
  { handle: "hodlhound", displayName: "hodl hound", kind: "Timelock", param: 210, name: "Til next cycle", deposits: [20, 10, 9], ageDays: 51 },
  { handle: "vaultrat", displayName: "vault rat", kind: "Open", name: "just vibing", deposits: [1.5, 0.5, 2, 1], ageDays: 8 },
  { handle: "lockedin", displayName: "locked.in", kind: "Timelock", param: 45, name: "45 day fast", deposits: [5, 5, 5, 2, 3], ageDays: 12 },
  { handle: "moonfarmer", displayName: "moon farmer 🌙", kind: "AmountTarget", param: 15, name: "moon fund", deposits: [2, 3, 1, 4, 2], ageDays: 17 },
  { handle: "satoshihound", displayName: "satoshi hound", kind: "Timelock", param: 365, name: "one year no peeking", deposits: [8, 4, 6, 5, 4, 3, 2], ageDays: 63 },
  { handle: "piggybanker", displayName: "piggy banker", kind: "Open", name: "test the waters", deposits: [0.5, 0.5, 1], ageDays: 4 },
  { handle: "liquidityleo", displayName: "Liquidity Leo", kind: "AmountTarget", param: 50, name: "deep pool club", deposits: [10, 8, 6, 9, 5], ageDays: 29 },
  { handle: "cleanwater", displayName: "Clean Water DAO", kind: "Timelock", param: 120, name: "Wells for Mali", deposits: [4, 3, 6, 2, 5, 3, 4, 2], ageDays: 40, charity: "Clean Water DAO" },
  { handle: "greenwojak", displayName: "green wojak", kind: "Open", name: "green candles only", deposits: [2, 1, 1.5], ageDays: 6 },
  { handle: "stacksol", displayName: "stack.sol", kind: "AmountTarget", param: 10, name: "first 10", deposits: [1, 2, 1, 1, 2], ageDays: 14 },
];

const ACT_KINDS_FILL: string[] = [];

export interface World {
  config: ProtocolConfig;
  vault: MetaVault;
  pool: Pool;
  pens: Pen[];
  activity: Activity[];
  priceHistory: number[]; // ANSEM price in USD, oldest→newest
}

export function buildWorld(): World {
  const config: ProtocolConfig = {
    minDeposit: DEFAULT_MIN_DEPOSIT,
    crankThreshold: DEFAULT_CRANK_THRESHOLD,
    ilReimburseBps: IL_REIMBURSE_BPS,
    ilReimburseCap: IL_REIMBURSE_CAP,
    pausedDeposits: false,
    pausedCrank: false,
  };

  // the canonical $ANSEM PumpSwap pool already exists and is deep.
  let pool: Pool = {
    solReserve: 6_000 * LAMPORTS_PER_SOL,
    ansemReserve: 820_000_000, // ~820M ANSEM
    lpSupply: 2_200_000 * LAMPORTS_PER_SOL,
  };

  let vault: MetaVault = {
    totalShares: 0,
    pendingLamports: 0,
    lpTokens: 0,
    bufferLamports: 0,
    treasuryLamports: 0,
    lifetimeDeposited: 0,
    lifetimeReturned: 0,
  };

  const pens: Pen[] = [];
  const activity: Activity[] = [];
  const priceHistory: number[] = [];

  // seed the vault buffer/treasury as if past breaks accrued into it
  vault.bufferLamports = 6.2 * LAMPORTS_PER_SOL;
  vault.treasuryLamports = 2.1 * LAMPORTS_PER_SOL;

  // replay each pen's deposits + interleave cranks + market drift
  for (const sp of SEED_PENS) {
    const owner = fakeKey(sp.handle);
    const createdAt = NOW - sp.ageDays * DAY;
    let unlockParam = 0;
    if (sp.kind === "Timelock") unlockParam = Math.floor((NOW + (sp.param ?? 30) * DAY) / 1000);
    if (sp.kind === "AmountTarget") unlockParam = (sp.param ?? 10) * LAMPORTS_PER_SOL;

    const pen: Pen = {
      owner,
      handle: sp.handle,
      displayName: sp.displayName,
      avatarSeed: sp.handle,
      name: sp.name,
      kind: sp.kind,
      unlockParam,
      principal: 0,
      shares: 0,
      createdAt,
      isCharity: !!sp.charity,
      charityName: sp.charity,
    };

    activity.push({
      id: `c-${sp.handle}`,
      kind: "PenCreated",
      ts: createdAt,
      handle: sp.handle,
      displayName: sp.displayName,
      avatarSeed: sp.handle,
      vaultKind: sp.kind,
    });

    sp.deposits.forEach((solAmt, i) => {
      const amount = Math.round(solAmt * LAMPORTS_PER_SOL);
      const minted = sharesForDeposit(amount, vault, pool);
      const isDonation = rng() < 0.28;
      vault = {
        ...vault,
        pendingLamports: vault.pendingLamports + amount,
        totalShares: vault.totalShares + minted,
        lifetimeDeposited: vault.lifetimeDeposited + amount,
      };
      pen.principal += amount;
      pen.shares += minted;

      activity.push({
        id: `d-${sp.handle}-${i}`,
        kind: isDonation ? "Donated" : "Deposited",
        ts: createdAt + (i + 1) * (sp.ageDays / (sp.deposits.length + 1)) * DAY,
        handle: sp.handle,
        displayName: sp.displayName,
        avatarSeed: sp.handle,
        amount,
        fromHandle: isDonation ? pickDonor(sp.handle) : undefined,
      });

      // crank when threshold crossed, then drift the market a touch
      if (vault.pendingLamports >= config.crankThreshold && rng() < 0.7) {
        const cr = applyCrank(vault, pool);
        vault = cr.vault;
        pool = cr.pool;
        activity.push({
          id: `p-${sp.handle}-${i}`,
          kind: "Provisioned",
          ts: activity[activity.length - 1].ts + 600_000,
          handle: "keeper",
          displayName: "keeper",
          avatarSeed: "keeper",
          amount: cr.batch,
        });
      }
      pool = applyExternalTrade(pool, (rng() - 0.42) * 0.012);
      priceHistory.push(ansemUsd(pool));
    });

    pens.push(pen);
  }

  // final crank of leftover pending + a gentle upward drift so most pens show
  // a small gain (with a couple underwater for honesty).
  if (vault.pendingLamports >= config.crankThreshold * 0.4) {
    const cr = applyCrank(vault, pool);
    vault = cr.vault;
    pool = cr.pool;
  }
  for (let i = 0; i < 40; i++) {
    pool = applyExternalTrade(pool, (rng() - 0.36) * 0.01);
    priceHistory.push(ansemUsd(pool));
  }

  activity.sort((a, b) => b.ts - a.ts);
  void ACT_KINDS_FILL;
  return { config, vault, pool, pens, activity: activity.slice(0, 60), priceHistory };
}

function ansemUsd(pool: Pool): number {
  return (pool.solReserve / LAMPORTS_PER_SOL / pool.ansemReserve) * SOL_USD;
}

const DONORS = ["anon", "whale_watcher", "ct_degen", "based_dev", "frencircle", "gm_ser", "tip_bot", "solmaxi"];
function pickDonor(exclude: string): string {
  const pick = DONORS[Math.floor(rng() * DONORS.length)];
  return pick === exclude ? DONORS[0] : pick;
}

// The signed-in demo identity (X login → embedded wallet, INTEGRATION §1).
export const DEMO_USER = {
  handle: "you",
  displayName: "you",
  avatarSeed: "your-pen",
  pubkey: fakeKey("demo-user-wallet"),
};

export function pubkeyForHandle(handle: string): string {
  return fakeKey(handle);
}

/**
 * The pen's on-chain address — PDA ["pen", owner]. Deterministic from the
 * owner key (mocked here), printed on share cards so anyone can donate.
 */
export function penAddress(owner: string): string {
  return fakeKey(`pda:pen:${owner}`);
}
