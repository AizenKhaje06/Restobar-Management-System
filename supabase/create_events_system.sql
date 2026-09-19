-- ============================================================
-- EVENT BOOKING SYSTEM - DATABASE SCHEMA
-- ============================================================
-- This creates all tables needed for the event booking system
-- integrated with the existing restaurant management system
-- ============================================================

-- ============================================================
-- 1. EVENT CUSTOMERS TABLE
-- ============================================================
-- Separate from staff profiles for security and clarity
CREATE TABLE IF NOT EXISTS event_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  date_of_birth DATE,
  company_name TEXT, -- For corporate bookings
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_customers_auth_id ON event_customers(auth_id);
CREATE INDEX IF NOT EXISTS idx_event_customers_email ON event_customers(email);

-- ============================================================
-- 2. EVENT VENUES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS event_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT, -- Indoor Hall, Outdoor Garden, Rooftop, etc.
  capacity_min INTEGER NOT NULL DEFAULT 10,
  capacity_max INTEGER NOT NULL DEFAULT 100,
  area_sqm DECIMAL(10,2), -- Area in square meters
  base_rate DECIMAL(10,2) NOT NULL, -- Base rental rate
  hourly_rate DECIMAL(10,2), -- Additional hourly rate
  amenities JSONB DEFAULT '[]'::JSONB, -- ["Air conditioning", "Stage", "Sound system"]
  photos JSONB DEFAULT '[]'::JSONB, -- Array of photo URLs
  floor_plan_url TEXT, -- Floor plan image
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_venues_active ON event_venues(is_active);

-- ============================================================
-- 3. EVENT PACKAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS event_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly name
  event_type TEXT NOT NULL, -- birthday, wedding, corporate, other
  description TEXT,
  short_description TEXT, -- For cards
  price_per_person DECIMAL(10,2), -- If per-person pricing
  base_price DECIMAL(10,2), -- If fixed pricing
  min_guests INTEGER DEFAULT 10,
  max_guests INTEGER DEFAULT 500,
  duration_hours INTEGER DEFAULT 4,
  
  -- What's included
  inclusions JSONB DEFAULT '[]'::JSONB,
  -- Example: [
  --   {"item": "Venue rental", "duration": "4 hours"},
  --   {"item": "Food buffet", "description": "Package A - 10 dishes"},
  --   {"item": "Table setup", "quantity": "10 tables"},
  --   {"item": "Basic decorations"}
  -- ]
  
  -- Available add-ons
  available_addons JSONB DEFAULT '[]'::JSONB,
  
  featured_image TEXT,
  gallery JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_packages_type ON event_packages(event_type);
CREATE INDEX IF NOT EXISTS idx_event_packages_active ON event_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_event_packages_slug ON event_packages(slug);

-- ============================================================
-- 4. EVENT MENU PACKAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS event_menu_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- buffet, plated, drinks, dessert
  description TEXT,
  price_per_person DECIMAL(10,2) NOT NULL,
  min_order INTEGER DEFAULT 50, -- Minimum number of pax
  
  -- Menu items included
  items JSONB DEFAULT '[]'::JSONB,
  -- Example: [
  --   {"name": "Grilled Chicken", "description": "..."},
  --   {"name": "Seafood Pasta", "description": "..."}
  -- ]
  
  dietary_info JSONB DEFAULT '{}'::JSONB, -- {"vegetarian": true, "halal": false}
  photo TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_menu_packages_category ON event_menu_packages(category);

-- ============================================================
-- 5. EVENT ADD-ONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS event_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- equipment, entertainment, decoration, food, service
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'item', -- item, hour, set, person
  photo TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_addons_category ON event_addons(category);

-- ============================================================
-- 6. EVENT BOOKINGS TABLE (Main)
-- ============================================================
CREATE TABLE IF NOT EXISTS event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL, -- AUTO: EVT-20240101-001
  
  -- Customer info
  customer_id UUID REFERENCES event_customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL, -- Denormalized for easy access
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Event details
  event_type TEXT NOT NULL, -- birthday, wedding, corporate, etc.
  event_name TEXT, -- "Maria's 18th Birthday", "Smith Wedding"
  event_date DATE NOT NULL,
  event_start_time TIME NOT NULL,
  event_end_time TIME NOT NULL,
  duration_hours DECIMAL(4,2),
  
  -- Venue & Capacity
  venue_id UUID REFERENCES event_venues(id),
  venue_name TEXT, -- Denormalized
  num_guests INTEGER NOT NULL,
  
  -- Package selection
  package_id UUID REFERENCES event_packages(id),
  package_name TEXT,
  
  -- Menu selection
  menu_package_id UUID REFERENCES event_menu_packages(id),
  menu_package_name TEXT,
  
  -- Customization
  decorations_theme TEXT,
  decorations_notes TEXT,
  seating_arrangement TEXT, -- "Round tables", "Theater style", "Classroom"
  special_requests TEXT,
  dietary_restrictions TEXT,
  
  -- Pricing breakdown
  venue_cost DECIMAL(10,2) DEFAULT 0,
  food_cost DECIMAL(10,2) DEFAULT 0,
  addons_cost DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  service_charge DECIMAL(10,2) DEFAULT 0, -- 10% service charge
  tax DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Payment tracking
  deposit_required DECIMAL(10,2), -- Usually 30-50%
  deposit_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2),
  total_paid DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending', -- pending, partial, paid, refunded
  payment_due_date DATE,
  
  -- Booking status
  status TEXT DEFAULT 'pending', 
  -- pending: awaiting admin confirmation
  -- confirmed: admin approved, awaiting payment
  -- paid: fully paid
  -- completed: event finished
  -- cancelled: booking cancelled
  
  -- Contract & Documents
  contract_url TEXT,
  contract_signed BOOLEAN DEFAULT FALSE,
  contract_signed_at TIMESTAMP WITH TIME ZONE,
  
  -- Administrative
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES profiles(id),
  
  confirmed_by UUID REFERENCES profiles(id), -- Staff who confirmed
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  notes TEXT, -- Internal admin notes
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_event_bookings_customer ON event_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_event_bookings_date ON event_bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_event_bookings_status ON event_bookings(status);
CREATE INDEX IF NOT EXISTS idx_event_bookings_venue ON event_bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_event_bookings_payment ON event_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_event_bookings_number ON event_bookings(booking_number);

-- ============================================================
-- 7. EVENT BOOKING ADD-ONS (Junction Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS event_booking_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES event_bookings(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES event_addons(id),
  addon_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_addons_booking ON event_booking_addons(booking_id);

-- ============================================================
-- 8. EVENT PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS event_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number TEXT UNIQUE NOT NULL, -- PAY-20240101-001
  booking_id UUID REFERENCES event_bookings(id) ON DELETE CASCADE,
  
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL, -- deposit, partial, full, refund
  payment_method TEXT NOT NULL, -- cash, bank_transfer, gcash, maya, card
  
  -- Payment proof
  reference_number TEXT,
  proof_url TEXT, -- Upload proof of payment
  
  status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_payments_booking ON event_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_event_payments_status ON event_payments(status);

-- ============================================================
-- 9. VENUE AVAILABILITY / BLOCKED DATES
-- ============================================================
CREATE TABLE IF NOT EXISTS venue_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES event_venues(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT, -- "Maintenance", "Private event", "Holiday"
  blocked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_blocked_venue ON venue_blocked_dates(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_blocked_date ON venue_blocked_dates(blocked_date);

-- ============================================================
-- 10. EVENT INQUIRIES (Pre-booking questions)
-- ============================================================
CREATE TABLE IF NOT EXISTS event_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_type TEXT,
  event_date DATE,
  num_guests INTEGER,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- new, responded, converted, closed
  responded_by UUID REFERENCES profiles(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_inquiries_status ON event_inquiries(status);

-- ============================================================
-- 11. EVENT REVIEWS (Post-event feedback)
-- ============================================================
CREATE TABLE IF NOT EXISTS event_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES event_bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES event_customers(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photos JSONB DEFAULT '[]'::JSONB,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_reviews_booking ON event_reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_approved ON event_reviews(is_approved);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_customers_updated_at
  BEFORE UPDATE ON event_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_venues_updated_at
  BEFORE UPDATE ON event_venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_packages_updated_at
  BEFORE UPDATE ON event_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_bookings_updated_at
  BEFORE UPDATE ON event_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE event_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reviews ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own data
CREATE POLICY "Customers can view own profile" ON event_customers
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Customers can update own profile" ON event_customers
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Customers can view own bookings" ON event_bookings
  FOR SELECT USING (
    customer_id IN (SELECT id FROM event_customers WHERE auth_id = auth.uid())
  );

CREATE POLICY "Customers can create bookings" ON event_bookings
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM event_customers WHERE auth_id = auth.uid())
  );

CREATE POLICY "Customers can view own payments" ON event_payments
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM event_bookings 
      WHERE customer_id IN (SELECT id FROM event_customers WHERE auth_id = auth.uid())
    )
  );

-- Staff (admin/pos) can see everything
CREATE POLICY "Staff can view all event data" ON event_customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pos')
    )
  );

CREATE POLICY "Staff can manage all bookings" ON event_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pos')
    )
  );

-- Public read access to venues, packages (for browsing)
ALTER TABLE event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_menu_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active venues" ON event_venues
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view active packages" ON event_packages
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view active menu packages" ON event_menu_packages
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view active addons" ON event_addons
  FOR SELECT USING (is_active = TRUE);

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================

-- Sample Venues
INSERT INTO event_venues (name, description, location, capacity_min, capacity_max, base_rate, amenities, photos) VALUES
('Grand Hall', 'Our largest indoor venue with elegant chandeliers and climate control', 'Indoor - Ground Floor', 100, 300, 50000, 
 '["Air conditioning", "Stage", "Sound system", "LED wall", "Dressing room"]'::JSONB,
 '["https://example.com/hall1.jpg", "https://example.com/hall2.jpg"]'::JSONB),
 
('Garden Pavilion', 'Beautiful outdoor space surrounded by lush gardens', 'Outdoor - Garden Area', 50, 150, 35000,
 '["Garden view", "Fairy lights", "Gazebo", "Natural ambiance"]'::JSONB,
 '["https://example.com/garden1.jpg"]'::JSONB),
 
('Rooftop Deck', 'Modern rooftop venue with city skyline views', 'Rooftop - 5th Floor', 30, 100, 40000,
 '["City view", "Sunset view", "Bar counter", "Lounge area"]'::JSONB,
 '["https://example.com/rooftop1.jpg"]'::JSONB);

-- Sample Event Packages
INSERT INTO event_packages (name, slug, event_type, description, short_description, price_per_person, min_guests, max_guests, duration_hours, inclusions, is_featured) VALUES
('Kids Birthday Bash', 'kids-birthday-bash', 'birthday', 'Perfect package for children''s birthday parties with fun decorations and kid-friendly menu', 'Fun-filled party for kids', 500, 20, 50, 4,
 '[{"item": "Venue rental", "duration": "4 hours"}, {"item": "Balloon decorations"}, {"item": "Kids food package"}, {"item": "Birthday cake"}, {"item": "Party host"}]'::JSONB, TRUE),

('Debut Package', 'debut-package', 'birthday', 'Elegant 18th birthday celebration package with complete setup', 'Make her 18th birthday memorable', 1500, 80, 150, 6,
 '[{"item": "Venue rental", "duration": "6 hours"}, {"item": "Elegant decorations"}, {"item": "Buffet dinner"}, {"item": "Cake and dessert table"}, {"item": "Sound system"}]'::JSONB, TRUE),

('Intimate Wedding', 'intimate-wedding', 'wedding', 'Perfect for small, intimate wedding ceremonies and receptions', 'Small wedding package', 2000, 50, 100, 8,
 '[{"item": "Venue rental", "duration": "8 hours"}, {"item": "Wedding decorations"}, {"item": "Buffet dinner"}, {"item": "Wedding cake"}, {"item": "Bridal suite"}]'::JSONB, TRUE);

-- Sample Menu Packages
INSERT INTO event_menu_packages (name, category, description, price_per_person, min_order, items) VALUES
('Classic Filipino Buffet', 'buffet', '10-dish Filipino feast perfect for any celebration', 500, 50,
 '[{"name": "Pancit Canton"}, {"name": "Lechon Kawali"}, {"name": "Chicken Inasal"}, {"name": "Beef Caldereta"}]'::JSONB),

('Premium International', 'buffet', '15-dish international buffet spread', 750, 50,
 '[{"name": "Roast Beef"}, {"name": "Grilled Salmon"}, {"name": "Pasta Station"}, {"name": "Caesar Salad"}]'::JSONB);

-- Sample Add-ons
INSERT INTO event_addons (name, category, description, price, unit) VALUES
('Professional Sound System', 'equipment', 'Premium sound system with microphones', 5000, 'set'),
('LED Wall Backdrop', 'equipment', '3m x 2m LED video wall', 15000, 'set'),
('Photo Booth', 'entertainment', '3-hour photo booth rental with props', 8000, 'set'),
('Live Band', 'entertainment', '3-hour live band performance', 25000, 'set'),
('Flower Arrangements', 'decoration', 'Premium flower centerpieces', 3000, 'set'),
('Lechon', 'food', 'Whole roasted pig', 12000, 'item');

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$ 
BEGIN 
  RAISE NOTICE 'Event Booking System database schema created successfully!';
  RAISE NOTICE 'Tables created: 11';
  RAISE NOTICE 'RLS policies enabled for security';
  RAISE NOTICE 'Sample data inserted for testing';
END $$;
