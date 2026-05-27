CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user'
);

CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE team_players (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  is_goalkeeper BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE matchdays (
  id SERIAL PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE player_bonuses (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  matchday_id INTEGER REFERENCES matchdays(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  UNIQUE(player_id, matchday_id)
);

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

CREATE INDEX IF NOT EXISTS finance_transactions_occurred_at_idx ON finance_transactions(occurred_at DESC);
CREATE INDEX IF NOT EXISTS finance_transactions_kind_idx ON finance_transactions(kind);
CREATE INDEX IF NOT EXISTS finance_transactions_holder_idx ON finance_transactions(holder_name);
