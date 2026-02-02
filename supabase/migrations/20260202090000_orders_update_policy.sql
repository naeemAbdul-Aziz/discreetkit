-- Optional: Allow pharmacies to update their own orders
-- Only needed if enabling direct client writes with anon key

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pharmacies can update their own orders" ON public.orders;
CREATE POLICY "Pharmacies can update their own orders"
ON public.orders
FOR UPDATE
USING (
  pharmacy_id IN (
    SELECT id FROM public.pharmacies WHERE user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  pharmacy_id IN (
    SELECT id FROM public.pharmacies WHERE user_id = (SELECT auth.uid())
  )
);

-- Note: Admin/service role retains full access via role-based checks or bypass.
