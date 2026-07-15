-- =====================================================================
-- Portfolio Full-Stack — Database Migration (001)
-- Creates: users, dashboard_content, visitor_tracking, public_files
-- Run:  npm run db:migrate
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1) users — authentication (single admin for now, schema supports many)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2) dashboard_content — editable online CV text + cover letters + sections
--    Each row = one content block keyed by `section` (e.g. 'profile',
--    'cv_text', 'cover_letter', 'skills', 'projects', ...).
--    Content is stored as JSONB so the existing shape is preserved.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard_content (
  id         BIGSERIAL PRIMARY KEY,
  section    TEXT NOT NULL UNIQUE,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- Helpful index for section lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_content_section
  ON dashboard_content(section);

-- ---------------------------------------------------------------------
-- 3) visitor_tracking — analytics for HR/employer visits
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitor_tracking (
  id          BIGSERIAL PRIMARY KEY,
  visited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address  TEXT,
  user_agent  TEXT,
  ref_source  TEXT,         -- from ?ref=google  /  ?ref=bkash  etc.
  path        TEXT,         -- which page / custom job link was opened
  session_id  TEXT          -- best-effort anonymous visitor id
);

CREATE INDEX IF NOT EXISTS idx_visitor_tracking_visited_at
  ON visitor_tracking(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_ref_source
  ON visitor_tracking(ref_source);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_path
  ON visitor_tracking(path);

-- ---------------------------------------------------------------------
-- 4) public_files — downloadable media (e.g. the ATS-friendly CV PDF)
--    IMPORTANT: This is the STANDALONE downloadable CV — it is completely
--    independent of dashboard_content. Uploading a new PDF here does not
--    affect the editable online CV text, and vice-versa.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public_files (
  id           BIGSERIAL PRIMARY KEY,
  kind         TEXT NOT NULL DEFAULT 'cv',   -- 'cv' | 'cover_letter_pdf' | 'resume'
  filename     TEXT NOT NULL,                -- stored filename on disk
  original_name TEXT,
  url          TEXT NOT NULL,                -- public URL to serve
  mime_type    TEXT,
  size_bytes   BIGINT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,-- only one active CV served at a time
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by  BIGINT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_public_files_kind_active
  ON public_files(kind, is_active);

-- updated_at trigger for users
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_dashboard_content_updated_at ON dashboard_content;
CREATE TRIGGER trg_dashboard_content_updated_at
  BEFORE UPDATE ON dashboard_content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;

-- ---------------------------------------------------------------------
-- End of migration 001
-- ---------------------------------------------------------------------