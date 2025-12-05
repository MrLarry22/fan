-- Fix foreign key for creators to profiles
-- Run this in Supabase SQL Editor

-- Check current constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'creators' AND tc.constraint_type = 'FOREIGN KEY';

-- If no foreign key exists, add it
ALTER TABLE creators
ADD CONSTRAINT creators_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Verify
SELECT 'Foreign key added successfully' as result;
