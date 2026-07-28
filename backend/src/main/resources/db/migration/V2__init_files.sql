CREATE TABLE files (
    id                UUID PRIMARY KEY,
    owner_id          UUID NOT NULL REFERENCES users(id),
    owner_name        VARCHAR(255) NOT NULL,
    display_name      VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type      VARCHAR(255) NOT NULL,
    size_bytes        BIGINT NOT NULL,
    storage_path      VARCHAR(500) NOT NULL,
    category          VARCHAR(50) NOT NULL,
    visibility        VARCHAR(50) NOT NULL,
    notes             TEXT,
    uploaded_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE file_tags (
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    tag     VARCHAR(100) NOT NULL
);

CREATE INDEX idx_files_owner_id ON files(owner_id);
CREATE INDEX idx_files_visibility ON files(visibility);
CREATE INDEX idx_files_display_name ON files(lower(display_name));