CREATE TABLE regulatory_deadlines (
    id SERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    regulation_type VARCHAR(100),

    deadline_date DATE NOT NULL,

    status VARCHAR(50) DEFAULT 'UPCOMING',
    priority VARCHAR(50) DEFAULT 'MEDIUM',

    is_deleted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_deadline_date ON regulatory_deadlines(deadline_date);
CREATE INDEX idx_status ON regulatory_deadlines(status);
CREATE INDEX idx_regulation_type ON regulatory_deadlines(regulation_type);