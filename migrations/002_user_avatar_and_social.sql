-- Ejecutar sobre una BD existente (después de 001 si aplica).
-- Ajusta nombres si tu esquema difiere.

BEGIN;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS photo_url VARCHAR(512) NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS avatar_icon_key VARCHAR(64) NULL;

CREATE TABLE IF NOT EXISTS user_favorite (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  place_kind VARCHAR(3) NOT NULL CHECK (place_kind IN ('svc', 'poi')),
  place_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, place_kind, place_id)
);
CREATE INDEX IF NOT EXISTS idx_user_favorite_user ON user_favorite(user_id);

CREATE TABLE IF NOT EXISTS user_visit (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  place_kind VARCHAR(3) NOT NULL CHECK (place_kind IN ('svc', 'poi')),
  place_id INT NOT NULL,
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_visit_user_time ON user_visit(user_id, visited_at DESC);

CREATE TABLE IF NOT EXISTS community_post (
  id_post SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  caption TEXT NOT NULL DEFAULT '',
  image_url VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_community_post_created ON community_post(created_at DESC);

COMMIT;
