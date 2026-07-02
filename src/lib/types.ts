// Domain types — mirror the on-chain accounts in programs/pitbull/src/state.rs.
// Lamports are modeled as JS numbers (all realistic pen sizes sit well inside
// Number.MAX_SAFE_INTEGER); shares use the same unit as the bootstrap
// "1 lamport = 1 share" rule in deposit().

export type VaultKind = "Open" | "AmountTarget" | "Timelock";

/** One piggy bank. On-chain PDA ["pen", owner]. */
export interface Pen {
  /** base58 pubkey of the owner (the only key that can break it). */
  owner: string;
  /** X handle for display (mapped off-chain, per INTEGRATION.md §1). */
  handle: string;
  displayName: string;
  /** deterministic seed for the generated avatar gradient. */
  avatarSeed: string;
  /** optional nickname the owner gave the pen. */
  name: string;
  kind: VaultKind;
  /** Timelock → unix seconds; AmountTarget → target lamports; Open → 0. */
  unlockParam: number;
  /** total lamports ever deposited (self + donations). */
  principal: number;
  /** share claim on the MetaVault. */
  shares: number;
  /** unix ms. */
  createdAt: number;
  isCharity?: boolean;
  charityName?: string;
  /** true for the signed-in demo user's own pen. */
  isMine?: boolean;
}

/** The pooled engine. On-chain PDA ["meta_vault"]. */
export interface MetaVault {
  totalShares: number;
  pendingLamports: number;
  lpTokens: number;
  bufferLamports: number;
  treasuryLamports: number;
  lifetimeDeposited: number;
  lifetimeReturned: number;
}

/** Simulated PumpSwap constant-product pool ($ANSEM / SOL). */
export interface Pool {
  /** quote side, WSOL, in lamports. */
  solReserve: number;
  /** base side, $ANSEM, in base units. */
  ansemReserve: number;
  lpSupply: number;
}

/** Global protocol config. On-chain PDA ["config"]. */
export interface ProtocolConfig {
  minDeposit: number;
  crankThreshold: number;
  ilReimburseBps: number;
  ilReimburseCap: number;
  pausedDeposits: boolean;
  pausedCrank: boolean;
}

/** Survives pen closure. On-chain PDA ["owner", owner]. */
export interface OwnerStats {
  owner: string;
  pensCreated: number;
  pensBroken: number;
  lifetimeDeposited: number;
  lifetimeReturned: number;
}

export type ActivityKind =
  | "PenCreated"
  | "Deposited"
  | "Donated"
  | "PenBroken"
  | "Provisioned";

export interface Activity {
  id: string;
  kind: ActivityKind;
  ts: number;
  handle: string;
  displayName: string;
  avatarSeed: string;
  /** lamports (SOL-equivalent), meaning depends on kind. */
  amount?: number;
  /** which token was deposited (deposits/donations only). */
  token?: "SOL" | "ANSEM";
  /** raw token amount when token === "ANSEM" (base units). */
  tokenAmount?: number;
  /** for donations: who filled it. */
  fromHandle?: string;
  /** for breaks: dual-asset outputs + gain flag. */
  solPaid?: number;
  ansemPaid?: number;
  gain?: number;
  vaultKind?: VaultKind;
}

/** The break_pen() settlement preview shown before signing. */
export interface BreakQuote {
  pendingOut: number;
  solLeg: number;
  ansemLeg: number;
  ansemLegValue: number;
  redeemedValue: number;
  principal: number;
  /** signed: redeemedValue - principal. */
  delta: number;
  isGain: boolean;
  /** positive-gain split (owner / buffer / treasury), all lamports. */
  gainToOwner: number;
  gainToBuffer: number;
  gainToTreasury: number;
  /** IL path: partial capped buffer reimbursement. */
  ilAmount: number;
  ilReimbursed: number;
  /** final payouts. */
  solToUser: number;
  ansemToUser: number;
}
