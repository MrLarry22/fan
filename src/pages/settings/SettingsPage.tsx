import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  HelpCircle, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export default function SettingsPage() {
  const settingsCategories = [
    {
      id: 'account',
      title: 'Account',
      icon: User,
      items: [
        { label: 'Account Info', path: '/settings/account/info' },
        { label: 'Password and Security Settings', path: '/dashboard/settings/account/security' },
        { label: 'Delete My Account', path: '/dashboard/settings/account/delete' }
      ]
    },
    {
      id: 'payments',
      title: 'Payments and Subscriptions',
      icon: CreditCard,
      items: [
        { label: 'Wallet and Payment Methods', path: '/dashboard/settings/payments/methods' },
        { label: 'My Subscriptions', path: '/dashboard/settings/payments/subscriptions' },
        { label: 'Transaction History', path: '/dashboard/settings/payments/history' }
      ]
    },
    {
      id: 'help',
      title: 'Help, Terms and Support',
      icon: HelpCircle,
      items: [
        { label: 'Help', path: '/support' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Privacy Policy', path: '/privacy' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white font-poppins">
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          {settingsCategories.map((category) => (
            <div key={category.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white font-poppins">
                    {category.title}
                  </h2>
                </div>
                
                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700 transition-colors group"
                    >
                      <span className="text-slate-300 group-hover:text-white">
                        {item.label}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}