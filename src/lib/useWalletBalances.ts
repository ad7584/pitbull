import { useEffect, useState } from "react";
import { fetchBalances, type WalletBalances } from "./solana";
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
 */
export function useWalletBalances(address: string | undefined, pollMs = 30_000): BalancesState {
  const [state, setState] = useState<BalancesState>({ balances: null, loading: false, error: false });

  useEffect(() => {
    if (!address || !isConfigured) {
      setState({ balances: null, loading: false, error: false });
      return;
    }
    let alive = true;
    const load = () => {
      setState((s) => ({ ...s, loading: true }));
      fetchBalances(address)
        .then((b) => alive && setState({ balances: b, loading: false, error: false }))
        .catch(() => alive && setState((s) => ({ balances: s.balances, loading: false, error: true })));
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
