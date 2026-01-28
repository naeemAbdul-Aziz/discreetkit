-- Make user_id nullable to support anonymous 'code-based' enrollments
ALTER TABLE public.medication_refill_subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- Drop the existing index if it exists and recreate it to be safe, though not strictly necessary for nullable
-- but good to ensure we don't have issues. 
-- Actually, specific index on user_id is fine even with nulls.

-- We might need new RLS policies for anonymous access if we want them to "view" it later, 
-- but for now, the primary goal is insertion.
-- The "Users can create own subscriptions" policy checks `auth.uid() = user_id`.
-- If user_id is NULL and auth.uid() is NULL, this policy might fail or be irrelevant for unauthenticated users.
-- We need a policy to allow anonymous INSERT.

CREATE POLICY "Allow anonymous enrollment"
ON public.medication_refill_subscriptions
FOR INSERT
WITH CHECK (
  auth.uid() IS NULL OR auth.uid() = user_id
);

-- Note: We generally don't want anonymous users to UPDATE or SELECT without strict checks (like knowing the code).
-- So we won't add general anonymous SELECT policies yet. They will rely on the "Success" screen
-- or a specific "Track by Code" server action (admin-privileged) to view details.
