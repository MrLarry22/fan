import React from 'react';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-poppins">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with all your activity
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700">
          <div className="text-center">
            {/* Icon */}
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-white" />
            </div>

            {/* Message */}
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
                Stay in the Loop!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                Notifications will show up here. Stay in the loop! This is where you'll find updates from your Fans, 
                activity on your posts, and all the love coming your way. Keep posting, messaging, and connecting 
                to make this page buzz with action!
              </p>
            </div>

            {/* Feature Icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Likes & Reactions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified when fans interact with your content
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Messages
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Never miss a message from your supporters
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  New Followers
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Celebrate when new fans join your community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}