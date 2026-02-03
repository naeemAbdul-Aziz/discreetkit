-- SILVER PILL PHARMACY SETUP
-- This script adds Silver Pill Pharmacy with complete service area coverage and stock

BEGIN;

-- ==========================================
-- 1. ADD SILVER PILL PHARMACY
-- ==========================================
INSERT INTO public.pharmacies (name, location, contact_person, phone_number, email, is_active, is_24_7)
VALUES (
    'Silver Pill Pharmacy',
    'Accra, Ghana',
    'Pharmacy Manager',
    '0201234567',
    'silverpillpharmacy@gmail.com',
    true,
    true
)
ON CONFLICT (email) DO UPDATE 
SET 
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    is_active = EXCLUDED.is_active,
    is_24_7 = EXCLUDED.is_24_7;

-- ==========================================
-- 2. ADD SERVICE AREAS (ALL DELIVERY LOCATIONS)
-- ==========================================
-- Get the pharmacy ID
WITH pharmacy AS (
    SELECT id FROM public.pharmacies WHERE email = 'silverpillpharmacy@gmail.com'
)
INSERT INTO public.pharmacy_service_areas (pharmacy_id, area_name, delivery_fee, max_delivery_time_hours, estimated_min_minutes, estimated_max_minutes, is_active)
SELECT 
    pharmacy.id,
    area_name,
    delivery_fee,
    max_delivery_time_hours,
    estimated_min_minutes,
    estimated_max_minutes,
    true
FROM pharmacy, (VALUES
    -- Campus Areas (Lower delivery fee)
    ('University of Ghana (Legon)', 10.00, 2, 30, 60),
    ('Legon', 10.00, 2, 30, 60),
    ('UG', 10.00, 2, 30, 60),
    ('UPSA', 10.00, 2, 30, 60),
    ('GIMPA', 10.00, 2, 30, 60),
    ('Wisconsin International University College', 10.00, 2, 30, 60),
    ('Academic City University College', 10.00, 2, 30, 60),
    ('Lancaster University Ghana', 10.00, 2, 30, 60),
    ('KNUST', 10.00, 2, 30, 60),
    ('Kumasi', 10.00, 2, 30, 60),
    ('UCC', 10.00, 2, 30, 60),
    ('Cape Coast', 10.00, 2, 30, 60),
    
    -- Accra Areas (Standard delivery fee)
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
    
    -- Other Major Cities
    ('Takoradi', 30.00, 5, 90, 180),
    ('Tamale', 30.00, 5, 90, 180),
    ('Ho', 30.00, 5, 90, 180),
    ('Sunyani', 30.00, 5, 90, 180),
    ('Koforidua', 25.00, 4, 60, 120)
) AS areas(area_name, delivery_fee, max_delivery_time_hours, estimated_min_minutes, estimated_max_minutes)
ON CONFLICT (pharmacy_id, area_name) DO UPDATE
SET 
    delivery_fee = EXCLUDED.delivery_fee,
    max_delivery_time_hours = EXCLUDED.max_delivery_time_hours,
    estimated_min_minutes = EXCLUDED.estimated_min_minutes,
    estimated_max_minutes = EXCLUDED.estimated_max_minutes,
    is_active = EXCLUDED.is_active;

-- ==========================================
-- 3. ADD PHARMACY PRODUCTS (STOCK ALL ITEMS)
-- ==========================================
-- Stock all products with good inventory levels
WITH pharmacy AS (
    SELECT id FROM public.pharmacies WHERE email = 'silverpillpharmacy@gmail.com'
)
INSERT INTO public.pharmacy_products (pharmacy_id, product_id, stock_level, is_available, reorder_level, reorder_quantity)
SELECT 
    pharmacy.id,
    products.id,
    CASE 
        WHEN products.featured = true THEN 500  -- High stock for featured items
        WHEN products.category = 'Testing' THEN 300
        WHEN products.category = 'Protection' THEN 400
        WHEN products.category = 'Bundles' THEN 200
        ELSE 250
    END as stock_level,
    true as is_available,
    50 as reorder_level,
    100 as reorder_quantity
FROM pharmacy, public.products
ON CONFLICT (pharmacy_id, product_id) DO UPDATE
SET 
    stock_level = EXCLUDED.stock_level,
    is_available = EXCLUDED.is_available,
    updated_at = NOW();

COMMIT;

-- ==========================================
-- VERIFICATION QUERIES (Optional - Run separately)
-- ==========================================
-- Check pharmacy was created
-- SELECT * FROM public.pharmacies WHERE email = 'silverpillpharmacy@gmail.com';

-- Check service areas
-- SELECT p.name, psa.area_name, psa.delivery_fee, psa.is_active 
-- FROM public.pharmacy_service_areas psa
-- JOIN public.pharmacies p ON p.id = psa.pharmacy_id
-- WHERE p.email = 'silverpillpharmacy@gmail.com'
-- ORDER BY psa.area_name;

-- Check product stock
-- SELECT p.name as pharmacy, pr.name as product, pp.stock_level, pp.is_available
-- FROM public.pharmacy_products pp
-- JOIN public.pharmacies p ON p.id = pp.pharmacy_id
-- JOIN public.products pr ON pr.id = pp.product_id
-- WHERE p.email = 'silverpillpharmacy@gmail.com'
-- ORDER BY pr.category, pr.name;
