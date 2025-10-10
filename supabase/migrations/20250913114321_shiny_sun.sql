/*
  # Additional Tables for Fanview Backend

  1. New Tables
    - `content_likes` - User likes on creator content
    - `wallets` - User wallet balances
    - `wallet_transactions` - Wallet transaction history

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table

  3. Indexes
    - Add performance indexes for common queries
*/

-- Content Likes Table
CREATE TABLE IF NOT EXISTS content_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, user_id)
);

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance numeric(10,2) DEFAULT 0.00 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('topup', 'purchase', 'refund')),
  amount numeric(10,2) NOT NULL,
  description text,
  paypal_transaction_id text,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Content Likes Policies
CREATE POLICY "Users can manage their own likes"
  ON content_likes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can read like counts"
  ON content_likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Wallets Policies
CREATE POLICY "Users can read their own wallet"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own wallet"
  ON wallets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create wallets"
  ON wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Wallet Transactions Policies
CREATE POLICY "Users can read their own transactions"
  ON wallet_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create transactions"
  ON wallet_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_likes_content_id ON content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user_id ON content_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- Update function for wallets
CREATE OR REPLACE FUNCTION update_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for wallet updates
DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_updated_at();