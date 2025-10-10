-- FIX DATABASE SCRIPT
-- Run this in your Supabase SQL Editor to fix the foreign key issue

-- Step 1: Check if the creators table exists and has data
SELECT 'Checking creators table...' as step;
SELECT id, user_id, display_name FROM public.creators;

-- Step 2: Check the foreign key constraint
SELECT 'Checking foreign key constraints...' as step;
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
WHERE tc.table_name = 'content' AND tc.constraint_type = 'FOREIGN KEY';

-- Step 3: Drop and recreate the foreign key constraint (if it's pointing to wrong place)
ALTER TABLE IF EXISTS content DROP CONSTRAINT IF EXISTS content_creator_id_fkey;

-- Step 4: Recreate the foreign key constraint pointing to public.creators
ALTER TABLE content 
ADD CONSTRAINT content_creator_id_fkey 
FOREIGN KEY (creator_id) 
REFERENCES public.creators(id) 
ON DELETE CASCADE;

-- Step 5: Run missing migrations
ALTER TABLE creators ADD COLUMN IF NOT EXISTS folder_name VARCHAR(50);
ALTER TABLE creators ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS media_count INTEGER DEFAULT 0;

-- Step 6: Verify the fix
SELECT 'Verification - Creators:' as step;
SELECT id, user_id, display_name FROM public.creators;

SELECT 'Verification - Foreign Key:' as step;
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'content' AND constraint_type = 'FOREIGN KEY';

SELECT 'Done! Try uploading content now.' as result;
