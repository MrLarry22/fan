import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement account deletion logic
      console.log('Account deletion requested');
      alert('Account deletion request submitted. You will receive a confirmation email.');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/dashboard/settings"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Settings</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white font-poppins">
            Delete Account
          </h1>
        </div>

        {/* Warning Section */}
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-100 font-semibold mb-2">
                Warning: This action cannot be undone
              </h3>
              <p className="text-red-200 text-sm leading-relaxed">
                Deleting your account will permanently remove all your data, including your profile, 
                subscriptions, transaction history, and any content you've liked or saved. This action 
                is irreversible.
              </p>
            </div>
          </div>
        </div>

        {/* What will be deleted */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            What will be deleted:
          </h2>
          
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Your profile and account information</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>All active subscriptions (will be cancelled)</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Transaction history and payment methods</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Wallet balance and credits</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Liked content and preferences</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Messages and conversations</span>
            </li>
          </ul>
        </div>

        {/* Alternatives */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6 mb-8">
          <h3 className="text-blue-100 font-semibold mb-3">
            Consider these alternatives:
          </h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li>• Temporarily deactivate your account instead</li>
            <li>• Cancel your subscriptions but keep your account</li>
            <li>• Contact support if you're having issues</li>
            <li>• Download your data before deleting</li>
          </ul>
        </div>

        {/* Deletion Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Confirm Account Deletion
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Type DELETE here"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirm-deletion"
                checked={showConfirmation}
                onChange={(e) => setShowConfirmation(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
              />
              <label htmlFor="confirm-deletion" className="text-sm text-slate-300">
                I understand that this action cannot be undone
              </label>
            </div>

            <div className="flex space-x-4 pt-6">
              <Link
                to="/dashboard/settings"
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || confirmText !== 'DELETE' || !showConfirmation}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm mb-2">
            Need help or have questions?
          </p>
          <Link
            to="/support"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
  );
}