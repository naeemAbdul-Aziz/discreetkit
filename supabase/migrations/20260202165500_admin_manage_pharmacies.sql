-- Fix RLS to allow Admins to Update and Delete Pharmacies
-- Previous policy only allowed 'service_role' or the 'owner' (user_id) to update.
-- This prevented Admins (who are authenticated users with 'admin' role) from managing partners.

DROP POLICY IF EXISTS "Allow admin update pharmacies" ON public.pharmacies;
DROP POLICY IF EXISTS "Allow admin delete pharmacies" ON public.pharmacies;

-- New UPDATE Policy: Allow Owner OR Admin OR Service Role
CREATE POLICY "Allow admin and owner update pharmacies" ON public.pharmacies 
FOR UPDATE USING (
    auth.role() = 'service_role' 
    OR user_id = (SELECT auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin')
);

-- New DELETE Policy: Allow Owner OR Admin OR Service Role
CREATE POLICY "Allow admin and owner delete pharmacies" ON public.pharmacies 
FOR DELETE USING (
    auth.role() = 'service_role' 
    OR user_id = (SELECT auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin')
);
