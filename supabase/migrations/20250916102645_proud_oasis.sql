/*
  # Fix Admin Function Conflict

  1. Database Changes
    - Drop existing promote_to_admin function if it exists
    - Recreate with correct return type
    - Add admin access logging table
    - Add security policies

  2. Security Features
    - Admin verification function
    - Access logging for security audit
    - Row level security on all tables
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS promote_to_admin(text);

-- Create admin access logs table
CREATE TABLE IF NOT EXISTS admin_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin access logs
ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access logs (only admins can read)
CREATE POLICY "Only admins can read access logs"
  ON admin_access_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create policy for system to insert logs
CREATE POLICY "System can insert access logs"
  ON admin_access_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create admin verification function with correct return type
CREATE OR REPLACE FUNCTION verify_admin_access(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user exists and has admin role
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE email = user_email 
    AND role = 'admin'
    AND created_at IS NOT NULL
    AND updated_at IS NOT NULL
  );
END;
$$;

-- Create function to promote user to admin (for initial setup only)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record profiles%ROWTYPE;
  result json;
BEGIN
  -- Find user by email
  SELECT * INTO user_record
  FROM profiles
  WHERE email = user_email;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;
  
  -- Update user role to admin
  UPDATE profiles
  SET role = 'admin',
      updated_at = now()
  WHERE email = user_email;
  
  -- Log the promotion
  INSERT INTO admin_access_logs (user_id, action, success, created_at)
  VALUES (user_record.id, 'PROMOTED_TO_ADMIN', true, now());
  
  RETURN json_build_object(
    'success', true,
    'message', 'User promoted to admin successfully',
    'user_id', user_record.id
  );
END;
$$;

-- Create function to check admin count (prevent removing last admin)
CREATE OR REPLACE FUNCTION get_admin_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM profiles
    WHERE role = 'admin'
  );
END;
$$;

-- Add index for better performance on admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_role_admin 
ON profiles (role) 
WHERE role = 'admin';

-- Add index for admin access logs
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_user_id 
ON admin_access_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_admin_access_logs_created_at 
ON admin_access_logs (created_at DESC);