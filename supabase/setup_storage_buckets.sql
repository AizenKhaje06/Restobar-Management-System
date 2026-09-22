-- ============================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- Create storage buckets for image uploads
-- ============================================================

-- ============================================================
-- 1. CREATE STORAGE BUCKET FOR EVENT IMAGES
-- ============================================================

-- Create the bucket (run this in Supabase Dashboard Storage section)
-- Or use the SQL Editor:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,  -- Public access
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ============================================================
-- 2. STORAGE POLICIES FOR EVENT IMAGES
-- ============================================================

-- Allow public to view images
CREATE POLICY "Public Access for Event Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);

-- ============================================================
-- 3. CREATE FOLDER STRUCTURE (OPTIONAL)
-- These will be created automatically on first upload
-- But here's the recommended structure:
-- ============================================================

-- /event-images
--   /venues        (venue photos)
--   /packages      (package photos)
--   /gallery       (public gallery photos)
--   /events        (actual event photos)
--   /featured      (featured/hero images)

-- ============================================================
-- 4. VERIFY SETUP
-- ============================================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'event-images';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%event%';

-- ============================================================
-- 5. USAGE NOTES
-- ============================================================

-- Upload an image:
-- const { data, error } = await supabase.storage
--   .from('event-images')
--   .upload('venues/my-image.jpg', file)

-- Get public URL:
-- const { data } = supabase.storage
--   .from('event-images')
--   .getPublicUrl('venues/my-image.jpg')

-- Delete an image:
-- const { data, error } = await supabase.storage
--   .from('event-images')
--   .remove(['venues/my-image.jpg'])

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Storage bucket setup complete!';
  RAISE NOTICE '📁 Bucket: event-images';
  RAISE NOTICE '📸 Max file size: 5MB';
  RAISE NOTICE '🔒 Public read, authenticated write';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify bucket in Supabase Dashboard > Storage';
  RAISE NOTICE '2. Test upload from admin interface';
  RAISE NOTICE '3. Check image URLs are accessible';
END $$;
