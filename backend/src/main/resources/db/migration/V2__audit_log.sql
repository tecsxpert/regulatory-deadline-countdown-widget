CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,

    action VARCHAR(50) NOT NULL,
    entity_id INT,
    entity_name VARCHAR(100),

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_log(entity_id);