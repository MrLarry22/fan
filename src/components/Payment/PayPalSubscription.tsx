import { useEffect, useRef, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';

interface PayPalSubscriptionProps {
  amount?: string; // e.g., "5.00"
  currency?: string; // e.g., "USD" 
  onSuccess: (subscriptionId: string) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

declare global {
  interface Window { 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal: any;
  }
}

export default function PayPalSubscription({ 
  amount = '5.00', 
  currency = 'USD', 
  onSuccess, 
  onError, 
  onCancel 
}: PayPalSubscriptionProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [mode, setMode] = useState<string>('sandbox');
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch PayPal config from server
  useEffect(() => {
  fetch(`${API_ENDPOINTS.paypal}/config`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClientId(data.data.clientId);
          setMode(data.data.mode || 'sandbox');
        } else {
          console.error('Failed to load PayPal config:', data);
          if (onError) onError(new Error('Failed to load PayPal configuration'));
        }
      })
      .catch(err => {
        console.error('Failed to load PayPal config', err);
        if (onError) onError(err);
      });
  }, [onError]);

  // Load PayPal SDK
  useEffect(() => {
    if (!clientId || scriptLoaded.current) return;

    const env = mode === 'live' ? '' : 'sandbox.';
    const script = document.createElement('script');
    script.src = `https://${env}paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.async = true;

    script.onload = () => {
      scriptLoaded.current = true;
      setSdkReady(true);
      setLoading(false);
      
      if (window.paypal && paypalRef.current) {
        try {
          window.paypal.Buttons({
            style: { 
              shape: 'rect', 
              color: 'blue', 
              layout: 'vertical', 
              label: 'subscribe',
              height: 40
            },
            createSubscription: async function() {
              try {
                console.log('Creating subscription with amount:', amount, currency);
                
                // Call our backend to create subscription
                const resp = await fetch(`${API_ENDPOINTS.paypal}/create-subscription`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    amount, 
                    currency,
                    return_url: `${window.location.origin}/payment/success`,
                    cancel_url: `${window.location.origin}/payment/cancel`
                  })
                });

                const json = await resp.json();
                if (!resp.ok || !json.success) {
                  console.error('Server failed to create subscription:', resp.status, json);
                  throw new Error(json.message || 'Failed to create subscription');
                }

                // PayPal expects subscription ID to proceed
                if (json.subscriptionId || (json.data && json.data.id)) {
                  const subId = json.subscriptionId || json.data.id;
                  console.log('Subscription created on server:', subId);
                  return subId;
                } else {
                  console.error('Invalid create-subscription response:', json);
                  throw new Error('Invalid subscription response from server');
                }
              } catch (err) {
                console.error('createSubscription error:', err);
                throw err;
              }
            },
            onApprove: function(details: { subscriptionID?: string; id?: string }) {
              const subId = details.subscriptionID || details.id || '';
              console.log('Subscription approved:', subId);
              if (onSuccess) onSuccess(subId);
            },
            onError: function(err: Error) {
              console.error('PayPal subscription error:', err);
              if (onError) onError(err);
            },
            onCancel: function() {
              console.log('Subscription cancelled by user');
              if (onCancel) onCancel();
            }
          }).render(paypalRef.current);
        } catch (err) {
          console.error('Failed to render PayPal buttons:', err);
          if (onError) onError(err as Error);
        }
      }
    };

    script.onerror = () => {
      const error = new Error('Failed to load PayPal SDK');
      console.error(error);
      setLoading(false);
      if (onError) onError(error);
    };

    document.body.appendChild(script);

    return () => { 
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [clientId, mode, amount, currency, onSuccess, onError, onCancel]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center py-6">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading PayPal...</p>
        </div>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="w-full">
        <div className="text-center py-6">
          <p className="text-sm text-red-500">Failed to load PayPal. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-300">Monthly Subscription:</span>
          <span className="text-white font-semibold">${amount} {currency}/month</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Recurring billing, cancel anytime</p>
      </div>
      
      <div ref={paypalRef} className="w-full min-h-[50px]" />
      
      <div className="mt-4 text-xs text-slate-400 text-center">
        <p>🔒 Secure payment processing by PayPal</p>
        <p>You can cancel your subscription at any time</p>
      </div>
    </div>
  );
}