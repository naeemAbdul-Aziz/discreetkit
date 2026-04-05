-- REFILL ENHANCEMENTS: ANONYMOUS TOKEN MODEL
-- Adds hospital-issued refill codes, phone lookups, and simplified adherence tracking.

ALTER TABLE public.medication_refill_subscriptions 
  ADD COLUMN phone text,
  ADD COLUMN hospital_refill_code text UNIQUE,
  ADD COLUMN hospital_id bigint REFERENCES public.pharmacies(id);

ALTER TABLE public.pharmacies 
  ADD COLUMN is_partner_hub boolean DEFAULT false;

ALTER TABLE public.refill_logs 
  ADD COLUMN adherence_status text DEFAULT 'unknown' CHECK (adherence_status IN ('confirmed', 'missed', 'unknown')),
  ADD COLUMN adherence_confirmed_at timestamptz;

-- Add index for fast WhatsApp phone lookups
CREATE INDEX idx_medication_refill_phone ON public.medication_refill_subscriptions(phone);

-- Comments for Clarity
COMMENT ON COLUMN public.medication_refill_subscriptions.hospital_refill_code IS 'Token issued by partner hospital (e.g., UGMC-123) to proof clinical authorization.';
COMMENT ON COLUMN public.pharmacies.is_partner_hub IS 'True if this is a hospital/NGO hub that provides medication free of charge (e.g. ARVs).';
COMMENT ON COLUMN public.refill_logs.adherence_status IS 'Simple 1-click adherence reporting (Monthly).';
