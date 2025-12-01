-- Enable pg_trgm for GIN indexing on text columns (fuzzy search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Optimize Service Area Search (Critical for Auto-Assignment)
-- Allows instant ILIKE searches on area_name
CREATE INDEX IF NOT EXISTS pharmacy_service_areas_area_name_gin_idx 
ON public.pharmacy_service_areas USING gin (area_name gin_trgm_ops);

-- 2. Optimize Order Filtering (Admin Dashboard)
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_pharmacy_id_status_idx ON public.orders(pharmacy_id, status);

-- 3. Optimize Inventory Lookups (Auto-Assignment)
-- Ensure fast lookups for stock checks
CREATE INDEX IF NOT EXISTS pharmacy_products_lookup_idx 
ON public.pharmacy_products(pharmacy_id, product_id, is_available);
