-- ============================================
-- ML DATA COLLECTION MIGRATION
-- Run with: Get-Content .\API\migration_ml.sql | docker exec -i smartur-postgres psql -U postgres -d smartur
-- VPS:  ssh root@2.24.112.25 "docker exec -i smartur-postgres psql -U postgres -d smartur" < API/migration_ml.sql
-- Safe to re-run (uses IF NOT EXISTS / IF NOT EXISTS).
-- ============================================

-- ============================================
-- 1. IMPLICIT + EXPLICIT EVENT STREAM
-- event_type: 'detail_open' | 'dwell' | 'filter_click' | 'skip' | 'share' | 'recommendation_click'
-- place_kind / place_id nullable for session-level events (filter clicks, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS user_interaction (
  id            BIGSERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  place_kind    VARCHAR(16) NULL,
  place_id      INT NULL,
  event_type    VARCHAR(32) NOT NULL,
  dwell_ms      INT NULL,
  meta          JSONB NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_interaction_user_place') THEN
    CREATE INDEX idx_user_interaction_user_place ON user_interaction (user_id, place_kind, place_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_interaction_created') THEN
    CREATE INDEX idx_user_interaction_created ON user_interaction (created_at DESC);
  END IF;
END $$;

-- ============================================
-- 2. EXPLICIT 1–5 STAR RATINGS
-- One rating per user per place (upsert on conflict).
-- ============================================
CREATE TABLE IF NOT EXISTS user_rating (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  place_kind VARCHAR(3) NOT NULL CHECK (place_kind IN ('svc', 'poi')),
  place_id   INT NOT NULL,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, place_kind, place_id)
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_rating_place') THEN
    CREATE INDEX idx_user_rating_place ON user_rating (place_kind, place_id);
  END IF;
END $$;

-- ============================================
-- 3. RECOMMENDATION CLICK FEEDBACK
-- Tracks which recommended items users clicked vs. ignored.
-- ============================================
CREATE TABLE IF NOT EXISTS ml_recommendation_feedback (
  id            SERIAL PRIMARY KEY,
  session_id    INT NOT NULL REFERENCES ml_recommendation_session(id) ON DELETE CASCADE,
  item_id       VARCHAR(64) NOT NULL,
  rank_pos      INT NOT NULL,
  clicked       BOOLEAN NOT NULL DEFAULT FALSE,
  clicked_at    TIMESTAMPTZ NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ml_rec_feedback_session') THEN
    CREATE INDEX idx_ml_rec_feedback_session ON ml_recommendation_feedback (session_id);
  END IF;
END $$;
