
-- Drop existing tables in reverse order of dependency to avoid foreign key conflicts.
DROP TABLE IF EXISTS public.order_events;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.products;

-- Create the products table
-- This table stores all the available health products.
CREATE TABLE public.products (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    description text,
    price_ghs numeric(10, 2) NOT NULL,
    student_price_ghs numeric(10, 2),
    image_url text,
    featured boolean DEFAULT false
);

-- Create the orders table
-- This table stores customer orders and all related details.
CREATE TABLE public.orders (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    code text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'received'::text NOT NULL,
    items jsonb,
    delivery_area text,
    delivery_address_note text,
    phone_masked text,
    subtotal numeric(10, 2),
    student_discount numeric(10, 2),
    delivery_fee numeric(10, 2),
    total_price numeric(10, 2)
);

-- Create the order_events table
-- This table stores a timeline of events for each order, used for tracking.
CREATE TABLE public.order_events (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    order_id bigint REFERENCES public.orders(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status text NOT NULL,
    note text
);

-- Insert initial product data
INSERT INTO public.products (name, description, price_ghs, student_price_ghs, image_url, featured)
VALUES 
    ('Standard HIV Kit', 'A single-use, private HIV self-test kit. WHO-approved for 99% accuracy.', 75.00, 65.00, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757958567/hiv-kit-1_bso3qa.png', true),
    ('Pregnancy Test Kit', 'A reliable, easy-to-use pregnancy test for fast and private results.', 45.00, 35.00, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757958566/preg-test_k6bwch.png', true),
    ('Support Bundle (Couple)', 'Contains two private HIV self-test kits. Test together for mutual support.', 140.00, null, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757958567/hiv-kit-2_tqzqxl.png', true),
    ('Complete Peace of Mind Bundle', 'Contains 1 HIV Kit, 1 Pregnancy Test, and 1 Postpill. Your all-in-one pack.', 200.00, 170.00, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757958567/bundle-1_bf2vda.png', true),
    ('Postpill (Emergency Contraception)', 'A single dose of emergency contraception to be taken after unprotected intercourse.', 90.00, 80.00, '/placeholders/postpill.png', false),
    ('Premium Condom Pack', 'A 12-pack of ultra-thin, lubricated latex condoms for safety and comfort.', 50.00, 40.00, '/placeholders/condoms.png', false),
    ('Aqua-based Personal Lubricant', 'A gentle, water-based lubricant for enhanced comfort. Safe to use with condoms.', 60.00, null, '/placeholders/lubricant.png', false),
    ('Weekend Ready Bundle', 'Includes a 12-pack of condoms and a personal lubricant for complete preparation.', 100.00, null, '/placeholders/weekendBundle.png', false);
