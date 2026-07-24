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
    ('maria.alvarez@clouddesk.io', '$2a$10$7yq1E4Z1p0m5f4c1o1QO0e2K1Jc7bE2s0m5B1p8H1c1o1QO0e2K1J', 'Maria Alvarez', 'ADMIN'),
    ('r.chen@clouddesk.io',        '$2a$10$7yq1E4Z1p0m5f4c1o1QO0e2K1Jc7bE2s0m5B1p8H1c1o1QO0e2K1J', 'R. Chen',       'MEMBER'),
    ('j.kim@clouddesk.io',         '$2a$10$7yq1E4Z1p0m5f4c1o1QO0e2K1Jc7bE2s0m5B1p8H1c1o1QO0e2K1J', 'J. Kim',        'MEMBER'),
    ('s.patel@clouddesk.io',       '$2a$10$7yq1E4Z1p0m5f4c1o1QO0e2K1Jc7bE2s0m5B1p8H1c1o1QO0e2K1J', 'S. Patel',      'MEMBER'),
    ('m.alvarez.ops@clouddesk.io', '$2a$10$7yq1E4Z1p0m5f4c1o1QO0e2K1Jc7bE2s0m5B1p8H1c1o1QO0e2K1J', 'Ops Account',   'MEMBER');
