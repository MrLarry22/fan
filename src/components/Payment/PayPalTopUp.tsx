import { useEffect, useRef, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { X, CreditCard, Wallet } from 'lucide-react';

interface PayPalTopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
  onError: (error: Error) => void;
  defaultAmount?: string;
}

interface PayPalButtonsConfig {
  style: {
    shape: string;
    color: string;
    layout: string;
    label: string;
    height: number;
  };
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError: (err: { message?: string }) => void;
  onCancel: () => void;
}

interface PayPalNamespace {
  Buttons: (config: PayPalButtonsConfig) => {
    render: (element: HTMLElement) => void;
  };
}

declare global {
  interface Window { 
    paypal: PayPalNamespace;
  }
}

export default function PayPalTopUp({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onError,
  defaultAmount = '25.00'
}: PayPalTopUpProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState(defaultAmount);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  // Fetch PayPal config
  useEffect(() => {
    if (isOpen) {
  fetch(`${API_ENDPOINTS.paypal}/config`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            loadPayPalSDK(data.data.clientId, data.data.mode);
          }
        })
        .catch(err => {
          console.error('Failed to load PayPal config', err);
          onError(err);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadPayPalSDK = (clientId: string, mode: string) => {
    if (window.paypal) {
      setSdkReady(true);
      renderPayPalButtons();
      return;
    }

    const env = mode === 'live' ? '' : 'sandbox.';
    const script = document.createElement('script');
    script.src = `https://${env}paypal.com/sdk/js?client-id=${clientId}&intent=capture&currency=USD`;
    script.async = true;

    script.onload = () => {
      setSdkReady(true);
      renderPayPalButtons();
    };

    script.onerror = () => {
      onError(new Error('Failed to load PayPal SDK'));
    };

    document.body.appendChild(script);
  };

  const renderPayPalButtons = () => {
    if (!window.paypal || !paypalRef.current) return;

    paypalRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: { 
        shape: 'rect', 
        color: 'blue', 
        layout: 'vertical', 
        label: 'pay',
        height: 40
      },
      createOrder: async function() {
        try {
          setLoading(true);
          
          const response = await fetch(`${API_ENDPOINTS.paypal}/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              amount: amount,
              currency: 'USD',
              description: `Wallet Top-up $${amount}`
            })
          });

          const data = await response.json();
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to create payment');
          }

          return data.orderId;
        } catch (err) {
          console.error('Create order error:', err);
          setLoading(false);
          onError(err as Error);
          throw err;
        }
      },
      onApprove: async function(data: { orderID: string }) {
        try {
          const response = await fetch(`${API_ENDPOINTS.paypal}/capture-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderID })
          });

          const result = await response.json();
          
          if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to capture payment');
          }

          setLoading(false);
          onSuccess(data.orderID);
          onClose();
        } catch (err) {
          console.error('Capture payment error:', err);
          setLoading(false);
          onError(err as Error);
        }
      },
      onError: function(err: { message?: string }) {
        console.error('PayPal error:', err);
        setLoading(false);
        onError(new Error(err.message || 'PayPal payment error'));
      },
      onCancel: function() {
        setLoading(false);
        onClose();
      }
    }).render(paypalRef.current);
  };

  useEffect(() => {
    if (sdkReady && isOpen) {
      renderPayPalButtons();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady, isOpen, amount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Top Up Wallet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Amount Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Amount
          </label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {['10.00', '25.00', '50.00', '100.00'].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                  amount === amt
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300'
                }`}
                disabled={loading}
              >
                ${amt}
              </button>
            ))}
          </div>
          
          {/* Custom Amount */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">$</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom amount"
              min="1"
              max="1000"
              step="0.01"
              disabled={loading}
              className="block w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Top-up Amount:</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              ${amount}
            </span>
          </div>
        </div>

        {/* PayPal Buttons */}
        {sdkReady ? (
          <div className="mb-4">
            <div ref={paypalRef} className="w-full min-h-[50px]" />
          </div>
        ) : (
          <div className="mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading PayPal...</span>
            </div>
          </div>
        )}

        {/* Alternative Payment Methods */}
        <div className="space-y-3">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            or pay with
          </div>
          <button
            onClick={() => alert('Credit card payment coming soon!')}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">Credit/Debit Card</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
          🔒 Secure payment processing by PayPal
        </div>
      </div>
    </div>
  );
}