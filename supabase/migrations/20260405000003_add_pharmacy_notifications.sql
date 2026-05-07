-- Add notification_preferences JSONB column to pharmacies table
ALTER TABLE public.pharmacies 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"sms_orders": true, "email_orders": true, "low_stock_alerts": false, "weekly_reports": false}'::jsonb;
