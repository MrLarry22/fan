import React, { useState } from 'react';
import { MessageCircle, X, Home, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Issues with adding a card or making a payment',
    answer: 'If you\'re having trouble adding a payment card, please check that your card details are correct and that your bank allows online transactions. Contact your bank to whitelist Fanview if the transaction is being declined.',
    category: 'For Fans'
  },
  {
    id: '2',
    question: 'Payout methods and earnings',
    answer: 'Creators can receive payouts through various methods including bank transfer and PayPal. Payouts are processed weekly and require a minimum balance of $20.',
    category: 'For Fans'
  },
  {
    id: '3',
    question: 'ID verification and KYC issues',
    answer: 'ID verification is required for creators to receive payouts. Please ensure your documents are clear, valid, and match your account information. Processing typically takes 24-48 hours.',
    category: 'For Fans'
  },
  {
    id: '4',
    question: 'Adding Fanview app on iOS/Android',
    answer: 'Fanview can be added as a web app to your home screen. On iOS: Open Safari, tap Share, then "Add to Home Screen". On Android: Open Chrome, tap menu, then "Add to Home Screen".',
    category: 'For Fans'
  }
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'help'>('home');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Fanview Support</h3>
            <p className="text-xs text-white/80">We're here to help!</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && (
          <div className="p-4 h-full overflow-y-auto">
            <div className="mb-4">
              <h4 className="text-white font-semibold mb-2">Frequently Asked Questions</h4>
              <p className="text-slate-400 text-sm">Click on any question to see the answer</p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item) => (
                <div key={item.id} className="bg-slate-800 rounded-lg border border-slate-700">
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full p-3 text-left flex items-center justify-between hover:bg-slate-750 transition-colors rounded-lg"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{item.question}</p>
                      <p className="text-slate-400 text-xs mt-1">{item.category}</p>
                    </div>
                    {expandedFAQ === item.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  
                  {expandedFAQ === item.id && (
                    <div className="px-3 pb-3">
                      <div className="bg-slate-700 rounded-lg p-3 mt-2">
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="p-4 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Need More Help?</h4>
              <p className="text-slate-400 text-sm mb-4">
                Visit our comprehensive help center for detailed guides and support articles.
              </p>
              <Link
                to="/support"
                onClick={() => setIsOpen(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 inline-block"
              >
                Visit Help Center
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-slate-700 p-2">
        <div className="flex rounded-lg bg-slate-800 p-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-colors ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-colors ${
              activeTab === 'help'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Help</span>
          </button>
        </div>
      </div>
    </div>
  );
}