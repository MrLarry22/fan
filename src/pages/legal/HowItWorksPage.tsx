import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, CreditCard, MessageCircle, Eye } from 'lucide-react';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Users,
      title: "Discover Creators",
      description: "Browse through our diverse community of content creators and find your favorites."
    },
    {
      icon: CreditCard,
      title: "Subscribe for $5/month",
      description: "Subscribe to any creator for just $5 per month to unlock their exclusive content."
    },
    {
      icon: MessageCircle,
      title: "Direct Messaging",
      description: "Connect directly with creators through our messaging system - some messages are free, others are paid."
    },
    {
      icon: Eye,
      title: "Pay-to-View Content",
      description: "Access the most exclusive content through our pay-to-view system for premium experiences."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatedSection>
          <Link
            to="/"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white font-poppins mb-4">How It Works</h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Getting started with Fanview is simple. Follow these steps to connect with your favorite creators.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <AnimatedSection key={index} delay={0.1 * index} direction="up">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white font-poppins mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.5}>
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white font-poppins mb-6">Getting Started</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Create Your Account</h3>
                <p className="text-slate-300">
                  Sign up with your email address and create a secure password. You'll get a random username that you can customize later.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Browse Creators</h3>
                <p className="text-slate-300">
                  Explore our diverse community of creators including influencers, fitness models, musicians, and more.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Subscribe & Enjoy</h3>
                <p className="text-slate-300">
                  Subscribe to your favorite creators for $5/month each and gain access to their exclusive content and direct messaging.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}