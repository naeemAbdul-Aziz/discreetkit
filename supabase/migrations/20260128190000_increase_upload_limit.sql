-- Increase valid file size for prescriptions bucket to 20MB
UPDATE storage.buckets
SET file_size_limit = 20971520 -- 20MB (20 * 1024 * 1024)
WHERE id = 'prescriptions';
