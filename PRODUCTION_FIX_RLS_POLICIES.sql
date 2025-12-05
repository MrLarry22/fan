-- =====================================================
-- PRODUCTION-READY RLS POLICY FIX
-- Run this in Supabase SQL Editor to fix all RLS issues
-- =====================================================

-- STEP 1: DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Drop creators policies
DROP POLICY IF EXISTS "Anyone can view creators" ON creators;
DROP POLICY IF EXISTS "Creators can update own profile" ON creators;
DROP POLICY IF EXISTS "Admins can manage all creators" ON creators;

-- Drop content policies
DROP POLICY IF EXISTS "Creators can manage own content" ON content;
DROP POLICY IF EXISTS "Subscribed users can read premium content" ON content;
DROP POLICY IF EXISTS "Admins can manage all content" ON content;
DROP POLICY IF EXISTS "Anyone can view non-premium content" ON content;

-- Drop subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;


-- STEP 2: CREATE COMPREHENSIVE RLS POLICIES
-- =====================================================

-- PROFILES TABLE POLICIES
-- =====================================================
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can do everything with profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- CREATORS TABLE POLICIES
-- =====================================================
CREATE POLICY "Anyone can view creators"
  ON creators FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own creator profile"
  ON creators FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own creator profile"
  ON creators FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can do everything with creators"
  ON creators FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- CONTENT TABLE POLICIES
-- =====================================================
CREATE POLICY "Anyone can view non-premium content"
  ON content FOR SELECT
  TO public
  USING (is_premium = false);

CREATE POLICY "Subscribed users can view premium content"
  ON content FOR SELECT
  TO authenticated
  USING (
    is_premium = false OR
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid() 
      AND s.creator_id = content.creator_id
      AND s.status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Creators can manage own content"
  ON content FOR ALL
  TO authenticated
  USING (
    creator_id IN (
      SELECT id FROM creators WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    creator_id IN (
      SELECT id FROM creators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can do everything with content"
  ON content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- SUBSCRIPTIONS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Creators can view subscriptions to them"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    creator_id IN (
      SELECT id FROM creators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can do everything with subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- STEP 3: VERIFY YOUR ADMIN ROLE
-- =====================================================
-- Run this to check if your account has admin role:
-- SELECT id, email, role FROM profiles WHERE role = 'admin';

-- If you don't have admin role, run this (replace with your email):
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';


-- STEP 4: GRANT NECESSARY PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;


-- =====================================================
-- DONE! Your RLS policies are now production-ready
-- =====================================================
