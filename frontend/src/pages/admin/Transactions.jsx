import React, { useState, useEffect } from 'react';
import {
  Search, CreditCard, Clock, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Loader, IndianRupee, Building2, ArrowRight, Calendar
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/api';

const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700' },
    FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700' },
    CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
  };
  const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

const TypeBadge = ({ type }) => {
  const config = {
    DISBURSEMENT: { label: 'Disbursement', color: 'bg-purple-100 text-purple-700' },
    REPAYMENT: { label: 'Repayment', color: 'bg-cyan-100 text-cyan-700' },
    SELF_FUNDED: { label: 'Self-Funded', color: 'bg-blue-100 text-blue-700' },
    FINANCIER_FUNDED: { label: 'Financier Funded', color: 'bg-green-100 text-green-700' },
  };
  const { label, color } = config[type] || { label: type || 'N/A', color: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
};

const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

const TransactionDetailModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Transaction Details</h2>
              <p className="text-gray-500 font-mono text-sm">{transaction.id?.slice(0, 8)}...</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Type */}
          <div className="flex items-center space-x-4">
            <StatusBadge status={transaction.status} />
            <TypeBadge type={transaction.type || transaction.fundingType} />
          </div>

          {/* Amount */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Amount</p>
            <p className="text-4xl font-bold text-gray-800">{formatCurrency(transaction.amount)}</p>
          </div>

          {/* Parties */}
          <div className="space-y-4">
            {transaction.payer && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Building2 size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Payer</p>
                    <p className="font-medium text-gray-800">
                      {transaction.payer?.profile?.companyName || transaction.payer?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <ArrowRight size={16} className="text-gray-600" />
              </div>
            </div>

            {transaction.recipient && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Recipient</p>
                    <p className="font-medium text-gray-800">
                      {transaction.recipient?.profile?.companyName || transaction.recipient?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Info */}
          {transaction.invoice && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 uppercase mb-2">Related Invoice</p>
              <p className="font-mono font-medium text-blue-800">{transaction.invoice.invoiceNumber}</p>
              <p className="text-sm text-blue-600">{formatCurrency(transaction.invoice.amount)}</p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm text-gray-800">Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              {transaction.completedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-800">Completed</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.completedAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState('disbursements');

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterType !== 'all') params.type = filterType;

      const response = await adminService.getTransactions(params);
      setTransactions(response.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterStatus, filterType]);

  const filteredTransactions = transactions.filter(txn => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        txn.id?.toLowerCase().includes(search) ||
        txn.invoice?.invoiceNumber?.toLowerCase().includes(search) ||
        txn.payer?.profile?.companyName?.toLowerCase().includes(search) ||
        txn.recipient?.profile?.companyName?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalAmount = transactions.reduce((sum, txn) => sum + (Number(txn.amount) || 0), 0);
  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'PENDING').length,
    completed: transactions.filter(t => t.status === 'COMPLETED').length,
    totalAmount,
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transaction Monitoring</h1>
          <p className="text-gray-500 text-sm">Track disbursements and repayments</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Total Transactions</span>
            <CreditCard size={14} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Pending</span>
            <Clock size={14} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Completed</span>
            <CheckCircle size={14} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Total Volume</span>
            <IndianRupee size={14} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalAmount)}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle size={18} className="text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={fetchTransactions} className="ml-auto text-red-600 hover:text-red-800 font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex space-x-2">
            {[
              { key: 'disbursements', label: 'Disbursements' },
              { key: 'repayments', label: 'Repayments' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-56"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading transactions...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No transactions found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'There are no transactions matching your filters'}
            </p>
          </div>
        )}

        {/* Transactions Table */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="text-sm font-mono text-gray-600">{txn.id?.slice(0, 8)}...</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-mono text-gray-800">{txn.invoice?.invoiceNumber || '-'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-800">
                        {txn.payer?.profile?.companyName || txn.payer?.email || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-800">
                        {txn.recipient?.profile?.companyName || txn.recipient?.email || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="font-medium text-gray-800">{formatCurrency(txn.amount)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{formatDate(txn.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setSelectedTransaction(txn)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {filteredTransactions.length} transactions
            </span>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </AdminLayout>
  );
}
