import React from 'react';
import { Search, Sparkles, Users, Heart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import PayPalTopUp from '../Payment/PayPalTopUp';

export default function MainContent() {
  const [showPayPal, setShowPayPal] = React.useState(false);

  const handlePayPalSuccess = (subscriptionId: string) => {
    console.log('PayPal subscription successful:', subscriptionId);
    alert('Payment successful! $25.00 has been added to your wallet.');
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error);
    alert('Payment failed. Please try again.');
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-slate-800 overflow-y-auto">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6">
        <div className="flex justify-end">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search creators, content, or topics..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4 font-poppins">
              Welcome to Fanview 👋
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Let's get you started!
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center space-x-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Sparkles className="w-6 h-6" />
              <span>Discover Creators</span>
            </Link>
            
            <button
              onClick={() => setShowPayPal(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg ml-4"
            >
              <span>💳</span>
              <span>Top Up Wallet</span>
            </button>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 right-12 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
        </div>

        {/* Content Highlight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hero Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
                Discover Inspiring Creators on Fanview
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Connect with amazing creators from around the world. Subscribe to exclusive content, 
                engage through direct messages, and support your favorite artists, influencers, and 
                content creators in their creative journey.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Exclusive Access
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get premium content from your favorite creators
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Direct Connection
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Message creators and build meaningful relationships
                </p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 h-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                alt="Creative workspace"
                className="rounded-2xl shadow-2xl w-full h-64 object-cover relative z-10"
              />
              {/* Floating Elements */}
              <div className="absolute top-8 left-8 bg-white/20 backdrop-blur-sm rounded-xl p-4 z-20">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-8 right-8 bg-white/20 backdrop-blur-sm rounded-xl p-4 z-20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  10K+
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Creators
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  500K+
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Happy Subscribers
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  1M+
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Content Pieces
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Top-Up Modal */}
      <PayPalTopUp
        isOpen={showPayPal}
        onClose={() => setShowPayPal(false)}
        onSuccess={handlePayPalSuccess}
        onError={handlePayPalError}
      />
    </div>
  );
}