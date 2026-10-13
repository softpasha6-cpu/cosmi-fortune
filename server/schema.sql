CREATE TABLE IF NOT EXISTS players (
  telegram_id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT NOT NULL DEFAULT '',
  balance BIGINT NOT NULL DEFAULT 10000 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS game_transactions (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL REFERENCES players(telegram_id) ON DELETE CASCADE,
  game TEXT NOT NULL CHECK (game IN ('slots','roulette','blackjack','dice','bonus_wheel')),
  bet BIGINT NOT NULL CHECK (bet >= 0),
  payout BIGINT NOT NULL CHECK (payout >= 0),
  balance_after BIGINT NOT NULL CHECK (balance_after >= 0),
  outcome JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS game_transactions_player_created_idx
  ON game_transactions (telegram_id, created_at DESC);


-- Safe upgrade for existing installations: new accounts start with 10,000 virtual credits.
ALTER TABLE players ALTER COLUMN balance SET DEFAULT 10000;

-- Request idempotency prevents the same round from being credited twice on retries.
ALTER TABLE game_transactions ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS game_transactions_idempotency_idx
  ON game_transactions (telegram_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Upgrade existing databases to support the free bonus wheel.
ALTER TABLE game_transactions DROP CONSTRAINT IF EXISTS game_transactions_game_check;
ALTER TABLE game_transactions ADD CONSTRAINT game_transactions_game_check CHECK (game IN ('slots','roulette','blackjack','dice','bonus_wheel'));

CREATE TABLE IF NOT EXISTS bonus_wheel_cooldowns (
  telegram_id BIGINT PRIMARY KEY REFERENCES players(telegram_id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reward BIGINT NOT NULL CHECK (reward >= 0)
);

CREATE TABLE IF NOT EXISTS bonus_wheel_claims (
  telegram_id BIGINT NOT NULL REFERENCES players(telegram_id) ON DELETE CASCADE,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reward BIGINT NOT NULL CHECK (reward >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (telegram_id, claim_date)
);

-- Existing installations may still have the original positive-bet constraint.
ALTER TABLE game_transactions DROP CONSTRAINT IF EXISTS game_transactions_bet_check;
ALTER TABLE game_transactions ADD CONSTRAINT game_transactions_bet_check CHECK (bet >= 0);

CREATE TABLE IF NOT EXISTS blackjack_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_telegram_id BIGINT NOT NULL REFERENCES players(telegram_id),
  invite_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','playing','finished')),
  bet BIGINT NOT NULL CHECK (bet > 0),
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS blackjack_room_players (
  room_id UUID NOT NULL REFERENCES blackjack_rooms(id) ON DELETE CASCADE,
  telegram_id BIGINT NOT NULL REFERENCES players(telegram_id),
  seat SMALLINT NOT NULL CHECK (seat BETWEEN 1 AND 5),
  hand JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','playing','stood','busted','blackjack','finished')),
  bet BIGINT NOT NULL CHECK (bet > 0),
  payout BIGINT NOT NULL DEFAULT 0 CHECK (payout >= 0),
  doubled BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (room_id, telegram_id),
  UNIQUE (room_id, seat)
);

ALTER TABLE blackjack_room_players ADD COLUMN IF NOT EXISTS ready BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE blackjack_rooms ADD COLUMN IF NOT EXISTS round_number INTEGER NOT NULL DEFAULT 1;
