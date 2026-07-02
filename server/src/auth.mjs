// Withdrawal authorization — this is what enforces "only the owner can
// withdraw". A caller must present a valid Privy access token whose subject
// matches the userId being withdrawn from.
//
// DEVNET FALLBACK: when ALLOW_INSECURE_WITHDRAW=true AND cluster != mainnet,
// requests are allowed WITHOUT a token so the flow can be tested end-to-end
// without completing OAuth. This is INSECURE and must be OFF for anything real.
import { createRemoteJWKSet, jwtVerify } from "jose";
import { IS_MAINNET } from "./config.mjs";

const APP_ID = process.env.PRIVY_APP_ID || "";
const JWKS = APP_ID
  ? createRemoteJWKSet(new URL(`https://auth.privy.io/api/v1/apps/${APP_ID}/jwks.json`))
  : null;

/**
 * @returns {Promise<{ok: true} | {ok: false, reason: string}>}
 */
export async function authorizeWithdraw(userId, authToken) {
  if (authToken && JWKS) {
    try {
      const { payload } = await jwtVerify(authToken, JWKS, {
        issuer: "privy.io",
        audience: APP_ID,
      });
      // Privy token subject is the user's DID; userId must equal it.
      if (payload.sub && payload.sub === userId) return { ok: true };
      return { ok: false, reason: "token does not match this account" };
    } catch {
      return { ok: false, reason: "invalid or expired token" };
    }
  }

  // Insecure fallback is gated on the ACTUAL chain (RPC target), so it can never
  // fire against mainnet even if PITBULL_CLUSTER is mislabeled.
  if (!IS_MAINNET && process.env.ALLOW_INSECURE_WITHDRAW === "true") {
    console.warn(`[auth] ⚠️ INSECURE devnet withdraw (no token) for ${userId}`);
    return { ok: true };
  }

  return { ok: false, reason: "authentication required" };
}
