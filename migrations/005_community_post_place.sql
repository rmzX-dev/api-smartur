-- Etiqueta obligatoria de lugar en publicaciones de comunidad
ALTER TABLE community_post ADD COLUMN IF NOT EXISTS place_kind VARCHAR(3);
ALTER TABLE community_post ADD COLUMN IF NOT EXISTS place_id INT;

-- Datos existentes: asignar POI/servicio demo según el texto (seeds originales)
UPDATE community_post SET place_kind = 'poi', place_id = 1
WHERE caption ILIKE '%amanecer%' OR caption ILIKE '%montaña%';

UPDATE community_post SET place_kind = 'poi', place_id = 2
WHERE caption ILIKE '%museo%';

UPDATE community_post SET place_kind = 'svc', place_id = 2
WHERE caption ILIKE '%café%' OR caption ILIKE '%coatepec%';

UPDATE community_post SET place_kind = 'poi', place_id = 1
WHERE place_kind IS NULL;

ALTER TABLE community_post ALTER COLUMN place_kind SET NOT NULL;
ALTER TABLE community_post ALTER COLUMN place_id SET NOT NULL;

ALTER TABLE community_post DROP CONSTRAINT IF EXISTS chk_community_post_place_kind;
ALTER TABLE community_post
  ADD CONSTRAINT chk_community_post_place_kind CHECK (place_kind IN ('svc', 'poi'));
