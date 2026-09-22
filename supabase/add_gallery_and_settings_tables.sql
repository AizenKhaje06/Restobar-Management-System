-- ============================================================
-- EVENT GALLERY TABLE
-- For managing photos shown in public gallery page
-- ============================================================
CREATE TABLE IF NOT EXISTS event_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  title TEXT,
  category TEXT NOT NULL DEFAULT 'venue', -- 'venue', 'event', 'all'
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_gallery_category ON event_gallery(category);
CREATE INDEX IF NOT EXISTS idx_event_gallery_sort ON event_gallery(sort_order);

-- RLS Policies
ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view gallery photos"
  ON event_gallery FOR SELECT
  USING (true);

-- Admin write access (requires authentication check)
CREATE POLICY "Authenticated users can manage gallery"
  ON event_gallery FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================
-- EVENT SETTINGS TABLE
-- Single row for global event system settings
-- ============================================================
CREATE TABLE IF NOT EXISTS event_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  -- Contact Information
  business_name TEXT DEFAULT 'Lydia''s Restobar & Events',
  email TEXT DEFAULT 'events@lydias.com',
  phone TEXT DEFAULT '+63 123 456 7890',
  address TEXT DEFAULT 'Main Street, City, Province',
  
  -- Social Media
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  
  -- Google Maps
  google_maps_embed TEXT,
  google_maps_link TEXT,
  
  -- Homepage Content (JSON)
  homepage_content JSONB DEFAULT '{}'::JSONB,
  -- Example structure:
  -- {
  --   "hero": {
  --     "title": "...",
  --     "subtitle": "...",
  --     "cta_primary": "...",
  --     "cta_secondary": "...",
  --     "background_image": "..."
  --   },
  --   "stats": [...],
  --   "testimonials": [...],
  --   "faq": [...]
  -- }
  
  -- System Settings
  booking_advance_days INTEGER DEFAULT 90, -- How many days in advance can customers book
  deposit_percentage INTEGER DEFAULT 30, -- Default deposit percentage
  cancellation_hours INTEGER DEFAULT 48, -- Hours before event for free cancellation
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT single_row CHECK (id = 1)
);

-- RLS Policies
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view settings"
  ON event_settings FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Authenticated users can update settings"
  ON event_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert settings"
  ON event_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default settings row
INSERT INTO event_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- UPDATE TRIGGER for updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_gallery_updated_at 
  BEFORE UPDATE ON event_gallery 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_event_settings_updated_at 
  BEFORE UPDATE ON event_settings 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Gallery and settings tables created successfully!';
  RAISE NOTICE '📸 event_gallery - For managing gallery photos';
  RAISE NOTICE '⚙️  event_settings - For homepage content and contact info';
END $$;
