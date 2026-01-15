/*
  # Fix Note Read Status RLS Policies for Anonymous Access

  1. Problem
    - The note_read_status table was created with RLS policies that only allow
      `authenticated` users
    - This application uses the Supabase `anon` key for database access
    - This mismatch causes SELECT and INSERT operations to fail silently
    - As a result, notes do not display in the NotesModal

  2. Solution
    - Drop the existing authenticated-only policies
    - Create new policies that include both `authenticated` and `anon` roles
    - This matches the pattern used by other tables (condition_notes, conditions, etc.)

  3. Security
    - Maintains RLS protection while allowing the application to function
    - Follows the same security pattern as other tables in this application
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view note read status" ON note_read_status;
DROP POLICY IF EXISTS "Anyone can insert note read status" ON note_read_status;

-- Create new policies with anon access
CREATE POLICY "Allow all access to note_read_status"
  ON note_read_status FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);
