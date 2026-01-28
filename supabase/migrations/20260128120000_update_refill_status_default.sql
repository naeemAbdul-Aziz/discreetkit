-- Migration: Update Medication Refill Subscriptions Status
-- Change default status to 'pending_verification' and update constraints.

-- 1. Drop existing check constraint if likely to conflict (or just replace it)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medication_refill_subscriptions_status_check') THEN
        ALTER TABLE public.medication_refill_subscriptions DROP CONSTRAINT medication_refill_subscriptions_status_check;
    END IF;
END $$;

-- 2. Update default value
ALTER TABLE public.medication_refill_subscriptions 
    ALTER COLUMN status SET DEFAULT 'pending_verification';

-- 3. Add new check constraint
ALTER TABLE public.medication_refill_subscriptions 
    ADD CONSTRAINT medication_refill_subscriptions_status_check 
    CHECK (status IN ('active', 'paused', 'cancelled', 'pending_verification'));

-- 4. Passively update existing active/null rows if desired? 
-- No, existing enrollments should remain 'active' to avoid breaking them. 
-- New enrollments will be 'pending_verification'.
