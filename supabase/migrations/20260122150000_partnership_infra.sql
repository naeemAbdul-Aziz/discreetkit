-- Partnership Infrastructure Migration
-- Adds support for Trade Discounts, Partner Codes, and Banking Details

-- 1. Pharmacies Table Updates
ALTER TABLE public.pharmacies
ADD COLUMN IF NOT EXISTS partner_code text UNIQUE,
ADD COLUMN IF NOT EXISTS trade_discount_percentage numeric(5, 2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS bank_details jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS momo_details jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.pharmacies.partner_code IS 'Unique DK-PARTNER-XXX code for identification.';
COMMENT ON COLUMN public.pharmacies.trade_discount_percentage IS 'Agreed margin discount (e.g. 20%) deducted from retail price for payout.';
COMMENT ON COLUMN public.pharmacies.bank_details IS 'JSON: { bank_name, account_number, account_name, branch }';
COMMENT ON COLUMN public.pharmacies.momo_details IS 'JSON: { network, number, account_name }';

-- 2. Pharmacy Products (Cost Price Override)
ALTER TABLE public.pharmacy_products
ADD COLUMN IF NOT EXISTS cost_price_ghs numeric(10, 2);

COMMENT ON COLUMN public.pharmacy_products.cost_price_ghs IS 'Optional override for negotiated cost price per item. If null, use Trade Discount.';

-- 3. Trigger to auto-generate Partner Code if null
CREATE OR REPLACE FUNCTION generate_partner_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.partner_code IS NULL THEN
        -- Generate format DK-PARTNER-00ID (using ID)
        -- Since ID is generated after insert, this might be tricky in BEFORE INSERT trigger if ID comes from sequence.
        -- We will use a random string or update it AFTER insert if strictly using ID.
        -- Better strategy: Use a random 4-char suffix or use a sequence.
        NEW.partner_code := 'DK-PARTNER-' || LPAD(floor(random()*1000)::text, 3, '0') || SUBSTRING(md5(random()::text), 1, 3);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_partner_code ON public.pharmacies;
CREATE TRIGGER trigger_set_partner_code
    BEFORE INSERT ON public.pharmacies
    FOR EACH ROW
    EXECUTE FUNCTION generate_partner_code();

-- 4. Payouts View (Optional, for reporting)
CREATE OR REPLACE VIEW public.pharmacy_payouts_due AS
SELECT 
    p.id as pharmacy_id,
    p.name as pharmacy_name,
    p.partner_code,
    p.trade_discount_percentage,
    COUNT(o.id) as total_orders,
    SUM(o.total_price) as total_revenue,
    SUM(o.total_price * (1 - (COALESCE(p.trade_discount_percentage, 20) / 100))) as payout_due,
    MIN(o.created_at) as period_start,
    MAX(o.created_at) as period_end
FROM public.orders o
JOIN public.pharmacies p ON o.pharmacy_id = p.id
WHERE o.status = 'completed'
-- We would typically filter by "paid_out = false", but we don't have that tracking yet.
-- For V1, this view just aggregates ALL completed orders.
GROUP BY p.id, p.name, p.partner_code, p.trade_discount_percentage;

-- 5. Backfill Existing Pharmacies (User Request)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.pharmacies WHERE partner_code IS NULL LOOP
        UPDATE public.pharmacies
        SET partner_code = 'DK-PARTNER-' || LPAD(floor(random()*1000)::text, 3, '0') || SUBSTRING(md5(random()::text), 1, 3)
        WHERE id = r.id;
    END LOOP;
END;
$$;
