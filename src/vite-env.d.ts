/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Privy app ID — public client key (dashboard.privy.io). */
  readonly VITE_PRIVY_APP_ID: string;
  /** Solana RPC endpoint — use a domain-restricted provider key. */
  readonly VITE_SOLANA_RPC_URL: string;
  /** $ANSEM SPL mint. Optional — falls back to the pinned constant. */
  readonly VITE_ANSEM_MINT?: string;
  /** Custodial backend base URL (Railway). Falls back to localhost:8787. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
