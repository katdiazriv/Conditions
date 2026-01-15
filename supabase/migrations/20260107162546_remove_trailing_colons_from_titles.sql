/*
  # Remove Trailing Colons from Condition Titles

  This migration removes the trailing colon character from all condition titles
  in both the available_conditions and conditions tables.

  ## Changes Made

  1. **available_conditions table**
     - Updates the `title` column to remove trailing colons
     - Affects template conditions used when adding new conditions to loans

  2. **conditions table**
     - Updates the `title` column to remove trailing colons
     - Affects existing conditions that have already been added to loans

  ## Rationale

  The colon is being moved from the data to the presentation layer.
  This allows the display logic to add the colon programmatically only
  where contextually appropriate (e.g., when title and description are
  displayed inline together).

  ## Notes

  - Custom condition templates are NOT affected by this migration
  - Uses RTRIM to safely remove only trailing colons
  - Only updates rows where the title actually ends with a colon
*/

UPDATE available_conditions
SET title = RTRIM(title, ':')
WHERE title LIKE '%:';

UPDATE conditions
SET title = RTRIM(title, ':')
WHERE title LIKE '%:';
