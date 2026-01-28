-- Enable Realtime for order_messages
-- This allows the OrderMessages component to receive instant updates without page refresh.

DO $$
BEGIN
    -- Check if publication exists (standard on Supabase)
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Add table to publication if not already added
        ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;
    END IF;
END $$;
