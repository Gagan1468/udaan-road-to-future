-- Migration for the single-course Road to Future dashboard.
-- REVIEW FIRST: run the duplicate check below against production before applying this file.
-- This migration is intentionally NOT executed by the application at startup.
--
-- Preflight query:
-- SELECT user_id, COUNT(*)
-- FROM registrations
-- WHERE user_id IS NOT NULL
-- GROUP BY user_id
-- HAVING COUNT(*) > 1;
--
-- If the query returns rows, STOP and review which registration to retain per account.
-- Do not delete historical registrations automatically.
--
-- This unique partial index enforces one linked registration per account while allowing
-- legacy/unlinked rows (user_id IS NULL) to remain untouched.
CREATE UNIQUE INDEX IF NOT EXISTS uq_registrations_user_id_enrolled
    ON registrations (user_id)
    WHERE user_id IS NOT NULL;
