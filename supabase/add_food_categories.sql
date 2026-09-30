-- ============================================================
-- ADD FOOD BUNDLE CATEGORIES TO EXISTING CATEGORIES TABLE
-- ============================================================
-- Add new food bundle categories for 2+ person meals
-- These will be used in menu_items table via category_id FK
-- ============================================================

-- Temporarily modify the log function to allow NULL changed_by
CREATE OR REPLACE FUNCTION log_content_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO content_updates_log (content_type, content_id, action, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP::text,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid) -- Use dummy UUID if no auth context
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert Food Bundle Categories
INSERT INTO categories (name, description, image_url, sort_order, is_active) VALUES

('Lechon', 
 'Our signature crispy lechon - perfect for celebrations and gatherings. Available in whole, half, or quarter sizes.', 
 '/placeholder.jpg', 
 1, 
 TRUE),

('Quick Meals', 
 'Ready-to-eat Filipino favorites perfect for small groups. No preparation needed, just heat and serve.', 
 '/placeholder.jpg', 
 2, 
 TRUE),

('Party Trays', 
 'Large serving trays of Filipino dishes good for parties and gatherings. Choose from our variety of viands.', 
 '/placeholder.jpg', 
 3, 
 TRUE),

('Lechon-In-A-Box', 
 'Convenient single-serving lechon boxes with rice and sides. Perfect for events and office gatherings.', 
 '/placeholder.jpg', 
 4, 
 TRUE),

('Lydia''s Family Boxes', 
 'Complete meal packages for families. Includes viands, rice, and sides - perfect for 4-6 persons.', 
 '/placeholder.jpg', 
 5, 
 TRUE),

('Promo Deals', 
 'Special promotional bundles and limited-time offers. Check our current deals and save on your favorites.', 
 '/placeholder.jpg', 
 6, 
 TRUE),

('Bento Box', 
 'Japanese-inspired individual meal boxes with a Filipino twist. Perfect for solo diners or small groups.', 
 '/placeholder.jpg', 
 7, 
 TRUE)

ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SAMPLE MENU ITEMS FOR EACH CATEGORY
-- ============================================================
-- You can add actual menu items with prices later
-- Example structure:
/*
INSERT INTO menu_items (category_id, name, description, price, is_available)
SELECT 
  id as category_id,
  'Whole Lechon (8-10kg)' as name,
  'Serves 15-20 persons. Crispy skin, juicy meat.' as description,
  2500.00 as price,
  TRUE as is_available
FROM categories 
WHERE name = 'Lechon'
LIMIT 1;
*/

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- Run this to verify the new categories were added:
-- SELECT id, name, description, sort_order, is_active 
-- FROM categories 
-- WHERE name IN ('Lechon', 'Quick Meals', 'Party Trays', 'Lechon-In-A-Box', 
--                'Lydia''s Family Boxes', 'Promo Deals', 'Bento Box')
-- ORDER BY sort_order;
