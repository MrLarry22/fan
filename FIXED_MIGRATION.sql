-- ===========================================
-- FIXED MIGRATION: Messaging System Tables
-- ===========================================
-- Run this in Supabase SQL Editor
-- This fixes the "column is_active does not exist" error

-- ===========================================
-- 1. CREATE TABLES (with IF NOT EXISTS)
-- ===========================================

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscriber_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,  -- Added this column
    UNIQUE(subscriber_id, creator_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 2. ADD MISSING COLUMNS (if table exists but column doesn't)
-- ===========================================

-- Add is_active to conversations if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'is_active') THEN
        ALTER TABLE conversations ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- ===========================================
-- 3. CREATE INDEXES (with IF NOT EXISTS)
-- ===========================================

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_subscriber ON conversations(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_conversations_creator ON conversations(creator_id);
CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = false;

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ===========================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 5. DROP EXISTING POLICIES (to avoid conflicts)
-- ===========================================

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can mark notifications as read" ON notifications;

-- ===========================================
-- 6. CREATE RLS POLICIES
-- ===========================================

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (auth.uid() = subscriber_id OR auth.uid() = creator_id);

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.subscriber_id = auth.uid() OR conversations.creator_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.subscriber_id = auth.uid() OR conversations.creator_id = auth.uid())
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark notifications as read" ON notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- 7. CREATE FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to create conversation if it doesn't exist
CREATE OR REPLACE FUNCTION create_conversation_if_not_exists(
    p_subscriber_id UUID,
    p_creator_id UUID
) RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
BEGIN
    -- Try to find existing conversation
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE subscriber_id = p_subscriber_id AND creator_id = p_creator_id;

    -- If not found, create new one
    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (subscriber_id, creator_id)
        VALUES (p_subscriber_id, p_creator_id)
        RETURNING id INTO v_conversation_id;
    END IF;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    v_recipient_id UUID;
BEGIN
    -- Get the recipient (the other person in the conversation)
    SELECT CASE
        WHEN subscriber_id = NEW.sender_id THEN creator_id
        ELSE subscriber_id
    END INTO v_recipient_id
    FROM conversations
    WHERE id = NEW.conversation_id;

    -- Create notification
    INSERT INTO notifications (user_id, type, message)
    VALUES (v_recipient_id, 'new_message', 'You have a new message');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;

-- Create trigger for new messages
CREATE TRIGGER trigger_notify_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();

-- ===========================================
-- 8. GRANT PERMISSIONS
-- ===========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON conversations TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT ALL ON notifications TO anon, authenticated;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ===========================================
-- 9. TEST THE MIGRATION
-- ===========================================

-- Test query to verify tables exist
SELECT
    'conversations' as table_name,
    COUNT(*) as record_count
FROM conversations
UNION ALL
SELECT
    'messages' as table_name,
    COUNT(*) as record_count
FROM messages
UNION ALL
SELECT
    'notifications' as table_name,
    COUNT(*) as record_count
FROM notifications;

-- ===========================================
-- MIGRATION COMPLETE!
-- ===========================================
-- Now test the messaging functionality:
-- 1. Hard refresh your browser (Ctrl+Shift+R)
-- 2. Go to a creator profile
-- 3. Click the "Inbox" or message button
-- 4. Try sending a message