import { useState, useEffect } from 'react';
import { Search, Filter, Users } from 'lucide-react';

interface Creator {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  total_subscribers: number;
  is_active: boolean;
  location?: string;
  isOnline?: boolean;
  lastSeen?: string;
  created_at: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function DiscoverPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
        setCreators(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch creators');
      }
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError(err instanceof Error ? err.message : 'Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (creator.bio && creator.bio.toLowerCase().includes(searchTerm.toLowerCase()));
    // For now, we'll just filter by search term since we don't have categories in the database yet
    return matchesSearch;
  });

  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleCreatorClick = (creator: Creator) => {
    // Navigate to creator profile using username
    const profileUrl = `/creator/${creator.display_name}`;
    window.location.href = profileUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-poppins">
            Discover Creators
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find amazing creators and connect with their exclusive content
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchCreators}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors duration-200"
            >
              <Filter className="w-5 h-5" />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-sm">!</span>
              </div>
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-semibold">Error loading creators</h3>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={fetchCreators}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Creators Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse border border-gray-200 dark:border-slate-700">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded mb-4"></div>
                <div className="h-10 bg-gray-300 dark:bg-slate-600 rounded"></div>
              </div>
            ))}
          </div>
        ) : !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                onClick={() => handleCreatorClick(creator)}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-900/20 transition-all duration-300 cursor-pointer group"
              >
                {/* Creator Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src={creator.avatar_url || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'}
                      alt={creator.display_name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                      }}
                    />
                    {creator.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {creator.display_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{creator.username}
                    </p>
                    {creator.location && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        📍 {creator.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {creator.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {creator.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFollowerCount(creator.total_subscribers)} subscribers
                      </span>
                    </div>
                    {creator.lastSeen && (
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${creator.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {creator.lastSeen}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Profile Button */}
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform group-hover:scale-105">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredCreators.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No creators found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}