/*
  # Add Suspend Stage Support

  1. Overview
    - Documents the addition of "Suspend" as a valid stage value for conditions
    - The stage column is already type text, so no schema changes are required
    - Suspend will appear first in stage ordering when conditions are suspended

  2. Stage Values
    - Suspend (new) - Conditions that have been temporarily suspended
    - Prior to Docs - Conditions required before document preparation
    - Prior to Funding - Conditions required before funding
    - Prior to Purchase - Conditions required before purchase
    - Post Funding - Conditions required after funding
    - Trailing Docs - Trailing documentation conditions

  3. Notes
    - Suspended conditions will be displayed with a light red background (#FFF5F5)
    - This is a documentation-only migration as the stage column accepts any text value
*/

SELECT 1;
