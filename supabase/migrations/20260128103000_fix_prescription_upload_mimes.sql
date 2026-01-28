-- Expand allowed MIME types for prescriptions bucket
-- Users might upload webp, heic, or other image formats.

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'image/gif', 
    'image/bmp', 
    'image/jpg', 
    'application/pdf'
]
WHERE id = 'prescriptions';
