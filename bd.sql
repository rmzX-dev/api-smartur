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