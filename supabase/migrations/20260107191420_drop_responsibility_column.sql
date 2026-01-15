/*
  # Drop Responsibility Column

  This migration removes the responsibility field from the application entirely.

  1. Changes
    - Drops the `responsibility` column from the `conditions` table
    - Drops the `responsibility` column from the `available_conditions` table
    - Drops the `responsibility` column from the `custom_condition_templates` table

  2. Reason
    - The responsibility field is no longer needed in the application
    - This is a clean removal with no data migration required

  3. Affected Tables
    - conditions
    - available_conditions
    - custom_condition_templates
*/

ALTER TABLE conditions DROP COLUMN IF EXISTS responsibility;

ALTER TABLE available_conditions DROP COLUMN IF EXISTS responsibility;

ALTER TABLE custom_condition_templates DROP COLUMN IF EXISTS responsibility;