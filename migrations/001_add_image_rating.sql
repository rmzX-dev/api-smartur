-- Migración: agregar image_url y rating para compatibilidad con app móvil
-- Ejecutar en bases de datos existentes:
-- psql -U tu_usuario -d tu_base -f migrations/001_add_image_rating.sql

BEGIN;

-- point_of_interest
ALTER TABLE point_of_interest ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE point_of_interest ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 4.0;

-- tourist_service
ALTER TABLE tourist_service ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

COMMIT;
