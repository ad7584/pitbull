// Postgres (Supabase) connection pool — the shared source of truth.
// SSL is required by Supabase; rejectUnauthorized:false is fine for the
// prototype (the pooler cert isn't in Node's default CA bundle).
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not set — copy server/.env.example to .env");
}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

export const query = (text, params) => pool.query(text, params);
