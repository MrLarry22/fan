import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clean up any pending subscription data
    localStorage.removeItem('pendingSubscription');
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center border border-slate-700">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-4">Payment Cancelled</h1>
        <p className="text-slate-300 mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        <p className="text-slate-400 text-sm mb-6">
          You can try again anytime to access premium content.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}