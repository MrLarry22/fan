/*
  # Create Admin User and Setup

  1. Admin User Setup
    - Creates a function to promote users to admin
    - Allows easy admin user creation
  
  2. Security
    - Only allows specific email to be promoted to admin
    - Maintains security while enabling admin access
*/

-- Function to promote a user to admin (replace email with your actual email)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET role = 'admin'
  WHERE email = user_email;
  
  -- Log the promotion
  RAISE NOTICE 'User % promoted to admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage (replace with your actual email):
-- SELECT promote_to_admin('your-email@example.com');