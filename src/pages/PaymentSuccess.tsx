import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your subscription...');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get the pending subscription from localStorage
        const pendingData = localStorage.getItem('pendingSubscription');
        if (!pendingData) {
          throw new Error('No pending subscription found');
        }

        const { creatorId, authToken } = JSON.parse(pendingData);
        
        // Get PayPal subscription ID from URL parameters
        const subscriptionId = searchParams.get('subscription_id') || searchParams.get('subscriptionID');
        
        if (!subscriptionId) {
          throw new Error('No PayPal subscription ID found');
        }

        // Call backend to create the subscription
  const response = await fetch(`${API_ENDPOINTS.subscriptions}/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ 
            creatorId, 
            paypalSubscriptionId: subscriptionId 
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Subscription failed');
        }

        const result = await response.json();
        
        // Clean up localStorage
        localStorage.removeItem('pendingSubscription');
        
        setStatus('success');
        setMessage('Subscription successful! You now have access to all premium content.');
        
        // Redirect to the creator's page after a delay
        setTimeout(() => {
          navigate(`/creator/${result.data.creator?.displayName || 'unknown'}`);
        }, 3000);

      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An error occurred while processing your payment.');
        
        // Clean up localStorage on error
        localStorage.removeItem('pendingSubscription');
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center border border-slate-700">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-4">Processing Payment</h1>
            <p className="text-slate-300">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <p className="text-slate-400 text-sm">Redirecting you back to the creator's page...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✕</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Failed</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}