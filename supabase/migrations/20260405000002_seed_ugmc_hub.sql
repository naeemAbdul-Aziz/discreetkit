-- SEED UGMC HUB & ART REFILL PRODUCTS
-- Registers UGMC as the primary partner hospital and seeds initial ART medication for the pilot.

-- 1. Insert UGMC Partner Hub
INSERT INTO public.pharmacies (name, location, contact_person, phone_number, is_partner_hub, is_active, partner_code)
VALUES (
    'University of Ghana Medical Centre (UGMC)',
    'Legon, Accra',
    'ART Clinic Pharmacy',
    '0203001107',
    true,
    true,
    'UGMC-ART-HUB'
) ON CONFLICT (partner_code) DO UPDATE 
SET phone_number = EXCLUDED.phone_number, is_partner_hub = true;

-- 2. Insert ART Refill Products (Category: Medication Refills)
-- Pricing is 0.00 since it is government/partner provided.
INSERT INTO public.products (name, description, price_ghs, student_price_ghs, category, requires_prescription, image_url)
VALUES 
(
    'ART Refill (30-Day Supply)', 
    'A 30-day supply of your physician-prescribed TLD antiretroviral therapy. Authorized in partnership with UGMC.', 
    0.00, 
    0.00, 
    'Medication Refills', 
    true, 
    'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757953240/close-up-delivery-person-giving-parcel-client_al5mjd.jpg'
),
(
    'ART Refill (90-Day Supply)', 
    'A 90-day multi-month refill of your physician-prescribed TLD antiretroviral therapy. Authorized in partnership with UGMC.', 
    0.00, 
    0.00, 
    'Medication Refills', 
    true, 
    'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757953240/close-up-delivery-person-giving-parcel-client_al5mjd.jpg'
)
ON CONFLICT (name) DO NOTHING;

-- 3. Link Products to UGMC Hub in inventory
-- We assume stock is managed by the hospital, so we set a high virtual stock for the platform.
WITH hub AS (SELECT id FROM public.pharmacies WHERE partner_code = 'UGMC-ART-HUB'),
     p1   AS (SELECT id FROM public.products WHERE name = 'ART Refill (30-Day Supply)'),
     p2   AS (SELECT id FROM public.products WHERE name = 'ART Refill (90-Day Supply)')
INSERT INTO public.pharmacy_products (pharmacy_id, product_id, stock_level, pharmacy_price_ghs)
SELECT hub.id, p1.id, 999, 0.00 FROM hub, p1
UNION ALL
SELECT hub.id, p2.id, 999, 0.00 FROM hub, p2
ON CONFLICT DO NOTHING;
