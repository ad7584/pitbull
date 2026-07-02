import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { env, isConfigured } from "@/lib/env";
import { PrivyBridge } from "./PrivyBridge";

/**
 * Wraps the app in Privy — but ONLY when configured (env present). Without
 * env, we render children bare and the app runs in its original mock mode, so
 * a missing App ID never hard-breaks the site. See src/lib/env.ts.
 *
 * Privy is set to X-login only, with a self-custodial embedded Solana wallet
 * created for every user on login. External wallets are intentionally off.
 */
export function Providers({ children }: { children: ReactNode }) {
  if (!isConfigured) return <>{children}</>;

  return (
    <PrivyProvider
      appId={env.privyAppId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#FF4D8D",
          landingHeader: "Log in or sign up",
          loginMessage: "One tap with X — a self-custodial wallet spins up underneath.",
          walletChainType: "solana-only",
          showWalletLoginFirst: false,
        },
        loginMethods: ["twitter"],
        embeddedWallets: {
          solana: { createOnLogin: "all-users" },
          showWalletUIs: true,
        },
      }}
    >
      <PrivyBridge />
      {children}
    </PrivyProvider>
  );
}
