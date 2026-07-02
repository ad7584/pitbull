/**
 * Typed, validated environment config.
 *
 * Vite exposes only VITE_-prefixed vars to the client via import.meta.env.
 * Values live in `.env` locally (gitignored) and in Vercel project env vars
 * in production/preview. See `.env.example` for the template.
 *
 * Access config through this module, never `import.meta.env` directly — it
 * gives one place for validation, fallbacks, and the `isConfigured` gate that
 * the UI uses to decide between real and mock behavior.
 */
import { ANSEM_MINT as PINNED_ANSEM_MINT } from "./protocol";

function read(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export const env = {
  /** Privy app ID (public client key). Empty until configured. */
  privyAppId: read("VITE_PRIVY_APP_ID"),
  /** Solana JSON-RPC endpoint. Empty until configured. */
  solanaRpcUrl: read("VITE_SOLANA_RPC_URL"),
  /** $ANSEM mint — env override, else the pinned protocol constant. */
  ansemMint: read("VITE_ANSEM_MINT") || PINNED_ANSEM_MINT,
} as const;

/** True once the real integration is wired — Privy + RPC both present. */
export const isConfigured: boolean = Boolean(env.privyAppId && env.solanaRpcUrl);

if (import.meta.env.DEV && !isConfigured) {
  // dev-only nudge; the app still runs in mock mode without these
  const missing = [
    !env.privyAppId && "VITE_PRIVY_APP_ID",
    !env.solanaRpcUrl && "VITE_SOLANA_RPC_URL",
  ].filter(Boolean);
  if (missing.length) console.info(`[env] running in mock mode — missing: ${missing.join(", ")}`);
}
