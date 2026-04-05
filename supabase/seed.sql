-- DISCREETKIT SYSTEM SEED
-- Initial data for roles, settings, and the UGMC Partner Hub.

-- 1. Roles & Settings
INSERT INTO public.roles (name, description) VALUES
    ('admin', 'Full administrative access'),
    ('pharmacy', 'Pharmacy staff access'),
    ('support', 'Support staff access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.store_settings (id, store_name) 
VALUES (1, 'DiscreetKit Ghana') 
ON CONFLICT (id) DO NOTHING;

-- 2. Categories
INSERT INTO public.categories (name, slug, description)
VALUES ('Medication Refills', 'medication-refills', 'Chronic medication refill services and clinical partner hubs.')
ON CONFLICT (name) DO NOTHING;

-- 3. UGMC Partner Hub
INSERT INTO public.pharmacies (name, location, contact_person, phone_number, is_partner_hub, is_active, partner_code, is_open)
VALUES (
    'University of Ghana Medical Centre (UGMC)',
    'Legon, Accra',
    'ART Clinic Pharmacy',
    '0203001107',
    true,
    true,
    'UGMC-ART-HUB',
    true
) ON CONFLICT (partner_code) DO UPDATE 
SET is_partner_hub = true, is_active = true;

-- 4. ART Products
INSERT INTO public.products (name, description, price_ghs, category, requires_prescription, image_url, featured)
VALUES 
(
    'ART Refill (30-Day Supply)', 
    'A 30-day supply of physician-prescribed TLD antiretroviral therapy. Authorized via clinical partner verification.', 
    0.00, 
    'Medication Refills', 
    true, 
    'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757953240/close-up-delivery-person-giving-parcel-client_al5mjd.jpg',
    true
),
(
    'ART Refill (90-Day Supply)', 
    'A 90-day multi-month refill of physician-prescribed TLD antiretroviral therapy. Optimized for stable patient protocols.', 
    0.00, 
    'Medication Refills', 
    true, 
    'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757953240/close-up-delivery-person-giving-parcel-client_al5mjd.jpg',
    true
)
ON CONFLICT (name) DO NOTHING;

-- 5. Linking Products to UGMC Hub (Inventory)
WITH hub AS (SELECT id FROM public.pharmacies WHERE partner_code = 'UGMC-ART-HUB'),
     p1   AS (SELECT id FROM public.products WHERE name = 'ART Refill (30-Day Supply)'),
     p2   AS (SELECT id FROM public.products WHERE name = 'ART Refill (90-Day Supply)')
INSERT INTO public.pharmacy_products (pharmacy_id, product_id, stock_level, is_available)
SELECT hub.id, p1.id, 999, true FROM hub, p1
UNION ALL
SELECT hub.id, p2.id, 999, true FROM hub, p2
ON CONFLICT (pharmacy_id, product_id) DO UPDATE SET stock_level = 999, is_available = true;
