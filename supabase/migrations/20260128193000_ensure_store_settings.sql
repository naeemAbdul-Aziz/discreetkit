-- Ensure we have one row in store_settings to prevent PGRST116
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
