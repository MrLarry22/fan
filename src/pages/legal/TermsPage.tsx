import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function TermsPage() {
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
          
          <h1 className="text-4xl font-bold text-white font-poppins mb-8">Terms of Service</h1>
          
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-slate-400 text-sm">Last updated: January 2025</p>
              
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Acceptance of Terms</h2>
                <p className="text-slate-300 leading-relaxed">
                  By accessing and using Fanview, you accept and agree to be bound by the terms and 
                  provision of this agreement. If you do not agree to abide by the above, please do 
                  not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Age Requirement</h2>
                <p className="text-slate-300 leading-relaxed">
                  You must be at least 18 years old to use Fanview. By using our service, you represent 
                  and warrant that you are at least 18 years of age.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Subscriptions and Payments</h2>
                <ul className="text-slate-300 space-y-2">
                  <li>• Subscriptions are charged monthly at $5 per creator</li>
                  <li>• You can cancel your subscription at any time</li>
                  <li>• Refunds are not provided for partial months</li>
                  <li>• All payments are processed securely through our payment partners</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">User Conduct</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  You agree not to use Fanview to:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>• Violate any laws or regulations</li>
                  <li>• Harass, abuse, or harm other users</li>
                  <li>• Share or distribute content without permission</li>
                  <li>• Attempt to circumvent payment systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Content Policy</h2>
                <p className="text-slate-300 leading-relaxed">
                  All content on Fanview is owned by the respective creators. Subscribers are granted 
                  limited access to view content but may not download, share, or redistribute any content 
                  without explicit permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
                <p className="text-slate-300 leading-relaxed">
                  We reserve the right to terminate or suspend your account at any time for violations 
                  of these terms or for any other reason at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
                <p className="text-slate-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us through 
                  our support system.
                </p>
              </section>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}