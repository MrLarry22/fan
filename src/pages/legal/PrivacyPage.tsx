import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function PrivacyPage() {
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
          
          <h1 className="text-4xl font-bold text-white font-poppins mb-8">Privacy Policy</h1>
          
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-slate-400 text-sm">Last updated: January 2025</p>
              
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  subscribe to creators, or contact us for support.
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>• Account information (email, username, password)</li>
                  <li>• Payment information (processed securely by our payment providers)</li>
                  <li>• Profile information (bio, preferences)</li>
                  <li>• Usage data and analytics</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We use the information we collect to provide, maintain, and improve our services:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>• Process subscriptions and payments</li>
                  <li>• Provide customer support</li>
                  <li>• Send important updates about our service</li>
                  <li>• Improve our platform and user experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Information Sharing</h2>
                <p className="text-slate-300 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  except as described in this policy. We may share information with service providers who 
                  assist us in operating our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
                <p className="text-slate-300 leading-relaxed">
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. All payment information is 
                  processed securely by PCI-compliant payment processors.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                <p className="text-slate-300 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us through our 
                  support system or email us at privacy@fanview.com.
                </p>
              </section>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}