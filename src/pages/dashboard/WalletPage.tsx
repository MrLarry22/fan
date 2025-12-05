import React from 'react';
import { Wallet, Plus, CreditCard, ArrowUpRight } from 'lucide-react';
import PayPalSubscription from '../../components/Payment/PayPalSubscription';

export default function WalletPage() {
  const [showPayPal, setShowPayPal] = React.useState(false);
  const [walletBalance, setWalletBalance] = React.useState(0.00);
  const [transactions, setTransactions] = React.useState<Array<{
    id: number;
    type: string;
    amount: number;
    date: string;
    status: string;
    paypalId: string;
  }>>([]);

  const handlePayPalSuccess = (subscriptionId: string) => {
    console.log('PayPal subscription successful:', subscriptionId);
    
    // Add credits to wallet (in real app, verify via webhook first)
    setWalletBalance(prev => prev + 25.00); // Example: $25 top-up
    
    // Add transaction record
    const newTransaction = {
      id: Date.now(),
      type: 'Subscription',
      amount: 5.00, // Monthly subscription amount
      date: new Date().toLocaleDateString(),
      status: 'Active',
      paypalId: subscriptionId
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    alert('Subscription activated successfully! Monthly billing: $5.00');
    setShowPayPal(false);
  };

  const handlePayPalError = (error: Error) => {
    console.error('PayPal error:', error);
    alert('Subscription failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
                Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your credits and payment methods
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Credits Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-8 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">
              Wallet Credits
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">$</span>
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {walletBalance.toFixed(2)}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Available Credits
                </p>
              </div>
            </div>

            <button 
              id="topup-btn"
              onClick={() => setShowPayPal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Top Up</span>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUpRight className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  No recent transactions. Your activity will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.type}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        +${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">
              My Payment Methods
            </h2>
          </div>

          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Payment Methods Added
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Add a payment method to easily top up your wallet and make purchases.
            </p>
            
            <button 
              onClick={() => setShowPayPal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">i</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Secure & Protected
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                Your payment information is encrypted and secure. We use industry-standard security 
                measures to protect your financial data and never store your card details on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Subscription Modal */}
      {showPayPal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-poppins">Subscribe</h2>
              <button 
                onClick={() => setShowPayPal(false)} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <PayPalSubscription
              amount="5.00"
              currency="USD"
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
              onCancel={() => setShowPayPal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}