-- Migration: Add partner_code to orders table
-- Purpose: Store unique partner access codes for Marie Stopes referrals

-- Add partner_code column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS partner_code TEXT;

-- Add index for lookups
CREATE INDEX IF NOT EXISTS orders_partner_code_idx ON public.orders(partner_code);

-- Documentation
COMMENT ON COLUMN public.orders.partner_code IS 'Unique code for Marie Stopes partner referral, generated at order creation (format: DK-MS-XXXX).';
