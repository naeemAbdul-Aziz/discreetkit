-- Add pharmacy_ack_status to orders table
ALTER TABLE public.orders 
ADD COLUMN pharmacy_ack_status text NOT NULL DEFAULT 'pending';

-- Add check constraint for valid status values
ALTER TABLE public.orders
ADD CONSTRAINT pharmacy_ack_status_check 
CHECK (pharmacy_ack_status IN ('pending', 'accepted', 'declined'));

-- Comment on column
COMMENT ON COLUMN public.orders.pharmacy_ack_status IS 'Status of pharmacy acknowledgement: pending, accepted, declined';

-- Add pharmacy_ack_at timestamp
ALTER TABLE public.orders
ADD COLUMN pharmacy_ack_at timestamptz;
