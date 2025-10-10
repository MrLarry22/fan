import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Bell, 
  Gift,
  Wallet,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Sidebar() {
  const { signOut, profile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/dashboard/discover', label: 'Discover', icon: Compass },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/dashboard/promotions', label: 'Promotions', icon: Gift },
    { path: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { path: '/dashboard/profile', label: 'Profile', icon: User },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col">
      {/* Logo */}
      {/* <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">
            Fanview
          </span>
        </Link>
      </div> */}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive(path)
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive(path) ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
            <span className="font-medium">{label}</span>
            {label === 'Wallet' && (
              <span className="ml-auto text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                $0.00
              </span>
            )}
            {label === 'Notifications' && (
              <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
          <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}