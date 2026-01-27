-- Create prescriptions bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'prescriptions',
    'prescriptions',
    false, -- Private bucket
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Users can upload own prescriptions" ON storage.objects;
CREATE POLICY "Users can upload own prescriptions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'prescriptions' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files (if needed for dashboard)
DROP POLICY IF EXISTS "Users can view own prescriptions" ON storage.objects;
CREATE POLICY "Users can view own prescriptions"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'prescriptions' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins/Pharmacies might need access (via signed URLs usually, or RLS if we grant them access)
-- For now, keep strictly private.
