import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Shield, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GoogleButton from '../components/ui/GoogleButton';

interface FormData {
  email: string;
  password: string;
  fullName: string;
}

export default function SignupPage() {
  const [showAgeVerification, setShowAgeVerification] = useState(true);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Always show age verification for new signup attempts
    setShowAgeVerification(true);
    setIsAgeVerified(false);
  }, []);

  const handleAgeVerification = (isOver18: boolean) => {
    if (isOver18) {
      setIsAgeVerified(true);
      setShowAgeVerification(false);
    } else {
      // Redirect to Google or previous page
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'https://google.com';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      
      if (error) {
        throw error;
      }

      setSuccess('Account created successfully! Please check your email for verification instructions before signing in.');
      setFormData({ email: '', password: '', fullName: '' });
      
      // Don't redirect immediately, let user read the message
      // They need to verify their email first
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        throw error;
      }

      // OAuth redirect is handled by Supabase
      // User will be redirected to Google, then back to our app
      
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.message?.includes('popup')) {
        setError('Please allow popups for Google sign-in or try again.');
      } else if (err.message?.includes('network')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Google sign-in failed. Please try using email instead.');
      }
    } finally {
      // Don't set loading to false immediately for OAuth flow
      // It will be handled by the redirect
    }
  };

  // Age Verification Modal
  const AgeVerificationModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl relative">
        {/* Close button for accessibility */}
        <button
          onClick={() => handleAgeVerification(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          {/* Headline */}
          <h1 className="text-3xl font-bold text-white mb-4 font-poppins">
            Age Verification
          </h1>
          
          {/* Subtext */}
          <p className="text-slate-300 mb-8 leading-relaxed text-lg">
            You must be 18 or older to create an account on FanView.
          </p>
          
          {/* Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => handleAgeVerification(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Yes, I'm 18+</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleAgeVerification(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
            >
              No, I'm under 18
            </button>
          </div>
          
          {/* Legal disclaimer */}
          <p className="text-slate-500 text-xs mt-6 leading-relaxed">
            By clicking "Yes, I'm 18+", you confirm that you are at least 18 years old and agree to our age verification policy.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      {/* Age Verification Modal - Always show first */}
      {showAgeVerification && <AgeVerificationModal />}
      
      {/* Signup Form - Only show after age verification */}
      {isAgeVerified && !showAgeVerification && (
        <div className="w-full max-w-md">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">F</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 font-poppins">
                Join FanView
              </h1>
              <p className="text-slate-400">
                Create your account to access exclusive content
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm mb-4">{success}</p>
                <div className="text-center">
                  <p className="text-slate-400 text-xs mb-3">
                    Didn't receive the email? Check your spam folder or click below to resend.
                  </p>
                  <button
                    onClick={async () => {
                      if (!formData.email) return;
                      
                      try {
                        const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: formData.email }),
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                          alert('Verification email sent! Please check your inbox.');
                        } else {
                          alert(data.message || 'Failed to send verification email');
                        }
                      } catch (error) {
                        alert('Failed to send verification email. Please try again.');
                      }
                    }}
                    className="text-green-400 hover:text-green-300 text-sm underline transition-colors"
                  >
                    Resend verification email
                  </button>
                </div>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Google Sign In Button */}
              <GoogleButton
                onClick={handleGoogleSignIn}
                loading={googleLoading}
                text="Continue with Google"
              />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-400">Or create account with email</span>
                </div>
              </div>

              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-500"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-800 disabled:to-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-slate-500 text-xs leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}