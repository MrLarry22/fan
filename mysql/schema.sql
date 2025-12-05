-- =====================================================
-- FANVIEW PLATFORM - MYSQL SCHEMA
-- Migration from Supabase (PostgreSQL) to MySQL
-- =====================================================

-- Drop existing database if it exists (use with caution in production)
-- DROP DATABASE IF EXISTS fanview;

-- Create database
CREATE DATABASE IF NOT EXISTS fanview
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE fanview;

-- =====================================================
-- USERS TABLE (replaces auth.users from Supabase)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires DATETIME,
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_sign_in_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_email_verification_token (email_verification_token),
  INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role ENUM('admin', 'creator', 'user') NOT NULL DEFAULT 'user',
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CREATORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS creators (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  bio TEXT,
  location VARCHAR(255),
  avatar_url TEXT,
  banner_url TEXT,
  folder_name VARCHAR(255) UNIQUE,
  total_subscribers INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  total_likes INT DEFAULT 0,
  media_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_username (username),
  INDEX idx_is_active (is_active),
  INDEX idx_total_subscribers (total_subscribers)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CONTENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS content (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  creator_id CHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content_url TEXT NOT NULL,
  content_type ENUM('image', 'video', 'text') NOT NULL,
  is_premium BOOLEAN DEFAULT TRUE,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE,
  INDEX idx_creator_id (creator_id),
  INDEX idx_is_premium (is_premium),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  creator_id CHAR(36) NOT NULL,
  paypal_subscription_id VARCHAR(255),
  status ENUM('active', 'inactive', 'cancelled', 'pending') NOT NULL DEFAULT 'pending',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NULL,
  amount DECIMAL(10,2) DEFAULT 5.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE,
  UNIQUE KEY unique_paypal_subscription (paypal_subscription_id),
  INDEX idx_user_id (user_id),
  INDEX idx_creator_id (creator_id),
  INDEX idx_status (status),
  INDEX idx_paypal_subscription_id (paypal_subscription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS likes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  content_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_content_like (user_id, content_id),
  INDEX idx_user_id (user_id),
  INDEX idx_content_id (content_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  sender_id CHAR(36) NOT NULL,
  recipient_id CHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_sender_id (sender_id),
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PAYMENT_TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  creator_id CHAR(36) NOT NULL,
  subscription_id CHAR(36),
  paypal_transaction_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  transaction_type ENUM('subscription', 'tip', 'purchase') NOT NULL DEFAULT 'subscription',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_creator_id (creator_id),
  INDEX idx_subscription_id (subscription_id),
  INDEX idx_paypal_transaction_id (paypal_transaction_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC COUNTS
-- =====================================================

-- Trigger to update likes_count in content table
DELIMITER $$
CREATE TRIGGER after_like_insert
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
  UPDATE content SET likes_count = likes_count + 1 WHERE id = NEW.content_id;
  UPDATE creators SET total_likes = total_likes + 1 
  WHERE id = (SELECT creator_id FROM content WHERE id = NEW.content_id);
END$$

CREATE TRIGGER after_like_delete
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
  UPDATE content SET likes_count = likes_count - 1 WHERE id = OLD.content_id;
  UPDATE creators SET total_likes = total_likes - 1 
  WHERE id = (SELECT creator_id FROM content WHERE id = OLD.content_id);
END$$
DELIMITER ;

-- Trigger to update media_count in creators table
DELIMITER $$
CREATE TRIGGER after_content_insert
AFTER INSERT ON content
FOR EACH ROW
BEGIN
  UPDATE creators SET media_count = media_count + 1 WHERE id = NEW.creator_id;
END$$

CREATE TRIGGER after_content_delete
AFTER DELETE ON content
FOR EACH ROW
BEGIN
  UPDATE creators SET media_count = media_count - 1 WHERE id = OLD.creator_id;
END$$
DELIMITER ;

-- Trigger to update total_subscribers in creators table
DELIMITER $$
CREATE TRIGGER after_subscription_insert
AFTER INSERT ON subscriptions
FOR EACH ROW
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE creators SET total_subscribers = total_subscribers + 1 WHERE id = NEW.creator_id;
  END IF;
END$$

CREATE TRIGGER after_subscription_update
AFTER UPDATE ON subscriptions
FOR EACH ROW
BEGIN
  IF OLD.status != 'active' AND NEW.status = 'active' THEN
    UPDATE creators SET total_subscribers = total_subscribers + 1 WHERE id = NEW.creator_id;
  ELSEIF OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE creators SET total_subscribers = total_subscribers - 1 WHERE id = NEW.creator_id;
  END IF;
END$$
DELIMITER ;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to get creator statistics
DELIMITER $$
CREATE PROCEDURE get_creator_stats(IN creator_id_param CHAR(36))
BEGIN
  SELECT 
    c.id,
    c.display_name,
    c.total_subscribers,
    c.total_revenue,
    c.total_likes,
    c.media_count,
    COUNT(DISTINCT s.id) as active_subscriptions,
    COUNT(DISTINCT co.id) as total_content
  FROM creators c
  LEFT JOIN subscriptions s ON c.id = s.creator_id AND s.status = 'active'
  LEFT JOIN content co ON c.id = co.creator_id
  WHERE c.id = creator_id_param
  GROUP BY c.id;
END$$
DELIMITER ;

-- Procedure to check if user has active subscription
DELIMITER $$
CREATE PROCEDURE check_subscription(
  IN user_id_param CHAR(36),
  IN creator_id_param CHAR(36),
  OUT has_subscription BOOLEAN
)
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM subscriptions
    WHERE user_id = user_id_param
    AND creator_id = creator_id_param
    AND status = 'active'
    AND (end_date IS NULL OR end_date > NOW())
  ) INTO has_subscription;
END$$
DELIMITER ;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for creator profiles with user info
CREATE OR REPLACE VIEW creator_profiles_view AS
SELECT 
  c.id,
  c.user_id,
  c.display_name,
  c.username,
  c.bio,
  c.location,
  c.avatar_url,
  c.banner_url,
  c.total_subscribers,
  c.total_revenue,
  c.total_likes,
  c.media_count,
  c.is_active,
  c.created_at,
  p.email,
  p.full_name,
  p.role
FROM creators c
JOIN profiles p ON c.user_id = p.id;

-- View for active subscriptions with details
CREATE OR REPLACE VIEW active_subscriptions_view AS
SELECT 
  s.id,
  s.user_id,
  s.creator_id,
  s.paypal_subscription_id,
  s.status,
  s.start_date,
  s.end_date,
  s.amount,
  c.display_name as creator_name,
  c.avatar_url as creator_avatar,
  p.email as user_email,
  p.full_name as user_name
FROM subscriptions s
JOIN creators c ON s.creator_id = c.id
JOIN profiles p ON s.user_id = p.id
WHERE s.status = 'active';

-- =====================================================
-- INSERT DEFAULT ADMIN USER (Optional)
-- =====================================================
-- Password: admin123 (hashed with bcrypt)
-- You should change this immediately in production
/*
INSERT INTO users (id, email, password_hash, email_verified) 
VALUES (
  UUID(),
  'admin@fanview.com',
  '$2b$10$rXYZABC123...',  -- Replace with actual bcrypt hash
  TRUE
);

INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'Admin User', 'admin'
FROM users WHERE email = 'admin@fanview.com';
*/

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- Additional composite indexes for common queries
CREATE INDEX idx_subscriptions_user_creator ON subscriptions(user_id, creator_id);
CREATE INDEX idx_subscriptions_creator_status ON subscriptions(creator_id, status);
CREATE INDEX idx_content_creator_premium ON content(creator_id, is_premium);
CREATE INDEX idx_messages_recipient_read ON messages(recipient_id, is_read);

-- Full-text search indexes
ALTER TABLE creators ADD FULLTEXT INDEX ft_creator_search (display_name, bio);
ALTER TABLE content ADD FULLTEXT INDEX ft_content_search (title, description);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
