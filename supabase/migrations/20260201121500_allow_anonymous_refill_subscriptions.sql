-- Migration: Allow anonymous refill subscriptions by making user_id nullable
-- Context: The enrollment flow is anonymous and uses the service role to insert
-- into medication_refill_subscriptions with user_id = NULL. The original schema
-- required user_id NOT NULL, causing insert failures. This migration drops the
-- NOT NULL constraint while preserving existing RLS policies and indexes.

BEGIN;

-- 1) Make user_id nullable
ALTER TABLE public.medication_refill_subscriptions
  ALTER COLUMN user_id DROP NOT NULL;

-- 2) Add explanatory comment for future clarity
COMMENT ON COLUMN public.medication_refill_subscriptions.user_id IS 'Optional. NULL for anonymous subscriptions enrolled without an authenticated user.';

-- 3) Validate existing unique index for anonymous duplicates remains intact
-- The unique index on (get_subscription_phone(delivery_address), product_id)
-- WHERE status = 'active' continues to prevent duplicate active subscriptions
-- for the same phone+product even when user_id is NULL.

COMMIT;
