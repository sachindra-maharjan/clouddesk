CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'MEMBER',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 5 provisioned users. Password for all seed accounts is "Password123!"
-- Hash is BCrypt (strength 10); regenerate before using outside local/dev.
INSERT INTO users (email, password_hash, display_name, role) VALUES
    ('maria.alvarez@clouddesk.io', '$2a$10$V5mPn3YDu89Qe53C7F0Jj.HZkOHy6qIMttj1DxcBg2xlHT9dwC5mC', 'Maria Alvarez', 'ADMIN'),
    ('r.chen@clouddesk.io',        '$2a$10$V5mPn3YDu89Qe53C7F0Jj.HZkOHy6qIMttj1DxcBg2xlHT9dwC5mC', 'R. Chen',       'MEMBER'),
    ('j.kim@clouddesk.io',         '$2a$10$V5mPn3YDu89Qe53C7F0Jj.HZkOHy6qIMttj1DxcBg2xlHT9dwC5mC', 'J. Kim',        'MEMBER'),
    ('s.patel@clouddesk.io',       '$2a$10$V5mPn3YDu89Qe53C7F0Jj.HZkOHy6qIMttj1DxcBg2xlHT9dwC5mC', 'S. Patel',      'MEMBER'),
    ('m.alvarez.ops@clouddesk.io', '$2a$10$V5mPn3YDu89Qe53C7F0Jj.HZkOHy6qIMttj1DxcBg2xlHT9dwC5mC', 'Ops Account',   'MEMBER');
