/*
  # Fix Storage Bucket RLS Policies for Anonymous Access

  1. Problem
    - Storage bucket policies only allowed 'authenticated' role
    - Application uses anonymous access (anon key without user sign-in)
    - Uploads failed with "new row violates row-level security policy"

  2. Changes
    - Drop existing INSERT/UPDATE/DELETE policies for condition-documents bucket
    - Drop existing INSERT/UPDATE/DELETE policies for document-thumbnails bucket
    - Recreate all policies to allow both 'authenticated' AND 'anon' roles
    - SELECT policies remain unchanged (already allow public access)

  3. Security Notes
    - This matches the RLS pattern used for database tables in this application
    - Public read access was already enabled for document viewing
    - Write access now available to both authenticated and anonymous users
*/

-- Drop existing policies for condition-documents bucket
DROP POLICY IF EXISTS "Authenticated users can upload to condition-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update condition-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from condition-documents" ON storage.objects;

-- Drop existing policies for document-thumbnails bucket
DROP POLICY IF EXISTS "Authenticated users can upload to document-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update document-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from document-thumbnails" ON storage.objects;

-- Recreate INSERT policy for condition-documents with anon access
CREATE POLICY "Allow uploads to condition-documents"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'condition-documents');

-- Recreate UPDATE policy for condition-documents with anon access
CREATE POLICY "Allow updates to condition-documents"
ON storage.objects FOR UPDATE
TO authenticated, anon
USING (bucket_id = 'condition-documents')
WITH CHECK (bucket_id = 'condition-documents');

-- Recreate DELETE policy for condition-documents with anon access
CREATE POLICY "Allow deletes from condition-documents"
ON storage.objects FOR DELETE
TO authenticated, anon
USING (bucket_id = 'condition-documents');

-- Recreate INSERT policy for document-thumbnails with anon access
CREATE POLICY "Allow uploads to document-thumbnails"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'document-thumbnails');

-- Recreate UPDATE policy for document-thumbnails with anon access
CREATE POLICY "Allow updates to document-thumbnails"
ON storage.objects FOR UPDATE
TO authenticated, anon
USING (bucket_id = 'document-thumbnails')
WITH CHECK (bucket_id = 'document-thumbnails');

-- Recreate DELETE policy for document-thumbnails with anon access
CREATE POLICY "Allow deletes from document-thumbnails"
ON storage.objects FOR DELETE
TO authenticated, anon
USING (bucket_id = 'document-thumbnails');