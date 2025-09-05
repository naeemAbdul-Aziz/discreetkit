-- This is the schema for the DiscreetKit database.
-- It is designed to be simple, secure, and privacy-focused.
-- Run this SQL in your Supabase project to set up the necessary tables.


-- Create a custom ENUM type for order statuses.
-- Using an ENUM ensures data integrity, as the 'status' column in the 'orders'
-- table can only have one of these predefined values. This is more robust
-- than using a plain text field.
CREATE TYPE order_status AS ENUM (
  'received', 
  'processing', 
  'out_for_delivery', 
  'completed'
);

-- Create the 'orders' table.
-- This table stores the core information for each order.
-- It is designed to be anonymous, storing no personal user data like names or emails.
CREATE TABLE
  orders (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    -- Unique, human-readable code for tracking the order. Indexed for fast lookups.
    code TEXT NOT NULL UNIQUE,
    -- The current status of the order, using our custom ENUM type.
    status order_status NOT NULL DEFAULT 'received',
    -- A JSONB field to store the items in the cart. Flexible for different products.
    items JSONB NOT NULL,
    -- The general area for delivery (e.g., "Legon Campus", "Osu").
    delivery_area TEXT,
    -- Optional specific notes for the delivery rider.
    delivery_address_note TEXT,
    -- The contact number for the delivery rider. It should be masked in the application.
    phone_masked TEXT,
    -- Financial details for the order.
    subtotal NUMERIC(10, 2) NOT NULL,
    student_discount NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    -- Timestamp for when the order was created.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

-- Add an index on the 'code' column for faster queries when a user tracks an order.
CREATE INDEX idx_orders_code ON orders (code);

-- Create the 'order_events' table.
-- This table stores the history of status changes for each order, creating a timeline.
CREATE TABLE
  order_events (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    -- Foreign key linking this event to an order. If an order is deleted, its events are also deleted.
    order_id BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    -- A user-friendly description of the status (e.g., "Order Received", "Out for Delivery").
    status TEXT NOT NULL,
    -- Optional detailed notes about the event (e.g., "Rider has picked up the package").
    note TEXT,
    -- Timestamp for when the event occurred.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

-- Add an index on 'order_id' for faster retrieval of an order's event history.
CREATE INDEX idx_order_events_order_id ON order_events (order_id);
