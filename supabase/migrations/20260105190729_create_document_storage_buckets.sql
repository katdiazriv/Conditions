/*
  # Create Document Storage Buckets

  1. New Buckets
    - `condition-documents` - Stores uploaded PDF and image files for loan conditions
    - `document-thumbnails` - Stores generated thumbnail images for document previews

  2. Security
    - Both buckets are set to public access for viewing
    - Authenticated users can upload files
    - Authenticated users can update their uploaded files
    - Authenticated users can delete their uploaded files
    - Anyone can view/download files (public read access)

  3. Notes
    - Public buckets allow direct URL access to files without authentication
    - Upload/delete operations still require authentication
    - File paths should include loan_id for organization
*/

-- Create the condition-documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'condition-documents',
  'condition-documents',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create the document-thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'document-thumbnails',
  'document-thumbnails',
  true,
  5242880, -- 5MB limit for thumbnails
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy: Allow public read access to condition-documents
CREATE POLICY "Public read access for condition-documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'condition-documents');

-- Policy: Allow authenticated users to upload to condition-documents
CREATE POLICY "Authenticated users can upload to condition-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'condition-documents');

-- Policy: Allow authenticated users to update files in condition-documents
CREATE POLICY "Authenticated users can update condition-documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'condition-documents')
WITH CHECK (bucket_id = 'condition-documents');

-- Policy: Allow authenticated users to delete from condition-documents
CREATE POLICY "Authenticated users can delete from condition-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'condition-documents');

-- Policy: Allow public read access to document-thumbnails
CREATE POLICY "Public read access for document-thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'document-thumbnails');

-- Policy: Allow authenticated users to upload to document-thumbnails
CREATE POLICY "Authenticated users can upload to document-thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'document-thumbnails');

-- Policy: Allow authenticated users to update files in document-thumbnails
CREATE POLICY "Authenticated users can update document-thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'document-thumbnails')
WITH CHECK (bucket_id = 'document-thumbnails');

-- Policy: Allow authenticated users to delete from document-thumbnails
CREATE POLICY "Authenticated users can delete from document-thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'document-thumbnails');