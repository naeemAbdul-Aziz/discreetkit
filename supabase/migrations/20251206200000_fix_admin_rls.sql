
-- Fix RLS for Pharmacy Service Areas
ALTER TABLE public.pharmacy_service_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pharmacies can view their own areas" ON public.pharmacy_service_areas;
CREATE POLICY "Pharmacies can view their own areas"
    ON public.pharmacy_service_areas FOR SELECT
    USING (pharmacy_id IN (
        SELECT id FROM public.pharmacies WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Pharmacies can manage their own areas" ON public.pharmacy_service_areas;
CREATE POLICY "Pharmacies can manage their own areas"
    ON public.pharmacy_service_areas FOR ALL
    USING (pharmacy_id IN (
        SELECT id FROM public.pharmacies WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Admins can view all areas" ON public.pharmacy_service_areas;
CREATE POLICY "Admins can view all areas"
    ON public.pharmacy_service_areas FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

-- Fix RLS for Pharmacy Products (Inventory)
ALTER TABLE public.pharmacy_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pharmacies can view their own inventory" ON public.pharmacy_products;
CREATE POLICY "Pharmacies can view their own inventory"
    ON public.pharmacy_products FOR SELECT
    USING (pharmacy_id IN (
        SELECT id FROM public.pharmacies WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Pharmacies can manage their own inventory" ON public.pharmacy_products;
CREATE POLICY "Pharmacies can manage their own inventory"
    ON public.pharmacy_products FOR ALL
    USING (pharmacy_id IN (
        SELECT id FROM public.pharmacies WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Admins can view all inventory" ON public.pharmacy_products;
CREATE POLICY "Admins can view all inventory"
    ON public.pharmacy_products FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));
