CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50),
    user_email VARCHAR(100),
    ip_address VARCHAR(45),
    severity VARCHAR(10)
);

CREATE INDEX IF NOT EXISTS idx_event_time ON security_events(event_time);
CREATE INDEX IF NOT EXISTS idx_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_severity ON security_events(severity);

COMMENT ON TABLE security_events IS 'Eventos de seguridad para monitoreo con Grafana (SMARTUR).';
