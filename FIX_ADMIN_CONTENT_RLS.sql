-- Quick fix for admin content creation RLS policy issue
-- Run this in your Supabase SQL editor or via migration

-- Drop the existing content policies
DROP POLICY IF EXISTS "Creators can manage own content" ON content;
DROP POLICY IF EXISTS "Subscribed users can read premium content" ON content;

-- Recreate content policies with proper admin access
CREATE POLICY "Creators can manage own content"
  ON content FOR ALL
  TO authenticated
  USING (
    creator_id IN (
      SELECT id FROM creators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all content"
  ON content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Subscribed users can read premium content"
  ON content FOR SELECT
  TO authenticated
  USING (
    NOT is_premium OR
    EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN creators c ON c.id = content.creator_id
      WHERE s.user_id = auth.uid() 
      AND s.creator_id = content.creator_id
      AND s.status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );