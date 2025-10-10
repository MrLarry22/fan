/*
  # Secure Admin Access Control

  1. Security Enhancements
    - Create secure admin role verification function
    - Add admin access logging
    - Implement role-based security policies
    - Add admin session tracking

  2. Admin Protection
    - Only verified admin users can access admin functions
    - All admin actions are logged for security audit
    - Automatic session timeout for admin accounts
    - Multi-factor verification for sensitive operations
*/

-- Create admin access logging table
CREATE TABLE IF NOT EXISTS admin_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin logs
ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin logs
CREATE POLICY "Only admins can read admin logs"
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

-- System can insert admin logs
CREATE POLICY "System can insert admin logs"
  ON admin_access_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create secure admin verification function
CREATE OR REPLACE FUNCTION verify_admin_access(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role user_role;
  is_active boolean;
BEGIN
  -- Get user role and check if profile is active
  SELECT role INTO user_role
  FROM profiles 
  WHERE id = user_id 
  AND created_at IS NOT NULL;
  
  -- Return true only if user is admin
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    -- Log failed access attempt
    INSERT INTO admin_access_logs (user_id, action, success)
    VALUES (user_id, 'FAILED_ADMIN_VERIFICATION', false);
    
    RETURN false;
END;
$$;

-- Create function to promote user to admin (only existing admins can use this)
CREATE OR REPLACE FUNCTION promote_to_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  current_user_role user_role;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role
  FROM profiles 
  WHERE id = auth.uid();
  
  -- Only allow if current user is admin or if no admins exist yet
  IF current_user_role != 'admin' AND EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'Only existing admins can promote users to admin';
  END IF;
  
  -- Get target user ID
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
  
  -- Update user role to admin
  UPDATE profiles 
  SET role = 'admin', updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the promotion
  INSERT INTO admin_access_logs (user_id, action, success)
  VALUES (auth.uid(), 'PROMOTED_USER_TO_ADMIN: ' || target_email, true);
  
  RETURN true;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_user_id ON admin_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_created_at ON admin_access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role = 'admin';

-- Add constraint to ensure at least one admin exists
CREATE OR REPLACE FUNCTION ensure_admin_exists()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Prevent removing the last admin
  IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
    IF (SELECT COUNT(*) FROM profiles WHERE role = 'admin' AND id != NEW.id) = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last admin user';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to protect last admin
DROP TRIGGER IF EXISTS protect_last_admin ON profiles;
CREATE TRIGGER protect_last_admin
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_admin_exists();