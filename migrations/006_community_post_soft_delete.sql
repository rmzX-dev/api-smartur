BEGIN;

-- Añadir columna is_active para borrado lógico (soft delete)
ALTER TABLE community_post ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Asegurar que los registros existentes sean marcados como activos
UPDATE community_post SET is_active = TRUE WHERE is_active IS NULL;

COMMIT;
