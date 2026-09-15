-- ============================================
-- CASH REMITTANCES TABLE
-- ============================================
-- Tracks cash handovers from POS staff to Admin
-- Used for shift changes and accountability

CREATE TABLE IF NOT EXISTS public.cash_remittances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remittance_number SERIAL UNIQUE,
  
  -- Staff info
  remitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  received_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Financial details
  cash_amount DECIMAL(10, 2) NOT NULL CHECK (cash_amount >= 0),
  declared_amount DECIMAL(10, 2) NOT NULL CHECK (declared_amount >= 0),
  variance DECIMAL(10, 2) GENERATED ALWAYS AS (cash_amount - declared_amount) STORED,
  
  -- Transaction counts for verification
  total_transactions INTEGER DEFAULT 0,
  cash_transactions INTEGER DEFAULT 0,
  
  -- Breakdown by payment method (for reference)
  card_amount DECIMAL(10, 2) DEFAULT 0,
  gcash_amount DECIMAL(10, 2) DEFAULT 0,
  maya_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Period covered
  shift_start_at TIMESTAMPTZ NOT NULL,
  shift_end_at TIMESTAMPTZ NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'discrepancy')),
  
  -- Notes and documentation
  notes TEXT,
  pos_notes TEXT, -- Notes from POS staff
  admin_notes TEXT, -- Notes from Admin
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_cash_remittances_remitted_by ON public.cash_remittances(remitted_by);
CREATE INDEX IF NOT EXISTS idx_cash_remittances_received_by ON public.cash_remittances(received_by);
CREATE INDEX IF NOT EXISTS idx_cash_remittances_status ON public.cash_remittances(status);
CREATE INDEX IF NOT EXISTS idx_cash_remittances_created_at ON public.cash_remittances(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cash_remittances_shift_end ON public.cash_remittances(shift_end_at DESC);

-- Enable RLS
ALTER TABLE public.cash_remittances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running the script)
DROP POLICY IF EXISTS "Users can view their remittances" ON public.cash_remittances;
DROP POLICY IF EXISTS "POS can create remittances" ON public.cash_remittances;
DROP POLICY IF EXISTS "Admin can update remittances" ON public.cash_remittances;

-- Policy: POS and Admin can view their own remittances
CREATE POLICY "Users can view their remittances" ON public.cash_remittances
  FOR SELECT
  USING (
    auth.uid() = remitted_by 
    OR auth.uid() = received_by 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: POS can create remittances
CREATE POLICY "POS can create remittances" ON public.cash_remittances
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('pos', 'admin')
    )
  );

-- Policy: Admin can update remittances (verify, add notes)
CREATE POLICY "Admin can update remittances" ON public.cash_remittances
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_cash_remittances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_cash_remittances_updated_at ON public.cash_remittances;

CREATE TRIGGER set_cash_remittances_updated_at
  BEFORE UPDATE ON public.cash_remittances
  FOR EACH ROW
  EXECUTE FUNCTION update_cash_remittances_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON public.cash_remittances TO authenticated;
GRANT UPDATE ON public.cash_remittances TO authenticated;
GRANT USAGE ON SEQUENCE cash_remittances_remittance_number_seq TO authenticated;

COMMENT ON TABLE public.cash_remittances IS 'Tracks cash remittances from POS staff to Admin during shift handovers';
COMMENT ON COLUMN public.cash_remittances.variance IS 'Auto-calculated: cash_amount - declared_amount (positive = overage, negative = shortage)';
