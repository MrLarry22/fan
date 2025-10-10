import React, { useState } from 'react';
import { Gift, Clock, Star, Users } from 'lucide-react';
import PayPalTopUp from '../../components/Payment/PayPalTopUp';

interface Promotion {
  id: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  timeLeft: string;
  category: string;
  followers: string;
  rating: number;
  description: string;
}

const mockPromotions: Promotion[] = [
  {
    id: '1',
    creatorName: 'Sarah Johnson',
    creatorUsername: '@sarahj',
    creatorAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    originalPrice: 9.99,
    discountedPrice: 0,
    discount: 100,
    timeLeft: '2 days left',
    category: 'Fitness',
    followers: '15.2K',
    rating: 4.9,
    description: 'Join my fitness journey with exclusive workout routines and nutrition tips!'
  },
  {
    id: '2',
    creatorName: 'Mike Chen',
    creatorUsername: '@mikechen',
    creatorAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    originalPrice: 12.99,
    discountedPrice: 0,
    discount: 100,
    timeLeft: '5 days left',
    category: 'Cooking',
    followers: '8.7K',
    rating: 4.8,
    description: 'Learn authentic Asian cooking techniques and secret family recipes!'
  },
  {
    id: '3',
    creatorName: 'Emma Davis',
    creatorUsername: '@emmad',
    creatorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    originalPrice: 7.99,
    discountedPrice: 0,
    discount: 100,
    timeLeft: '1 day left',
    category: 'Art',
    followers: '12.1K',
    rating: 4.7,
    description: 'Discover digital art techniques and creative inspiration for beginners!'
  },
  {
    id: '4',
    creatorName: 'Alex Rodriguez',
    creatorUsername: '@alexr',
    creatorAvatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    originalPrice: 15.99,
    discountedPrice: 0,
    discount: 100,
    timeLeft: '3 days left',
    category: 'Music',
    followers: '20.5K',
    rating: 4.9,
    description: 'Behind-the-scenes music production and exclusive acoustic sessions!'
  }
];

export default function PromotionsPage() {
  const [joinedPromotions, setJoinedPromotions] = useState<Set<string>>(new Set());
  const [showPayPal, setShowPayPal] = useState(false);

  const handleJoinPromotion = (promotionId: string) => {
    // For free promotions, just mark as joined
    if (mockPromotions.find(p => p.id === promotionId)?.discountedPrice === 0) {
      setJoinedPromotions(prev => new Set([...prev, promotionId]));
    } else {
      // For paid promotions, open PayPal
      setShowPayPal(true);
    }
  };

  const handlePayPalSuccess = (subscriptionId: string) => {
    console.log('PayPal subscription successful:', subscriptionId);
    alert('Successfully joined promotion!');
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error);
    alert('Payment failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
                Limited-Time Promotions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Join amazing creators for free - limited time offers!
              </p>
            </div>
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {mockPromotions.map((promotion) => (
            <div
              key={promotion.id}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-900/20 transition-all duration-300"
            >
              {/* Promotion Badge */}
              <div className="bg-gradient-to-r from-pink-500 to-orange-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-5 h-5" />
                    <span className="font-bold text-lg">{promotion.discount}% OFF</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{promotion.timeLeft}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Creator Info */}
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={promotion.creatorAvatar}
                    alt={promotion.creatorName}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-600"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {promotion.creatorName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {promotion.creatorUsername}
                    </p>
                    <span className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                      {promotion.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {promotion.description}
                </p>

                {/* Stats */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {promotion.followers}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {promotion.rating}
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      FREE
                    </span>
                    <span className="text-lg text-gray-400 line-through ml-2">
                      ${promotion.originalPrice}/month
                    </span>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoinPromotion(promotion.id)}
                  disabled={joinedPromotions.has(promotion.id)}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                    joinedPromotions.has(promotion.id)
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {joinedPromotions.has(promotion.id) ? '✓ Joined!' : 'Join for FREE'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4 font-poppins">
              Don't Miss Out!
            </h2>
            <p className="text-lg opacity-90 mb-6">
              These exclusive free access promotions won't last long. Join your favorite creators now!
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>Limited time offers - Act fast!</span>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Modal for Paid Promotions */}
      <PayPalTopUp
        isOpen={showPayPal}
        onClose={() => setShowPayPal(false)}
        onSuccess={handlePayPalSuccess}
        onError={handlePayPalError}
      />
    </div>
  );
}