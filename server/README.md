# PIT-BULL server (custodial prototype — DEVNET)

The off-chain source of truth: assigns each user a unique **deposit address**,
tracks balances + shares in a **shared ledger**, and (later stages) sweeps to a
single **keeper wallet** that provides $ANSEM LP.

> ⚠️ **Custodial + devnet-only.** This holds/derives keys that control funds.
> It runs on **devnet** (no real money). Going to mainnet is a separate, gated
> decision requiring a security audit, legal review, and real key custody
> (KMS/HSM/multisig) — not a config flip. A single flat-file key = catastrophic
> if leaked; that's fine for a devnet prototype, unacceptable for real funds.

## Run
```bash
cd server
npm install
npm start          # http://localhost:8787
```
First run generates a master seed + keeper wallet into `.secrets/` (gitignored).

## Endpoints (Stage 1)
- `GET  /health` → cluster + keeper pubkey
- `POST /deposit-address` `{ userId }` → the user's unique deposit address
- `GET  /balance/:userId` → credited balance + share
- `GET  /pool` → shared pool numbers

## Roadmap
- **S1 (done):** deposit-address-per-user, shared ledger, API.
- **S2:** deposit detection (Helius) → credit ledger; frontend shows the address + real balance.
- **S3:** keeper — when pending > 10 SOL, provide $ANSEM LP (⚠️ mainnet-only step).
- **S4:** owner-only withdrawal (authenticated via Privy identity).
- **S5 (gated):** mainnet — only after audit + legal + KMS custody.
- **Storage:** JSON file now → Postgres (Supabase) for production.
