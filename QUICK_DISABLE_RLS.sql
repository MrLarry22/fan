-- =====================================================
-- QUICK ADMIN FIX - RUN THIS FIRST!
-- =====================================================
-- This will temporarily disable RLS and make you admin
-- Run this in Supabase SQL Editor

-- 1. Find your user ID (replace with your email)
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'your-email@example.com'; -- CHANGE THIS TO YOUR EMAIL!
BEGIN
  -- Get your user ID
  SELECT id INTO admin_user_id 
  FROM profiles 
  WHERE email = admin_email;
  
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found!', admin_email;
  ELSE
    -- Make you admin
    UPDATE profiles 
    SET role = 'admin' 
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'User % is now admin! User ID: %', admin_email, admin_user_id;
  END IF;
END $$;

-- 2. Temporarily disable RLS on all tables (for testing)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE creators DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- AFTER THIS WORKS, RE-ENABLE RLS WITH PROPER POLICIES
-- =====================================================
-- Once your admin operations work, run this:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE content ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- 
-- Then run the PRODUCTION_FIX_RLS_POLICIES.sql file
