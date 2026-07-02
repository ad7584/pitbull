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

-- processed deposits, for idempotent crediting (one row per on-chain sig)
create table if not exists deposits (
  sig        text primary key,
  user_id    text not null,
  lamports   bigint not null,
  created_at timestamptz not null default now()
);
`;

await query(SQL);
console.log("migrated: users, pool_state, deposits");
await pool.end();
