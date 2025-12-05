import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Image, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video';
  file_url?: string;
  created_at: string;
  is_from_admin: boolean;
}

interface Conversation {
  id: string;
  creator_id: string;
  subscriber_id: string;
  last_message: string;
  last_message_at: string;
  unread_count_admin: number;
  creator_name?: string;
  creator_avatar?: string;
  subscriber_name?: string;
  subscriber_avatar?: string;
}

export default function AdminMessaging() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load all conversations
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load conversations');
      
      const data = await response.json();
      setConversations(data.conversations);
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      const interval = setInterval(() => loadMessages(selectedConversation.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/messages/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      setMessages(data.messages);
      
      // Mark as read
      await fetch(`http://localhost:3001/api/messages/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send message as admin (responding as creator)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/messages/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          message_type: 'text'
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      setNewMessage('');
      await loadMessages(selectedConversation.id);
      await loadConversations(); // Refresh conversation list
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert('Please select an image or video file.');
      return;
    }

    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large. Maximum size is ${isImage ? '10MB' : '100MB'}.`);
      return;
    }

    setUploadingFile(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message_type', isImage ? 'image' : 'video');

      const response = await fetch(`http://localhost:3001/api/messages/conversations/${selectedConversation.id}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload file');
      
      await loadMessages(selectedConversation.id);
      await loadConversations();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-xl h-[calc(100vh-200px)] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-800 overflow-y-auto">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            All Conversations
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {conversations.length} active chats
          </p>
        </div>

        <div className="divide-y divide-gray-800">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 text-left hover:bg-gray-800/50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-gray-800/50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    {conv.subscriber_avatar ? (
                      <img
                        src={conv.subscriber_avatar}
                        alt={conv.subscriber_name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {conv.unread_count_admin > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {conv.unread_count_admin}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white truncate">
                        {conv.subscriber_name || 'User'}
                      </p>
                      <span className="text-xs text-gray-400">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      To: {conv.creator_name}
                    </p>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {conv.last_message}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-800/30">
              <div className="flex items-center space-x-3">
                {selectedConversation.subscriber_avatar ? (
                  <img
                    src={selectedConversation.subscriber_avatar}
                    alt={selectedConversation.subscriber_name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-white">
                    {selectedConversation.subscriber_name || 'User'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Chatting with {selectedConversation.creator_name}
                  </p>
                </div>
              </div>
              <div className="mt-2 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full inline-block">
                You're responding as the creator
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isAdminMessage = message.is_from_admin;
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 ${
                        isAdminMessage
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      {message.message_type === 'text' ? (
                        <p className="break-words">{message.content}</p>
                      ) : message.message_type === 'image' ? (
                        <img
                          src={message.file_url}
                          alt="Uploaded"
                          className="rounded-lg max-w-full h-auto"
                        />
                      ) : (
                        <video
                          src={message.file_url}
                          controls
                          className="rounded-lg max-w-full h-auto"
                        />
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${isAdminMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                          {formatTime(message.created_at)}
                        </span>
                        {isAdminMessage && (
                          <span className="text-xs bg-purple-500/30 px-2 py-0.5 rounded-full ml-2">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-800/30">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploadingFile ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Image className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message (responding as creator)..."
                  disabled={sending || uploadingFile}
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending || uploadingFile}
                  className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Your messages will appear as if sent by the creator
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a conversation to start messaging</p>
              <p className="text-sm mt-2">You'll respond as the creator</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
