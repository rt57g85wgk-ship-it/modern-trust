-- SQL script to add landlord contact columns to the 'users' table and setup storage policies in Supabase.
-- Please execute this SQL command in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mlmpopgfrwjdbitkxvzt/sql/new

-- 1. Add Landlord Contact Columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_qr_url TEXT;

-- 2. Create 'qr-codes' Storage Bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Setup Row-Level Security (RLS) policies for storage.objects on 'qr-codes'
DROP POLICY IF EXISTS "Allow public SELECT to qr-codes" ON storage.objects;
CREATE POLICY "Allow public SELECT to qr-codes"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-codes');

DROP POLICY IF EXISTS "Allow authenticated INSERT to owner folder in qr-codes" ON storage.objects;
CREATE POLICY "Allow authenticated INSERT to owner folder in qr-codes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'qr-codes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Allow authenticated UPDATE to owner folder in qr-codes" ON storage.objects;
CREATE POLICY "Allow authenticated UPDATE to owner folder in qr-codes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'qr-codes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Allow authenticated DELETE to owner folder in qr-codes" ON storage.objects;
CREATE POLICY "Allow authenticated DELETE to owner folder in qr-codes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'qr-codes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
