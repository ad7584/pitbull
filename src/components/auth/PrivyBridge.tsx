import { useEffect } from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import type { LinkedAccountWithMetadata, WalletWithMetadata } from "@privy-io/react-auth";
import { authBridge } from "@/lib/authBridge";
import { usePit } from "@/lib/store";

/** The embedded Solana wallet address off the user's linked accounts. */
function solanaAddress(accounts: LinkedAccountWithMetadata[] | undefined): string | undefined {
  const wallet = accounts?.find(
    (a): a is WalletWithMetadata =>
      a.type === "wallet" && (a as WalletWithMetadata).chainType === "solana",
  );
  return wallet?.address;
}

/**
 * Bridges Privy's auth state into the Zustand store, and registers the real
 * login/logout actions on `authBridge` so the Nav can trigger them without
 * calling Privy hooks. Rendered ONLY inside <PrivyProvider> (i.e. when
 * configured), so these hooks are always valid here. Renders nothing.
 *
 * We read the wallet address from `user.linkedAccounts` rather than the
 * `@privy-io/react-auth/solana` hooks on purpose — the latter bundles Privy's
 * full transaction-signing stack (@solana/kit, @solana-program/*), which we
 * don't need just to read an address.
 */
export function PrivyBridge() {
  const { ready, authenticated, user, logout, getAccessToken } = usePrivy();
  const { login } = useLogin();
  const setConnected = usePit((s) => s.setConnectedFromPrivy);
  const signOut = usePit((s) => s.signOut);

  // expose real actions to the rest of the app
  useEffect(() => {
    authBridge.login = () => login();
    authBridge.logout = () => {
      void logout();
    };
    authBridge.getAccessToken = getAccessToken;
  }, [login, logout, getAccessToken]);

  // mirror Privy → store
  useEffect(() => {
    if (!ready) return;
    const address = solanaAddress(user?.linkedAccounts);
    if (authenticated && address && user) {
      const handle = user.twitter?.username || user.twitter?.name || "anon";
      // user.id is the Privy DID = the access-token subject (owner-only key)
      setConnected(handle, address, user.id);
    } else if (!authenticated) {
      signOut();
    }
  }, [ready, authenticated, user, setConnected, signOut]);

  return null;
}
