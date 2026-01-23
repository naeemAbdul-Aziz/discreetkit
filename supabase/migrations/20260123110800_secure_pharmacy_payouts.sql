-- Secure Pharmacy Payouts View
-- Restricts access to pharmacy_payouts_due view to admins and respective pharmacy owners

-- 1. Enable RLS on the view by setting security_invoker
-- This was already done in 20260123100000_secure_view.sql, but we'll ensure it's set

-- 2. Create RLS policies for the underlying tables that the view depends on
-- The view queries: orders, pharmacies
-- We need to ensure these tables have proper RLS

-- 3. Grant appropriate permissions
-- Only admins and pharmacy owners should see payout data

-- Revoke public access to the view
REVOKE ALL ON public.pharmacy_payouts_due FROM PUBLIC;
REVOKE ALL ON public.pharmacy_payouts_due FROM anon;
REVOKE ALL ON public.pharmacy_payouts_due FROM authenticated;

-- Grant SELECT to authenticated users (will be filtered by RLS on underlying tables)
GRANT SELECT ON public.pharmacy_payouts_due TO authenticated;

-- Ensure the view uses security_invoker (already done, but confirming)
ALTER VIEW public.pharmacy_payouts_due SET (security_invoker = true);

-- 4. Ensure orders table has proper RLS for pharmacy access
-- Pharmacies should only see their own orders

-- Check if RLS is enabled on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing pharmacy policy if it exists
DROP POLICY IF EXISTS "Pharmacies can view their own orders" ON public.orders;

-- Create policy: Pharmacies can only view their own orders
CREATE POLICY "Pharmacies can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
    -- Admin can see all
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    )
    OR
    -- Pharmacy can see only their orders
    EXISTS (
        SELECT 1 FROM public.pharmacies p
        WHERE p.id = orders.pharmacy_id
        AND p.user_id = auth.uid()
    )
);

-- 5. Ensure pharmacies table has proper RLS
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;

-- Drop existing pharmacy policy if it exists
DROP POLICY IF EXISTS "Pharmacies can view their own data" ON public.pharmacies;

-- Create policy: Pharmacies can only view their own data
CREATE POLICY "Pharmacies can view their own data"
ON public.pharmacies
FOR SELECT
TO authenticated
USING (
    -- Admin can see all
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    )
    OR
    -- Pharmacy can see only their own data
    user_id = auth.uid()
);

-- 6. Add comment explaining the security model
COMMENT ON VIEW public.pharmacy_payouts_due IS 'Secured view showing payout calculations. Access restricted via RLS on underlying tables (orders, pharmacies). Only admins can see all payouts, pharmacies can only see their own.';
