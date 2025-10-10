import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, DollarSign } from 'lucide-react';

export default function TransactionHistoryPage() {
  // Mock transaction data - replace with real data from your backend
  const transactions = [
    // Empty for now - will show "No transactions" message
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/dashboard/settings"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Settings</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white font-poppins">
                Transaction History
              </h1>
              <p className="text-slate-400 mt-2">
                View all your payment transactions and downloads
              </p>
            </div>
            
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date Range
              </label>
              <select className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Time</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 3 Months</option>
                <option value="365">Last Year</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Transaction Type
              </label>
              <select className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Types</option>
                <option value="subscription">Subscriptions</option>
                <option value="topup">Wallet Top-ups</option>
                <option value="purchase">Purchases</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Recent Transactions
            </h2>
            <div className="text-sm text-slate-400">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {transactions.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Transactions Yet
              </h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Your transaction history will appear here once you start subscribing to creators or making purchases.
              </p>
              
              <Link
                to="/dashboard/discover"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
              >
                <span>Start Exploring</span>
              </Link>
            </div>
          ) : (
            /* Transactions Table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Type</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">Amount</th>
                    <th className="text-center py-3 px-4 text-slate-300 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction: any) => (
                    <tr key={transaction.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-4 px-4 text-slate-300">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{transaction.date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white">
                        {transaction.description}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'subscription' 
                            ? 'bg-blue-900/20 text-blue-400'
                            : transaction.type === 'topup'
                            ? 'bg-green-900/20 text-green-400'
                            : 'bg-purple-900/20 text-purple-400'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-white font-semibold">
                        ${transaction.amount}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-900/20 text-green-400'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-900/20 text-yellow-400'
                            : 'bg-red-900/20 text-red-400'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <p className="text-2xl font-bold text-white">$0.00</p>
            <p className="text-sm text-slate-400">Total Spent</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <p className="text-2xl font-bold text-white">$0.00</p>
            <p className="text-sm text-slate-400">This Month</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-slate-400">Transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}