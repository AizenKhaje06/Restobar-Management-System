-- =====================================================
-- ADD RLS POLICIES FOR GALLERY ACCESS
-- Grant landing_page_manager access to event_gallery
-- =====================================================

-- Enable RLS on event_gallery table
ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Landing page managers can view gallery" ON event_gallery;
DROP POLICY IF EXISTS "Landing page managers can manage gallery" ON event_gallery;

-- Landing page managers can view all gallery images
CREATE POLICY "Landing page managers can view gallery"
ON event_gallery FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'landing_page_manager'
  )
);

-- Landing page managers can manage gallery images
CREATE POLICY "Landing page managers can manage gallery"
ON event_gallery FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'landing_page_manager'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'landing_page_manager'
  )
);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'event_gallery'
AND policyname LIKE '%Landing page managers%'
ORDER BY policyname;
