BEGIN;

-- Base de datos recomendada: ENCODING UTF8 (evita "?" en lugar de acentos)
-- Ejemplo: CREATE DATABASE smartur WITH ENCODING 'UTF8' TEMPLATE template0;

CREATE TABLE role (
  role_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

INSERT INTO role (name) VALUES ('admin'), ('user');

CREATE TABLE "user" (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  photo_url VARCHAR(512) NULL,
  avatar_icon_key VARCHAR(64) NULL,
  birth_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES role(role_id)
);

-- ============================================
-- FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER PARA LA TABLA user
-- ============================================

CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

-- Índice para búsquedas por role_id
CREATE INDEX idx_user_role ON "user"(role_id);

-- Índice para ordenar por fecha de creación
CREATE INDEX idx_user_created_at ON "user"(created_at DESC);


-- Tabla de Perfil del Viajero Optimizada para SMARTUR
CREATE TABLE traveler_profile (
  id_profile SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Datos de Perfil (Step 1)
  age INT,                                    -- Edad exacta
  age_range VARCHAR(10),                      -- Rango (ej. '18-25')
  gender VARCHAR(20),                         -- Género
  
  -- Preferencias y Estilo (Step 2)
  interests TEXT[],                           -- Tipos de turismo {naturaleza, aventura, etc.}
  activity_level INT DEFAULT 3,               -- Nivel 1-5
  preferred_place VARCHAR(50),                -- 'aire', 'cerrado', 'indiferente'
  
  -- Contexto Fijo (Step 3 / Step 4)
  travel_type VARCHAR(50),                    -- 'solo', 'pareja', 'familia', 'amigos'
  has_accessibility BOOLEAN DEFAULT FALSE,    -- Necesita accesibilidad
  accessibility_detail TEXT,                  -- Detalles de la necesidad
  has_visited_before BOOLEAN DEFAULT FALSE,   -- ¿Ha visitado la región?
  
  -- Campos Originales / Auditoría
  restrictions TEXT,                          -- Alergias o restricciones médicas
  sustainable_preferences BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX idx_profile_user_id ON traveler_profile(user_id);

CREATE TABLE location (
  id_location SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  state VARCHAR(100),
  municipality VARCHAR(100),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6)
);

CREATE TABLE tourism_type (
  id_type SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- point_of_interest schema aligned for ML inference
DROP TABLE IF EXISTS point_of_interest CASCADE;

CREATE TABLE point_of_interest (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  categories_raw TEXT NOT NULL,
  categories_mapped JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_level SMALLINT NOT NULL DEFAULT 2,
  is_accessible BOOLEAN NOT NULL DEFAULT FALSE,
  outdoor BOOLEAN NOT NULL DEFAULT FALSE,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_poi_created_at ON point_of_interest(created_at DESC);
CREATE INDEX idx_poi_price_level ON point_of_interest(price_level);
CREATE INDEX idx_poi_categories_mapped ON point_of_interest USING GIN (categories_mapped);

CREATE TABLE tourism_expenditure (
  id_expenditure SERIAL PRIMARY KEY,
  id_tourist INT,
  expenditure_type VARCHAR(50),
  amount NUMERIC(10,2),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  destination VARCHAR(150),
  FOREIGN KEY (id_tourist) REFERENCES "user"(user_id)
);

CREATE TABLE tourism_sector (
  id_sector SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE company (
  id_company SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  address VARCHAR(255),
  phone VARCHAR(50),
  id_sector INT NOT NULL,
  id_location INT,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_sector) REFERENCES tourism_sector(id_sector),
  FOREIGN KEY (id_location) REFERENCES location(id_location)
);

CREATE TABLE tourist_activities (
  id_activity SERIAL PRIMARY KEY,
  id_company INT,
  is_active BOOLEAN DEFAULT TRUE,
  production_value NUMERIC(12,2),
  environmental_impact TEXT,
  social_impact TEXT,
  FOREIGN KEY (id_company) REFERENCES company(id_company)
);


CREATE TABLE tourism_employment (
  id_employment SERIAL PRIMARY KEY,
  id_company INT,
  position VARCHAR(100),
  contract_type VARCHAR(50),
  gender VARCHAR(20),
  salary NUMERIC(10,2),
  start_date DATE,
  FOREIGN KEY (id_company) REFERENCES company(id_company)
);

CREATE TABLE tourism_inputs (
  id_input SERIAL PRIMARY KEY,
  id_company INT,
  input_type VARCHAR(100),
  cost NUMERIC(10,2),
  consumption NUMERIC(10,2),
  carbon_footprint NUMERIC(10,2),
  FOREIGN KEY (id_company) REFERENCES company(id_company)
);

-- EVALUATION TEMPLATES
CREATE TABLE evaluation_template (
    id_template SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20),
    service_type VARCHAR(50), -- 'restaurant', 'hotel', 'tour'
    active BOOLEAN DEFAULT true,
    creation_date TIMESTAMP
);

CREATE TABLE evaluation_criterion (
    id_criterion SERIAL PRIMARY KEY,
    id_template INTEGER REFERENCES evaluation_template(id_template),
    name VARCHAR(100), -- 'Infrastructure', 'Accessibility', etc.
    description TEXT,
    weight DECIMAL(3,2), -- 0.00 - 1.00
    order_index INTEGER,
    active BOOLEAN DEFAULT true,
    field_type VARCHAR(50) NOT NULL DEFAULT 'scale' CHECK (field_type IN ('text', 'multiple_choice', 'scale', 'checkbox', 'select')),
    is_required BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE evaluation_subcriterion (
    id_subcriterion SERIAL PRIMARY KEY,
    id_criterion INTEGER NOT NULL REFERENCES evaluation_criterion(id_criterion) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL, -- Description of the score level
    score DECIMAL(5,2) NOT NULL DEFAULT 0, -- e.g., 0, 1, 2, 3, 4
    order_index INTEGER NOT NULL DEFAULT 0,
    required_evidences TEXT[], -- Types of required evidence
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tourist_service (
    id_service SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    id_company INT,
    id_location INT,
    service_type VARCHAR(50),
    active BOOLEAN DEFAULT true,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_company) REFERENCES company(id_company),
    FOREIGN KEY (id_location) REFERENCES location(id_location)
);


CREATE TABLE service_evaluation (
    id_evaluation SERIAL PRIMARY KEY,
    id_service INTEGER REFERENCES tourist_service(id_service),
    id_template INTEGER REFERENCES evaluation_template(id_template),
    evaluation_date DATE,
    evaluator_id INTEGER REFERENCES "user"(user_id),
    status VARCHAR(20), -- 'in_progress', 'completed', 'reviewed'
    is_active BOOLEAN DEFAULT TRUE,
    total_score DECIMAL(4,2),
    evaluation_time INTEGER, -- minutes
    general_observations TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE evaluation_detail (
    id_detail SERIAL PRIMARY KEY,
    id_evaluation INTEGER REFERENCES service_evaluation(id_evaluation),
    id_criterion INTEGER REFERENCES evaluation_criterion(id_criterion),
    assigned_score INTEGER, -- 0-4
    id_selected_subcriterion INTEGER REFERENCES evaluation_subcriterion(id_subcriterion),
    observations TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    attached_evidences JSON, -- URLs of photos, documents, etc.
    created_at TIMESTAMP
);

CREATE TABLE service_certification (
    id_certification SERIAL PRIMARY KEY,
    id_service INTEGER REFERENCES tourist_service(id_service),
    certification_type VARCHAR(100), -- 'H_Distinction', 'Michelin', 'Sustainable'
    obtainment_date DATE,
    expiration_date DATE,
    issuing_organization VARCHAR(100),
    evidence_url VARCHAR(255),
    status VARCHAR(20), -- 'active', 'expired', 'under_review'
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE login_tokens (
  user_id INT,
  token VARCHAR(100) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT,
  token VARCHAR(100) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

-- ============================================
-- A5: REGISTRO DE SEGURIDAD Y AUDITORÍA
-- Tabla para observabilidad de eventos de auth
-- Usada por: services/monitoringService.js
-- ============================================
CREATE TABLE security_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,  -- LOGIN_ATTEMPT, LOGIN_FAILED, MFA_FAILED, etc.
  user_email VARCHAR(100),
  ip_address VARCHAR(50),
  severity VARCHAR(20) DEFAULT 'INFO', -- INFO, WARNING, ERROR
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para consultas de Grafana ordenadas por tiempo
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
-- Índice para filtrar por tipo de evento
CREATE INDEX idx_security_events_type ON security_events(event_type);

-- ============================================
-- App móvil: favoritos, historial de visitas, comunidad
-- ============================================
CREATE TABLE user_favorite (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  place_kind VARCHAR(3) NOT NULL CHECK (place_kind IN ('svc', 'poi')),
  place_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, place_kind, place_id)
);
CREATE INDEX idx_user_favorite_user ON user_favorite(user_id);

CREATE TABLE user_visit (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  place_kind VARCHAR(3) NOT NULL CHECK (place_kind IN ('svc', 'poi')),
  place_id INT NOT NULL,
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_visit_user_time ON user_visit(user_id, visited_at DESC);

CREATE TABLE community_post (
  id_post SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  caption TEXT NOT NULL DEFAULT '',
  image_url VARCHAR(512) NULL,
  place_kind VARCHAR(3) NOT NULL CHECK (place_kind IN ('svc', 'poi')),
  place_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_community_post_created ON community_post(created_at DESC);

CREATE TABLE contact_subscription (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  source VARCHAR(64) NOT NULL DEFAULT 'landing_b2b',
  reason VARCHAR(100) NULL,
  message TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_contact_subscription_email ON contact_subscription(email);

-- ============================================
-- MODELO ML: persistencia de recomendaciones y métricas
-- (generadas por servicio MODELO :8000; consulta vía GET /recommendations/{user_id})
-- ============================================
CREATE TABLE ml_recommendation_session (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  alpha DOUBLE PRECISION,
  best_algorithm VARCHAR(64),
  execution_time_ms DOUBLE PRECISION,
  context_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ml_rec_session_user_created
  ON ml_recommendation_session (user_id, created_at DESC);

CREATE TABLE ml_recommendation_item (
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
CREATE INDEX idx_ml_rec_item_session ON ml_recommendation_item (session_id);

CREATE TABLE ml_model_metrics (
  id SERIAL PRIMARY KEY,
  metrics_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SEEDS DEMO (explore + usuarios de prueba + posts)
-- Contraseña ambos usuarios: Password1a
-- ============================================
INSERT INTO tourism_type (name) VALUES
  ('Naturaleza'),
  ('Cultura'),
  ('Gastronomía');

INSERT INTO location (name, state, municipality, latitude, longitude) VALUES
  ('Xalapa', 'Veracruz', 'Xalapa', 19.531240, -96.915890),
  ('Coatepec', 'Veracruz', 'Coatepec', 19.451800, -96.959700),
  ('Córdoba', 'Veracruz', 'Córdoba', 18.894200, -96.934700);

INSERT INTO tourism_sector (name, description) VALUES
  ('Hotelería', 'Hospedaje'),
  ('Restaurantes', 'Gastronomía'),
  ('Turismo de naturaleza', 'Actividades al aire libre');

INSERT INTO company (name, address, phone, id_sector, id_location) VALUES
  ('Hotel Mirador', 'Av. Principal 100', '2288110011', 1, 1),
  ('Café La Orquídea', 'Centro 20', '2288220022', 2, 2),
  ('Eco Tours Veracruz', 'Bosque 5', '2288330033', 3, 2);

INSERT INTO tourist_service (name, description, id_company, id_location, service_type, active, image_url) VALUES
  ('Hotel Mirador Xalapa', 'Habitaciones con vista a la ciudad.', 1, 1, 'hotel', true,
   'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=800'),
  ('Café Orquídea Coatepec', 'Café de la región y postres artesanales.', 2, 2, 'restaurant', true,
   'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&w=800'),
  ('Senderismo Macuiltépetl', 'Salida guiada al parque.', 3, 1, 'tour', true,
   'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&w=800');

INSERT INTO point_of_interest (name, categories_raw, categories_mapped, price_level, is_accessible, outdoor, latitude, longitude) VALUES
  ('Parque Macuiltépetl', 'park, viewpoint', '["nature"]', 1, true, true, 19.531240, -96.915890),
  ('Museo Interactivo', 'museum, science', '["culture"]', 2, true, false, 19.531240, -96.915890),
  ('Cascada de Texolo', 'waterfall', '["nature"]', 1, false, true, 19.451800, -96.959700),
  ('Ex-Hacienda de Toxpan', 'hacienda, history', '["culture"]', 1, true, true, 18.894200, -96.934700);

-- bcrypt hash for password: Password1a
INSERT INTO "user" (name, email, password, role_id, photo_url, avatar_icon_key) VALUES
  ('Turista Demo', 'turista@smartur.demo',
   '$2b$10$HQJ66fgUzg5nFEHnzzYrb.F/UQehNmboHq.FemnPRLUEJ0hLQjthe', 2, NULL, 'hiking'),
  ('Admin Demo', 'martinlaraolivares@gmail.com',
   '$2b$10$HQJ66fgUzg5nFEHnzzYrb.F/UQehNmboHq.FemnPRLUEJ0hLQjthe', 1, NULL, 'admin');

INSERT INTO community_post (user_id, caption, image_url, place_kind, place_id) VALUES
  (2, 'Increíble amanecer en la montaña — altas montañas de Veracruz.',
   'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&w=800', 'poi', 1),
  (1, 'Recomiendo el museo interactivo en Xalapa, ideal en familia.', NULL, 'poi', 2),
  (2, 'El café de Coatepec no tiene comparación.', 
   'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&w=800', 'svc', 2);

-- Altas Montañas: Orizaba y Fortín (app Home ya no usa mocks)
INSERT INTO location (name, state, municipality, latitude, longitude) VALUES
  ('Orizaba', 'Veracruz', 'Orizaba', 18.849100, -97.105100),
  ('Fortín de las Flores', 'Veracruz', 'Fortín', 18.901200, -96.998500);

INSERT INTO company (name, address, phone, id_sector, id_location) VALUES
  ('Hotel Altas Montañas Orizaba', 'Madero 123', '2721001001', 1, 4),
  ('Restaurante El Pico', 'Sur 45', '2721001002', 2, 4),
  ('Aventura Pico Tours', 'Norte 10', '2721001003', 3, 4),
  ('Posada Fortín', 'Principal 200', '2731002001', 1, 5);

INSERT INTO tourist_service (name, description, id_company, id_location, service_type, active, image_url) VALUES
  ('Hotel Altas Montañas', 'Vista al Pico de Orizaba.', 4, 4, 'hotel', true,
   'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&w=800'),
  ('El Pico Restaurante', 'Cocina regional y café.', 5, 4, 'restaurant', true,
   'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&w=800'),
  ('Tour Pico de Orizaba', 'Excursión a refugio y zona de montaña.', 6, 4, 'tour', true,
   'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&w=800'),
  ('Posada Fortín Plaza', 'Hospedaje céntrico en Fortín.', 7, 5, 'hotel', true,
   'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=800');

INSERT INTO point_of_interest (name, categories_raw, categories_mapped, price_level, is_accessible, outdoor, latitude, longitude) VALUES
  ('Pico de Orizaba', 'volcano, mountain', '["nature"]', 1, false, true, 18.849100, -97.105100),
  ('Palacio de Hierro Orizaba', 'monument, history', '["culture"]', 1, true, false, 18.849100, -97.105100),
  ('Jardín Botánico Fortín', 'botanical garden', '["nature"]', 1, true, true, 18.901200, -96.998500);

-- Córdoba: más servicios y puntos (filtros hotel / restaurante / tour / museo / naturaleza)
INSERT INTO company (name, address, phone, id_sector, id_location) VALUES
  ('Hotel Gobernador Córdoba', 'Av. 1 norte 64', '2717123456', 1, 3),
  ('Casa Revilla Gastronomía', 'Av. 3 norte 12', '2717123457', 2, 3),
  ('Experiencias Los Portales', 'Portal de Gloria', '2717123458', 3, 3);

INSERT INTO tourist_service (name, description, id_company, id_location, service_type, active, image_url) VALUES
  ('Hotel Gobernador Córdoba', 'Hospedaje cerca del zócalo y Los Portales.', 8, 3, 'hotel', true,
   'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=800'),
  ('Restaurante Casa Revilla', 'Alta cocina veracruzana en el centro histórico.', 9, 3, 'restaurant', true,
   'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&w=800'),
  ('Tour Ciudad de los 30 Caballeros', 'Recorrido colonial, leyendas y barrio de La Villa.', 10, 3, 'tour', true,
   'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&w=800');

INSERT INTO point_of_interest (name, categories_raw, categories_mapped, price_level, is_accessible, outdoor, latitude, longitude) VALUES
  ('Catedral de Córdoba', 'cathedral, religion', '["culture"]', 1, true, false, 18.894200, -96.934700),
  ('Los Portales de Córdoba', 'zocalo, town square', '["culture", "gastronomy"]', 2, true, true, 18.894200, -96.934700),
  ('Parque Ecológico Cerro del Metate', 'park, hiking', '["nature"]', 1, false, true, 18.894200, -96.934700),
  ('Municipio de La Villa', 'neighborhood, architecture', '["culture"]', 1, true, true, 18.894200, -96.934700);

-- Xico (nueva ciudad): Pueblo Mágico, variedad de tipos para filtros
INSERT INTO location (name, state, municipality, latitude, longitude) VALUES
  ('Xico', 'Veracruz', 'Xico', 19.421800, -97.010200);

INSERT INTO company (name, address, phone, id_sector, id_location) VALUES
  ('Hotel Posada Xico', 'Morelos 15', '2281234501', 1, 6),
  ('Fonda Tradicional Xico', 'Juárez 8', '2281234502', 2, 6),
  ('Xico Aventura en la Niebla', 'Carretera a Texolo km 1', '2281234503', 3, 6);

INSERT INTO tourist_service (name, description, id_company, id_location, service_type, active, image_url) VALUES
  ('Hotel Posada Xico', 'Descanso en el corazón del Pueblo Mágico.', 11, 6, 'hotel', true,
   'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&w=800'),
  ('Fonda Tradicional Xico', 'Mole, chiles en nogada y dulces regionales.', 12, 6, 'restaurant', true,
   'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&w=800'),
  ('Tour Cascada de Texolo y miradores', 'Salida guiada desde Xico.', 13, 6, 'tour', true,
   'https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&w=800');

INSERT INTO point_of_interest (name, categories_raw, categories_mapped, price_level, is_accessible, outdoor, latitude, longitude) VALUES
  ('Cascada de Texolo', 'waterfall', '["nature"]', 1, false, true, 19.421800, -97.010200),
  ('Santuario de María Magdalena', 'sanctuary, religion', '["culture"]', 1, true, false, 19.421800, -97.010200),
  ('Mercado de Xico', 'market, local food', '["gastronomy"]', 1, true, false, 19.421800, -97.010200),
  ('Mirador de la Niebla', 'viewpoint, coffee', '["nature"]', 1, true, true, 19.421800, -97.010200);

-- Evaluation instrument seed data
INSERT INTO evaluation_template (name, version, service_type, active, creation_date) VALUES
  ('Instrumento de Evaluación Restaurante', '1.0', 'restaurante', true, NOW()),
  ('Instrumento de Evaluación Hotel', '1.0', 'hotel', true, NOW());

INSERT INTO evaluation_criterion (id_template, name, description, weight, order_index, active, field_type, is_required) VALUES
  (1, '¿Cuántas puertas de acceso tiene?', '[STEP:infraestructura] Evalúa el número y calidad de accesos', 1.00, 0, true, 'scale', true),
  (1, '¿El establecimiento cuenta con señalización?', '[STEP:infraestructura] Presencia de señalización visible', 1.00, 1, true, 'scale', true),
  (1, '¿Las áreas de cocina están limpias?', '[STEP:higiene] Limpieza general de cocina y área de preparación', 1.00, 2, true, 'scale', true),
  (1, '¿El personal usa uniforme y equipo de protección?', '[STEP:higiene] Higiene del personal de servicio', 1.00, 3, true, 'scale', true),
  (1, '¿La atención al cliente es amable?', '[STEP:servicio] Calidad en el trato al cliente', 1.00, 4, true, 'scale', true),
  (1, '¿El menú es claro y descriptivo?', '[STEP:servicio] Claridad y presentación del menú', 1.00, 5, true, 'scale', true);

INSERT INTO evaluation_subcriterion (id_criterion, description, score, order_index) VALUES
  (1, 'Deficiente', 2, 0), (1, 'Regular', 4, 1), (1, 'Bueno', 6, 2), (1, 'Muy bueno', 8, 3), (1, 'Excelente', 10, 4),
  (2, 'Deficiente', 2, 0), (2, 'Regular', 4, 1), (2, 'Bueno', 6, 2), (2, 'Muy bueno', 8, 3), (2, 'Excelente', 10, 4),
  (3, 'Deficiente', 2, 0), (3, 'Regular', 4, 1), (3, 'Bueno', 6, 2), (3, 'Muy bueno', 8, 3), (3, 'Excelente', 10, 4),
  (4, 'Deficiente', 2, 0), (4, 'Regular', 4, 1), (4, 'Bueno', 6, 2), (4, 'Muy bueno', 8, 3), (4, 'Excelente', 10, 4),
  (5, 'Deficiente', 2, 0), (5, 'Regular', 4, 1), (5, 'Bueno', 6, 2), (5, 'Muy bueno', 8, 3), (5, 'Excelente', 10, 4),
  (6, 'Deficiente', 2, 0), (6, 'Regular', 4, 1), (6, 'Bueno', 6, 2), (6, 'Muy bueno', 8, 3), (6, 'Excelente', 10, 4);

-- ============================================
-- ML DATA COLLECTION TABLES
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
CREATE INDEX idx_user_interaction_user_place ON user_interaction (user_id, place_kind, place_id);
CREATE INDEX idx_user_interaction_created ON user_interaction (created_at DESC);

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
CREATE INDEX idx_user_rating_place ON user_rating (place_kind, place_id);

CREATE TABLE IF NOT EXISTS ml_recommendation_feedback (
  id            SERIAL PRIMARY KEY,
  session_id    INT NOT NULL REFERENCES ml_recommendation_session(id) ON DELETE CASCADE,
  item_id       VARCHAR(64) NOT NULL,
  rank_pos      INT NOT NULL,
  clicked       BOOLEAN NOT NULL DEFAULT FALSE,
  clicked_at    TIMESTAMPTZ NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ml_rec_feedback_session ON ml_recommendation_feedback (session_id);

INSERT INTO location (name, state, municipality, latitude, longitude)
VALUES
  ('Ixtaczoquitlán',          'Veracruz', 'Ixtaczoquitlán',        18.816700, -97.066700),
  ('Cuitláhuac',              'Veracruz', 'Cuitláhuac',            18.813100, -96.722200),
  ('Amatlán de los Reyes',    'Veracruz', 'Amatlán de los Reyes',  18.833300, -96.916700),
  ('Yanga',                   'Veracruz', 'Yanga',                 18.833300, -96.800000),
  ('Atoyac',                  'Veracruz', 'Atoyac',                18.916700, -96.766700),
  ('Xico',                    'Veracruz', 'Xico',                  19.421800, -97.010200)
ON CONFLICT DO NOTHING;

COMMIT;