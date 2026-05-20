-- Orizaba / Fortín para el Home (idempotente por nombre de empresa / servicio / POI).
-- Uso: npm run seed:explore   o   psql "$DATABASE_URL" -f seeds/seed_explore_more.sql

BEGIN;

-- Catálogos mínimos requeridos por FK (idempotente)
INSERT INTO tourism_sector (name, description)
SELECT v.name, v.description
FROM (VALUES
  ('Hotelería'::varchar(100), 'Hospedaje'::text),
  ('Restaurantes'::varchar(100), 'Gastronomía'::text),
  ('Turismo de naturaleza'::varchar(100), 'Actividades al aire libre'::text)
) AS v(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM tourism_sector s WHERE s.name = v.name
);

INSERT INTO tourism_type (name)
SELECT v.name
FROM (VALUES
  ('Naturaleza'::varchar(100)),
  ('Cultura'::varchar(100))
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM tourism_type t WHERE t.name = v.name
);

INSERT INTO location (name, state, municipality, latitude, longitude)
SELECT v.name, v.state, v.municipality, v.latitude, v.longitude
FROM (VALUES
  ('Orizaba'::varchar(150), 'Veracruz'::varchar(100), 'Orizaba'::varchar(100), 18.849100::numeric(10,6), -97.105100::numeric(10,6)),
  ('Fortín de las Flores'::varchar(150), 'Veracruz'::varchar(100), 'Fortín'::varchar(100), 18.901200::numeric(10,6), -96.998500::numeric(10,6))
) AS v(name, state, municipality, latitude, longitude)
WHERE NOT EXISTS (
  SELECT 1 FROM location l WHERE l.name = v.name AND l.state = v.state
);

INSERT INTO company (name, address, phone, id_sector, id_location)
SELECT 'Hotel Altas Montañas Orizaba', 'Madero 123', '2721001001', s.id_sector, l.id_location
FROM location l
JOIN tourism_sector s ON s.name = 'Hotelería'
WHERE l.name = 'Orizaba' AND l.state = 'Veracruz'
  AND NOT EXISTS (SELECT 1 FROM company c WHERE c.name = 'Hotel Altas Montañas Orizaba')
LIMIT 1;

INSERT INTO company (name, address, phone, id_sector, id_location)
SELECT 'Restaurante El Pico', 'Sur 45', '2721001002', s.id_sector, l.id_location
FROM location l
JOIN tourism_sector s ON s.name = 'Restaurantes'
WHERE l.name = 'Orizaba' AND l.state = 'Veracruz'
  AND NOT EXISTS (SELECT 1 FROM company c WHERE c.name = 'Restaurante El Pico')
LIMIT 1;

INSERT INTO company (name, address, phone, id_sector, id_location)
SELECT 'Aventura Pico Tours', 'Norte 10', '2721001003', s.id_sector, l.id_location
FROM location l
JOIN tourism_sector s ON s.name = 'Turismo de naturaleza'
WHERE l.name = 'Orizaba' AND l.state = 'Veracruz'
  AND NOT EXISTS (SELECT 1 FROM company c WHERE c.name = 'Aventura Pico Tours')
LIMIT 1;

INSERT INTO company (name, address, phone, id_sector, id_location)
SELECT 'Posada Fortín', 'Principal 200', '2731002001', s.id_sector, l.id_location
FROM location l
JOIN tourism_sector s ON s.name = 'Hotelería'
WHERE l.name = 'Fortín de las Flores' AND l.state = 'Veracruz'
  AND NOT EXISTS (SELECT 1 FROM company c WHERE c.name = 'Posada Fortín')
LIMIT 1;

INSERT INTO tourist_service (name, description, id_company, id_location, service_type, active, image_url)
SELECT 'Hotel Altas Montañas', 'Vista al Pico de Orizaba.', c.id_company, c.id_location, 'hotel', true,
  'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&w=800'
FROM company c
WHERE c.name = 'Hotel Altas Montañas Orizaba'
  AND NOT EXISTS (SELECT 1 FROM tourist_service t WHERE t.name = 'Hotel Altas Montañas' AND t.id_company = c.id_company);

INSERT INTO tourist_service (name, description, id_company, id_location, service_type, active, image_url)
SELECT 'El Pico Restaurante', 'Cocina regional y café.', c.id_company, c.id_location, 'restaurant', true,
  'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&w=800'
FROM company c
WHERE c.name = 'Restaurante El Pico'
  AND NOT EXISTS (SELECT 1 FROM tourist_service t WHERE t.name = 'El Pico Restaurante' AND t.id_company = c.id_company);

INSERT INTO tourist_service (name, description, id_company, id_location, service_type, active, image_url)
SELECT 'Tour Pico de Orizaba', 'Excursión a refugio y zona de montaña.', c.id_company, c.id_location, 'tour', true,
  'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&w=800'
FROM company c
WHERE c.name = 'Aventura Pico Tours'
  AND NOT EXISTS (SELECT 1 FROM tourist_service t WHERE t.name = 'Tour Pico de Orizaba' AND t.id_company = c.id_company);

INSERT INTO tourist_service (name, description, id_company, id_location, service_type, active, image_url)
SELECT 'Posada Fortín Plaza', 'Hospedaje céntrico en Fortín.', c.id_company, c.id_location, 'hotel', true,
  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=800'
FROM company c
WHERE c.name = 'Posada Fortín'
  AND NOT EXISTS (SELECT 1 FROM tourist_service t WHERE t.name = 'Posada Fortín Plaza' AND t.id_company = c.id_company);

INSERT INTO point_of_interest (name, description, id_type, id_location, sustainability, image_url, rating)
SELECT 'Pico de Orizaba', 'Volcán y zona de montaña.', t.id_type, l.id_location, true,
  'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&w=800', 4.9
FROM location l
JOIN tourism_type t ON t.name = 'Naturaleza'
WHERE l.name = 'Orizaba' AND l.state = 'Veracruz'
  AND NOT EXISTS (SELECT 1 FROM point_of_interest p WHERE p.name = 'Pico de Orizaba' AND p.id_location = l.id_location)
LIMIT 1;

INSERT INTO point_of_interest (name, description, id_type, id_location, sustainability, image_url, rating)
SELECT 'Palacio de Hierro Orizaba', 'Monumento histórico.', t.id_type, l.id_location, false,
  'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&w=800', 4.7
FROM location l
JOIN tourism_type t ON t.name = 'Cultura'
WHERE l.name = 'Orizaba' AND l.state = 'Veracruz'
  AND NOT EXISTS (SELECT 1 FROM point_of_interest p WHERE p.name = 'Palacio de Hierro Orizaba' AND p.id_location = l.id_location)
LIMIT 1;

INSERT INTO point_of_interest (name, description, id_type, id_location, sustainability, image_url, rating)
SELECT 'Jardín Botánico Fortín', 'Flores y áreas verdes.', t.id_type, l.id_location, true,
  'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&w=800', 4.5
FROM location l
JOIN tourism_type t ON t.name = 'Naturaleza'
WHERE l.name = 'Fortín de las Flores' AND l.state = 'Veracruz'
  AND NOT EXISTS (SELECT 1 FROM point_of_interest p WHERE p.name = 'Jardín Botánico Fortín' AND p.id_location = l.id_location)
LIMIT 1;

COMMIT;
