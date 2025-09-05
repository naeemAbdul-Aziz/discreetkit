
-- DiscreetKit Database Schema
-- This schema is designed for a simple, anonymous ordering system.
-- It prioritizes privacy by minimizing stored personal data and ensuring
-- data is handled securely.

-- 1. Orders Table: Stores the core details of each anonymous order.
CREATE TABLE orders (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- A unique, human-readable code for tracking the order anonymously.
    code TEXT NOT NULL UNIQUE,
    
    -- The current status of the order.
    status TEXT NOT NULL DEFAULT 'received', -- e.g., 'received', 'processing', 'out_for_delivery', 'completed'
    
    -- A JSONB array of the items in the cart.
    -- Example: [{"id": 1, "name": "Standard HIV Kit", "quantity": 2, "priceGHS": 75.00}]
    items JSONB NOT NULL,
    
    -- Delivery details. No personal name or address is stored.
    delivery_area TEXT NOT NULL,
    delivery_address_note TEXT, -- Optional notes for the rider.
    
    -- Contact number for the delivery rider. This should be masked in the app and is deleted after delivery.
    phone_masked TEXT NOT NULL,
    
    -- Financial details for record-keeping.
    subtotal NUMERIC(10, 2) NOT NULL,
    student_discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);
COMMENT ON TABLE orders IS 'Stores the core details for each anonymous order.';
COMMENT ON COLUMN orders.code IS 'Unique, human-readable code for anonymous tracking.';
COMMENT ON COLUMN orders.items IS 'JSONB array of items in the cart.';


-- 2. Order Events Table: A log of status changes for each order.
CREATE TABLE order_events (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key linking to the orders table.
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- The status at the time of the event (e.g., 'Processing', 'Out for Delivery').
    status TEXT NOT NULL,
    
    -- A descriptive note for the event (e.g., "Rider has picked up the package.").
    note TEXT
);
COMMENT ON TABLE order_events IS 'A log of status changes for each order, powering the tracking history.';
COMMENT ON COLUMN order_events.order_id IS 'Links the event to a specific order.';


-- 3. Enable Row-Level Security (RLS)
-- This is a crucial security measure in Supabase. It ensures that data is not publicly
-- accessible by default. You must create specific policies to allow access.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;

-- By default, no one can access the data. You would create policies like:
-- - Allow service_role (your backend) to access everything.
-- - Allow an authenticated user to view their own orders (not applicable here as we are anonymous).
-- For this app, since all access is via the secure service_role key on the backend,
-- we don't need to create specific RLS policies for read/write access from the public.
-- The service role bypasses RLS rules.
