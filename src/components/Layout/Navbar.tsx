import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Settings, 
  Crown, 
  Menu, 
  X, 
  Heart,
  Search,
  Home,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Discover', icon: Home },
    { path: '/dashboard/discover', label: 'Creators', icon: Users },
    { path: '/search', label: 'Search', icon: Search },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white font-poppins">
              Fanview
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive(path)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            
            {/* Desktop Admin Link - More Prominent */}
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={(e) => {
                  // Additional client-side verification
                  if (profile.role !== 'admin') {
                    e.preventDefault();
                    alert('🚫 Access Denied: Admin privileges required');
                    return;
                  }
                }}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/admin')
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-red-500/30 hover:border-red-400'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span className="font-semibold">🔒 ADMIN</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && profile ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-8 h-8 object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-white text-sm font-medium">
                    {profile?.full_name || 'User'}
                  </span>
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white transition-colors p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="space-y-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(path)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
              
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/admin')
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-red-500/30'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {user && profile && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>My Dashboard</span>
                </Link>
              )}
            </div>
            
            {/* Mobile Admin Link */}
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/admin')
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-red-500/30'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}