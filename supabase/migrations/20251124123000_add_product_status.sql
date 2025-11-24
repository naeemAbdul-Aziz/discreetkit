-- Migration: add product status field for inline editing
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft','archived'));

-- Backfill nulls if any existing rows (should not be needed due to default)
UPDATE public.products SET status = 'active' WHERE status IS NULL;
