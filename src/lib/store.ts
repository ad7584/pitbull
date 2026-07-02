import { create } from "zustand";
import {
  applyBreak,
  applyCrank,
  applyExternalTrade,
  breakQuote,
  penWorth,
  sharesForDeposit,
} from "./engine";
import { buildWorld, DEMO_USER, pubkeyForHandle, SOL_USD } from "./seed";
import { toSol } from "./format";
import type {
  Activity,
  BreakQuote,
  MetaVault,
  Pen,
  Pool,
  ProtocolConfig,
  VaultKind,
} from "./types";

/** Privy-only: X login → embedded self-custodial wallet. No external wallets. */
export interface Auth {
  status: "guest" | "connected";
  handle: string;
  displayName: string;
  pubkey: string;
  /** stable backend identity = the Privy DID (token subject). Owner-only auth
   *  matches this against the verified access token. Falls back to pubkey. */
  userId: string;
}

export interface Toast {
  id: number;
  title: string;
  desc?: string;
  tone: "success" | "info" | "danger";
}

interface DepositOpts {
  /** true when filling someone else's pen (donation). */
  donation?: boolean;
  fromHandle?: string;
  /** which token funds the deposit; ANSEM is valued at pool spot. */
  token?: "SOL" | "ANSEM";
  /** raw ANSEM amount (base units) when token === "ANSEM". */
  tokenAmount?: number;
}

interface PitState {
  config: ProtocolConfig;
  vault: MetaVault;
  pool: Pool;
  pens: Pen[];
  activity: Activity[];
  priceHistory: number[];
  now: number;
  auth: Auth;
  toasts: Toast[];
  /** transient: the last completed break, drives the smash celebration. */
  lastBreak: { pen: Pen; quote: BreakQuote } | null;

  // selectors
  myPen: () => Pen | undefined;
  findPen: (ownerOrHandle: string) => Pen | undefined;
  worthOf: (pen: Pen) => number;
  quoteFor: (pen: Pen) => BreakQuote;
  ansemUsd: () => number;

  // auth (Privy: X login → embedded wallet)
  signInWithX: (handle?: string) => void;
  /** called by PrivyBridge once real auth + embedded wallet are ready. */
  setConnectedFromPrivy: (handle: string, pubkey: string, userId: string) => void;
  signOut: () => void;

  // program actions
  createPen: (kind: VaultKind, unlockParam: number, name: string, charityName?: string) => void;
  deposit: (penOwner: string, amount: number, opts?: DepositOpts) => void;
  break_: (penOwner: string) => BreakQuote | null;
  crank: () => void;
  clearLastBreak: () => void;

  // ambient
  tickMarket: () => void;
  setNow: (n: number) => void;

  // ui
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
}

const world = buildWorld();
let toastSeq = 1;
const AMBIENT_HANDLES = ["vaultrat", "moonfarmer", "greenwojak", "stacksol", "dcaqueen", "lockedin"];

export const usePit = create<PitState>((set, get) => ({
  ...world,
  now: Date.now(),
  auth: { status: "guest", handle: "", displayName: "", pubkey: "", userId: "" },
  toasts: [],
  lastBreak: null,

  myPen: () => {
    const { auth, pens } = get();
    if (auth.status !== "connected") return undefined;
    return pens.find((p) => p.owner === auth.pubkey);
  },
  findPen: (ownerOrHandle) => {
    const { pens } = get();
    return pens.find(
      (p) => p.owner === ownerOrHandle || p.handle.toLowerCase() === ownerOrHandle.toLowerCase(),
    );
  },
  worthOf: (pen) => penWorth(pen, get().vault, get().pool),
  quoteFor: (pen) => breakQuote(pen, get().vault, get().pool, get().config),
  ansemUsd: () => {
    const { pool } = get();
    return (toSol(pool.solReserve) / pool.ansemReserve) * SOL_USD;
  },

  signInWithX: (handle) => {
    const h = handle?.trim() || DEMO_USER.handle;
    set({
      auth: {
        status: "connected",
        handle: h,
        displayName: h === DEMO_USER.handle ? "you" : h,
        pubkey: h === DEMO_USER.handle ? DEMO_USER.pubkey : pubkeyForHandle(h),
        userId: h === DEMO_USER.handle ? DEMO_USER.pubkey : pubkeyForHandle(h),
      },
    });
    get().pushToast({ title: "Signed in with X", desc: "Privy embedded wallet ready — self-custodial, keys stay yours.", tone: "success" });
  },
  setConnectedFromPrivy: (handle, pubkey, userId) => {
    const cur = get().auth;
    // avoid redundant updates on Privy's re-renders
    if (cur.status === "connected" && cur.pubkey === pubkey) return;
    const h = handle.trim() || "anon";
    set({ auth: { status: "connected", handle: h, displayName: h, pubkey, userId: userId || pubkey } });
    get().pushToast({
      title: "Wallet ready",
      desc: "Privy embedded wallet connected — self-custodial, keys stay yours.",
      tone: "success",
    });
  },
  signOut: () =>
    set({ auth: { status: "guest", handle: "", displayName: "", pubkey: "", userId: "" } }),

  createPen: (kind, unlockParam, name, charityName) => {
    const { auth, pens, config } = get();
    if (auth.status !== "connected") return;
    if (config.pausedDeposits) {
      get().pushToast({ title: "Deposits paused", desc: "The circuit breaker is on. Breaks still work.", tone: "danger" });
      return;
    }
    if (pens.some((p) => p.owner === auth.pubkey)) {
      get().pushToast({ title: "You already have a live pen", desc: "One at a time — break it to start a new one.", tone: "info" });
      return;
    }
    const pen: Pen = {
      owner: auth.pubkey,
      handle: auth.handle,
      displayName: auth.displayName,
      avatarSeed: auth.pubkey,
      name: name.trim() || "my piggy bank",
      kind,
      unlockParam: kind === "Open" ? 0 : unlockParam,
      principal: 0,
      shares: 0,
      createdAt: Date.now(),
      isMine: true,
      isCharity: !!charityName,
      charityName,
    };
    const activity: Activity = {
      id: `c-mine-${Date.now()}`,
      kind: "PenCreated",
      ts: Date.now(),
      handle: pen.handle,
      displayName: pen.displayName,
      avatarSeed: pen.avatarSeed,
      vaultKind: kind,
    };
    set((s) => ({ pens: [pen, ...s.pens], activity: [activity, ...s.activity] }));
    get().pushToast({ title: "Piggy bank created 🐷", desc: "Now fill it — every deposit deepens the pool.", tone: "success" });
  },

  deposit: (penOwner, amount, opts) => {
    const { pens, vault, pool, config } = get();
    if (config.pausedDeposits) {
      get().pushToast({ title: "Deposits paused", desc: "The circuit breaker is on.", tone: "danger" });
      return;
    }
    if (amount < config.minDeposit) {
      get().pushToast({ title: "Below the minimum", desc: "That deposit is too small.", tone: "danger" });
      return;
    }
    const idx = pens.findIndex((p) => p.owner === penOwner);
    if (idx < 0) return;
    const minted = sharesForDeposit(amount, vault, pool);
    const nextVault: MetaVault = {
      ...vault,
      pendingLamports: vault.pendingLamports + amount,
      totalShares: vault.totalShares + minted,
      lifetimeDeposited: vault.lifetimeDeposited + amount,
    };
    const nextPens = pens.slice();
    const pen = { ...nextPens[idx] };
    pen.principal += amount;
    pen.shares += minted;
    nextPens[idx] = pen;

    const activity: Activity = {
      id: `d-${penOwner}-${Date.now()}`,
      kind: opts?.donation ? "Donated" : "Deposited",
      ts: Date.now(),
      handle: pen.handle,
      displayName: pen.displayName,
      avatarSeed: pen.avatarSeed,
      amount,
      token: opts?.token ?? "SOL",
      tokenAmount: opts?.tokenAmount,
      fromHandle: opts?.donation ? (opts.fromHandle ?? get().auth.handle ?? "anon") : undefined,
    };
    set((s) => ({ vault: nextVault, pens: nextPens, activity: [activity, ...s.activity] }));
  },

  break_: (penOwner) => {
    const { pens, vault, pool, config, auth } = get();
    const pen = pens.find((p) => p.owner === penOwner);
    if (!pen) return null;
    // Only the pen's owner may break it and withdraw — no one else. In the
    // real program this is enforced on-chain by requiring the owner's
    // signature against the ["pen", owner] PDA; here we enforce the same rule.
    if (auth.status !== "connected" || auth.pubkey !== pen.owner) {
      get().pushToast({
        title: "Not your bank",
        desc: "Only the owner can smash this piggy bank and withdraw.",
        tone: "danger",
      });
      return null;
    }
    const { vault: nv, pool: np, quote } = applyBreak(pen, vault, pool, config);
    const activity: Activity = {
      id: `b-${penOwner}-${Date.now()}`,
      kind: "PenBroken",
      ts: Date.now(),
      handle: pen.handle,
      displayName: pen.displayName,
      avatarSeed: pen.avatarSeed,
      amount: pen.principal,
      solPaid: quote.solToUser,
      ansemPaid: quote.ansemToUser,
      gain: quote.delta,
    };
    set((s) => ({
      vault: nv,
      pool: np,
      pens: s.pens.filter((p) => p.owner !== penOwner),
      activity: [activity, ...s.activity],
      lastBreak: { pen, quote },
    }));
    return quote;
  },

  crank: () => {
    const { vault, pool, config } = get();
    if (config.pausedCrank) return;
    if (vault.pendingLamports < config.crankThreshold) return;
    const cr = applyCrank(vault, pool);
    const activity: Activity = {
      id: `p-${Date.now()}`,
      kind: "Provisioned",
      ts: Date.now(),
      handle: "keeper",
      displayName: "keeper",
      avatarSeed: "keeper",
      amount: cr.batch,
    };
    set((s) => ({ vault: cr.vault, pool: cr.pool, activity: [activity, ...s.activity] }));
    get().pushToast({ title: "Batch provisioned ⚙️", desc: "Pending SOL deployed into the pool.", tone: "info" });
  },

  clearLastBreak: () => set({ lastBreak: null }),

  tickMarket: () => {
    set((s) => {
      // gentle random walk with slight upward drift
      const drift = (Math.random() - 0.46) * 0.006;
      const pool = applyExternalTrade(s.pool, drift);
      const price = (toSol(pool.solReserve) / pool.ansemReserve) * SOL_USD;
      const priceHistory = [...s.priceHistory.slice(-180), price];

      // occasional ambient auto-crank so pending doesn't pile up forever
      let vault = s.vault;
      let activity = s.activity;
      let pool2 = pool;
      if (vault.pendingLamports >= s.config.crankThreshold && Math.random() < 0.15 && !s.config.pausedCrank) {
        const cr = applyCrank(vault, pool);
        vault = cr.vault;
        pool2 = cr.pool;
        activity = [
          {
            id: `p-${Date.now()}`,
            kind: "Provisioned",
            ts: Date.now(),
            handle: "keeper",
            displayName: "keeper",
            avatarSeed: "keeper",
            amount: cr.batch,
          },
          ...activity,
        ];
      }
      return { pool: pool2, priceHistory, vault, activity };
    });

    // occasional ambient deposit from another CT persona to feel alive
    if (Math.random() < 0.12) {
      const s = get();
      const h = AMBIENT_HANDLES[Math.floor(Math.random() * AMBIENT_HANDLES.length)];
      const target = s.pens.find((p) => p.handle === h);
      if (target && !s.config.pausedDeposits) {
        const amt = Math.round((0.3 + Math.random() * 3) * 1e9);
        s.deposit(target.owner, amt, Math.random() < 0.3 ? { donation: true, fromHandle: "anon" } : undefined);
      }
    }
  },

  setNow: (n) => set({ now: n }),

  pushToast: (t) => {
    const id = toastSeq++;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => get().dismissToast(id), 4200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
