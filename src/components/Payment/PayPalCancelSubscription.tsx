import { useState } from 'react';
import { X } from 'lucide-react';

interface PayPalCancelSubscriptionProps {
  subscriptionId: string;
  onSuccess: () => void;
  onError?: (error: Error) => void;
  onClose: () => void;
}

export default function PayPalCancelSubscription({ 
  subscriptionId, 
  onSuccess, 
  onError, 
  onClose 
}: PayPalCancelSubscriptionProps) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
  const resp = await fetch(`${API_ENDPOINTS.paypal}/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId,
          reason: 'Customer requested cancellation'
        })
      });

      const json = await resp.json();
      if (!resp.ok || !json.success) {
        throw new Error(json.message || 'Failed to cancel subscription');
      }

      console.log('Subscription cancelled:', subscriptionId);
      onSuccess();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      if (onError) onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-poppins">Cancel Subscription</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-300 mb-4">
            Are you sure you want to cancel your subscription?
          </p>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Subscription ID:</p>
            <p className="text-white font-mono text-sm break-all">{subscriptionId}</p>
          </div>
        </div>

        <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-amber-100 text-sm mb-1">
                Important Notice
              </h4>
              <p className="text-amber-200 text-xs leading-relaxed">
                Cancelling will stop all future billing cycles. You'll retain access until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Keep Subscription
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Cancel Subscription'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
