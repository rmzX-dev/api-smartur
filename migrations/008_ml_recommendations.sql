-- Persistencia de recomendaciones y métricas del servicio MODELO (FastAPI :8000)
CREATE TABLE IF NOT EXISTS ml_recommendation_session (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  alpha DOUBLE PRECISION,
  best_algorithm VARCHAR(64),
  execution_time_ms DOUBLE PRECISION,
  context_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ml_rec_session_user_created
  ON ml_recommendation_session (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ml_recommendation_item (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES ml_recommendation_session(id) ON DELETE CASCADE,
  rank_pos INTEGER NOT NULL,
  item_id VARCHAR(64) NOT NULL,
  title VARCHAR(255),
  score DOUBLE PRECISION,
  pred_cf DOUBLE PRECISION,
  pred_rf DOUBLE PRECISION,
  pred_gbm DOUBLE PRECISION,
  kind VARCHAR(16) DEFAULT 'poi',
  image_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_ml_rec_item_session ON ml_recommendation_item (session_id);

CREATE TABLE IF NOT EXISTS ml_model_metrics (
  id SERIAL PRIMARY KEY,
  metrics_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
