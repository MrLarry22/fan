import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';

// Minimal PayPal SDK typings to avoid conflicts with global declarations
type PaypalButtonsConfig = {
  style?: {
    shape?: string;
    color?: string;
    layout?: string;
    label?: string;
    height?: number;
    tagline?: boolean;
  };
  createSubscription: () => Promise<string>;
  onApprove: (data: { subscriptionID?: string; id?: string }) => Promise<void>;
  onError: (err: { message?: string }) => void;
  onCancel: () => void;
};

type PaypalButtons = { render: (element: HTMLElement) => Promise<void> };
type PaypalNamespaceSlim = { Buttons: (config: PaypalButtonsConfig) => PaypalButtons };

interface PayPalEnhancedSubscriptionProps {
  amount?: string;
  currency?: string;
  planId?: string;
  onSuccess: (subscriptionId: string, paymentMethod: string) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  country?: string;
  customerEmail?: string;
  customization?: {
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    layout?: 'vertical' | 'horizontal';
    height?: number;
  };
}

// Note: Use runtime checks and minimal typing to avoid conflicts with global PayPal SDK types

type PaymentStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error';

export default function PayPalEnhancedSubscription({ 
  amount = '5.00', 
  currency = 'USD',
  planId,
  onSuccess, 
  onError, 
  onCancel,
  country = 'US',
  customerEmail,
  customization = {}
}: PayPalEnhancedSubscriptionProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const buttonsRendered = useRef(false);
  const isRendering = useRef(false);
  
  const [clientId, setClientId] = useState<string | null>(null);
  const [mode, setMode] = useState<string>('sandbox');
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('paypal');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Fetch PayPal config from server
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/paypal/config');
        const data = await response.json();
        
        if (data.success) {
          setClientId(data.data.clientId);
          setMode(data.data.mode || 'sandbox');
        } else {
          throw new Error('Failed to load PayPal configuration');
        }
      } catch (err) {
        console.error('Failed to load PayPal config', err);
        setPaymentStatus('error');
        setStatusMessage('Failed to load payment configuration');
        if (onError) onError(err as Error);
      }
    };

    fetchConfig();
  }, [onError]);

  // Load PayPal SDK
  useEffect(() => {
    if (!clientId || scriptLoaded.current) return;

    const env = mode === 'live' ? '' : 'sandbox.';
    
    // Build SDK URL with basic supported funding sources for sandbox
    const sdkParams = new URLSearchParams({
      'client-id': clientId,
      'vault': 'true',
      'intent': 'subscription',
      'currency': currency,
      'locale': country === 'US' ? 'en_US' : `en_${country}`,
      'components': 'buttons'
    });

    const script = document.createElement('script');
    script.src = `https://${env}paypal.com/sdk/js?${sdkParams.toString()}`;
    script.async = true;

    script.onload = () => {
      scriptLoaded.current = true;
      setSdkReady(true);
      setLoading(false);
    };

    script.onerror = () => {
      const error = new Error('Failed to load PayPal SDK');
      console.error(error);
      setLoading(false);
      setPaymentStatus('error');
      setStatusMessage('Failed to load PayPal SDK');
      if (onError) onError(error);
    };

    document.body.appendChild(script);

    return () => { 
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      scriptLoaded.current = false;
      buttonsRendered.current = false;
    };
  }, [clientId, mode, currency, country, onError]);

  // Render PayPal buttons when SDK is ready
  const renderPayPalButtons = useCallback(() => {
    const wpContainer = window as unknown as { paypal?: PaypalNamespaceSlim };
    const wp = wpContainer.paypal;
    if (!wp || !paypalRef.current || buttonsRendered.current || isRendering.current) return;

    // Verify the element is still in the DOM
    if (!document.body.contains(paypalRef.current)) {
      console.warn('PayPal container not in DOM yet, skipping render');
      return;
    }

    // Clear previous buttons safely
    try {
      paypalRef.current.innerHTML = '';
    } catch (e) {
      console.warn('Error clearing PayPal container:', e);
      return;
    }
    
    try {
      const buttons = wp.Buttons({
        style: { 
          shape: customization.shape || 'rect', 
          color: customization.color || 'blue', 
          layout: customization.layout || 'vertical', 
          label: 'subscribe',
          height: customization.height || 45
        },
        
        createSubscription: async function() {
          try {
            setPaymentStatus('processing');
            setStatusMessage('Creating subscription...');
            
            console.log('Creating subscription with:', {
              amount, 
              currency, 
              planId,
              paymentMethod: selectedPaymentMethod,
              customerEmail
            });
            
            const requestBody = {
              amount,
              currency,
              return_url: `${window.location.origin}/payment/success`,
              cancel_url: `${window.location.origin}/payment/cancel`,
              creator_id: planId  // Pass creator ID for database linking
            };

            // Get auth token to identify the user
            const authToken = localStorage.getItem('authToken');
            const headers: Record<string, string> = { 
              'Content-Type': 'application/json'
            };
            if (authToken) {
              headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch('http://localhost:3001/api/paypal/create-subscription', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                amount: requestBody.amount,
                currency: requestBody.currency,
                return_url: `${window.location.origin}/payment/success`,
                cancel_url: `${window.location.origin}/payment/cancel`,
                creator_id: planId  // Pass creator ID to backend
              })
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
              throw new Error(result.message || 'Failed to create subscription');
            }

            const subscriptionId = result.subscriptionId || result.data?.id;
            if (!subscriptionId) {
              throw new Error('Invalid subscription response from server');
            }

            console.log('Subscription created successfully:', subscriptionId);
            setStatusMessage('Subscription created, processing payment...');
            return subscriptionId;
            
          } catch (err) {
            console.error('createSubscription error:', err);
            setPaymentStatus('error');
            setStatusMessage((err as Error).message || 'Failed to create subscription');
            throw err;
          }
        },
        
        onApprove: async function(data: { subscriptionID?: string; id?: string }) {
          try {
            setPaymentStatus('processing');
            setStatusMessage('Finalizing subscription...');
            
            const subscriptionId = data.subscriptionID || data.id;
            console.log('Subscription approved:', subscriptionId);
            
            // Get auth token to identify the user
            const authToken = localStorage.getItem('authToken');
            const headers: Record<string, string> = { 
              'Content-Type': 'application/json'
            };
            if (authToken) {
              headers['Authorization'] = `Bearer ${authToken}`;
            }
            
            // Verify subscription with backend (this now saves to DB)
            const verifyResponse = await fetch(`http://localhost:3001/api/payments/subscriptions/subscription/${subscriptionId}`, {
              method: 'GET',
              headers
            });

            if (!verifyResponse.ok) {
              throw new Error('Failed to verify subscription');
            }

            const verifyResult = await verifyResponse.json();
            const status = verifyResult?.data?.status;
            const okStatuses = ['ACTIVE', 'APPROVAL_PENDING', 'APPROVED'];
            if (!verifyResult.success || (status && !okStatuses.includes(status))) {
              throw new Error(verifyResult.message || `Subscription verification failed${status ? ` (status: ${status})` : ''}`);
            }

            setPaymentStatus('success');
            setStatusMessage('Subscription activated successfully!');
            
            // Give the backend a moment to save the subscription
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (onSuccess && subscriptionId) {
              onSuccess(subscriptionId, selectedPaymentMethod);
            }
            
          } catch (err) {
            console.error('onApprove error:', err);
            setPaymentStatus('error');
            setStatusMessage((err as Error).message || 'Failed to finalize subscription');
            if (onError) onError(err as Error);
          }
        },  onError: function(err: { message?: string }) {
          console.error('PayPal subscription error:', err);
          setPaymentStatus('error');
          setStatusMessage('Payment processing failed');
          if (onError) onError(new Error(err.message || 'PayPal payment error'));
        },
        
        onCancel: function() {
          console.log('Subscription cancelled by user');
          setPaymentStatus('idle');
          setStatusMessage('Payment cancelled');
          if (onCancel) onCancel();
        }
        
      });

      // Check if element still exists before rendering
      if (!paypalRef.current || !document.body.contains(paypalRef.current)) {
        console.warn('PayPal container removed from DOM before render');
        return;
      }

      // Render buttons
  isRendering.current = true;
  buttons.render(paypalRef.current)
        .then(() => {
          buttonsRendered.current = true;
          isRendering.current = false;
          console.log('PayPal buttons rendered successfully');
        })
        .catch((err: Error) => {
          isRendering.current = false;
          // Don't show error if container was removed (expected on unmount)
          if (err.message.includes('container element removed')) {
            console.log('PayPal container removed during render (expected on unmount)');
            return;
          }
          console.error('Failed to render PayPal buttons:', err);
          setPaymentStatus('error');
          setStatusMessage('Failed to render payment buttons');
          if (onError) onError(err);
        });
      
    } catch (err) {
      console.error('Failed to initialize PayPal buttons:', err);
      setPaymentStatus('error');
      setStatusMessage('Failed to initialize payment system');
      if (onError) onError(err as Error);
    }
  }, [
    selectedPaymentMethod, 
    amount, 
    currency, 
    planId,
    customerEmail,
    customization,
    onSuccess, 
    onError, 
    onCancel
  ]);

  // Re-render buttons when payment method changes or SDK becomes ready
  useEffect(() => {
    if (sdkReady && !loading) {
      buttonsRendered.current = false;
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        renderPayPalButtons();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedPaymentMethod, sdkReady, loading, renderPayPalButtons]);

  // Initial render when SDK is ready
  useEffect(() => {
    if (sdkReady && !buttonsRendered.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        renderPayPalButtons();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sdkReady, renderPayPalButtons]);

  // Get status icon
  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-400">Loading payment system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Subscription Details */}
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-slate-300">Monthly Subscription:</span>
          <span className="text-white font-semibold">${amount} {currency}/month</span>
        </div>
        <p className="text-xs text-slate-400">Recurring billing • Cancel anytime</p>
      </div>

      {/* Payment Method Selection */}
      <PaymentMethodSelector
        selectedMethod={selectedPaymentMethod}
        onMethodSelect={setSelectedPaymentMethod}
        country={country}
      />

      {/* Status Message */}
      {statusMessage && (
        <div className={`
          p-3 rounded-lg flex items-center space-x-2 text-sm
          ${paymentStatus === 'error' ? 'bg-red-900/20 border border-red-500/20 text-red-400' :
            paymentStatus === 'success' ? 'bg-green-900/20 border border-green-500/20 text-green-400' :
            paymentStatus === 'processing' ? 'bg-blue-900/20 border border-blue-500/20 text-blue-400' :
            'bg-slate-800 border border-slate-600 text-slate-300'
          }
        `}>
          {getStatusIcon()}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* PayPal Buttons Container */}
      {sdkReady && paymentStatus !== 'success' && (
        <div className="space-y-3">
          <div ref={paypalRef} className="w-full min-h-[50px]" />
          
          <div className="text-xs text-slate-400 text-center space-y-1">
            <p>🔒 Secure payment processing by PayPal</p>
            <p>All major cards and digital wallets accepted</p>
            {country !== 'US' && <p>Local payment methods available for your region</p>}
          </div>
        </div>
      )}

      {/* Error State */}
      {paymentStatus === 'error' && (
        <div className="text-center py-4">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-400 mb-3">Payment system error</p>
          <button 
            onClick={() => {
              setPaymentStatus('idle');
              setStatusMessage('');
              buttonsRendered.current = false;
              renderPayPalButtons();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success State */}
      {paymentStatus === 'success' && (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Subscription Active!</h3>
          <p className="text-sm text-slate-400">
            Your ${amount} {currency}/month subscription has been activated
          </p>
        </div>
      )}
    </div>
  );
}
