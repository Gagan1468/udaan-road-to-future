-- Run this once against your existing udaan_courses database.
-- This adds the account link to the existing registrations table.
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS ix_registrations_user_id ON registrations(user_id);
-- Existing registrations remain unlinked; new registrations are linked to signed-in accounts.
