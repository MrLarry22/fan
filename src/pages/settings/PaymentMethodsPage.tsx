import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus } from 'lucide-react';
// import PayPalTopUp from '../../components/Payment/PayPalTopUp'; // Removed: subscription-only

export default function PaymentMethodsPage() {
  const [showPayPal, setShowPayPal] = useState(false);

  const handlePayPalSuccess = (subscriptionId: string) => {
    console.log('PayPal setup successful:', subscriptionId);
    alert('Payment method added successfully!');
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error);
    alert('Failed to add payment method. Please try again.');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/dashboard/settings"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Settings</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white font-poppins">
            Payment Methods
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your payment methods and billing information
          </p>
        </div>

        {/* Current Payment Methods */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Your Payment Methods
            </h2>
            <button
              onClick={() => setShowPayPal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment Method</span>
            </button>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Payment Methods Added
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Add a payment method to easily subscribe to creators and top up your wallet.
            </p>
            
            <button 
              onClick={() => setShowPayPal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Payment Method</span>
            </button>
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Billing Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Billing Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter billing name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Country
              </label>
              <select className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Address
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter billing address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                City
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter city"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter ZIP code"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
              Save Billing Info
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">i</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-100 mb-2">
                Secure Payment Processing
              </h4>
              <p className="text-blue-200 text-sm leading-relaxed">
                All payment information is encrypted and processed securely through PayPal. 
                We never store your credit card details on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Modal */}
      <PayPalTopUp
        isOpen={showPayPal}
        onClose={() => setShowPayPal(false)}
        onSuccess={handlePayPalSuccess}
        onError={handlePayPalError}
      />
    </div>
  );
}