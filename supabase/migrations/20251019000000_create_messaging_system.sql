-- =====================================================
-- MESSAGING SYSTEM - Complete Schema
-- Real-time chat between subscribers and creators
-- Admin responds on behalf of all creators
-- =====================================================

-- 1. CREATE MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  
  -- Message content
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video')),
  content TEXT, -- Text content or file URL
  file_url TEXT, -- For images/videos
  file_size INTEGER, -- File size in bytes
  thumbnail_url TEXT, -- Thumbnail for videos
  
  -- Metadata
  is_from_admin BOOLEAN DEFAULT false, -- True when admin sends on behalf of creator
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_creator ON messages(creator_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(is_read) WHERE is_read = false;


-- 2. CREATE CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Last message info for quick display
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_sender_id UUID REFERENCES profiles(id),
  
  -- Unread counts
  unread_count_subscriber INTEGER DEFAULT 0,
  unread_count_admin INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one conversation per creator-subscriber pair
  UNIQUE(creator_id, subscriber_id)
);

-- Add indexes
CREATE INDEX idx_conversations_creator ON conversations(creator_id);
CREATE INDEX idx_conversations_subscriber ON conversations(subscriber_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_active ON conversations(is_active) WHERE is_active = true;


-- 3. CREATE NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification details
  type TEXT NOT NULL CHECK (type IN ('new_message', 'message_read', 'other')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  related_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  related_conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  related_creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  
  -- Metadata
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT, -- URL to navigate when clicked
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);


-- 4. CREATE FUNCTIONS FOR MESSAGE OPERATIONS
-- =====================================================

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message = CASE 
      WHEN NEW.message_type = 'text' THEN NEW.content
      WHEN NEW.message_type = 'image' THEN '📷 Image'
      WHEN NEW.message_type = 'video' THEN '🎥 Video'
      ELSE 'Message'
    END,
    last_message_at = NEW.created_at,
    last_message_sender_id = NEW.sender_id,
    unread_count_subscriber = CASE 
      WHEN NEW.sender_id != (SELECT subscriber_id FROM conversations WHERE id = NEW.conversation_id)
      THEN unread_count_subscriber + 1
      ELSE unread_count_subscriber
    END,
    unread_count_admin = CASE 
      WHEN NEW.sender_id = (SELECT subscriber_id FROM conversations WHERE id = NEW.conversation_id)
      THEN unread_count_admin + 1
      ELSE unread_count_admin
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation
DROP TRIGGER IF EXISTS trigger_update_conversation ON messages;
CREATE TRIGGER trigger_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();


-- Function to reset unread count when messages are read
CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- If message is marked as read, update conversation unread count
  IF NEW.is_read = true AND OLD.is_read = false THEN
    UPDATE conversations
    SET 
      unread_count_subscriber = CASE 
        WHEN NEW.recipient_id = (SELECT subscriber_id FROM conversations WHERE id = NEW.conversation_id)
        THEN GREATEST(0, unread_count_subscriber - 1)
        ELSE unread_count_subscriber
      END,
      unread_count_admin = CASE 
        WHEN NEW.recipient_id != (SELECT subscriber_id FROM conversations WHERE id = NEW.conversation_id)
        THEN GREATEST(0, unread_count_admin - 1)
        ELSE unread_count_admin
      END,
      updated_at = now()
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reset unread count
DROP TRIGGER IF EXISTS trigger_reset_unread ON messages;
CREATE TRIGGER trigger_reset_unread
  AFTER UPDATE ON messages
  FOR EACH ROW
  WHEN (NEW.is_read IS DISTINCT FROM OLD.is_read)
  EXECUTE FUNCTION reset_unread_count();


-- 5. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages they're part of"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can do everything with messages"
  ON messages FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Conversations policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    subscriber_id = auth.uid() OR
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (subscriber_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    subscriber_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can do everything with conversations"
  ON conversations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can do everything with notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- 6. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON messages TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;


-- =====================================================
-- MESSAGING SYSTEM SETUP COMPLETE!
-- =====================================================

-- Quick test query to verify tables:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('messages', 'conversations', 'notifications');
