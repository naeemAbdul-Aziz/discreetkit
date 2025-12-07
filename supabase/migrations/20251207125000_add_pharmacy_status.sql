-- Migration to add operating hours and status columns to pharmacies table
ALTER TABLE public.pharmacies 
ADD COLUMN IF NOT EXISTS is_24_7 boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS operating_hours jsonb DEFAULT NULL;

COMMENT ON COLUMN public.pharmacies.is_24_7 IS 'Flag if the pharmacy operates 24 hours a day.';
COMMENT ON COLUMN public.pharmacies.is_open IS 'Manual override to close a pharmacy temporarily.';
COMMENT ON COLUMN public.pharmacies.operating_hours IS 'JSON object defining opening/closing times if not 24/7.';
