// Client for the custodial backend (Railway). The backend is the shared source
// of truth for deposit addresses, balances, and pool state — real, not mock.
import { env } from "./env";

const BASE = env.apiUrl.replace(/\/$/, "");

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export interface Health {
  ok: boolean;
  cluster: string;
  keeper: string;
}
export interface Balance {
  userId: string;
  depositAddress: string;
  creditedLamports: number;
  shares: number;
  lastSig: string | null;
}
export interface DepositAddress {
  userId: string;
  depositAddress: string;
  cluster: string;
}
export interface PoolState {
  pendingLamports: number;
  lpTokens: number;
  totalShares: number;
}

export const api = {
  health: () => req<Health>("/health"),
  /** Assign (or fetch) a user's unique deposit address. */
  depositAddress: (userId: string) =>
    req<DepositAddress>("/deposit-address", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
  balance: (userId: string) => req<Balance>(`/balance/${encodeURIComponent(userId)}`),
  pool: () => req<PoolState>("/pool"),
};
