-- Add field_type column to evaluation_criterion
ALTER TABLE evaluation_criterion 
ADD COLUMN IF NOT EXISTS field_type VARCHAR(50) NOT NULL DEFAULT 'scale'
CHECK (field_type IN ('text', 'multiple_choice', 'scale', 'checkbox', 'select'));

-- Add is_required column to evaluation_criterion
ALTER TABLE evaluation_criterion 
ADD COLUMN IF NOT EXISTS is_required BOOLEAN NOT NULL DEFAULT TRUE;

-- Ensure evaluation_subcriterion table exists
CREATE TABLE IF NOT EXISTS evaluation_subcriterion (
    id_subcriterion SERIAL PRIMARY KEY,
    id_criterion INTEGER NOT NULL REFERENCES evaluation_criterion(id_criterion) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
