BEGIN;

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
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES role(role_id)
);

CREATE TABLE traveler_profile (
  id_profile SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  age INT,
  gender VARCHAR(20),
  travel_type VARCHAR(50),
  interests TEXT,
  restrictions TEXT,
  sustainable_preferences BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

CREATE TABLE location (
  id_location SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  state VARCHAR(100),
  municipality VARCHAR(100),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6)
);

CREATE TABLE tourism_type (
  id_type SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE point_of_interest (
  id_point SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  id_type INT,
  id_location INT,
  sustainability BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_type) REFERENCES tourism_type(id_type),
  FOREIGN KEY (id_location) REFERENCES location(id_location)
);

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
    active BOOLEAN DEFAULT true
);

CREATE TABLE evaluation_subcriterion (
    id_subcriterion SERIAL PRIMARY KEY,
    id_criterion INTEGER REFERENCES evaluation_criterion(id_criterion),
    description TEXT, -- Description of the score level
    score INTEGER, -- 0, 1, 2, 3, 4
    order_index INTEGER,
    required_evidences TEXT[] -- Types of required evidence
);

CREATE TABLE tourist_service (
    id_service SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    id_company INT,
    id_location INT,
    service_type VARCHAR(50),
    active BOOLEAN DEFAULT true,
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
    status VARCHAR(20) -- 'active', 'expired', 'under_review'
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

COMMIT;