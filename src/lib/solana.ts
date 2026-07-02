// Real Solana reads via @solana/web3.js against the configured RPC (Helius).
// This is the ONLY place that touches the chain. Pen/pool logic stays in the
// mock engine — there is no deployed program yet — but wallet balances here
// are genuinely live.
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { env } from "./env";

let connection: Connection | null = null;

/** Lazy singleton — one Connection for the whole app. */
export function getConnection(): Connection {
  if (!connection) connection = new Connection(env.solanaRpcUrl, "confirmed");
  return connection;
}

export interface WalletBalances {
  /** SOL, in whole units. */
  sol: number;
  /** $ANSEM, in whole (UI) units. */
  ansem: number;
}

/**
 * Live SOL + $ANSEM balances for an address. Sums all $ANSEM token accounts
 * the owner holds (usually one ATA). Throws on an invalid address or RPC error
 * — callers should handle failure and fall back gracefully.
 */
export async function fetchBalances(address: string): Promise<WalletBalances> {
  const conn = getConnection();
  const owner = new PublicKey(address);
  const mint = new PublicKey(env.ansemMint);

  const [lamports, tokenAccounts] = await Promise.all([
    conn.getBalance(owner),
    conn.getParsedTokenAccountsByOwner(owner, { mint }),
  ]);

  const ansem = tokenAccounts.value.reduce((sum, { account }) => {
    const info = (account.data as { parsed?: { info?: { tokenAmount?: { uiAmount?: number } } } })
      .parsed?.info?.tokenAmount?.uiAmount;
    return sum + (info ?? 0);
  }, 0);

  return { sol: lamports / LAMPORTS_PER_SOL, ansem };
}
