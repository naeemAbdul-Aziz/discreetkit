-- DISCREETKIT SEED DATA
-- This script populates the database with initial data for development/testing.
-- It assumes the schema has already been created by migrations.

BEGIN;

-- ==========================================
-- 1. CLEANUP (Truncate tables to start fresh)
-- ==========================================
-- Use TRUNCATE to clear data without dropping structure
TRUNCATE TABLE public.order_events CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.customers CASCADE;
TRUNCATE TABLE public.pharmacy_products CASCADE;
TRUNCATE TABLE public.pharmacies CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.roles CASCADE;
TRUNCATE TABLE public.store_settings CASCADE;
-- Note: Do NOT truncate medication_refill_subscriptions here unless also seeding them differently

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
-- 4. PRODUCTS (Expanded Catalog)
-- ==========================================
INSERT INTO public.products (name, description, price_ghs, student_price_ghs, category, sub_category, brand, stock_level, image_url, featured, requires_prescription, is_student_product, usage_instructions, in_the_box, savings_ghs)
VALUES
  -- CORE TEST KITS
  ('HIV Self-Test Kit','Confidential oral swab HIV test. Result in 15–20 minutes.',50.00,25.00,'Testing','HIV','OraQuick',200,'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png',true,false,true,ARRAY['Swab gums','Insert into vial','Wait','Read window'],ARRAY['Test device','Buffer vial','Instructions'],25.00),
  ('Pregnancy Test Strip (Pack of 5)','High-sensitivity HCG early detection strips.',30.00,20.00,'Testing','Pregnancy','Predictor',600,'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png',false,false,true,ARRAY['Collect urine','Dip for 5s','Lay flat','Read after 3m'],ARRAY['5 strips','Silica packet'],10.00),
  ('Ovulation Test Kit (LH Surge)','Identifies fertile window via LH surge detection.',65.00,45.00,'Testing','Fertility','ClearBlue',180,'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60',false,false,true,ARRAY['Test daily same time','Compare lines','Record surge'],ARRAY['7 test cassettes','Instructions'],20.00),
  ('Malaria Rapid Test Kit','Finger-prick antigen detection for malaria.',25.00,15.00,'Testing','General Health','CareStart',350,'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=60',false,false,true,ARRAY['Sterilize finger','Lancet prick','Apply blood','Add buffer'],ARRAY['Cassette','Buffer','Lancet','Alcohol swab'],10.00),
  ('UTI Test Strips (10 pack)','Detect leukocytes & nitrites for urinary infection.',40.00,30.00,'Testing','General Health','AZO',220,'https://images.unsplash.com/photo-1616651181620-9906d6e43fc3?w=800&auto=format&fit=crop&q=60',false,false,true,ARRAY['Dip in urine','Wait 2 minutes','Match color chart'],ARRAY['10 strips','Color guide'],10.00),
  ('Chlamydia & Gonorrhea Test','Lab-certified discreet collection kit for STIs.',120.00,100.00,'Testing','STI','LetsGetChecked',55,'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=60',true,false,false,ARRAY['Collect sample','Seal tube','Mail prepaid'],ARRAY['Collection cup','Transport tube','Return envelope'],20.00),
  ('Weekend Essentials Bundle','Essential protection + lubricant combo.',90.00,70.00,'Bundles','Intimacy','DiscreetKit',140,'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413627/weekend_bundle_t8cfxp.png',true,false,true,ARRAY['Use as needed'],ARRAY['12 ultra thin condoms','Lubricant 50ml','Info card'],20.00),
  ('Complete Intimacy Bundle','All-in-one value set for couples.',160.00,120.00,'Bundles','Intimacy','DiscreetKit',90,'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png',true,false,true,ARRAY['Use products appropriately'],ARRAY['Condoms','Lubricant','Pregnancy test','HIV kit'],40.00),
  -- CONTRACEPTION / PROTECTION
  ('Emergency Contraceptive (Morning After)','Take within 72h for highest efficacy.',45.00,35.00,'Contraception','Emergency','Postinor-2',260,'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&auto=format&fit=crop&q=60',true,false,true,ARRAY['Take first tablet','Take second after 12h'],ARRAY['2 tablets','Leaflet'],10.00),
  ('Oral Contraceptive Pill (Monthly)','Daily hormonal birth control pack.',30.00,20.00,'Contraception','Daily Pill','Yasmin',140,'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&auto=format&fit=crop&q=60',false,true,true,ARRAY['One pill daily same time'],ARRAY['21 tablets'],10.00),
  ('Ultra Thin Condoms (12 pack)','Maximum sensitivity reliable protection.',45.00,35.00,'Protection','Condoms','Durex',820,'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',true,false,true,ARRAY['Open carefully','Roll on','Dispose after use'],ARRAY['12 condoms'],10.00),
  ('Textured Condoms (Ribbed & Dotted)','Extra stimulation design.',20.00,15.00,'Protection','Condoms','Fiesta',640,'https://images.unsplash.com/photo-1617625624633-40a3733a493a?w=800&auto=format&fit=crop&q=60',false,false,true,ARRAY['Open carefully','Roll on','Dispose after use'],ARRAY['3 condoms'],5.00),
  -- WELLNESS & LUBRICANTS
  ('Water-Based Lubricant (100ml)','Non-sticky natural feel.',40.00,30.00,'Wellness','Lubricants','Durex Play',160,'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png',false,false,false,ARRAY['Apply desired amount'],ARRAY['100ml bottle'],10.00),
  ('Strawberry Flavored Lube','Sugar-free flavored lubricant.',45.00,35.00,'Wellness','Lubricants','Fiesta',110,'https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=800&auto=format&fit=crop&q=60',false,false,true,ARRAY['Apply desired amount'],ARRAY['50ml bottle'],10.00),
  -- MENSTRUAL CARE
  ('Organic Cotton Tampons (Regular)','Biodegradable chemical-free protection.',35.00,25.00,'Menstrual Care','Tampons','Flo',210,'https://images.unsplash.com/photo-1616651181620-9906d6e43fc3?w=800&auto=format&fit=crop&q=60',false,false,true,ARRAY['Change every 4–8h'],ARRAY['16 tampons'],10.00),
  ('Menstrual Cup (Size B)','Reusable eco-friendly cup.',150.00,120.00,'Menstrual Care','Cups','DivaCup',55,'https://images.unsplash.com/photo-1596627672297-5d2520392b45?w=800&auto=format&fit=crop&q=60',true,false,false,ARRAY['Boil before first use','Fold insert','Empty every 12h'],ARRAY['Cup','Storage pouch'],30.00),
  ('Ultra Thin Pads with Wings','High absorption barely-there feel.',25.00,20.00,'Menstrual Care','Pads','Always',420,'https://images.unsplash.com/photo-1618428516900-33512270918e?w=800&auto=format&fit=crop&q=60',false,false,true,ARRAY['Peel and stick'],ARRAY['10 pads'],5.00);

-- ==========================================
-- 5. PHARMACIES
-- ==========================================
INSERT INTO public.pharmacies (name, location, contact_person, phone_number, email) VALUES
('Legon Campus Pharmacy','University of Ghana, Legon','Kwame Mensah','0244123456','legon@pharmacy.com'),
('Osu Oxford St Pharmacy','Oxford Street, Osu','Sarah Osei','0200987654','osu@pharmacy.com'),
('East Legon Health Mart','East Legon, Accra','Ama Boateng','0277445566','eastlegon@pharmacy.com'),
('Spintex Road Chemist','Spintex Road, Accra','John Doe','0244000001','spintex@pharmacy.com'),
('Dansoman Community Pharmacy','Dansoman, Accra','Grace Addo','0244000002','dansoman@pharmacy.com'),
('Kumasi Central Pharmacy','Adum, Kumasi','Kofi Antwi','0500112233','kumasi@pharmacy.com'),
('KNUST Hospital Pharmacy','KNUST Campus, Kumasi','Dr. Opoku','0500112244','knust@pharmacy.com'),
('Tema Community 1 Pharmacy','Community 1, Tema','Yaw Dapaah','0266778899','tema@pharmacy.com'),
('Takoradi Market Circle Pharmacy','Market Circle, Takoradi','Esi Mansa','0244000003','takoradi@pharmacy.com'),
('Tamale Teaching Hospital Pharmacy','Tamale','Ibrahim Ali','0244000004','tamale@pharmacy.com');

-- ==========================================
-- 6. ORDERS (Sample History)
-- ==========================================
WITH pharm AS (SELECT id, name FROM public.pharmacies)
INSERT INTO public.orders (code, items, status, delivery_area, phone_masked, email, subtotal, delivery_fee, total_price, pharmacy_id, pharmacy_ack_status, created_at)
VALUES
('ORD-2024-001','[{"id":"1","name":"HIV Self-Test Kit","price":50,"quantity":1}]','completed','Legon','024***123','student1@ug.edu.gh',50.00,10.00,60.00,(SELECT id FROM pharm WHERE name='Legon Campus Pharmacy'),'accepted',NOW()-INTERVAL '25 days'),
('ORD-2024-002','[{"id":"9","name":"Water-Based Lubricant","price":40,"quantity":1},{"id":"11","name":"Ultra Thin Condoms","price":45,"quantity":1}]','completed','Osu','020***987','customer2@gmail.com',85.00,15.00,100.00,(SELECT id FROM pharm WHERE name='Osu Oxford St Pharmacy'),'accepted',NOW()-INTERVAL '20 days'),
('ORD-2024-003','[{"id":"7","name":"Weekend Essentials Bundle","price":90,"quantity":1}]','completed','East Legon','055***555','couple@yahoo.com',90.00,15.00,105.00,(SELECT id FROM pharm WHERE name='East Legon Health Mart'),'accepted',NOW()-INTERVAL '15 days'),
('ORD-2024-004','[{"id":"16","name":"Menstrual Cup","price":150,"quantity":1}]','completed','Kumasi','050***112','eco.warrior@gmail.com',150.00,20.00,170.00,(SELECT id FROM pharm WHERE name='Kumasi Central Pharmacy'),'accepted',NOW()-INTERVAL '10 days'),
('ORD-2024-005','[{"id":"1","name":"HIV Self-Test Kit","price":50,"quantity":2}]','out_for_delivery','Tema','026***778','anon.tester@gmail.com',100.00,25.00,125.00,(SELECT id FROM pharm WHERE name='Tema Community 1 Pharmacy'),'accepted',NOW()-INTERVAL '2 hours'),
('ORD-2024-006','[{"id":"8","name":"Complete Intimacy Bundle","price":160,"quantity":1}]','processing','Spintex','024***001','urgent@hotmail.com',160.00,15.00,175.00,(SELECT id FROM pharm WHERE name='Spintex Road Chemist'),'accepted',NOW()-INTERVAL '30 minutes'),
('ORD-2024-007','[{"id":"4","name":"Malaria Rapid Test Kit","price":25,"quantity":3}]','processing','Tamale','024***004','family.health@gmail.com',75.00,30.00,105.00,(SELECT id FROM pharm WHERE name='Tamale Teaching Hospital Pharmacy'),'pending',NOW()-INTERVAL '15 minutes'),
('ORD-2024-008','[{"id":"17","name":"Ultra Thin Pads","price":25,"quantity":4}]','pending_payment','Dansoman','024***002','monthly.supply@gmail.com',100.00,15.00,115.00,NULL,'pending',NOW()-INTERVAL '5 minutes');

-- ==========================================
-- 7. ORDER EVENTS
-- ==========================================
INSERT INTO public.order_events (order_id, status, note, created_at)
SELECT id,'Order Received','Order placed successfully',created_at FROM public.orders;
INSERT INTO public.order_events (order_id, status, note, created_at)
SELECT id,'Payment Confirmed','Payment received',created_at+INTERVAL '2 minutes' FROM public.orders WHERE status IN ('received','processing','out_for_delivery','completed');
INSERT INTO public.order_events (order_id, status, note, created_at)
SELECT id,'Processing','Pharmacy accepted order',created_at+INTERVAL '10 minutes' FROM public.orders WHERE status IN ('processing','out_for_delivery','completed');
INSERT INTO public.order_events (order_id, status, note, created_at)
SELECT id,'Out for Delivery','Package picked up',created_at+INTERVAL '30 minutes' FROM public.orders WHERE status IN ('out_for_delivery','completed');
INSERT INTO public.order_events (order_id, status, note, created_at)
SELECT id,'Completed','Delivered to customer',created_at+INTERVAL '1 hour' FROM public.orders WHERE status='completed';

-- ==========================================
-- 8. SUGGESTIONS
-- ==========================================
INSERT INTO public.suggestions (suggestion) VALUES
('Add flavored & warming lubricant options.'),
('Introduce subscription for condoms & pills.'),
('UTI test strips were helpful, keep stocking.'),
('Faster evening delivery to Tema please.'),
('Discrete outer packaging appreciated.'),
('Offer fertility hormone test panels.'),
('Please add hepatitis B test kit.'),
('Bundle student health essentials at discount.');

-- ==========================================
-- 9. ROLE ASSIGNMENTS (Admin Safety Net)
-- ==========================================
-- Safe insert - assumes users exist in Auth, if not they will be ignored or error depending on FK. 
-- Since we can't seed auth.users easily here, we use ON CONFLICT DO NOTHING.
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id FROM auth.users u, public.roles r WHERE u.email='admin@discreetkit.com' AND r.name='admin' ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id FROM auth.users u, public.roles r WHERE u.email='naeemabdulaziz202@gmail.com' AND r.name='admin' ON CONFLICT DO NOTHING;

COMMIT;
