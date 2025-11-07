-- Migration: customer enhancements (derived aggregation reliability & performance)
-- Date: 2025-11-07
--
-- Adds supporting indexes for faster admin aggregation queries and prepares a
-- view that could be used later if direct SQL aggregation is preferred.
-- NOTE: Supabase Realtime does not emit changes for views; keep listening to
-- underlying tables for realtime updates.

-- Safety: Use IF NOT EXISTS to avoid errors if already applied manually.
CREATE INDEX IF NOT EXISTS orders_email_idx ON public.orders(email);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at);

-- Optional future: a view for customer aggregates (email/phone/code fallback)
-- Use this if you want to move aggregation server-side with a single SELECT.
-- Currently unused by API code (aggregation happens in route handler).
-- DROP VIEW IF EXISTS customer_aggregates;
-- CREATE VIEW customer_aggregates AS
-- SELECT
--   COALESCE(email, phone_masked, code) AS identifier,
--   email,
--   MIN(created_at) AS first_order,
--   MAX(created_at) AS last_order,
--   COUNT(*) AS orders,
--   SUM(COALESCE(total_price,0)) AS total_spent
-- FROM public.orders
-- GROUP BY 1, email;
-- COMMENT ON VIEW customer_aggregates IS 'Derived customer aggregates from orders with email/phone/code fallback.';
