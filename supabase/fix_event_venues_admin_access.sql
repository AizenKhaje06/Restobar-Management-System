-- ============================================================
-- FIX: Add Admin Access Policies for Event Venues Management
-- ============================================================
-- This adds the missing RLS policies so admins can manage venues
-- ============================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admin can manage all venues" ON event_venues;
DROP POLICY IF EXISTS "Admin can manage all packages" ON event_packages;
DROP POLICY IF EXISTS "Admin can manage all menu packages" ON event_menu_packages;
DROP POLICY IF EXISTS "Admin can manage all addons" ON event_addons;

-- ============================================================
-- VENUE POLICIES
-- ============================================================

-- Admin can do everything with venues (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admin can manage all venues" ON event_venues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pos')
    )
  );

-- ============================================================
-- PACKAGE POLICIES
-- ============================================================

-- Admin can do everything with packages
CREATE POLICY "Admin can manage all packages" ON event_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pos')
    )
  );

-- ============================================================
-- MENU PACKAGE POLICIES
-- ============================================================

-- Admin can do everything with menu packages
CREATE POLICY "Admin can manage all menu packages" ON event_menu_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pos')
    )
  );

-- ============================================================
-- ADDON POLICIES
-- ============================================================

-- Admin can do everything with addons
CREATE POLICY "Admin can manage all addons" ON event_addons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pos')
    )
  );

-- ============================================================
-- VERIFICATION
-- ============================================================

-- List all policies for these tables
DO $$ 
BEGIN 
  RAISE NOTICE '=== RLS Policies Updated Successfully ===';
  RAISE NOTICE 'Admin users can now manage:';
  RAISE NOTICE '  - Event Venues (all operations)';
  RAISE NOTICE '  - Event Packages (all operations)';
  RAISE NOTICE '  - Menu Packages (all operations)';
  RAISE NOTICE '  - Event Add-ons (all operations)';
  RAISE NOTICE '';
  RAISE NOTICE 'Public users can still:';
  RAISE NOTICE '  - View active venues';
  RAISE NOTICE '  - View active packages';
  RAISE NOTICE '  - View active menu packages';
  RAISE NOTICE '  - View active addons';
END $$;
