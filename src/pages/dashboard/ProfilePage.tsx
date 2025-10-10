import React from 'react';
import { User, Edit, MapPin, Calendar, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const { profile } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const generateHandle = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '-' + Math.floor(Math.random() * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-poppins">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile information and settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 -mt-16 md:-mt-12">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-slate-800 shadow-lg">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(profile?.full_name || 'User')
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {profile?.full_name || 'Advanced Haddock'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  @{generateHandle(profile?.full_name || 'advanced-haddock')}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Location not set</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Link
                to="/dashboard/profile/edit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>
            </div>

            {/* Bio Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Bio
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {profile?.bio || 'No bio added yet. Tell the world about yourself!'}
              </p>
            </div>

            {/* Stats Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Stats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subscriptions</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile?.role === 'admin' ? 'Admin' : 'User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Type</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/dashboard/profile/edit"
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-900/20 transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Edit Profile
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your information and bio
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/settings"
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-900/20 transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Account Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage privacy and security
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}