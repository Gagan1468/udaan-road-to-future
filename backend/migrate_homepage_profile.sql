-- Run once against your existing database (Render PostgreSQL) before deploying this version.
-- The new `enquiries` table is created automatically at startup (create_all); the columns below are not,
-- because create_all never alters existing tables.
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE;
