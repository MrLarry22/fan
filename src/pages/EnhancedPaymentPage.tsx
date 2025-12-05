import { useState } from 'react';
import PayPalEnhancedSubscription from '../components/Payment/PayPalEnhancedSubscription';
import SubscriptionManager from '../components/Payment/SubscriptionManager';
import { CheckCircle, CreditCard, Globe, Smartphone, Wallet } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  currency: string;
  interval: string;
  features: string[];
}

export default function EnhancedPaymentPage() {
  const [currentStep, setCurrentStep] = useState<'select' | 'payment' | 'manage'>('select');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState('US');

  // Mock user data - replace with real user context
  const mockUser = {
    id: 'user_123',
    email: 'user@example.com',
    country: userCountry
  };

  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '5.00',
      currency: 'USD',
      interval: 'month',
      features: [
        'Access to premium content',
        'HD video streaming',
        'Mobile app access',
        'Email support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Plan', 
      price: '10.00',
      currency: 'USD',
      interval: 'month',
      features: [
        'Everything in Basic',
        '4K video streaming',
        'Offline downloads',
        'Priority support',
        'Exclusive content'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '20.00', 
      currency: 'USD',
      interval: 'month',
      features: [
        'Everything in Premium',
        'Multiple device access',
        'Advanced analytics',
        'API access',
        'White-label options'
      ]
    }
  ];

  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', icon: <Wallet className="w-5 h-5" />, regions: 'Global' },
    { id: 'card', name: 'Credit/Debit Cards', icon: <CreditCard className="w-5 h-5" />, regions: 'Global' },
    { id: 'venmo', name: 'Venmo', icon: <Smartphone className="w-5 h-5" />, regions: 'US Only' },
    { id: 'googlepay', name: 'Google Pay', icon: <Wallet className="w-5 h-5" />, regions: 'Selected Countries' },
    { id: 'local', name: 'Local Methods', icon: <Globe className="w-5 h-5" />, regions: 'iDEAL, SOFORT, etc.' }
  ];

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (subId: string, paymentMethod: string) => {
    console.log('Payment successful:', { subId, paymentMethod });
    setSubscriptionId(subId);
    setCurrentStep('manage');
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error.message}`);
  };

  const handleCountryChange = (country: string) => {
    setUserCountry(country);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Enhanced PayPal Integration
          </h1>
          <p className="text-xl text-slate-300 mb-6">
            Professional payment system with multi-method support
          </p>
          
          {/* Country Selector */}
          <div className="inline-flex items-center space-x-2 bg-slate-800 rounded-lg p-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <select 
              value={userCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="bg-transparent text-white border-none focus:outline-none"
            >
              <option value="US">United States</option>
              <option value="NL">Netherlands</option>
              <option value="DE">Germany</option>
              <option value="BE">Belgium</option>
              <option value="AT">Austria</option>
              <option value="IT">Italy</option>
              <option value="PL">Poland</option>
              <option value="GB">United Kingdom</option>
            </select>
          </div>
        </div>

        {/* Payment Methods Showcase */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Supported Payment Methods
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {paymentMethods.map((method) => (
              <div 
                key={method.id}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 text-center"
              >
                <div className="flex justify-center mb-2 text-blue-400">
                  {method.icon}
                </div>
                <div className="text-white font-medium text-sm mb-1">
                  {method.name}
                </div>
                <div className="text-xs text-slate-400">
                  {method.regions}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['select', 'payment', 'manage'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${currentStep === step 
                    ? 'bg-blue-500 text-white' 
                    : index < ['select', 'payment', 'manage'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-600 text-slate-300'
                  }
                `}>
                  {index < ['select', 'payment', 'manage'].indexOf(currentStep) ? 
                    <CheckCircle className="w-4 h-4" /> : 
                    index + 1
                  }
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep === step ? 'text-white' : 'text-slate-400'
                }`}>
                  {step === 'select' ? 'Select Plan' : 
                   step === 'payment' ? 'Payment' : 'Manage'}
                </span>
                {index < 2 && (
                  <div className="w-8 h-0.5 bg-slate-600 ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 'select' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white text-center mb-8">
                Choose Your Subscription Plan
              </h2>
              
              {subscriptionPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {plan.name}
                      </h3>
                      <div className="text-2xl font-bold text-blue-400 mt-1">
                        ${plan.price}
                        <span className="text-sm text-slate-400">/{plan.interval}</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Select Plan
                    </button>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {currentStep === 'payment' && selectedPlan && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Complete Your Payment
                </h2>
                <p className="text-slate-300">
                  You selected: <span className="text-blue-400 font-semibold">{selectedPlan.name}</span>
                </p>
              </div>

              <PayPalEnhancedSubscription
                amount={selectedPlan.price}
                currency={selectedPlan.currency}
                country={userCountry}
                customerEmail={mockUser.email}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={() => setCurrentStep('select')}
                customization={{
                  color: 'blue',
                  shape: 'rect',
                  layout: 'vertical',
                  height: 45
                }}
              />

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('select')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  ← Back to plans
                </button>
              </div>
            </div>
          )}

          {currentStep === 'manage' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Subscription Management
                </h2>
                <p className="text-slate-300">
                  Manage your active subscription and payment methods
                </p>
              </div>

              <SubscriptionManager
                userId={mockUser.id}
                onSubscriptionChange={(subscription) => {
                  console.log('Subscription changed:', subscription);
                }}
              />

              <div className="text-center">
                <button
                  onClick={() => {
                    setCurrentStep('select');
                    setSubscriptionId(null);
                    setSelectedPlan(null);
                  }}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  ← Start over
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multiple Payment Methods</h3>
            <p className="text-slate-400 text-sm">
              Support for PayPal, cards, Venmo, Google Pay, and local payment methods
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure & Compliant</h3>
            <p className="text-slate-400 text-sm">
              PCI DSS compliant with advanced fraud protection and encryption
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Global Coverage</h3>
            <p className="text-slate-400 text-sm">
              Support for 200+ countries with localized payment methods
            </p>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-12 p-6 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5">
              ⚠️
            </div>
            <div>
              <h4 className="text-yellow-400 font-semibold mb-2">Demo Environment</h4>
              <p className="text-yellow-200 text-sm mb-3">
                This is a demonstration of the enhanced PayPal integration using sandbox credentials. 
                In a production environment, you would:
              </p>
              <ul className="text-yellow-200 text-sm space-y-1">
                <li>• Use live PayPal credentials</li>
                <li>• Implement proper user authentication</li>
                <li>• Store subscription data in a database</li>
                <li>• Set up webhook endpoints for event handling</li>
                <li>• Add comprehensive error logging</li>
                <li>• Implement fraud detection measures</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
