import { useEffect, useState } from "react";
import { api, type Stats } from "./api";

/** Live headline stats from the backend (real TVL + real $ANSEM price). */
export function useStats(pollMs = 30_000): Stats | null {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => api.stats().then((s) => alive && setStats(s)).catch(() => {});
    load();
    const id = window.setInterval(load, pollMs);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [pollMs]);
  return stats;
}
