-- ============================================================
-- CRITICAL FIXES MIGRATION
-- Adds missing tables and columns referenced in the codebase
-- Run this in Supabase SQL Editor immediately
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CREATE TABLE_SESSIONS TABLE
-- Required for customer QR ordering flow
-- ============================================================
CREATE TABLE IF NOT EXISTS public.table_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  access_code text NOT NULL CHECK (access_code ~ '^\d{4}$'),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  closed_reason text CHECK (closed_reason IN ('paid', 'cancelled', 'timeout')),
  closed_at timestamptz,
  closed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for table_sessions
CREATE INDEX IF NOT EXISTS idx_table_sessions_table ON public.table_sessions(table_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_token ON public.table_sessions(token);
CREATE INDEX IF NOT EXISTS idx_table_sessions_status ON public.table_sessions(status);
CREATE INDEX IF NOT EXISTS idx_table_sessions_created ON public.table_sessions(created_at DESC);

-- Enable RLS on table_sessions
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for table_sessions
CREATE POLICY "sessions_read_public" ON public.table_sessions 
  FOR SELECT USING (true);

CREATE POLICY "sessions_create_public" ON public.table_sessions 
  FOR INSERT WITH CHECK (
    customer_name IS NOT NULL 
    AND access_code ~ '^\d{4}$'
  );

CREATE POLICY "sessions_staff_manage" ON public.table_sessions 
  FOR ALL USING (public.is_staff());

-- ============================================================
-- 2. ADD MISSING COLUMN: profiles.username
-- Required for username-based authentication
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Add constraint to ensure username format
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS username_format;
ALTER TABLE public.profiles ADD CONSTRAINT username_format 
  CHECK (username IS NULL OR (username ~ '^[a-z0-9_]{3,20}$'));

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Update RLS policy to allow username lookups during login
DROP POLICY IF EXISTS "profiles_username_lookup" ON public.profiles;
CREATE POLICY "profiles_username_lookup" ON public.profiles 
  FOR SELECT USING (true);  -- Allow public username->email lookup for login

-- ============================================================
-- 3. ADD MISSING COLUMNS: orders table extensions
-- Required for additional orders, waiter assignments, and session tracking
-- ============================================================

-- Add order_type column (initial vs additional orders)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'initial';
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS order_type_check;
ALTER TABLE public.orders ADD CONSTRAINT order_type_check 
  CHECK (order_type IN ('initial', 'additional'));

-- Add parent_order_id for linking additional orders to initial order
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS parent_order_id uuid;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS fk_parent_order;
ALTER TABLE public.orders ADD CONSTRAINT fk_parent_order 
  FOREIGN KEY (parent_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- Add assisted_by to track which waiter helped with the order
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS assisted_by uuid;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS fk_assisted_by;
ALTER TABLE public.orders ADD CONSTRAINT fk_assisted_by 
  FOREIGN KEY (assisted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add is_notified flag for additional order notifications
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_notified boolean NOT NULL DEFAULT true;

-- Add session_id to link orders to table sessions
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS session_id text;

-- Indexes for new order columns
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON public.orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_parent ON public.orders(parent_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_type ON public.orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_assisted ON public.orders(assisted_by);
CREATE INDEX IF NOT EXISTS idx_orders_notified ON public.orders(is_notified) WHERE is_notified = false;

-- ============================================================
-- 4. ADD PERFORMANCE INDEXES
-- Critical indexes for frequently queried data
-- Note: Using regular CREATE INDEX (not CONCURRENTLY) inside transaction
-- Note: Avoiding DATE() function expressions due to immutability requirements
-- ============================================================

-- Order items by date (for analytics)
CREATE INDEX IF NOT EXISTS idx_order_items_created 
  ON public.order_items(created_at DESC);

-- Menu items by category and availability (for customer menu)
CREATE INDEX IF NOT EXISTS idx_menu_items_cat_avail 
  ON public.menu_items(category_id, is_available) 
  WHERE is_available = true;

-- Orders by created_at (for date range queries)
-- Using timestamptz instead of DATE() expression for compatibility
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON public.orders(created_at DESC);

-- Activity logs by action and date
CREATE INDEX IF NOT EXISTS idx_activity_action_date 
  ON public.activity_logs(action, created_at DESC);

-- Reservations by reserved_at (for date range queries)
-- Using timestamptz instead of DATE() expression for compatibility
CREATE INDEX IF NOT EXISTS idx_reservations_reserved_at_status 
  ON public.reservations(reserved_at DESC, status);

-- ============================================================
-- 5. ADD DATA VALIDATION CONSTRAINTS
-- Ensure data integrity at database level
-- ============================================================

-- Email validation for profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_email;
ALTER TABLE public.profiles ADD CONSTRAINT valid_email 
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- Phone validation (international format)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_phone;
ALTER TABLE public.profiles ADD CONSTRAINT valid_phone 
  CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{10,13}$');

-- Price must be reasonable
ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS reasonable_price;
ALTER TABLE public.menu_items ADD CONSTRAINT reasonable_price 
  CHECK (price >= 1 AND price <= 100000);

-- Party size limits for reservations
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reasonable_party_size;
ALTER TABLE public.reservations ADD CONSTRAINT reasonable_party_size 
  CHECK (party_size >= 1 AND party_size <= 50);

-- Order quantities must be reasonable
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS reasonable_quantity;
ALTER TABLE public.order_items ADD CONSTRAINT reasonable_quantity 
  CHECK (quantity >= 1 AND quantity <= 100);

-- ============================================================
-- 6. UPDATE RLS POLICIES
-- Fix security issues in existing policies
-- ============================================================

-- Fix insecure reservation policy
DROP POLICY IF EXISTS "reservations_public_insert" ON public.reservations;
CREATE POLICY "reservations_public_insert" ON public.reservations 
  FOR INSERT WITH CHECK (
    customer_name IS NOT NULL 
    AND (customer_phone IS NOT NULL OR customer_email IS NOT NULL)
    AND party_size BETWEEN 1 AND 50
    AND reserved_at > now()
  );

-- Update orders policy to properly validate session access
DROP POLICY IF EXISTS "orders_customer_read" ON public.orders;
CREATE POLICY "orders_customer_read" ON public.orders 
  FOR SELECT USING (
    public.is_staff()
    OR EXISTS (
      SELECT 1 FROM public.table_sessions 
      WHERE id::text = orders.session_id::text
        AND status = 'active'
    )
  );

-- Allow customers to create orders via their session
DROP POLICY IF EXISTS "orders_session_write" ON public.orders;
CREATE POLICY "orders_session_write" ON public.orders 
  FOR INSERT WITH CHECK (
    public.is_staff()
    OR (
      session_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.table_sessions ts
        WHERE ts.id::text = orders.session_id::text
          AND ts.status = 'active'
      )
    )
  );

-- ============================================================
-- 7. ADD HELPFUL DATABASE FUNCTIONS
-- Utility functions for common operations
-- ============================================================

-- Get active orders count for a table
CREATE OR REPLACE FUNCTION get_table_active_orders(p_table_id uuid)
RETURNS int AS $$
  SELECT COUNT(*)::int
  FROM public.orders
  WHERE table_id = p_table_id
    AND status NOT IN ('completed', 'cancelled')
    AND payment_status != 'paid';
$$ LANGUAGE sql STABLE;

-- Get revenue for date range
CREATE OR REPLACE FUNCTION get_revenue(p_start_date date, p_end_date date)
RETURNS numeric AS $$
  SELECT COALESCE(SUM(total), 0)
  FROM public.orders
  WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date
    AND payment_status = 'paid';
$$ LANGUAGE sql STABLE;

-- Get top selling items for date range
CREATE OR REPLACE FUNCTION get_top_items(
  p_start_date date, 
  p_end_date date, 
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  item_name text,
  total_quantity bigint,
  total_revenue numeric
) AS $$
  SELECT 
    oi.name,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.quantity * oi.unit_price) as total_revenue
  FROM public.order_items oi
  INNER JOIN public.orders o ON oi.order_id = o.id
  WHERE DATE(o.created_at) BETWEEN p_start_date AND p_end_date
    AND o.payment_status = 'paid'
  GROUP BY oi.name
  ORDER BY total_quantity DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- Get session summary (total orders, items, amount)
CREATE OR REPLACE FUNCTION get_session_summary(p_session_id text)
RETURNS TABLE (
  order_count int,
  item_count bigint,
  total_amount numeric
) AS $$
  SELECT 
    COUNT(DISTINCT o.id)::int as order_count,
    SUM(oi.quantity) as item_count,
    SUM(o.total) as total_amount
  FROM public.orders o
  LEFT JOIN public.order_items oi ON oi.order_id = o.id
  WHERE o.session_id::text = p_session_id::text
    AND o.status != 'cancelled';
$$ LANGUAGE sql STABLE;

-- ============================================================
-- 8. GRANT PERMISSIONS
-- Ensure functions can be called by authenticated users
-- ============================================================
GRANT EXECUTE ON FUNCTION get_table_active_orders(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_revenue(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_items(date, date, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_session_summary(text) TO authenticated, anon;

COMMIT;

-- ============================================================
-- VERIFICATION QUERIES
-- Run these after migration to verify success
-- ============================================================

-- Check table_sessions exists and is empty
-- SELECT COUNT(*) as session_count FROM public.table_sessions;

-- Check profiles.username column exists
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'username';

-- Check orders new columns exist
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'orders' AND column_name IN ('order_type', 'parent_order_id', 'assisted_by', 'is_notified', 'session_id');

-- Test helper functions
-- SELECT get_revenue(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE);
-- SELECT * FROM get_top_items(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, 5);
