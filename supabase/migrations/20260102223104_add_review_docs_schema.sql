/*
  # Review Docs Schema Updates

  1. Changes to `condition_documents` table
    - Make `condition_id` nullable to support loan-level documents
    - Add `loan_id` column (uuid, nullable) for documents not linked to conditions
    - Add `document_type` column (text, nullable) for document classification
    - Add `description` column (text, nullable) for document description
    - Add `expiration_date` column (date, nullable) for document expiration
    - Add CHECK constraint ensuring either condition_id OR loan_id is present

  2. New Tables
    - `document_notes` - Notes specific to individual documents
      - `id` (uuid, primary key)
      - `document_id` (uuid, FK to condition_documents)
      - `author_name` (text)
      - `author_role` (text)
      - `content` (text)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on document_notes table
    - Add permissive policy matching existing tables

  4. Indexes
    - Index on loan_id for efficient lookups
    - Index on document_id for document_notes
*/

-- Make condition_id nullable
DO $$
BEGIN
  ALTER TABLE condition_documents ALTER COLUMN condition_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add loan_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'loan_id'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN loan_id uuid REFERENCES loans(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add document_type column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'document_type'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN document_type text;
  END IF;
END $$;

-- Add description column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'description'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN description text;
  END IF;
END $$;

-- Add expiration_date column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'expiration_date'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN expiration_date date;
  END IF;
END $$;

-- Add CHECK constraint ensuring either condition_id OR loan_id is present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'condition_documents_requires_parent'
  ) THEN
    ALTER TABLE condition_documents
    ADD CONSTRAINT condition_documents_requires_parent
    CHECK (condition_id IS NOT NULL OR loan_id IS NOT NULL);
  END IF;
END $$;

-- Create document_notes table
CREATE TABLE IF NOT EXISTS document_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES condition_documents(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_role text NOT NULL DEFAULT 'Processor',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on document_notes
ALTER TABLE document_notes ENABLE ROW LEVEL SECURITY;

-- Add permissive policy for document_notes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to document_notes'
  ) THEN
    CREATE POLICY "Allow all access to document_notes"
      ON document_notes FOR ALL
      TO authenticated, anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_condition_documents_loan ON condition_documents(loan_id);
CREATE INDEX IF NOT EXISTS idx_document_notes_document ON document_notes(document_id);