import React, { useState, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { supabase, Creator } from '../lib/supabase';
import CreatorCard from '../components/Creator/CreatorCard';
import AuthModal from '../components/Auth/AuthModal';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('total_subscribers', { ascending: false });

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (creatorId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    // Handle subscription logic here
    console.log('Subscribe to creator:', creatorId);
  };

  const filteredCreators = creators.filter(creator =>
    creator.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6 font-playfair">
            Discover Amazing Creators
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Subscribe to your favorite creators and get exclusive access to their premium content
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Featured Creators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-8">
          <TrendingUp className="w-6 h-6 text-blue-400 mr-2" />
          <h2 className="text-2xl font-bold text-white font-playfair">
            Featured Creators
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        )}

        {!loading && filteredCreators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'No creators found matching your search.' : 'No creators available.'}
            </p>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}