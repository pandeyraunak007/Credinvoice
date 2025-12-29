import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Filter, Download, Plus, FileText, Clock, CheckCircle,
  XCircle, AlertCircle, ChevronRight, ChevronDown, MoreVertical,
  Eye, Edit, Trash2, Send, CreditCard, Building2, Calendar,
  ArrowUpDown, RefreshCw, ArrowLeft, Loader2
} from 'lucide-react';
import { invoiceService } from '../../services/api';

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  PENDING_ACCEPTANCE: { label: 'Pending Acceptance', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  ACCEPTED: { label: 'Accepted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  OPEN_FOR_BIDDING: { label: 'Open for Bidding', color: 'bg-purple-100 text-purple-700', icon: CreditCard },
  BID_ACCEPTED: { label: 'Bid Selected', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
  DISBURSED: { label: 'Disbursed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  SETTLED: { label: 'Settled', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  OVERDUE: { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sellerFilter, setSellerFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceService.list();
      setInvoices(response.data || []);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const uniqueSellers = [...new Set(invoices.map(inv => inv.sellerName).filter(Boolean))];

  const filteredInvoices = invoices
    .filter(inv => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (sellerFilter !== 'all' && inv.sellerName !== sellerFilter) return false;
      const searchLower = searchTerm.toLowerCase();
      if (searchTerm &&
          !inv.invoiceNumber?.toLowerCase().includes(searchLower) &&
          !inv.sellerName?.toLowerCase().includes(searchLower)) return false;
      return true;
    });

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleSubmitInvoice = async (e, invoiceId) => {
    e.stopPropagation();
    try {
      await invoiceService.submit(invoiceId);
      fetchInvoices();
    } catch (err) {
      console.error('Failed to submit invoice:', err);
    }
  };

  const handleOpenForBidding = async (e, invoiceId) => {
    e.stopPropagation();
    try {
      await invoiceService.openForBidding(invoiceId);
      fetchInvoices();
    } catch (err) {
      console.error('Failed to open for bidding:', err);
    }
  };

  const getActionButtons = (invoice) => {
    switch (invoice.status) {
      case 'DRAFT':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}/edit`); }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={(e) => handleSubmitInvoice(e, invoice.id)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Submit
            </button>
          </div>
        );
      case 'PENDING_ACCEPTANCE':
        const daysRemaining = getDaysRemaining(invoice.dueDate);
        return (
          <div className="flex items-center space-x-2">
            <span className="text-orange-600 text-sm">
              {daysRemaining > 0 ? `${daysRemaining}d remaining` : 'Awaiting response'}
            </span>
          </div>
        );
      case 'ACCEPTED':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => handleOpenForBidding(e, invoice.id)}
              className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700"
            >
              Open Bidding
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}`); }}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
            >
              Self-Fund
            </button>
          </div>
        );
      case 'OPEN_FOR_BIDDING':
        const bidsCount = invoice.bids?.length || 0;
        return (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}/bids`); }}
            className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 flex items-center space-x-1"
          >
            <span>View Bids</span>
            {bidsCount > 0 && <span className="bg-white/20 px-1.5 rounded">{bidsCount}</span>}
          </button>
        );
      case 'BID_ACCEPTED':
        const acceptedBid = invoice.bids?.find(b => b.status === 'ACCEPTED');
        return (
          <div className="text-sm">
            <span className="text-gray-500">Selected: </span>
            <span className="font-medium text-gray-800">
              {acceptedBid?.financier?.companyName || 'Financier'} @ {acceptedBid?.discountRate || '-'}%
            </span>
          </div>
        );
      case 'DISBURSED':
        return (
          <div className="text-sm">
            <span className="text-green-600 font-medium">
              {invoice.productType === 'DD_SELF_FUNDED' ? 'Self-Funded' : 'Financier'}
            </span>
          </div>
        );
      case 'SETTLED':
        return (
          <div className="text-sm text-emerald-600 font-medium">Completed</div>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'PENDING_ACCEPTANCE').length,
    bidding: invoices.filter(i => i.status === 'OPEN_FOR_BIDDING').length,
    value: invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading invoices...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Invoices</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInvoices}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
              <p className="text-gray-500 text-sm">Manage your invoices and discount offers</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/invoices/create')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={20} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Pending Acceptance</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Open for Bidding</p>
            <p className="text-2xl font-bold text-purple-600">{stats.bidding}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Total Value</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.value)}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Invoice ID or Seller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white min-w-[180px]"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending_acceptance">Pending Acceptance</option>
                <option value="accepted">Accepted</option>
                <option value="open_for_bidding">Open for Bidding</option>
                <option value="disbursed">Disbursed</option>
                <option value="settled">Settled</option>
              </select>
              <select
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white min-w-[180px]"
              >
                <option value="all">All Sellers</option>
                {uniqueSellers.map(seller => (
                  <option key={seller} value={seller}>{seller}</option>
                ))}
              </select>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing <strong>{filteredInvoices.length}</strong> of {invoices.length} invoices
            </span>
            <button
              onClick={fetchInvoices}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Invoice Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Invoice</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Seller</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600 font-medium">No invoices found</p>
                      <p className="text-gray-500 text-sm mt-1">Create your first invoice to get started</p>
                      <button
                        onClick={() => navigate('/invoices/create')}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Create Invoice
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const StatusIcon = statusConfig[invoice.status]?.icon || FileText;
                    const statusStyle = statusConfig[invoice.status] || statusConfig.DRAFT;
                    return (
                      <tr
                        key={invoice.id}
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                        className="hover:bg-gray-50 transition cursor-pointer"
                      >
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-500">{formatDate(invoice.invoiceDate)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{invoice.sellerName || 'N/A'}</p>
                            <p className="text-sm text-gray-500 font-mono">{invoice.sellerGstin}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-800">{formatCurrency(invoice.totalAmount)}</p>
                        </td>
                        <td className="px-4 py-4">
                          {invoice.discountPercentage ? (
                            <div>
                              <p className="font-medium text-green-600">{invoice.discountPercentage}%</p>
                              <p className="text-sm text-gray-500">
                                -{formatCurrency(invoice.totalAmount * invoice.discountPercentage / 100)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-700">{formatDate(invoice.dueDate)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.color}`}>
                            <StatusIcon size={12} />
                            <span>{statusStyle.label}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          {getActionButtons(invoice)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
            <span className="text-sm text-gray-600">1-{filteredInvoices.length} of {filteredInvoices.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
