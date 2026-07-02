/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Privy app ID — public client key (dashboard.privy.io). */
  readonly VITE_PRIVY_APP_ID: string;
  /** Solana RPC endpoint — use a domain-restricted provider key. */
  readonly VITE_SOLANA_RPC_URL: string;
  /** $ANSEM SPL mint. Optional — falls back to the pinned constant. */
  readonly VITE_ANSEM_MINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
