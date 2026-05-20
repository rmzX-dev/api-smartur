BEGIN;

-- Soft delete flags across domain tables
ALTER TABLE company ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE location ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE point_of_interest ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE tourist_activities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE traveler_profile ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE service_evaluation ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE evaluation_detail ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE service_certification ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Favorites soft delete instead of physical delete
ALTER TABLE user_favorite ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE user_favorite ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Normalize current data
UPDATE company SET is_active = TRUE WHERE is_active IS NULL;
UPDATE location SET is_active = TRUE WHERE is_active IS NULL;
UPDATE point_of_interest SET is_active = TRUE WHERE is_active IS NULL;
UPDATE tourist_activities SET is_active = TRUE WHERE is_active IS NULL;
UPDATE traveler_profile SET is_active = TRUE WHERE is_active IS NULL;
UPDATE service_evaluation SET is_active = TRUE WHERE is_active IS NULL;
UPDATE evaluation_detail SET is_active = TRUE WHERE is_active IS NULL;
UPDATE service_certification SET is_active = TRUE WHERE is_active IS NULL;
UPDATE user_favorite SET is_active = TRUE WHERE is_active IS NULL;

-- Keep state coherent for prior non-active certifications/evaluations
UPDATE service_certification
SET status = 'inactive'
WHERE is_active = FALSE AND (status IS NULL OR status = 'active');

UPDATE service_evaluation
SET status = 'deleted'
WHERE is_active = FALSE AND (status IS NULL OR status IN ('in_progress', 'completed', 'reviewed'));

COMMIT;
