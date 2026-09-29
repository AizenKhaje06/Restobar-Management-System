-- =====================================================
-- LANDING PAGE MANAGER SYSTEM
-- Separate role for managing website content, bookings, and customer orders
-- =====================================================

-- Add new role to roles table if not exists
INSERT INTO public.roles (id, label, description)
VALUES ('landing_page_manager', 'Landing Page Manager', 'Manages website content, online orders, and event bookings')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- LANDING PAGE SETTINGS TABLE
-- Store configurable settings for the landing page
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_page_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Business Information
  business_name text DEFAULT 'Lydia''s Lechon',
  tagline text DEFAULT '60 Years of Bringing Filipino Flavors to Life',
  about_text text,
  
  -- Contact Information
  phone text,
  email text,
  address text,
  
  -- Business Hours
  business_hours jsonb DEFAULT '{
    "monday": {"open": "10:00", "close": "22:00", "closed": false},
    "tuesday": {"open": "10:00", "close": "22:00", "closed": false},
    "wednesday": {"open": "10:00", "close": "22:00", "closed": false},
    "thursday": {"open": "10:00", "close": "22:00", "closed": false},
    "friday": {"open": "10:00", "close": "22:00", "closed": false},
    "saturday": {"open": "10:00", "close": "23:00", "closed": false},
    "sunday": {"open": "10:00", "close": "21:00", "closed": false}
  }'::jsonb,
  
  -- Social Media Links
  facebook_url text,
  instagram_url text,
  twitter_url text,
  youtube_url text,
  
  -- Hero Section
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  hero_video_url text,
  
  -- Features Toggle
  enable_online_ordering boolean DEFAULT true,
  enable_event_booking boolean DEFAULT true,
  enable_table_reservation boolean DEFAULT true,
  
  -- SEO
  meta_title text,
  meta_description text,
  meta_keywords text[],
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO landing_page_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ONLINE ORDERS TABLE
-- Track customer orders from the landing page
-- =====================================================
CREATE TABLE IF NOT EXISTS online_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  
  -- Customer Information
  customer_id uuid REFERENCES event_customers(id),
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  
  -- Order Details
  items jsonb NOT NULL, -- Array of {item_id, name, quantity, price, addons}
  subtotal decimal(10,2) NOT NULL,
  delivery_fee decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  
  -- Delivery/Pickup
  order_type text CHECK (order_type IN ('delivery', 'pickup')) DEFAULT 'delivery',
  delivery_address text,
  delivery_notes text,
  scheduled_time timestamptz,
  
  -- Status
  status text CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled')) DEFAULT 'pending',
  payment_status text CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  payment_method text CHECK (payment_method IN ('cash', 'gcash', 'card', 'bank_transfer')),
  
  -- Tracking
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  
  -- Manager Assignment
  assigned_to uuid REFERENCES profiles(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_online_orders_customer ON online_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_online_orders_status ON online_orders(status);
CREATE INDEX IF NOT EXISTS idx_online_orders_created ON online_orders(created_at DESC);

-- =====================================================
-- CUSTOMER REVIEWS TABLE
-- Store customer feedback and reviews
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer
  customer_id uuid REFERENCES event_customers(id),
  customer_name text NOT NULL,
  
  -- Review Details
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text text,
  
  -- Related Order (optional)
  order_id uuid REFERENCES online_orders(id),
  
  -- Moderation
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  is_featured boolean DEFAULT false,
  
  -- Response
  admin_response text,
  responded_at timestamptz,
  responded_by uuid REFERENCES profiles(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_rating ON customer_reviews(rating);

-- =====================================================
-- CONTENT UPDATES LOG
-- Track changes made to landing page content
-- =====================================================
CREATE TABLE IF NOT EXISTS content_updates_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What was changed
  content_type text NOT NULL, -- 'menu_item', 'venue', 'package', 'settings', etc.
  content_id uuid,
  action text CHECK (action IN ('create', 'update', 'delete')) NOT NULL,
  
  -- Changes
  old_data jsonb,
  new_data jsonb,
  
  -- Who changed it
  changed_by uuid REFERENCES profiles(id) NOT NULL,
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_log_type ON content_updates_log(content_type);
CREATE INDEX IF NOT EXISTS idx_content_log_user ON content_updates_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_content_log_created ON content_updates_log(created_at DESC);

-- =====================================================
-- RLS POLICIES - LANDING PAGE MANAGER ACCESS
-- =====================================================

-- Landing Page Settings
ALTER TABLE landing_page_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landing page managers can view settings"
  ON landing_page_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'landing_page_manager')
    )
  );

CREATE POLICY "Landing page managers can update settings"
  ON landing_page_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'landing_page_manager')
    )
  );

-- Online Orders
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landing page managers can view all orders"
  ON online_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'landing_page_manager')
    )
  );

CREATE POLICY "Landing page managers can update orders"
  ON online_orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'landing_page_manager')
    )
  );

CREATE POLICY "Customers can view their own orders"
  ON online_orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Customer Reviews
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON customer_reviews FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Landing page managers can manage reviews"
  ON customer_reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'landing_page_manager')
    )
  );

-- Content Updates Log
ALTER TABLE content_updates_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landing page managers can view content logs"
  ON content_updates_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'landing_page_manager')
    )
  );

-- =====================================================
-- FUNCTIONS FOR LANDING PAGE MANAGER
-- =====================================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  -- Get count of orders today
  SELECT COUNT(*) + 1 INTO counter
  FROM online_orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Format: ORD-YYYYMMDD-####
  new_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to log content updates
CREATE OR REPLACE FUNCTION log_content_update()
RETURNS trigger AS $$
BEGIN
  INSERT INTO content_updates_log (
    content_type,
    content_id,
    action,
    old_data,
    new_data,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP::text,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers to track content changes
CREATE TRIGGER log_menu_items_changes
  AFTER INSERT OR UPDATE OR DELETE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION log_content_update();

CREATE TRIGGER log_event_venues_changes
  AFTER INSERT OR UPDATE OR DELETE ON event_venues
  FOR EACH ROW EXECUTE FUNCTION log_content_update();

CREATE TRIGGER log_event_packages_changes
  AFTER INSERT OR UPDATE OR DELETE ON event_packages
  FOR EACH ROW EXECUTE FUNCTION log_content_update();

-- =====================================================
-- VIEWS FOR LANDING PAGE MANAGER DASHBOARD
-- =====================================================

-- Daily Orders Summary
CREATE OR REPLACE VIEW daily_orders_summary AS
SELECT
  DATE(created_at) as order_date,
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
  SUM(total_amount) as total_revenue,
  SUM(total_amount) FILTER (WHERE status = 'completed') as completed_revenue
FROM online_orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Popular Menu Items (from online orders)
CREATE OR REPLACE VIEW popular_menu_items AS
SELECT
  item->>'item_id' as item_id,
  item->>'name' as item_name,
  COUNT(*) as order_count,
  SUM((item->>'quantity')::integer) as total_quantity_sold
FROM online_orders,
  jsonb_array_elements(items) as item
WHERE status = 'completed'
GROUP BY item->>'item_id', item->>'name'
ORDER BY total_quantity_sold DESC;

-- Customer Order History
CREATE OR REPLACE VIEW customer_order_history AS
SELECT
  ec.id as customer_id,
  ec.full_name,
  ec.email,
  ec.phone,
  COUNT(oo.id) as total_orders,
  SUM(oo.total_amount) as total_spent,
  MAX(oo.created_at) as last_order_date
FROM event_customers ec
LEFT JOIN online_orders oo ON ec.id = oo.customer_id
GROUP BY ec.id, ec.full_name, ec.email, ec.phone;

COMMENT ON TABLE landing_page_settings IS 'Configurable settings for the landing page';
COMMENT ON TABLE online_orders IS 'Customer orders from the landing page';
COMMENT ON TABLE customer_reviews IS 'Customer feedback and reviews';
COMMENT ON TABLE content_updates_log IS 'Audit log for content changes';
