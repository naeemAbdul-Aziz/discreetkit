-- DISCREETKIT SEED DATA (Exhaustive April 2026 Edition)
-- This script populates the database with initial data for development/testing.
-- It assumes the schema has already been created by migrations.

BEGIN;

-- ==========================================
-- 1. CLEANUP
-- ==========================================
TRUNCATE TABLE public.order_events CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.order_messages CASCADE;
TRUNCATE TABLE public.order_cancellations CASCADE;
TRUNCATE TABLE public.inventory_reservations CASCADE;
TRUNCATE TABLE public.pharmacy_products CASCADE;
TRUNCATE TABLE public.pharmacy_riders CASCADE;
TRUNCATE TABLE public.pharmacy_service_areas CASCADE;
TRUNCATE TABLE public.pharmacies CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.categories CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.roles CASCADE;
TRUNCATE TABLE public.store_settings CASCADE;
TRUNCATE TABLE public.medication_refill_subscriptions CASCADE;
TRUNCATE TABLE public.refill_logs CASCADE;

-- ==========================================
-- 2. ROLES
-- ==========================================
INSERT INTO public.roles (name, description) VALUES
  ('admin','Full administrative access'),
  ('pharmacy','Pharmacy staff access'),
  ('support','Support staff access')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 3. STORE SETTINGS
-- ==========================================
INSERT INTO public.store_settings (id, store_name, support_email, support_phone, currency) 
VALUES (1, 'Access Discreet Ltd.', 'support@discreetkit.com', '+233 20 300 1107', 'GHS') 
ON CONFLICT (id) DO UPDATE SET store_name = EXCLUDED.store_name;

-- ==========================================
-- 4. CATEGORIES
-- ==========================================
INSERT INTO public.categories (name, slug, description) VALUES
('Testing', 'testing', 'Home diagnostic kits for sexual health and general wellness.'),
('Contraception', 'contraception', 'Emergency and daily birth control options.'),
('Protection', 'protection', 'Safe and reliable barrier protection.'),
('Wellness', 'wellness', 'Sexual wellness and hydration products.'),
('Menstrual Care', 'menstrual-care', 'Organic and sustainable menstrual hygiene products.'),
('Bundles', 'bundles', 'Curated sets for value and convenience.')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 5. PRODUCTS (Exhaustive Catalog)
-- ==========================================
INSERT INTO public.products (name, description, price_ghs, student_price_ghs, category, sub_category, brand, stock_level, image_url, featured, requires_prescription, is_student_product, usage_instructions, in_the_box, savings_ghs)
VALUES
  ('HIV Self-Test Kit','Confidential oral swab HIV test. Result in 15–20 minutes.',50.00,25.00,'Testing','HIV','OraQuick',200,'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png',true,false,true,ARRAY['Swab gums','Insert into vial','Wait','Read window'],ARRAY['Test device','Buffer vial','Instructions'],25.00),
  ('Pregnancy Test Strip (Pack of 5)','High-sensitivity HCG early detection strips.',30.00,20.00,'Testing','Pregnancy','Predictor',600,'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png',false,false,true,ARRAY['Collect urine','Dip for 5s','Lay flat','Read after 3m'],ARRAY['5 strips','Silica packet'],10.00),
  ('Chlamydia & Gonorrhea Test','Lab-certified discreet collection kit for STIs.',120.00,100.00,'Testing','STI','LetsGetChecked',55,'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=60',true,false,false,ARRAY['Collect sample','Seal tube','Mail prepaid'],ARRAY['Collection cup','Transport tube','Return envelope'],20.00),
  ('Weekend Essentials Bundle','Essential protection + lubricant combo.',90.00,70.00,'Bundles','Intimacy','DiscreetKit',140,'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413627/weekend_bundle_t8cfxp.png',true,false,true,ARRAY['Use as needed'],ARRAY['12 ultra thin condoms','Lubricant 50ml','Info card'],20.00),
  ('Emergency Contraceptive (Morning After)','Take within 72h for highest efficacy.',45.00,35.00,'Contraception','Emergency','Postinor-2',260,'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&auto=format&fit=crop&q=60',true,false,true,ARRAY['Take first tablet','Take second after 12h'],ARRAY['2 tablets','Leaflet'],10.00),
  ('Ultra Thin Condoms (12 pack)','Maximum sensitivity reliable protection.',45.00,35.00,'Protection','Condoms','Durex',820,'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',true,false,true,ARRAY['Open carefully','Roll on','Dispose after use'],ARRAY['12 condoms'],10.00),
  ('Menstrual Cup (Size B)','Reusable eco-friendly cup.',150.00,120.00,'Menstrual Care','Cups','DivaCup',55,'https://images.unsplash.com/photo-1596627672297-5d2520392b45?w=800&auto=format&fit=crop&q=60',true,false,false,ARRAY['Boil before first use','Fold insert','Empty every 12h'],ARRAY['Cup','Storage pouch'],30.00);

-- ==========================================
-- 6. PHARMACIES (Silver Pill + Expansion)
-- ==========================================
INSERT INTO public.pharmacies (name, location, contact_person, phone_number, email, is_active, is_24_7) VALUES
('Silver Pill Pharmacy','Accra, Ghana','Pharmacy Manager','0201234567','silverpillpharmacy@gmail.com',true,true),
('Legon Campus Pharmacy','University of Ghana, Legon','Kwame Mensah','0244123456','legon@pharmacy.com',true,true),
('Osu Oxford St Pharmacy','Oxford Street, Osu','Sarah Osei','0200987654','osu@pharmacy.com',true,true);

-- ==========================================
-- 7. SERVICE AREAS (Exhaustive 30+ Areas)
-- ==========================================
WITH sp AS (SELECT id FROM public.pharmacies WHERE email = 'silverpillpharmacy@gmail.com')
INSERT INTO public.pharmacy_service_areas (pharmacy_id, area_name, delivery_fee, max_delivery_time_hours, estimated_min_minutes, estimated_max_minutes, is_active)
SELECT sp.id, area_name, delivery_fee, max_delivery_time_hours, estimated_min_minutes, estimated_max_minutes, true
FROM sp, (VALUES
    ('University of Ghana (Legon)', 10.00, 2, 30, 60),
    ('Legon', 10.00, 2, 30, 60),
    ('UG', 10.00, 2, 30, 60),
    ('UPSA', 10.00, 2, 30, 60),
    ('GIMPA', 10.00, 2, 30, 60),
    ('Osu', 20.00, 3, 45, 90),
    ('East Legon', 20.00, 3, 45, 90),
    ('Spintex', 20.00, 3, 45, 90),
    ('Dansoman', 20.00, 3, 45, 90),
    ('Tema', 20.00, 3, 45, 90),
    ('Madina', 20.00, 3, 45, 90),
    ('Achimota', 20.00, 3, 45, 90),
    ('Kaneshie', 20.00, 3, 45, 90),
    ('Circle', 20.00, 3, 45, 90),
    ('Adabraka', 20.00, 3, 45, 90),
    ('Airport', 20.00, 3, 45, 90),
    ('Dzorwulu', 20.00, 3, 45, 90),
    ('Labone', 20.00, 3, 45, 90),
    ('Cantonments', 20.00, 3, 45, 90),
    ('Teshie', 20.00, 3, 45, 90),
    ('Nungua', 20.00, 3, 45, 90),
    ('Haatso', 20.00, 3, 45, 90),
    ('Dome', 20.00, 3, 45, 90),
    ('Kasoa', 25.00, 4, 60, 120),
    ('Takoradi', 30.00, 5, 90, 180),
    ('Tamale', 30.00, 5, 90, 180),
    ('Ho', 30.00, 5, 90, 180),
    ('Sunyani', 30.00, 5, 90, 180),
    ('Koforidua', 25.00, 4, 60, 120)
) AS areas(area_name, delivery_fee, max_delivery_time_hours, estimated_min_minutes, estimated_max_minutes);

-- ==========================================
-- 8. RIDERS (Command Center Test Data)
-- ==========================================
WITH sp AS (SELECT id FROM public.pharmacies WHERE email = 'silverpillpharmacy@gmail.com')
INSERT INTO public.pharmacy_riders (pharmacy_id, name, phone, is_active)
SELECT sp.id, 'John', '0203001107', true FROM sp
ON CONFLICT (pharmacy_id, phone) DO NOTHING;

-- ==========================================
-- 9. AUTH USERS (Test Infrastructure)
-- ==========================================
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES (
    gen_random_uuid(), 'authenticated', 'authenticated', 'silverpillpharmacy@gmail.com', 
    crypt('DiscreetKitAdmin2k25', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', ''
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id FROM auth.users u, public.roles r 
WHERE u.email = 'silverpillpharmacy@gmail.com' AND r.name = 'pharmacy'
ON CONFLICT DO NOTHING;

UPDATE public.pharmacies SET user_id = (SELECT id FROM auth.users WHERE email = 'silverpillpharmacy@gmail.com')
WHERE email = 'silverpillpharmacy@gmail.com';

COMMIT;
