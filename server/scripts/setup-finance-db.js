require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupFinanceDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS finance_transactions (
        id SERIAL PRIMARY KEY,
        kind VARCHAR(20) NOT NULL CHECK (kind IN ('SPONSOR', 'REGISTRATION', 'EXPENSE')),
        amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
        currency CHAR(3) NOT NULL DEFAULT 'EUR',
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        source_name TEXT,
        holder_name TEXT,
        spent_by TEXT,
        description TEXT,
        created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS finance_transactions_occurred_at_idx ON finance_transactions(occurred_at DESC);');
    await pool.query('CREATE INDEX IF NOT EXISTS finance_transactions_kind_idx ON finance_transactions(kind);');
    await pool.query('CREATE INDEX IF NOT EXISTS finance_transactions_holder_idx ON finance_transactions(holder_name);');

    process.stdout.write('finance_transactions: OK\n');
  } catch (err) {
    process.stderr.write(`finance_transactions: ERROR\n${err.message}\n`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setupFinanceDb();
