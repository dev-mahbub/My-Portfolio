-- =====================================================================
-- Portfolio Full-Stack — Database Migration (002)
-- Creates: uploads table (stores file bytes in DB for serverless compatibility)
-- Run:  npm run db:migrate
--
-- Why: On Vercel/serverless the filesystem is read-only, so uploaded files
-- (CV PDF, avatar, cover images) are stored as BYTEA in PostgreSQL instead.
-- They are served via /api/file/[id].
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS uploads (
  id           BIGSERIAL PRIMARY KEY,
  kind         TEXT NOT NULL DEFAULT 'image',   -- 'cv' | 'avatar' | 'cover' | 'image'
  filename     TEXT NOT NULL,                    -- stored filename (unique slug)
  original_name TEXT,
  mime_type    TEXT,
  size_bytes   BIGINT,
  data         BYTEA NOT NULL,                   -- the raw file bytes
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by  BIGINT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_uploads_kind
  ON uploads(kind);
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_at
  ON uploads(uploaded_at DESC);

COMMIT;

-- ---------------------------------------------------------------------
-- End of migration 002
-- ---------------------------------------------------------------------