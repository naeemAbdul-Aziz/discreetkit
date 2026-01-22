-- Migration: Performance & Security Optimization
-- Date: 2026-01-20
-- Description: Adds missing foreign key indexes and optimizes RLS policies.

-- ==========================================
-- 1. INDEX OPTIMIZATION (Fixes "Unindexed Foreign Keys")
-- ==========================================

-- Orders: Index heavily queried columns if missing
CREATE INDEX IF NOT EXISTS orders_pharmacy_id_idx ON public.orders(pharmacy_id);
-- Note: 'user_id' not on orders in consolidated schema, but if it exists in live DB:
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
    END IF;
END $$;

-- Order Events: FK to orders
CREATE INDEX IF NOT EXISTS order_events_order_id_idx ON public.order_events(order_id);

-- Order Messages: FKs
CREATE INDEX IF NOT EXISTS order_messages_sender_id_idx ON public.order_messages(sender_id);

-- Order Cancellations: FKs
CREATE INDEX IF NOT EXISTS order_cancellations_approved_by_idx ON public.order_cancellations(approved_by);

-- Product Requests: FK to pharmacies
CREATE INDEX IF NOT EXISTS product_requests_pharmacy_id_idx ON public.product_requests(pharmacy_id);

-- User Roles: FK to roles (Fixes "Unindexed Foreign Keys" for public.user_roles)
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles(user_id); -- Often auto-indexed by PK, but good to ensure if PK is composite

-- JSONB GIN Index (Performance for filtering/querying items)
CREATE INDEX IF NOT EXISTS orders_items_gin_idx ON public.orders USING GIN (items);

-- Inventory Reservations: FK to products (pharmacy_id already indexed usually, but good to ensure composite)
CREATE INDEX IF NOT EXISTS inventory_reservations_product_id_idx ON public.inventory_reservations(product_id);
-- Compound index for faster lookups by pharmacy+product (common pattern)
CREATE INDEX IF NOT EXISTS inventory_reservations_pharmacy_product_idx ON public.inventory_reservations(pharmacy_id, product_id);

-- ==========================================
-- 2. RLS OPTIMIZATION (Fixes "Auth RLS Initialization Plan")
-- ==========================================
-- Wrapping auth.uid() in (SELECT auth.uid()) prevents it from being called for every row 
-- in some complex joins, improving query planner performance.

-- Optimize: User Roles (Deeply nested in other policies, critical for perm check)
-- "Init Plan" warning suggests current_setting/auth.uid is called too often.
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (
    user_id = (SELECT auth.uid())
);

-- Optimize: Pharmacies
DROP POLICY IF EXISTS "Pharmacy users can view their own pharmacy" ON public.pharmacies;
CREATE POLICY "Pharmacy users can view their own pharmacy" ON public.pharmacies FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR (SELECT auth.role()) = 'service_role'
);

-- Optimize: Pharmacy Products (Inventory)
DROP POLICY IF EXISTS "Pharmacies can view their own inventory" ON public.pharmacy_products;
CREATE POLICY "Pharmacies can view their own inventory" ON public.pharmacy_products FOR SELECT USING (
    pharmacy_id IN (
        SELECT id FROM public.pharmacies WHERE user_id = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "Pharmacies can manage their own inventory" ON public.pharmacy_products;
CREATE POLICY "Pharmacies can manage their own inventory" ON public.pharmacy_products FOR ALL USING (
    pharmacy_id IN (
        SELECT id FROM public.pharmacies WHERE user_id = (SELECT auth.uid())
    )
);

-- Optimize: Orders
-- Simplify "Pharmacies can view assigned orders" to avoid joining generic roles if possible, 
-- but we need to join pharmacies table.
DROP POLICY IF EXISTS "Pharmacies can view assigned orders" ON public.orders;
CREATE POLICY "Pharmacies can view assigned orders" ON public.orders FOR SELECT USING (
    pharmacy_id IN (
        SELECT id FROM public.pharmacies WHERE user_id = (SELECT auth.uid())
    )
);

-- ==========================================
-- 3. SECURITY HARDENING (Fixes "Multiple Permissive Policies")
-- ==========================================

-- Review: Categories (Previously "Admin full access" + others?) 
-- Ensure we don't have overlapping public write access.
-- (Consolidated schema looked okay: "Admin full" All + "Public read" Select presumably implies read-only public)

-- Ensure Public Read Only on Categories
DROP POLICY IF EXISTS "Public read access" ON public.categories;
CREATE POLICY "Public read access" ON public.categories FOR SELECT USING (true);

-- Review: Order Cancellations
-- Drop redundant "View" policy if "Manage" (ALL) exists for verified admins.
DROP POLICY IF EXISTS "Admins can view all cancellations" ON public.order_cancellations;

-- Optimize: Payment Events
DROP POLICY IF EXISTS "Admin full access" ON public.payment_events;
CREATE POLICY "Admin full access" ON public.payment_events FOR ALL USING (
    (SELECT auth.role()) = 'service_role'
);

-- Optimize: Suggestions
DROP POLICY IF EXISTS "Admin full access" ON public.suggestions;
CREATE POLICY "Admin full access" ON public.suggestions FOR ALL USING (
    (SELECT auth.role()) = 'service_role'
);

-- Optimize: Pharmacy Notifications
DROP POLICY IF EXISTS "Admin full access" ON public.pharmacy_notifications;
CREATE POLICY "Admin full access" ON public.pharmacy_notifications FOR ALL USING (
    (SELECT auth.role()) = 'service_role'
);

-- Optimize: Product Requests
DROP POLICY IF EXISTS "Pharmacies can view their own requests" ON public.product_requests;
CREATE POLICY "Pharmacies can view their own requests" ON public.product_requests FOR SELECT USING (
    pharmacy_id IN (SELECT id FROM public.pharmacies WHERE user_id = (SELECT auth.uid()))
);
DROP POLICY IF EXISTS "Pharmacies can insert their own requests" ON public.product_requests;
CREATE POLICY "Pharmacies can insert their own requests" ON public.product_requests FOR INSERT WITH CHECK (
    pharmacy_id IN (SELECT id FROM public.pharmacies WHERE user_id = (SELECT auth.uid()))
);
DROP POLICY IF EXISTS "Admins can view all requests" ON public.product_requests;
CREATE POLICY "Admins can view all requests" ON public.product_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin')
);

-- Optimize: Pharmacy Service Areas
DROP POLICY IF EXISTS "Pharmacies can view their own areas" ON public.pharmacy_service_areas;
CREATE POLICY "Pharmacies can view their own areas" ON public.pharmacy_service_areas FOR SELECT USING (
    pharmacy_id IN (SELECT id FROM public.pharmacies WHERE user_id = (SELECT auth.uid()))
);
DROP POLICY IF EXISTS "Pharmacies can manage their own areas" ON public.pharmacy_service_areas;
CREATE POLICY "Pharmacies can manage their own areas" ON public.pharmacy_service_areas FOR ALL USING (
    pharmacy_id IN (SELECT id FROM public.pharmacies WHERE user_id = (SELECT auth.uid()))
);
DROP POLICY IF EXISTS "Admins can view all areas" ON public.pharmacy_service_areas;
CREATE POLICY "Admins can view all areas" ON public.pharmacy_service_areas FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin')
);

-- Optimize: Order Messages
DROP POLICY IF EXISTS "Admins can view all messages" ON public.order_messages;
CREATE POLICY "Admins can view all messages" ON public.order_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin')
);
DROP POLICY IF EXISTS "Pharmacies can view their order messages" ON public.order_messages;
CREATE POLICY "Pharmacies can view their order messages" ON public.order_messages FOR SELECT USING (
    NOT is_internal AND order_id IN (
        SELECT o.id FROM public.orders o JOIN public.pharmacies p ON o.pharmacy_id = p.id WHERE p.user_id = (SELECT auth.uid())
    )
);
-- (Note: Insert policies with 'WITH CHECK' are harder to wrap in subqueries effectively without breaking logic, 
-- but simpler SELECT policies yield the biggest perf wins.)

-- Optimize: Order Cancellations
DROP POLICY IF EXISTS "Admins can manage cancellations" ON public.order_cancellations;
CREATE POLICY "Admins can manage cancellations" ON public.order_cancellations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin')
);

-- Optimize: Inventory Reservations
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.inventory_reservations;
CREATE POLICY "Admins can view all reservations" ON public.inventory_reservations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin')
);
DROP POLICY IF EXISTS "Pharmacies can view their reservations" ON public.inventory_reservations;
CREATE POLICY "Pharmacies can view their reservations" ON public.inventory_reservations FOR SELECT USING (
    pharmacy_id IN (SELECT id FROM public.pharmacies WHERE user_id = (SELECT auth.uid()))
);

-- Ensure RLS is enabled on all tables (Critical for "RLS Disabled in Public" warnings)
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_products ENABLE ROW LEVEL SECURITY;

-- Add comment to track migration
COMMENT ON DATABASE postgres IS 'Applied migration: 20260120120000_perf_security_optimization.sql';
