import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, UserPlus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Creator {
  id: string;
  display_name: string;
  username?: string;
  avatar_url: string;
  total_subscribers: number;
  category?: string;
  bio?: string;
  is_active: boolean;
  media_count?: number;
  total_likes?: number;
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function SuggestedCreators() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set());
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/creators`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Sort by subscribers and take top creators for suggestions
        const sortedCreators = result.data
          .filter((creator: Creator) => creator.is_active && creator.avatar_url)
          .sort((a: Creator, b: Creator) => (b.total_subscribers || 0) - (a.total_subscribers || 0));
        setCreators(sortedCreators);
      } else {
        throw new Error(result.message || 'Failed to fetch creators');
      }
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError(err instanceof Error ? err.message : 'Failed to load creators');
      // Set empty array as fallback
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const nextCreator = () => {
    if (creators.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % creators.length);
    }
  };

  const prevCreator = () => {
    if (creators.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + creators.length) % creators.length);
    }
  };

  const handleFollow = (creatorId: string) => {
    setFollowedCreators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(creatorId)) {
        newSet.delete(creatorId);
      } else {
        newSet.add(creatorId);
      }
      return newSet;
    });
  };

  const handleViewAllCreators = () => {
    navigate('/dashboard/discover');
  };

  const handleCreatorClick = (creator: Creator) => {
    // Navigate to creator profile using display name
    const profileUrl = `/creator/${creator.display_name}`;
    navigate(profileUrl);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-80 h-screen bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">
            Suggested Creators
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading creators...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-80 h-screen bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">
            Suggested Creators
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-red-500 text-sm mb-2">Failed to load creators</p>
            <button 
              onClick={fetchCreators}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (creators.length === 0) {
    return (
      <div className="w-80 h-screen bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">
            Suggested Creators
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No creators available</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              Add some creators in the admin dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate visible creators (show up to 3 at a time)
  const visibleCreators = [];
  for (let i = 0; i < Math.min(3, creators.length); i++) {
    const index = (currentIndex + i) % creators.length;
    visibleCreators.push(creators[index]);
  }

  return (
    <div className="w-80 h-screen bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">
            Suggested Creators
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={fetchCreators}
              disabled={loading}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Refresh creators"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={prevCreator}
              disabled={creators.length === 0}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={nextCreator}
              disabled={creators.length === 0}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Creators List */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {visibleCreators.map((creator) => (
          <div
            key={creator.id}
            className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-900/20 transition-all duration-300 cursor-pointer"
            onClick={() => handleCreatorClick(creator)}
          >
            {/* Creator Avatar */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <img
                  src={creator.avatar_url || '/default-avatar.jpg'}
                  alt={creator.display_name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-600"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-avatar.jpg';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {creator.display_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{creator.username || creator.display_name.toLowerCase().replace(/\s+/g, '')}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {creator.category || 'Content Creator'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatFollowerCount(creator.total_subscribers || 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Followers
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {creator.media_count || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Posts
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {creator.total_likes || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Likes
                </p>
              </div>
            </div>

            {/* Follow Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when clicking follow button
                handleFollow(creator.id);
              }}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                followedCreators.has(creator.id)
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {followedCreators.has(creator.id) ? 'Following' : 'Follow'}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="p-6 border-t border-gray-200 dark:border-slate-800">
        <button 
          onClick={handleViewAllCreators}
          className="w-full py-3 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors"
        >
          View All Creators
        </button>
      </div>
    </div>
  );
}