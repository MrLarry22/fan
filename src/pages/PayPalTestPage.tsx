import { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import PayPalSubscription from '../components/Payment/PayPalSubscription';
import PayPalCancelSubscription from '../components/Payment/PayPalCancelSubscription';

export default function PayPalTestPage() {
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleSubscriptionSuccess = (subscriptionId: string) => {
    console.log('Subscription successful:', subscriptionId);
    alert(`Subscription successful! Subscription ID: ${subscriptionId}`);
    setCurrentSubscriptionId(subscriptionId);
  };

  const handleCancelSuccess = () => {
    console.log('Subscription cancelled');
    alert('Subscription cancelled successfully!');
    setCurrentSubscriptionId(null);
    setShowCancelDialog(false);
  };

  const handleError = (error: Error) => {
    console.error('Payment error:', error);
    alert(`Error: ${error.message || 'Unknown error'}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">PayPal Subscription Test</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Subscription Section */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Monthly Subscription</h2>
            <p className="text-slate-300 mb-6">
              Subscribe to Fanview for recurring monthly access.
              Default: $5.00/month USD
            </p>
            
            {!currentSubscriptionId ? (
              <PayPalSubscription
                amount="5.00"
                currency="USD"
                onSuccess={handleSubscriptionSuccess}
                onError={handleError}
                onCancel={() => console.log('User cancelled subscription flow')}
              />
            ) : (
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                  <h3 className="text-green-100 font-semibold mb-2">Active Subscription</h3>
                  <p className="text-green-200 text-sm">ID: {currentSubscriptionId}</p>
                </div>
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Subscription Features</h2>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Monthly recurring billing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure PayPal processing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No setup fees</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
              <h4 className="text-blue-100 font-semibold mb-2">Test Mode</h4>
              <p className="text-blue-200 text-sm">
                This is using PayPal sandbox environment. Use test credentials to complete payments.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Test Instructions</h3>
          <div className="text-slate-300 space-y-2">
            <p>• Click "Subscribe" to start PayPal subscription flow</p>
            <p>• Use PayPal sandbox test credentials to complete subscription</p>
            <p>• After successful subscription, you can test cancellation</p>
            <p>• Check browser console and server logs for detailed information</p>
            <p>• For debugging, check: <code className="bg-slate-700 px-2 py-1 rounded text-sm">GET /api/paypal/debug/last-created</code></p>
          </div>
        </div>

        {/* Debug Section */}
        <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Debug Tools</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                fetch(`${API_ENDPOINTS.paypal}/debug/last-created`)
                  .then(res => res.json())
                  .then(data => {
                    console.log('Debug info:', data);
                    alert('Debug info logged to console. Check developer tools.');
                  })
                  .catch(err => console.error('Debug fetch error:', err));
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              View PayPal Objects
            </button>
            
            <button
              onClick={() => {
                fetch(`${API_ENDPOINTS.paypal}/debug/clear`, { method: 'POST' })
                  .then(res => res.json())
                  .then(data => {
                    console.log('Cleared debug info:', data);
                    alert('Debug info cleared');
                  })
                  .catch(err => console.error('Clear debug error:', err));
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Clear Debug Cache
            </button>

            <button
              onClick={() => {
                setCurrentSubscriptionId(null);
                alert('Local subscription state reset');
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Reset Local State
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelDialog && currentSubscriptionId && (
        <PayPalCancelSubscription
          subscriptionId={currentSubscriptionId}
          onSuccess={handleCancelSuccess}
          onError={handleError}
          onClose={() => setShowCancelDialog(false)}
        />
      )}
    </div>
  );
}
