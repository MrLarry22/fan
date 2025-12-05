import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Image, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video';
  file_url?: string;
  created_at: string;
  is_from_admin: boolean;
}

interface MessagingModalProps {
  creatorId: string;
  creatorName: string;
  onClose: () => void;
}

export default function MessagingModal({ creatorId, creatorName, onClose }: MessagingModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [creatorUserId, setCreatorUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.messages}/conversations/${convId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      setMessages(data.data || []);
      setLoading(false);
      
      // Mark messages as read
      await fetch(`${API_ENDPOINTS.messages}/conversations/${convId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  }, []);

  // Initialize conversation only once
  useEffect(() => {
    if (!user || !creatorId || conversationId) return;
    setLoading(true);
    (async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No auth token');
        const response = await fetch(`${API_ENDPOINTS.messages}/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ creatorId })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setConversationId(data.data.id);
            setCreatorUserId(data.data.creator?.id || null);
          }
        } else {
          console.error('Conversation creation failed', response.status);
        }
      } catch (err) {
        console.error('initConversation error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, creatorId, conversationId]);

  // Load messages once when conversationId is set
  useEffect(() => {
    if (!conversationId) return;
    loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(() => loadMessages(conversationId), 5000);
    return () => clearInterval(interval);
  }, [conversationId, loadMessages]);

  // Send text message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || !newMessage.trim() || !conversationId || !creatorUserId) return;
    setSending(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_ENDPOINTS.messages}/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: newMessage, recipientId: creatorUserId, message_type: 'text' })
        }
      );
      if (response.ok) {
        setNewMessage('');
        await loadMessages(conversationId);
      } else {
        console.error('sendMessage failed with status', response.status);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert('Please select an image or video file.');
      return;
    }

    // Validate file size
    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
    if (file.size > maxSize) {
      alert(`File too large. Maximum size is ${isImage ? '10MB' : '100MB'}.`);
      return;
    }

    setUploadingFile(true);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipientId', creatorUserId!);
      formData.append('message_type', isImage ? 'image' : 'video');

      const response = await fetch(`${API_ENDPOINTS.messages}/conversations/${conversationId}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload file');
      
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Format timestamp
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {creatorName}
              </h2>
              <p className="text-sm text-gray-400">Chat with creator</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Start a conversation with {creatorName}</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 ${
                        isOwnMessage
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
                      <div className="flex items-center justify-end space-x-2 mt-1">
                        <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                          {formatTime(message.created_at)}
                        </span>
                        {message.is_from_admin && !isOwnMessage && (
                          <span className="text-xs bg-purple-500/30 px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
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
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
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
                placeholder="Type a message..."
                disabled={sending || uploadingFile}
                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
              Images up to 10MB • Videos up to 100MB
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
