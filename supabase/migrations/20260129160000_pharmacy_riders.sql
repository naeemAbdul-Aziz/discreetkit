-- Rider Management System
-- Enable asset-light rider management for pharmacy partners

-- 1. Create pharmacy_riders table
CREATE TABLE IF NOT EXISTS public.pharmacy_riders (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  pharmacy_id bigint REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  is_active boolean DEFAULT true,
  
  -- Performance tracking (can be updated by triggers/functions later)
  total_deliveries int DEFAULT 0,
  last_active_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique rider per pharmacy (by phone)
  UNIQUE(pharmacy_id, phone)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_riders_pharmacy_id ON public.pharmacy_riders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_riders_active ON public.pharmacy_riders(is_active) WHERE is_active = true;

-- 3. RLS Policies
ALTER TABLE public.pharmacy_riders ENABLE ROW LEVEL SECURITY;

-- Admins: Full access
CREATE POLICY "Admins can manage all riders"
  ON public.pharmacy_riders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Pharmacies: Manage their own riders
CREATE POLICY "Pharmacies can view their own riders"
  ON public.pharmacy_riders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacies p
      WHERE p.id = pharmacy_riders.pharmacy_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacies can create their own riders"
  ON public.pharmacy_riders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pharmacies p
      WHERE p.id = pharmacy_riders.pharmacy_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacies can update their own riders"
  ON public.pharmacy_riders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacies p
      WHERE p.id = pharmacy_riders.pharmacy_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pharmacies p
      WHERE p.id = pharmacy_riders.pharmacy_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacies can delete their own riders"
  ON public.pharmacy_riders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacies p
      WHERE p.id = pharmacy_riders.pharmacy_id
      AND p.user_id = auth.uid()
    )
  );

-- 4. Triggers
CREATE TRIGGER update_pharmacy_riders_updated_at
  BEFORE UPDATE ON public.pharmacy_riders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.pharmacy_riders IS 'Registry of delivery riders employed by pharmacy partners';
