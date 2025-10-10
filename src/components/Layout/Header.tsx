import React from 'react';
import { User, LogOut, Settings, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white font-playfair">
              Fanview
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Discover
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Creators
            </a>
            {profile?.role === 'creator' && (
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                My Content
              </a>
            )}
            {profile?.role === 'admin' && (
              <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                <Crown className="w-4 h-4 mr-1" />
                Admin
              </a>
            )}
          </nav>

          {/* User Menu */}
          {user && profile ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-white text-sm font-medium">
                  {profile.full_name}
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  {profile.role}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}