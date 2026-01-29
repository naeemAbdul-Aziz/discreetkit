-- Medication Refill Subscriptions Schema
-- Enables enrollment-based refill service separate from cart

-- 0. Cleanup (Safe for re-running)
DROP TABLE IF EXISTS public.refill_logs CASCADE;
DROP TABLE IF EXISTS public.medication_refill_subscriptions CASCADE;
DROP FUNCTION IF EXISTS generate_subscription_code CASCADE;
DROP FUNCTION IF EXISTS update_medication_refill_subscriptions_updated_at CASCADE;

-- 1. Create medication_refill_subscriptions table
CREATE TABLE IF NOT EXISTS public.medication_refill_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_code text UNIQUE, -- Auto-generated DK-SUB-XXXX for anonymity
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Enrollment details
  enrolled_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  
  -- Delivery schedule
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly')),
  next_delivery_date date,
  delivery_address jsonb NOT NULL,
  
  -- Prescription verification
  prescription_verified boolean DEFAULT false,
  prescription_document_url text,
  prescribing_doctor text,
  prescription_expiry_date date,
  
  -- Pharmacy assignment
  pharmacy_id bigint REFERENCES public.pharmacies(id),
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_next_delivery CHECK (next_delivery_date >= CURRENT_DATE)
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_refill_subscriptions_user_id ON public.medication_refill_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_refill_subscriptions_status ON public.medication_refill_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_refill_subscriptions_next_delivery ON public.medication_refill_subscriptions(next_delivery_date) WHERE status = 'active';

-- 3. Enable RLS
ALTER TABLE public.medication_refill_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.medication_refill_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "Users can create own subscriptions"
  ON public.medication_refill_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON public.medication_refill_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.medication_refill_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Pharmacies can view subscriptions assigned to them
CREATE POLICY "Pharmacies can view assigned subscriptions"
  ON public.medication_refill_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacies p
      WHERE p.id = medication_refill_subscriptions.pharmacy_id
      AND p.user_id = auth.uid()
    )
  );

-- 5. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medication_refill_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_medication_refill_subscriptions_updated_at
  BEFORE UPDATE ON public.medication_refill_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_medication_refill_subscriptions_updated_at();

-- Trigger to auto-generate DK-SUB code
CREATE OR REPLACE FUNCTION generate_subscription_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_code IS NULL THEN
        -- Generate random 6-character suffix
        NEW.subscription_code := 'DK-SUB-' || upper(substring(md5(random()::text) from 1 for 6));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_subscription_code
    BEFORE INSERT ON public.medication_refill_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION generate_subscription_code();

-- 6. Create view for active subscriptions with product details
CREATE OR REPLACE VIEW public.active_refill_subscriptions AS
SELECT 
  mrs.id,
  mrs.subscription_code,
  mrs.user_id,
  mrs.product_id,
  p.name as product_name,
  p.price_ghs,
  p.image_url,
  mrs.status,
  mrs.frequency,
  mrs.next_delivery_date,
  mrs.prescription_verified,
  mrs.prescription_expiry_date,
  mrs.enrolled_at,
  ph.name as pharmacy_name,
  ph.id as pharmacy_id
FROM public.medication_refill_subscriptions mrs
JOIN public.products p ON mrs.product_id = p.id
LEFT JOIN public.pharmacies ph ON mrs.pharmacy_id = ph.id
WHERE mrs.status = 'active';

-- Set security invoker for the view
ALTER VIEW public.active_refill_subscriptions SET (security_invoker = true);

-- Grant permissions
GRANT SELECT ON public.active_refill_subscriptions TO authenticated;

-- 7. Add comments
COMMENT ON TABLE public.medication_refill_subscriptions IS 'Stores medication refill subscription enrollments for recurring delivery service';
COMMENT ON COLUMN public.medication_refill_subscriptions.status IS 'Subscription status: active, paused, or cancelled';
COMMENT ON COLUMN public.medication_refill_subscriptions.frequency IS 'Delivery frequency: monthly or quarterly';
COMMENT ON COLUMN public.medication_refill_subscriptions.delivery_address IS 'JSON object with address details: {street, city, region, phone}';
COMMENT ON COLUMN public.medication_refill_subscriptions.prescription_verified IS 'Whether prescription has been verified by pharmacy/admin';

-- 8. Create refill_logs table for medical history tracking
CREATE TABLE IF NOT EXISTS public.refill_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.medication_refill_subscriptions(id) ON DELETE CASCADE,
  pharmacy_id bigint REFERENCES public.pharmacies(id),
  
  -- Fulfillment details
  filled_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready_for_pickup', 'completed', 'cancelled')),
  pharmacist_notes text,
  next_refill_authorized_date date,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for history lookups
CREATE INDEX IF NOT EXISTS idx_refill_logs_subscription_id ON public.refill_logs(subscription_id);

-- Enable RLS
ALTER TABLE public.refill_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Logs
-- Users can view their own logs
CREATE POLICY "Users can view own refill logs"
  ON public.refill_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.medication_refill_subscriptions sub
      WHERE sub.id = refill_logs.subscription_id
      AND sub.user_id = auth.uid()
    )
  );

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
  ON public.refill_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'admin'));

-- Pharmacies can view/manage logs for their subscriptions
CREATE POLICY "Pharmacies can view/manage logs for their subscriptions"
  ON public.refill_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.medication_refill_subscriptions sub
      JOIN public.pharmacies p ON sub.pharmacy_id = p.id
      WHERE sub.id = refill_logs.subscription_id
      AND p.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.refill_logs IS 'Immutable log of every medication fulfillment/refill event for legal compliance and history';
