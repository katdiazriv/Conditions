/*
  # Add Role Column to User Condition Flags

  1. Changes
    - Add `role` column to `user_condition_flags` table
    - Role is constrained to valid values: 'Processor III' or 'Underwriter'
    - Migrate existing records to use 'Processor III' as their role
    - Update unique constraint from (user_id, condition_id) to (role, condition_id)
    - Update index from user_id to role for query performance

  2. Purpose
    - Flags are now role-based rather than user-based
    - Each role sees only its own flags (no inheritance between roles)
    - Enables role-specific workflow tracking

  3. Migration Notes
    - Existing flags (previously tied to 'demo-user') are migrated to 'Processor III'
    - user_id column is kept for future extensibility
*/

ALTER TABLE user_condition_flags
ADD COLUMN IF NOT EXISTS role text;

UPDATE user_condition_flags
SET role = 'Processor III'
WHERE role IS NULL;

ALTER TABLE user_condition_flags
ALTER COLUMN role SET NOT NULL;

ALTER TABLE user_condition_flags
ADD CONSTRAINT user_condition_flags_role_check
CHECK (role IN ('Processor III', 'Underwriter'));

ALTER TABLE user_condition_flags
DROP CONSTRAINT IF EXISTS user_condition_flags_user_id_condition_id_key;

ALTER TABLE user_condition_flags
ADD CONSTRAINT user_condition_flags_role_condition_id_key
UNIQUE (role, condition_id);

DROP INDEX IF EXISTS idx_user_condition_flags_user_id;

CREATE INDEX IF NOT EXISTS idx_user_condition_flags_role
ON user_condition_flags(role);