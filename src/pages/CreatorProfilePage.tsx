import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  Play, 
  Image as ImageIcon, 
  Lock,
  Star,
  MapPin,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import PayPalEnhancedSubscription from '../components/Payment/PayPalEnhancedSubscription';
import MessagingModal from '../components/Messaging/MessagingModal';
import { API_ENDPOINTS } from '../config/api';


interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  banner: string;
  followers: string;
  totalLikes: number;
  subscriptionPrice: number;
  category: string;
  location: string;
  joinDate: string;
  isVerified: boolean;
  content: ContentItem[];
}

interface ContentItem {
  id: string;
  type: 'image' | 'video';
  thumbnail: string;
  title: string;
  description?: string;
  likes: number;
  isPremium: boolean;
  createdAt: string;
}

export default function CreatorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [likedContent, setLikedContent] = useState<Set<string>>(new Set());

  const fetchCreatorData = useCallback(async () => {
    console.log('fetchCreatorData: Starting fetch for username:', username);
    if (!username) {
      console.log('fetchCreatorData: Username is missing, aborting.');
      return;
    }

    try {
      setLoading(true);
  // Fetch creator details
  console.log('fetchCreatorData: Fetching creator details...');
  const creatorResponse = await fetch(`${API_ENDPOINTS.creators}/username/${username}`);
      console.log('fetchCreatorData: Creator response status:', creatorResponse.status);
      if (!creatorResponse.ok) {
        throw new Error(`Creator not found (status: ${creatorResponse.status})`);
      }
      const creatorResult = await creatorResponse.json();
      console.log('fetchCreatorData: Creator API result:', creatorResult);
      
      if (!creatorResult.success || !creatorResult.data) {
        throw new Error(creatorResult.message || 'Failed to get creator data from API');
      }

      const creatorData = creatorResult.data;
      console.log('fetchCreatorData: Creator data received:', creatorData);

      // Ensure we have a valid token before making protected requests
      const ensureValidToken = async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) return null;

          // Decode JWT payload safely to check expiry (no verification here)
          const parts = token.split('.');
          if (parts.length < 2) return token;
          const payload = JSON.parse(atob(parts[1]));
          const exp = payload.exp; // seconds since epoch
          const now = Math.floor(Date.now() / 1000);

          // If token is still valid, return it
          if (exp && exp > now + 5) {
            return token;
          }

          console.log('fetchCreatorData: Token expired or about to expire, attempting refresh...');

          // Attempt to refresh by re-requesting backend token using OAuth marker
          // This requires that the user is still signed into Supabase and we have their email
          if (user && user.email) {
            try {
              const resp = await fetch(API_ENDPOINTS.auth.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, password: 'oauth-login' })
              });

              if (resp.ok) {
                const data = await resp.json();
                if (data.success && data.data && data.data.token) {
                  localStorage.setItem('authToken', data.data.token);
                  console.log('fetchCreatorData: Token refreshed successfully');
                  return data.data.token;
                }
              }
              console.warn('fetchCreatorData: Token refresh request failed');
            } catch (err) {
              console.warn('fetchCreatorData: Token refresh error', err);
            }
          } else {
            console.log('fetchCreatorData: No signed-in user available to refresh token');
          }

          return null;
        } catch (err) {
          console.error('fetchCreatorData: Token check failed', err);
          return null;
        }
      };

      const validToken = await ensureValidToken();
      console.log('fetchCreatorData: Token from localStorage (post-check):', validToken ? `${validToken.substring(0,20)}...` : 'NO TOKEN');
      const headers: HeadersInit = {};
      if (validToken) {
        headers['Authorization'] = `Bearer ${validToken}`;
        console.log('fetchCreatorData: Authorization header set');
      }

      // Fetch creator's content
      console.log(`fetchCreatorData: Fetching content for creator ID: ${creatorData.id}`);
      const contentResponse = await fetch(`${API_ENDPOINTS.content}/creator/${creatorData.id}`, { headers });
      console.log('fetchCreatorData: Content response status:', contentResponse.status);
      
      let contentData: any[] = [];
      let subscriptionStatus = false;
      
      if (contentResponse.ok) {
        const contentResult = await contentResponse.json();
        console.log('fetchCreatorData: Content API result:', contentResult);
        if (contentResult.success && contentResult.data && Array.isArray(contentResult.data.content)) {
          subscriptionStatus = contentResult.data.isSubscribed;
          console.log('fetchCreatorData: Subscription status:', subscriptionStatus);
          contentData = contentResult.data.content; // Keep raw data for now
        } else {
          console.warn('Content API call was successful, but data is not in the expected format:', contentResult);
        }
      } else {
        console.error('Content API request failed:', {
          status: contentResponse.status,
          statusText: contentResponse.statusText
        });
      }

      console.log('fetchCreatorData: Transforming data for state...');
      // Transform creator data to match the interface
      const transformedCreator: CreatorProfile = {
        id: creatorData.id,
        name: creatorData.display_name || creatorData.username,
        username: creatorData.username,
        bio: creatorData.bio || 'No bio available',
        avatar: creatorData.avatar_url || '/default-avatar.jpg',
        banner: creatorData.banner_url || '/default-banner.jpg',
        followers: String(creatorData.total_subscribers || 0),
        totalLikes: creatorData.total_likes || 0,
        subscriptionPrice: creatorData.subscription_price || 5.00,
        category: creatorData.category || 'Content Creator',
        location: creatorData.location || 'Unknown',
        joinDate: new Date(creatorData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        isVerified: creatorData.is_verified || false,
        content: contentData.map((item: any) => ({
          id: item.id,
          type: item.content_type,
          thumbnail: item.is_premium && !subscriptionStatus ? '/placeholder-image.jpg' : item.content_url || '/placeholder-image.jpg',
          title: item.title,
          description: item.description || '',
          likes: item.totalLikes || 0,
          isPremium: item.is_premium,
          createdAt: item.created_at,
          isLikedByUser: item.isLikedByUser,
          isLocked: item.isLocked
        }))
      };
      console.log('fetchCreatorData: Data transformed, setting state.');

      setIsSubscribed(subscriptionStatus);
      setCreator(transformedCreator);
      
      const liked = new Set<string>();
      contentData.forEach((item: any) => {
        if (item.isLikedByUser) {
          liked.add(item.id);
        }
      });
      setLikedContent(liked);
      console.log('fetchCreatorData: State updated successfully.');

    } catch (error) {
      console.error('Error in fetchCreatorData:', error);
      setCreator({
        id: '1',
        name: username || 'Creator',
        username: username || 'creator',
        bio: 'Content creator profile could not be loaded.',
        avatar: '/default-avatar.jpg',
        banner: '/default-banner.jpg',
        followers: '0',
        totalLikes: 0,
        subscriptionPrice: 5.00,
        category: 'Content Creator',
        location: 'Unknown',
        joinDate: 'Recently',
        isVerified: false,
        content: []
      });
    } finally {
      console.log('fetchCreatorData: Fetch process finished.');
      setLoading(false);
    }
  }, [username, user]);

  useEffect(() => {
    fetchCreatorData();
  }, [fetchCreatorData]);
  
  const handleSubscribe = () => {
    if (!user) {
      // Redirect to login or show login modal
      alert('Please log in to subscribe to creators');
      return;
    }
    setShowPayPal(true);
  };

  const handlePayPalSuccess = (subscriptionId: string, paymentMethod: string) => {
    console.log('PayPal subscription successful:', { subscriptionId, paymentMethod });
    
    // Immediately update UI to reflect subscription
    setIsSubscribed(true);
    setShowPayPal(false);
    
    // Refetch creator data to show unlocked content
    // Use a small delay to allow webhook to potentially process
    setTimeout(() => {
      console.log('Refetching data after a short delay...');
      fetchCreatorData();
    }, 1500);
    
    // Show success message
    alert(`🎉 Successfully subscribed with ${paymentMethod}! You now have access to all premium content from ${creator?.name}.`);
  };

  const handlePayPalError = (error: Error) => {
    console.error('PayPal subscription error:', error);
    setShowPayPal(false);
    
    // Show user-friendly error message
    const friendlyMessage = error.message.includes('cancelled') 
      ? 'Subscription was cancelled. You can try again anytime!'
      : `Subscription failed: ${error.message}. Please try again or contact support.`;
    
    alert(friendlyMessage);
  };

  const handlePayPalCancel = () => {
    console.log('PayPal subscription cancelled by user');
    setShowPayPal(false);
  };

  const handleLike = async (contentId: string) => {
    if (!user) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const isLiked = likedContent.has(contentId);

    // Optimistically update UI
    setLikedContent(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });

    setCreator(prev => {
      if (!prev) return null;
      return {
        ...prev,
        content: prev.content.map(item => {
          if (item.id === contentId) {
            return { ...item, likes: item.likes + (isLiked ? -1 : 1) };
          }
          return item;
        }),
        totalLikes: prev.totalLikes + (isLiked ? -1 : 1)
      };
    });

    try {
  const response = await fetch(`${API_ENDPOINTS.content}/${contentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      const result = await response.json();
      console.log('Like/Unlike response:', result);

      // Optionally, refetch all data to ensure consistency, though optimistic update is usually enough
      // fetchCreatorData();

    } catch (error) {
      console.error('Error liking content:', error);
      // Revert optimistic update on failure
      setLikedContent(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(contentId);
        } else {
          newSet.delete(contentId);
        }
        return newSet;
      });
      setCreator(prev => {
        if (!prev) return null;
        return {
          ...prev,
          content: prev.content.map(item => {
            if (item.id === contentId) {
              return { ...item, likes: item.likes - (isLiked ? -1 : 1) };
            }
            return item;
          }),
          totalLikes: prev.totalLikes - (isLiked ? -1 : 1)
        };
      });
      alert('Failed to update like. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Creator not found</h1>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Discover</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-white font-semibold">
                {creator.totalLikes.toLocaleString()} likes
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner and Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Banner Image */}
          <div className="h-64 md:h-80 rounded-2xl overflow-hidden mt-6 relative">
            <img
              src={creator.banner}
              alt={`${creator.name} banner`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          {/* Profile Info */}
          <div className="relative -mt-20 px-6">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-32 h-32 rounded-full border-4 border-slate-900 shadow-xl object-cover"
                />
                {creator.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>

              {/* Creator Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins mb-2">
                  {creator.name}
                </h1>
                <p className="text-slate-400 text-lg mb-2">@{creator.username}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{creator.followers} followers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{creator.category}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{creator.location}</span>
                    </div>
                    {user && isSubscribed && (
                      <button
                        onClick={() => setShowMessaging(true)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Inbox</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscribe Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubscribe}
                disabled={isSubscribed}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg flex items-center space-x-2 ${
                  isSubscribed
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:shadow-xl'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Heart className="w-5 h-5 fill-current" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe ${creator.subscriptionPrice}/month</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bio Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 bg-slate-800 rounded-2xl p-6 border border-slate-700"
        >
          <h2 className="text-xl font-bold text-white font-poppins mb-4">About</h2>
          <p className="text-slate-300 leading-relaxed">{creator.bio}</p>
        </motion.div>

        {/* Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 mb-12"
        >
          <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-2xl font-bold text-white font-poppins">Media</h2>
            <span className="text-2xl">🎬</span>
            <div className="flex items-center space-x-1">
              <Heart className="w-5 h-5 text-red-400 fill-current" />
              <span className="text-slate-300 font-semibold">
                {creator.totalLikes.toLocaleString()}
                
              </span>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creator.content.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all duration-300 group relative"
              >
                {/* Content Thumbnail */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      item.isPremium && !isSubscribed
                        ? 'blur-md group-hover:blur-lg'
                        : 'group-hover:scale-105'
                    }`}
                  />
                  
                  {/* Content Type Icon */}
                  <div className="absolute top-3 left-3">
                    {item.type === 'video' ? (
                      <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Premium Lock Overlay */}
                  {item.isPremium && !isSubscribed && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="w-8 h-8 text-white mx-auto mb-2" />
                        <p className="text-white text-sm font-semibold">Subscribe to unlock</p>
                      </div>
                    </div>
                  )}

                  {/* Premium Badge */}
                  {item.isPremium && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Premium
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleLike(item.id)}
                      disabled={!user}
                      className="flex items-center space-x-1 text-slate-400 hover:text-red-400 transition-colors disabled:cursor-not-allowed"
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          likedContent.has(item.id) ? 'fill-current text-red-400' : ''
                        }`} 
                      />
                      <span className="text-sm">{item.likes}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Subscribe CTA for locked content */}
          {!isSubscribed && creator.content.some(item => item.isPremium) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 text-center"
            >
              <Lock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white font-poppins mb-2">
                Unlock Premium Content
              </h3>
              <p className="text-slate-300 mb-6">
                Subscribe to {creator.name} to access all premium photos and videos
              </p>
              <button
                onClick={handleSubscribe}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Subscribe ${creator.subscriptionPrice}/month
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Enhanced PayPal Subscription Modal */}
      {showPayPal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">Subscribe to {creator.name}</h3>
                    <p className="text-slate-400">Monthly subscription</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPayPal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Subscription Benefits */}
              <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-white mb-3">What you'll get:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>Access to all premium photos and videos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Play className="w-4 h-4 text-blue-400" />
                    <span>HD video content streaming</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>Support your favorite creator</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span>Cancel anytime - no long-term commitment</span>
                  </li>
                </ul>
              </div>

              {/* Enhanced PayPal Subscription Component */}
              <PayPalEnhancedSubscription
                amount={creator.subscriptionPrice.toFixed(2)}
                currency="USD"
                customerEmail={user?.email}
                country="US"
                planId={creator.id}
                onSuccess={handlePayPalSuccess}
                onError={handlePayPalError}
                onCancel={handlePayPalCancel}
                customization={{
                  color: 'blue',
                  shape: 'rect',
                  layout: 'vertical',
                  height: 45
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      {showMessaging && creator && (
        <MessagingModal
          creatorId={creator.id}
          creatorName={creator.name}
          onClose={() => setShowMessaging(false)}
        />
      )}
    </div>
  );
}