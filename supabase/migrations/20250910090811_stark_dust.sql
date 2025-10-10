/*
  # Create Fanview Platform Schema

  1. New Tables
    - `profiles` - Extended user profiles (linked to auth.users)
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text, optional)
      - `role` (text, enum: admin, creator, user)
      - `bio` (text, optional for creators)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `creators` - Creator specific data
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `display_name` (text)
      - `bio` (text)
      - `avatar_url` (text)
      - `total_subscribers` (integer)
      - `total_revenue` (numeric)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `content` - Creator content library
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references creators)
      - `title` (text)
      - `description` (text)
      - `content_url` (text)
      - `content_type` (text: image, video, text)
      - `is_premium` (boolean)
      - `created_at` (timestamp)
    
    - `subscriptions` - User subscriptions to creators
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `creator_id` (uuid, references creators)
      - `paypal_subscription_id` (text)
      - `status` (text: active, inactive, cancelled)
      - `start_date` (timestamp)
      - `end_date` (timestamp, nullable)
      - `amount` (numeric, default 5.00)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Users can read their own data
    - Creators can manage their content
    - Admins have full access
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'creator', 'user');
CREATE TYPE content_type AS ENUM ('image', 'video', 'text');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'pending');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'user',
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Creators table
CREATE TABLE IF NOT EXISTS creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  bio text,
  avatar_url text,
  total_subscribers integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content_url text NOT NULL,
  content_type content_type NOT NULL,
  is_premium boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  paypal_subscription_id text,
  status subscription_status NOT NULL DEFAULT 'pending',
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  amount numeric(5,2) DEFAULT 5.00,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, creator_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can read public profile data"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Creators policies
CREATE POLICY "Anyone can read active creators"
  ON creators FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Creators can update own data"
  ON creators FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all creators"
  ON creators FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Content policies
CREATE POLICY "Creators can manage own content"
  ON content FOR ALL
  TO authenticated
  USING (
    creator_id IN (
      SELECT id FROM creators WHERE user_id = auth.uid()
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

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Creators can read their subscriber data"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    creator_id IN (
      SELECT id FROM creators WHERE user_id = auth.uid()
    )
  );

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();