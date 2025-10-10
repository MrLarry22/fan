import { X, ExternalLink, CreditCard } from 'lucide-react';

interface PayPalTopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (subscriptionId: string) => void;
  onError?: (error: Error) => void;
  creatorId: string;
}

export default function PayPalTopUp({ isOpen, onClose, creatorId }: PayPalTopUpProps) {
  const paypalSubscriptionUrl = 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0MN6183124871754NNC7PKVQ';

  const handlePayPalRedirect = () => {
    // Get auth token from localStorage
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      console.error('No auth token found');
      return;
    }

    // Store the pending subscription data
    const pendingData = {
      creatorId: creatorId,
      authToken: authToken
    };
    localStorage.setItem('pendingSubscription', JSON.stringify(pendingData));

    // Redirect to PayPal (using sandbox URL for testing)
    const paypalUrl = `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=YOUR_PAYPAL_EMAIL&item_name=Creator%20Subscription&a3=5.00&p3=1&t3=M&src=1&sra=1&return=${encodeURIComponent('http://localhost:5173/payment/success')}&cancel_return=${encodeURIComponent('http://localhost:5173/payment/cancel')}`;
    
    window.location.href = paypalUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-poppins">
              Top Up Wallet
            </h2>
            <p className="text-slate-400 text-sm">
              Add credits to your Fanview wallet
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* PayPal Direct Link */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-yellow-500 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Secure PayPal Checkout
            </h3>
            <p className="text-white/80 text-sm mb-6">
              Click below to complete your payment securely through PayPal
            </p>
            
            <button
              onClick={handlePayPalRedirect}
              className="w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Continue with PayPal</span>
              <ExternalLink className="w-5 h-5" />
            </button>
            
            {/* Pay With Card Option */}
            <div className="mt-4">
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-white/20"></div>
                <span className="px-4 text-white/60 text-sm">or</span>
                <div className="flex-1 border-t border-white/20"></div>
              </div>
              
              <button
                onClick={handlePayPalRedirect}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 border border-slate-600 hover:border-slate-500 flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Pay With Card</span>
                <ExternalLink className="w-4 h-4 opacity-60" />
              </button>
              
              <p className="text-white/60 text-xs text-center mt-2">
                Securely processed by PayPal
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="text-center mb-6">
          <p className="text-slate-400 text-sm mb-4">
            Or choose your payment amount:
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            {[10, 25, 50].map((amount) => (
              <button
                key={amount}
                onClick={() => window.open(`${paypalSubscriptionUrl}&amount=${amount}`, '_blank')}
                className="bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-lg transition-colors border border-slate-600 hover:border-slate-500"
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">i</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-100 text-sm mb-1">
                Secure Payment
              </h4>
              <p className="text-blue-200 text-xs leading-relaxed">
                You'll be redirected to PayPal's secure checkout page. We never store your payment information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}