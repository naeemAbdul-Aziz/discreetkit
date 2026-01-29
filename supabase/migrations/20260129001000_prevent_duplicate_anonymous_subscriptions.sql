-- Migration: Clean up duplicates and prevent future duplicate anonymous subscriptions
-- Step 1: Identify and handle existing duplicates before adding unique constraint

-- 1. Create the phone extraction function first
CREATE OR REPLACE FUNCTION get_subscription_phone(delivery_address jsonb)
RETURNS text AS $$
BEGIN
  RETURN delivery_address->>'phone';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Cancel duplicate active subscriptions (keep only the oldest one per phone+product)
-- This marks newer duplicates as 'cancelled' so they don't block the unique index
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY get_subscription_phone(delivery_address), product_id 
      ORDER BY enrolled_at ASC  -- Keep the oldest subscription
    ) as rn
  FROM public.medication_refill_subscriptions
  WHERE status = 'active'
)
UPDATE public.medication_refill_subscriptions
SET status = 'cancelled',
    updated_at = now()
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Now add the unique index (will succeed since duplicates are cancelled)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_phone_product_subscription
ON public.medication_refill_subscriptions (get_subscription_phone(delivery_address), product_id)
WHERE status = 'active';

-- 4. Add comment explaining the constraint
COMMENT ON INDEX public.unique_active_phone_product_subscription IS 
'Prevents the same phone number from creating duplicate active subscriptions for the same product. This ensures anonymous users cannot accidentally create multiple subscriptions.';
