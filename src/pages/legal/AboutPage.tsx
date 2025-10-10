import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function AboutPage() {
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
          
          <h1 className="text-4xl font-bold text-white font-poppins mb-8">About Us</h1>
          
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed mb-6">
                Welcome to Fanview - the premier subscription-based content platform that connects users with their favorite creators.
              </p>
              
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                We're dedicated to empowering creators and providing fans with exclusive access to premium content. 
                Our platform is built with cutting-edge technology to ensure the best experience for both creators and subscribers.
              </p>
              
              <h2 className="text-2xl font-bold text-white mb-4">What We Offer</h2>
              <ul className="text-slate-300 space-y-2 mb-6">
                <li>• Subscription-based access to exclusive creator content</li>
                <li>• Direct messaging between creators and fans</li>
                <li>• Pay-to-view premium content</li>
                <li>• Secure payment processing</li>
                <li>• Mobile-optimized experience</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-white mb-4">Our Values</h2>
              <p className="text-slate-300 leading-relaxed">
                We believe in creating a safe, secure, and innovative platform that puts both creators and fans first. 
                Privacy, security, and user experience are at the core of everything we do.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}