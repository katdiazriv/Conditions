/*
  # Make user_id nullable in user_condition_flags

  This migration allows role-based condition flags to be stored without
  requiring a user_id. The application now identifies flags by role rather
  than individual user, so user_id is no longer required.

  1. Changes
    - ALTER user_condition_flags.user_id to DROP NOT NULL constraint
    
  2. Notes
    - Existing records with user_id values remain unchanged
    - New records can now be inserted with NULL user_id when using role-based flags
*/

ALTER TABLE user_condition_flags ALTER COLUMN user_id DROP NOT NULL;
