import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Wallet, Globe } from 'lucide-react';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'venmo' | 'googlepay' | 'applepay' | 'local';
  icon: React.ReactNode;
  enabled: boolean;
  description?: string;
  localMethod?: 'ideal' | 'bancontact' | 'sofort' | 'giropay' | 'eps' | 'mybank' | 'p24';
}

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onMethodSelect: (methodId: string) => void;
  availableMethods?: PaymentMethod[];
  country?: string;
  className?: string;
}

const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'card',
    icon: <Wallet className="w-5 h-5" />,
    enabled: true,
    description: 'Pay with your PayPal account'
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    type: 'card',
    icon: <CreditCard className="w-5 h-5" />,
    enabled: true,
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'venmo',
    name: 'Venmo',
    type: 'venmo',
    icon: <Smartphone className="w-5 h-5" />,
    enabled: true,
    description: 'Pay with Venmo (US only)'
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    type: 'googlepay',
    icon: <Wallet className="w-5 h-5" />,
    enabled: true,
    description: 'Quick and secure Google Pay'
  }
];

// Local payment methods by country
const localPaymentMethods: Record<string, PaymentMethod[]> = {
  'NL': [
    {
      id: 'ideal',
      name: 'iDEAL',
      type: 'local',
      localMethod: 'ideal',
      icon: <Globe className="w-5 h-5" />,
      enabled: true,
      description: 'Dutch online banking'
    }
  ],
  'BE': [
    {
      id: 'bancontact',
      name: 'Bancontact',
      type: 'local',
      localMethod: 'bancontact',
      icon: <Globe className="w-5 h-5" />,
      enabled: true,
      description: 'Belgian payment method'
    }
  ],
  'DE': [
    {
      id: 'sofort',
      name: 'SOFORT',
      type: 'local',
      localMethod: 'sofort',
      icon: <Globe className="w-5 h-5" />,
      enabled: true,
      description: 'German online banking'
    },
    {
      id: 'giropay',
      name: 'giropay',
      type: 'local',
      localMethod: 'giropay',
      icon: <Globe className="w-5 h-5" />,
      enabled: true,
      description: 'German bank transfer'
    }
  ],
  'AT': [
    {
      id: 'eps',
      name: 'EPS',
      type: 'local',
      localMethod: 'eps',
      icon: <Globe className="w-5 h-5" />,
      enabled: true,
      description: 'Austrian online banking'
    }
  ],
  'IT': [
    {
      id: 'mybank',
      name: 'MyBank',
      type: 'local',
      localMethod: 'mybank',
      icon: <Globe className="w-5 h-5" />,
      enabled: true,
      description: 'Italian online banking'
    }
  ],
  'PL': [
    {
      id: 'p24',
      name: 'Przelewy24',
      type: 'local',
      localMethod: 'p24',
      icon: <Globe className="w-5 h-5" />,
      enabled: true,
      description: 'Polish payment method'
    }
  ]
};

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
  availableMethods,
  country = 'US',
  className = ''
}: PaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    if (availableMethods) {
      setMethods(availableMethods);
    } else {
      // Build default methods + local methods for country
      const allMethods = [...defaultPaymentMethods];
      
      // Add local payment methods for the specific country
      if (localPaymentMethods[country]) {
        allMethods.push(...localPaymentMethods[country]);
      }
      
      // Filter Venmo for US only
      const filteredMethods = allMethods.filter(method => {
        if (method.id === 'venmo' && country !== 'US') {
          return false;
        }
        return method.enabled;
      });
      
      setMethods(filteredMethods);
    }
  }, [availableMethods, country]);

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Choose Payment Method</h3>
      
      {methods.map((method) => (
        <div
          key={method.id}
          className={`
            p-4 rounded-lg border cursor-pointer transition-all duration-200
            ${selectedMethod === method.id
              ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
              : 'border-slate-600 bg-slate-800 hover:border-slate-500 hover:bg-slate-700'
            }
          `}
          onClick={() => onMethodSelect(method.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                p-2 rounded-lg
                ${selectedMethod === method.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}
              `}>
                {method.icon}
              </div>
              <div>
                <div className="font-medium text-white">{method.name}</div>
                {method.description && (
                  <div className="text-sm text-slate-400">{method.description}</div>
                )}
              </div>
            </div>
            
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selectedMethod === method.id
                ? 'border-blue-500 bg-blue-500'
                : 'border-slate-500'
              }
            `}>
              {selectedMethod === method.id && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-xs text-slate-400 text-center mt-4">
        🔒 All payments are processed securely through PayPal
      </div>
    </div>
  );
}
