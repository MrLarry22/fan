import React, { useEffect, useRef } from 'react';

interface PayPalSubscriptionProps {
  planId: string;
  onSuccess: (subscriptionId: string) => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

export default function PayPalSubscription({ planId, onSuccess, onError }: PayPalSubscriptionProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=ARCZ5elcfZlldhrN8u0nW79HRaRHhWapkG9mSeTnp-l9zOrhER80xGv-9G9kaW8T6umBpRX3sS-JDwJX&vault=true&intent=subscription';
    script.async = true;
    
    script.onload = () => {
      scriptLoaded.current = true;
      if (window.paypal && paypalRef.current) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              plan_id: planId
            });
          },
          onApprove: function(data: any, actions: any) {
            onSuccess(data.subscriptionID);
          },
          onError: function(err: any) {
            console.error('PayPal error:', err);
            if (onError) onError(err);
          }
        }).render(paypalRef.current);
      }
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [planId, onSuccess, onError]);

  return (
    <div className="w-full">
      <div ref={paypalRef} className="w-full"></div>
    </div>
  );
}