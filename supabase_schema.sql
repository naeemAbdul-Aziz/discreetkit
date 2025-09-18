-- Drop the existing products table if it exists to start fresh.
DROP TABLE IF EXISTS products;

-- Create the products table.
CREATE TABLE products (
    id bigint PRIMARY KEY,
    name text NOT NULL,
    description text,
    price_ghs numeric NOT NULL,
    student_price_ghs numeric,
    image_url text,
    featured boolean
);

-- Insert the product data.
INSERT INTO products (id, name, description, price_ghs, student_price_ghs, image_url, featured) VALUES
(1, 'Standard HIV Kit', 'A single-use, private HIV self-test kit. It is WHO-approved for 99% accuracy.', 75.00, 65.00, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756313856/hiv_kit_v2_fmuuta.png', true),
(2, 'Pregnancy Test Kit', 'A reliable, easy-to-use pregnancy test for fast and private results.', 45.00, 35.00, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756313856/preg_kit_v2_wcbpws.png', true),
(3, 'Support Bundle (Couple)', 'Contains two private HIV self-test kits. Encourages testing together for mutual support.', 140.00, NULL, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756313856/couple_bundle_v2_oojvqn.png', true),
(4, 'Postpill (Emergency Contraception)', 'A single dose of emergency contraception to be taken after unprotected intercourse.', 90.00, 80.00, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/c_pad,b_auto,h_188,w_250/v1758129053/postpill_dfkczf.png', true),
(5, 'Premium Condom Pack', 'A 12-pack of ultra-thin, lubricated latex condoms for safety and comfort.', 50.00, 40.00, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/c_pad,b_auto,h_188,w_250/v1758129053/condoms_c0x9v8.png', false),
(6, 'Aqua-based Personal Lubricant', 'A gentle, water-based lubricant for enhanced comfort. Safe to use with condoms.', 60.00, NULL, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/c_pad,b_auto,h_188,w_250/v1758129053/lube_z8k5p6.png', false),
(7, 'Weekend Ready Bundle', 'Includes a 12-pack of condoms and a personal lubricant for complete preparation.', 100.00, NULL, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/c_pad,b_auto,h_188,w_250/v1758129053/weekend_bundle_d3a3td.png', false),
(8, 'Complete Peace of Mind Bundle', 'Contains 1 HIV Kit, 1 Pregnancy Test, and 1 Postpill. Your all-in-one pack.', 200.00, 170.00, 'https://res.cloudinary.com/dzfa6wqb8/image/upload/c_pad,b_auto,h_188,w_250/v1758129053/peace_of_mind_bundle_bvg3lx.png', false);
