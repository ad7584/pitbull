// On-chain SOL movement: sweep per-user deposit addresses into the single
// keeper wallet, and pay out withdrawals from the keeper. Devnet.
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { RPC_URL } from "./config.mjs";

export const connection = new Connection(RPC_URL, "confirmed");

// A bare SOL account must retain the rent-exempt minimum or it's reaped, so a
// deposit address can never be swept fully to zero.
const RENT_EXEMPT_MIN = 890_880;
const FEE = 5_000;

/** Sweep a deposit address into the keeper (leaves rent + fee). */
export async function sweepToKeeper(depositKeypair, keeperPubkey) {
  const bal = await connection.getBalance(depositKeypair.publicKey);
  const amount = bal - RENT_EXEMPT_MIN - FEE;
  if (amount <= 0) return { swept: 0 };
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: depositKeypair.publicKey,
      toPubkey: keeperPubkey,
      lamports: amount,
    }),
  );
  const sig = await sendAndConfirmTransaction(connection, tx, [depositKeypair]);
  return { swept: amount, sig };
}

/** Pay `lamports` from the keeper to a destination (a withdrawal). */
export async function payout(keeper, destination, lamports) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keeper.publicKey,
      toPubkey: new PublicKey(destination),
      lamports,
    }),
  );
  const sig = await sendAndConfirmTransaction(connection, tx, [keeper]);
  return { sig };
}

export async function balanceOf(pubkey) {
  return connection.getBalance(new PublicKey(pubkey));
}

export { LAMPORTS_PER_SOL };
