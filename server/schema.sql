CREATE TABLE IF NOT EXISTS players (
  telegram_id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT NOT NULL DEFAULT '',
  balance BIGINT NOT NULL DEFAULT 1000000 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS game_transactions (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL REFERENCES players(telegram_id) ON DELETE CASCADE,
  game TEXT NOT NULL CHECK (game IN ('slots','roulette','blackjack','dice')),
  bet BIGINT NOT NULL CHECK (bet > 0),
  payout BIGINT NOT NULL CHECK (payout >= 0),
  balance_after BIGINT NOT NULL CHECK (balance_after >= 0),
  outcome JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS game_transactions_player_created_idx
  ON game_transactions (telegram_id, created_at DESC);
