import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatedSection>
          <Link
            to="/"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-white font-poppins mb-8">Cookie Policy</h1>
          
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-slate-400 text-sm">Last updated: January 2025</p>
              
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies</h2>
                <p className="text-slate-300 leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  improving our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We use cookies for several purposes:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>• <strong>Essential Cookies:</strong> Required for the website to function properly</li>
                  <li>• <strong>Authentication Cookies:</strong> Keep you logged in to your account</li>
                  <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li>• <strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Types of Cookies We Use</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Session Cookies</h3>
                    <p className="text-slate-300">
                      These are temporary cookies that expire when you close your browser. They help us 
                      maintain your session while you browse our site.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Persistent Cookies</h3>
                    <p className="text-slate-300">
                      These cookies remain on your device for a set period or until you delete them. 
                      They help us remember your preferences for future visits.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Managing Cookies</h2>
                <p className="text-slate-300 leading-relaxed">
                  You can control and manage cookies in various ways. Most browsers allow you to refuse 
                  cookies or delete cookies that have already been set. However, please note that if you 
                  disable cookies, some features of our website may not function properly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
                <p className="text-slate-300 leading-relaxed">
                  We may use third-party services that set their own cookies, such as analytics providers 
                  and payment processors. These cookies are governed by the respective third parties' 
                  privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                <p className="text-slate-300 leading-relaxed">
                  If you have any questions about our use of cookies, please contact us through our 
                  support system.
                </p>
              </section>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}