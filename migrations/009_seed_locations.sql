-- Seed de ubicaciones con coordenadas — Las Altas Montañas, Veracruz
-- Ejecutar en local:  psql -U postgres -d smartur -f migrations/009_seed_locations.sql
-- Ejecutar en Docker: docker exec -i smartur-postgres psql -U postgres -d smartur < migrations/009_seed_locations.sql
-- Ejecutar en VPS:    ssh root@2.24.112.25
--                     cd /opt/SMARTUR && docker exec -i smartur-postgres psql -U postgres -d smartur < API/migrations/009_seed_locations.sql

-- Ciudades principales de la región
INSERT INTO location (name, state, municipality, latitude, longitude, is_active)
VALUES
  ('Córdoba',                  'Veracruz', 'Córdoba',               18.884200, -96.925600, TRUE),
  ('Orizaba',                  'Veracruz', 'Orizaba',               18.852200, -97.099400, TRUE),
  ('Fortín de las Flores',     'Veracruz', 'Fortín',                18.906100, -96.998100, TRUE),
  ('Ixtaczoquitlán',           'Veracruz', 'Ixtaczoquitlán',        18.816700, -97.066700, TRUE),
  ('Cuitláhuac',               'Veracruz', 'Cuitláhuac',            18.813100, -96.722200, TRUE),
  ('Amatlán de los Reyes',     'Veracruz', 'Amatlán de los Reyes',  18.833300, -96.916700, TRUE),
  ('Yanga',                    'Veracruz', 'Yanga',                 18.833300, -96.800000, TRUE),
  ('Atoyac',                   'Veracruz', 'Atoyac',                18.916700, -96.766700, TRUE),

  -- Puntos de interés en Córdoba
  ('Parque 21 de Mayo',                    'Veracruz', 'Córdoba',  18.884200, -96.925600, TRUE),
  ('Museo de la Ciudad de Córdoba',        'Veracruz', 'Córdoba',  18.886000, -96.927000, TRUE),
  ('Catedral de la Inmaculada Concepción', 'Veracruz', 'Córdoba',  18.883500, -96.924800, TRUE),

  -- Puntos de interés en Orizaba
  ('Palacio de Hierro de Orizaba',         'Veracruz', 'Orizaba',  18.852200, -97.099400, TRUE),
  ('Teleférico de Orizaba',                'Veracruz', 'Orizaba',  18.850000, -97.100000, TRUE),

  -- Fortín de las Flores
  ('Jardín Botánico de Fortín',            'Veracruz', 'Fortín',   18.906100, -96.998100, TRUE)

ON CONFLICT DO NOTHING;

-- Actualizar coordenadas en filas existentes que tengan latitud/longitud NULL o 0
-- (ajusta los nombres según lo que tengas en tu base de datos)
UPDATE location SET latitude = 18.884200, longitude = -96.925600
  WHERE name ILIKE '%córdoba%' AND municipality ILIKE '%córdoba%' AND (latitude IS NULL OR latitude = 0);

UPDATE location SET latitude = 18.852200, longitude = -97.099400
  WHERE name ILIKE '%orizaba%' AND (latitude IS NULL OR latitude = 0);

UPDATE location SET latitude = 18.906100, longitude = -96.998100
  WHERE name ILIKE '%fortín%' AND (latitude IS NULL OR latitude = 0);

UPDATE location SET latitude = 18.816700, longitude = -97.066700
  WHERE name ILIKE '%ixtaczoquitl%' AND (latitude IS NULL OR latitude = 0);

UPDATE location SET latitude = 18.813100, longitude = -96.722200
  WHERE name ILIKE '%cuitláhuac%' AND (latitude IS NULL OR latitude = 0);

UPDATE location SET latitude = 18.833300, longitude = -96.916700
  WHERE name ILIKE '%amatlán%' AND (latitude IS NULL OR latitude = 0);

UPDATE location SET latitude = 18.833300, longitude = -96.800000
  WHERE name ILIKE '%yanga%' AND (latitude IS NULL OR latitude = 0);

-- Verificar resultado
SELECT id_location, name, municipality, latitude, longitude FROM location ORDER BY id_location;
