import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('fanview-cookie-consent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('fanview-cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Set a temporary flag to not show again this session
    sessionStorage.setItem('fanview-cookie-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              {/* Cookie Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Message */}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2 font-poppins">
                  🍪 Cookie Notice
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  We use cookies to improve your experience and provide faster access. 
                  By continuing, you accept our cookie policy.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={handleAcceptCookies}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 min-w-[140px]"
                >
                  <span>Accept Cookies</span>
                </button>
                
                <Link
                  to="/cookies"
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-slate-600 hover:border-slate-500 flex items-center justify-center min-w-[120px]"
                >
                  Learn More
                </Link>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 md:relative md:top-0 md:right-0 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Privacy Notice */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-slate-500 text-xs leading-relaxed">
                We respect your privacy. Cookies help us provide personalized content and analyze site usage. 
                You can manage your preferences in our{' '}
                <Link to="/cookies" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Cookie Policy
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}