/*
  # Create Email History Table

  This migration creates a table to store sent email records for document requests and reminders.
  This table will be used by the future email history feature to display past communications.

  1. New Tables
    - `email_history`
      - `id` (uuid, primary key) - Unique identifier for each email record
      - `loan_id` (uuid) - Reference to the associated loan
      - `email_type` (text) - Type of email: 'doc_request', 'reminder', etc.
      - `from_email` (text) - Sender email address
      - `from_name` (text) - Sender display name
      - `to_emails` (jsonb) - Array of recipient email addresses
      - `cc_emails` (jsonb) - Array of CC email addresses
      - `subject` (text) - Email subject line
      - `template_name` (text) - Name of the template used
      - `intro_content` (text) - Intro paragraph content
      - `body_html` (text) - Full rendered HTML email body
      - `doc_request_ids` (jsonb) - Array of doc request IDs included in email
      - `sent_at` (timestamptz) - When the email was sent
      - `sent_by_user_id` (uuid) - User who sent the email (for future auth)
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `email_history` table
    - Add policy for authenticated users to read email history
    - Add policy for authenticated users to insert email records

  3. Indexes
    - Index on loan_id for efficient queries by loan
    - Index on sent_at for chronological sorting
*/

CREATE TABLE IF NOT EXISTS email_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL,
  email_type text NOT NULL DEFAULT 'doc_request',
  from_email text NOT NULL,
  from_name text,
  to_emails jsonb NOT NULL DEFAULT '[]'::jsonb,
  cc_emails jsonb NOT NULL DEFAULT '[]'::jsonb,
  subject text NOT NULL,
  template_name text,
  intro_content text,
  body_html text NOT NULL,
  doc_request_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  sent_at timestamptz NOT NULL DEFAULT now(),
  sent_by_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read email history"
  ON email_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert email history records"
  ON email_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_email_history_loan_id ON email_history(loan_id);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_at ON email_history(sent_at DESC);