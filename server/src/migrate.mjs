// Idempotent schema migration. Run: npm run migrate
import { query, pool } from "./db.mjs";

const SQL = `
create table if not exists users (
  user_id           text primary key,          -- Privy user id (identity)
  deposit_address   text not null,             -- unique per-user deposit addr
  credited_lamports bigint  not null default 0, -- SOL-equiv credited
  shares            numeric not null default 0, -- claim on the pool
  last_sig          text,
  created_at        timestamptz not null default now()
);

-- one row (id=1) holding global pool state
create table if not exists pool_state (
  id              int primary key default 1,
  pending_lamports bigint  not null default 0,
  lp_tokens        numeric not null default 0,
  total_shares     numeric not null default 0
);
insert into pool_state (id) values (1) on conflict (id) do nothing;
-- cached SOL value of the vault's LP position (refreshed by the keeper), so the
-- share math can value LP without a live RPC call inside a DB transaction (#7).
alter table pool_state add column if not exists lp_value_lamports bigint not null default 0;

-- processed deposits, for idempotent crediting (one row per on-chain sig)
create table if not exists deposits (
  sig        text primary key,
  user_id    text not null,
  lamports   bigint not null,
  created_at timestamptz not null default now()
);

-- withdrawals: recorded in the SAME tx as the share burn, so a failed payout is
-- always recoverable from the DB (never a silent burned-but-unpaid).
create table if not exists withdrawals (
  id          bigserial primary key,
  user_id     text not null,
  destination text not null,
  lamports    bigint not null,
  status      text not null default 'pending',   -- pending | paid | failed
  sig         text,
  created_at  timestamptz not null default now(),
  settled_at  timestamptz
);
`;

await query(SQL);
console.log("migrated: users, pool_state, deposits, withdrawals");
await pool.end();
