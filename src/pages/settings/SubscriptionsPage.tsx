import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, DollarSign } from 'lucide-react';

export default function SubscriptionsPage() {
  // Mock subscription data - replace with real data from your backend
  const subscriptions = [
    // Empty for now - will show "No subscriptions" message
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/dashboard/settings"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Settings</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white font-poppins">
            My Subscriptions
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your active subscriptions and billing
          </p>
        </div>

        {/* Subscriptions List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Active Subscriptions
            </h2>
            <div className="text-sm text-slate-400">
              {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {subscriptions.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Active Subscriptions
              </h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                You haven't subscribed to any creators yet. Discover amazing creators and start your journey!
              </p>
              
              <Link
                to="/dashboard/discover"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Discover Creators</span>
              </Link>
            </div>
          ) : (
            /* Subscriptions List */
            <div className="space-y-4">
              {subscriptions.map((subscription: any) => (
                <div key={subscription.id} className="bg-slate-700 rounded-xl p-6 border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={subscription.creator.avatar}
                        alt={subscription.creator.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-white font-semibold">
                          {subscription.creator.name}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          @{subscription.creator.username}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${subscription.amount}/month</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Next billing: {subscription.nextBilling}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          subscription.status === 'active' 
                            ? 'bg-green-900/20 text-green-400' 
                            : 'bg-red-900/20 text-red-400'
                        }`}>
                          {subscription.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <button className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      View Profile
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing Summary */}
        <div className="mt-8 bg-slate-800 rounded-xl border border-slate-700 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Billing Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-700 rounded-xl">
              <p className="text-2xl font-bold text-white">$0.00</p>
              <p className="text-sm text-slate-400">Monthly Total</p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-xl">
              <p className="text-2xl font-bold text-white">$0.00</p>
              <p className="text-sm text-slate-400">This Year</p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-xl">
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-sm text-slate-400">Active Subs</p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">?</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-100 mb-2">
                Need Help with Subscriptions?
              </h4>
              <p className="text-blue-200 text-sm leading-relaxed mb-3">
                Having trouble with your subscriptions or billing? Our support team is here to help.
              </p>
              <Link
                to="/support"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}