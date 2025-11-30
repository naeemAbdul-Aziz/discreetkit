-- 1. Ensure standard categories have descriptions (fixes the initial seed data)
INSERT INTO public.categories (name, slug, description) VALUES
    ('Testing', 'testing', 'Reliable and discreet testing kits for your peace of mind.'),
    ('Contraception', 'contraception', 'Safe and effective contraceptive options.'),
    ('Protection', 'protection', 'High-quality protection products for safety.'),
    ('Wellness', 'wellness', 'General wellness products for your daily health.'),
    ('Menstrual Care', 'menstrual-care', 'Essential menstrual care products for comfort.')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- 2. Sync any other categories found in existing products
INSERT INTO public.categories (name, slug, description)
SELECT DISTINCT category, 
       trim(both '-' from lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g'))) as slug,
       'Explore our range of ' || category || ' products designed for your needs.' as description
FROM public.products
WHERE category IS NOT NULL 
  AND category != ''
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description
WHERE categories.description IS NULL;
