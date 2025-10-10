import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AccountInfoPage() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    bio: profile?.bio || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await updateProfile({
        full_name: formData.full_name,
        bio: formData.bio
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/dashboard/settings"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Settings</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white font-poppins">
            Account Information
          </h1>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✓ Account information updated successfully!
            </p>
          </div>
        )}

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">
                Email cannot be changed for security reasons
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Account Role
              </label>
              <input
                type="text"
                value={profile?.role || 'User'}
                disabled
                className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-slate-400 cursor-not-allowed capitalize"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}