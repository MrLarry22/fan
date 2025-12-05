import { useState, useEffect, useCallback } from 'react';
import { Calendar, CreditCard, DollarSign, AlertCircle, CheckCircle, XCircle, Pause, Play } from 'lucide-react';

interface Subscription {
  id: string;
  status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED' | 'EXPIRED';
  planId: string;
  amount: string;
  currency: string;
  interval: 'month' | 'year';
  nextBillingDate: string;
  lastPaymentDate?: string;
  paymentMethod: string;
  createdAt: string;
}

interface SubscriptionManagerProps {
  userId: string;
  onSubscriptionChange?: (subscription: Subscription | null) => void;
  className?: string;
}

type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

export default function SubscriptionManager({
  userId,
  onSubscriptionChange,
  className = ''
}: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState<ActionStatus>('idle');
  const [actionMessage, setActionMessage] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Fetch current subscription
  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
  const response = await fetch(`${API_ENDPOINTS.payments}/subscriptions/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setSubscription(result.data);
        if (onSubscriptionChange) {
          onSubscriptionChange(result.data);
        }
      } else {
        setSubscription(null);
        if (onSubscriptionChange) {
          onSubscriptionChange(null);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [userId, onSubscriptionChange]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setActionStatus('loading');
      setActionMessage('Cancelling subscription...');

  const response = await fetch(`${API_ENDPOINTS.payments}/subscriptions/${subscription.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const result = await response.json();

      if (result.success) {
        setActionStatus('success');
        setActionMessage('Subscription cancelled successfully');
        setShowCancelConfirm(false);
        
        // Update subscription status
        setSubscription(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
        
        if (onSubscriptionChange) {
          onSubscriptionChange(subscription ? { ...subscription, status: 'CANCELLED' } : null);
        }
      } else {
        throw new Error(result.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setActionStatus('error');
      setActionMessage((error as Error).message || 'Failed to cancel subscription');
    }

    // Clear status after 3 seconds
    setTimeout(() => {
      setActionStatus('idle');
      setActionMessage('');
    }, 3000);
  };

  const handleSuspendSubscription = async () => {
    if (!subscription) return;

    try {
      setActionStatus('loading');
      setActionMessage('Suspending subscription...');

  const response = await fetch(`${API_ENDPOINTS.payments}/subscriptions/${subscription.id}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to suspend subscription');
      }

      const result = await response.json();

      if (result.success) {
        setActionStatus('success');
        setActionMessage('Subscription suspended successfully');
        
        setSubscription(prev => prev ? { ...prev, status: 'SUSPENDED' } : null);
        
        if (onSubscriptionChange) {
          onSubscriptionChange(subscription ? { ...subscription, status: 'SUSPENDED' } : null);
        }
      } else {
        throw new Error(result.message || 'Failed to suspend subscription');
      }
    } catch (error) {
      console.error('Error suspending subscription:', error);
      setActionStatus('error');
      setActionMessage((error as Error).message || 'Failed to suspend subscription');
    }

    setTimeout(() => {
      setActionStatus('idle');
      setActionMessage('');
    }, 3000);
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    try {
      setActionStatus('loading');
      setActionMessage('Reactivating subscription...');

  const response = await fetch(`${API_ENDPOINTS.payments}/subscriptions/${subscription.id}/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      const result = await response.json();

      if (result.success) {
        setActionStatus('success');
        setActionMessage('Subscription reactivated successfully');
        
        setSubscription(prev => prev ? { ...prev, status: 'ACTIVE' } : null);
        
        if (onSubscriptionChange) {
          onSubscriptionChange(subscription ? { ...subscription, status: 'ACTIVE' } : null);
        }
      } else {
        throw new Error(result.message || 'Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      setActionStatus('error');
      setActionMessage((error as Error).message || 'Failed to reactivate subscription');
    }

    setTimeout(() => {
      setActionStatus('idle');
      setActionMessage('');
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'SUSPENDED':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'EXPIRED':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-400 bg-green-900/20 border-green-500/20';
      case 'CANCELLED':
        return 'text-red-400 bg-red-900/20 border-red-500/20';
      case 'SUSPENDED':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/20';
      case 'EXPIRED':
        return 'text-orange-400 bg-orange-900/20 border-orange-500/20';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-400">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Active Subscription</h3>
          <p className="text-sm text-slate-400">You don't have an active subscription yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto space-y-6 ${className}`}>
      {/* Subscription Details Card */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Subscription</h3>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${getStatusColor(subscription.status)}`}>
            {getStatusIcon(subscription.status)}
            <span className="capitalize">{subscription.status.toLowerCase()}</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-400">
              <DollarSign className="w-4 h-4" />
              <span>Amount</span>
            </div>
            <span className="text-white font-semibold">
              ${subscription.amount} {subscription.currency}/{subscription.interval}
            </span>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-400">
              <CreditCard className="w-4 h-4" />
              <span>Payment Method</span>
            </div>
            <span className="text-white capitalize">{subscription.paymentMethod}</span>
          </div>

          {/* Next Billing Date */}
          {subscription.status === 'ACTIVE' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Next Billing</span>
              </div>
              <span className="text-white">{formatDate(subscription.nextBillingDate)}</span>
            </div>
          )}

          {/* Last Payment Date */}
          {subscription.lastPaymentDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Last Payment</span>
              </div>
              <span className="text-white">{formatDate(subscription.lastPaymentDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Status */}
      {actionMessage && (
        <div className={`
          p-3 rounded-lg flex items-center space-x-2 text-sm
          ${actionStatus === 'error' ? 'bg-red-900/20 border border-red-500/20 text-red-400' :
            actionStatus === 'success' ? 'bg-green-900/20 border border-green-500/20 text-green-400' :
            'bg-blue-900/20 border border-blue-500/20 text-blue-400'
          }
        `}>
          {actionStatus === 'loading' && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {actionStatus === 'success' && <CheckCircle className="w-4 h-4" />}
          {actionStatus === 'error' && <XCircle className="w-4 h-4" />}
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {subscription.status === 'ACTIVE' && (
          <>
            <button
              onClick={handleSuspendSubscription}
              disabled={actionStatus === 'loading'}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Pause className="w-4 h-4" />
              <span>Suspend Subscription</span>
            </button>

            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={actionStatus === 'loading'}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Subscription</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">
                    Are you sure you want to cancel your subscription? This action cannot be undone.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionStatus === 'loading'}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    Yes, Cancel
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={actionStatus === 'loading'}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    Keep Subscription
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {subscription.status === 'SUSPENDED' && (
          <button
            onClick={handleReactivateSubscription}
            disabled={actionStatus === 'loading'}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Reactivate Subscription</span>
          </button>
        )}
      </div>

      <div className="text-xs text-slate-400 text-center">
        <p>🔒 All subscription changes are processed securely</p>
        <p>Subscription ID: {subscription.id}</p>
      </div>
    </div>
  );
}
