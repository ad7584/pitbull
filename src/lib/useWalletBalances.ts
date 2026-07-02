import { useEffect, useState } from "react";
import type { WalletBalances } from "./solana";
import { isConfigured } from "./env";

interface BalancesState {
  balances: WalletBalances | null;
  loading: boolean;
  error: boolean;
}

/**
 * Live SOL + $ANSEM balances for the connected address. No-ops (returns null)
 * in mock mode or when there's no address, so it's always safe to call.
 * Refetches when `address` changes; poll interval keeps it fresh.
 *
 * `@solana/web3.js` is a heavy dependency, so it's dynamically imported inside
 * the effect — guests and the landing page never pay for it; it loads only
 * when a connected wallet first needs a balance.
 */
export function useWalletBalances(address: string | undefined, pollMs = 30_000): BalancesState {
  const [state, setState] = useState<BalancesState>({ balances: null, loading: false, error: false });

  useEffect(() => {
    if (!address || !isConfigured) {
      setState({ balances: null, loading: false, error: false });
      return;
    }
    let alive = true;
    const load = async () => {
      setState((s) => ({ ...s, loading: true }));
      try {
        const { fetchBalances } = await import("./solana");
        const b = await fetchBalances(address);
        if (alive) setState({ balances: b, loading: false, error: false });
      } catch {
        if (alive) setState((s) => ({ balances: s.balances, loading: false, error: true }));
      }
    };
    load();
    const id = window.setInterval(load, pollMs);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [address, pollMs]);

  return state;
}
