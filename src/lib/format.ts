import { LAMPORTS_PER_SOL } from "./protocol";

/** Lamports → SOL number. */
export function toSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/** Format lamports as a SOL string, trimming trailing zeros sensibly. */
export function fmtSol(
  lamports: number,
  opts: { maxFrac?: number; sign?: boolean } = {},
): string {
  const { maxFrac = 3, sign = false } = opts;
  const sol = toSol(lamports);
  const abs = Math.abs(sol);
  let frac = maxFrac;
  if (abs >= 1000) frac = Math.min(maxFrac, 1);
  else if (abs >= 100) frac = Math.min(maxFrac, 2);
  const s = abs.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: frac,
  });
  const signStr = sign && sol > 0 ? "+" : sol < 0 ? "-" : "";
  return `${signStr}${s}`;
}

/** Compact currency-ish formatting for big token/USD counts (1.2M, 340K). */
export function fmtCompact(n: number, digits = 1): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(digits).replace(/\.0$/, "") + "B";
  if (abs >= 1e6) return (n / 1e6).toFixed(digits).replace(/\.0$/, "") + "M";
  if (abs >= 1e3) return (n / 1e3).toFixed(digits).replace(/\.0$/, "") + "K";
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

/** Compact SOL, e.g. 12.4K SOL worth of pending liquidity. */
export function fmtSolCompact(lamports: number, digits = 1): string {
  return fmtCompact(toSol(lamports), digits);
}

export function fmtUsd(n: number): string {
  return "$" + fmtCompact(n, 2);
}

export function fmtPct(x: number, digits = 1): string {
  const s = (x * 100).toFixed(digits);
  return (x > 0 ? "+" : "") + s + "%";
}

/** Shorten a base58 pubkey: AbcD…wXyz */
export function shortKey(key: string, edge = 4): string {
  if (key.length <= edge * 2 + 1) return key;
  return `${key.slice(0, edge)}…${key.slice(-edge)}`;
}

const UNITS: [number, string][] = [
  [31_536_000, "y"],
  [2_592_000, "mo"],
  [86_400, "d"],
  [3_600, "h"],
  [60, "m"],
  [1, "s"],
];

/** "3d 4h" style countdown from seconds remaining. */
export function fmtCountdown(secondsLeft: number): string {
  if (secondsLeft <= 0) return "ready";
  let rem = Math.floor(secondsLeft);
  const parts: string[] = [];
  for (const [size, label] of UNITS) {
    if (rem >= size) {
      const v = Math.floor(rem / size);
      parts.push(`${v}${label}`);
      rem -= v * size;
    }
    if (parts.length === 2) break;
  }
  return parts.join(" ");
}

/** Relative "time ago" from a unix-ms timestamp. */
export function timeAgo(tsMs: number, now = Date.now()): string {
  const s = Math.max(1, Math.floor((now - tsMs) / 1000));
  for (const [size, label] of UNITS) {
    if (s >= size) return `${Math.floor(s / size)}${label} ago`;
  }
  return "now";
}

export function fmtDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Deterministic small hash from a string → [0,1). */
export function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}
