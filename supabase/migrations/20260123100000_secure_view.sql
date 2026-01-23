-- Enable RLS (Security Invoker) on the view so it requires permissions of the querying user
-- This removes the "Unrestricted" warning in Supabase Studio
ALTER VIEW public.pharmacy_payouts_due SET (security_invoker = true);
