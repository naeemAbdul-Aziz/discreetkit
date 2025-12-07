-- Add courier details to orders table to support asset-light delivery model
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS courier_name text,
ADD COLUMN IF NOT EXISTS courier_phone text,
ADD COLUMN IF NOT EXISTS courier_tracking_url text;

COMMENT ON COLUMN public.orders.courier_name IS 'Name of the dispatch rider or service (e.g. Bolt, Uber, Private).';
COMMENT ON COLUMN public.orders.courier_phone IS 'Contact number of the rider for the customer.';
COMMENT ON COLUMN public.orders.courier_tracking_url IS 'External tracking link if available.';
