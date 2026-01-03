import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, FileText, Clock, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Loader, IndianRupee, TrendingUp, Filter, Building2, ExternalLink
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/api';

const StatusBadge = ({ status }) => {
  const config = {
    DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    ACCEPTED: { label: 'Accepted', color: 'bg-cyan-100 text-cyan-700' },
    OPEN_FOR_BIDDING: { label: 'Open for Bidding', color: 'bg-purple-100 text-purple-700' },
    BID_ACCEPTED: { label: 'Bid Accepted', color: 'bg-indigo-100 text-indigo-700' },
    FINANCED: { label: 'Financed', color: 'bg-green-100 text-green-700' },
    REPAID: { label: 'Repaid', color: 'bg-emerald-100 text-emerald-700' },
    DEFAULTED: { label: 'Defaulted', color: 'bg-red-100 text-red-700' },
    CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
  };
  const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

const ProductTypeBadge = ({ type }) => {
  const config = {
    INVOICE_FINANCING: { label: 'Invoice Financing', color: 'bg-blue-100 text-blue-700' },
    DYNAMIC_DISCOUNTING: { label: 'Dynamic Discounting', color: 'bg-green-100 text-green-700' },
    GST_FINANCING: { label: 'GST Financing', color: 'bg-orange-100 text-orange-700' },
  };
  const { label, color } = config[type] || { label: type || 'N/A', color: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
};

const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

const InvoiceDetailModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{invoice.invoiceNumber}</h2>
              <p className="text-gray-500">Invoice Details</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Type */}
          <div className="flex items-center space-x-4">
            <StatusBadge status={invoice.status} />
            <ProductTypeBadge type={invoice.productType} />
          </div>

          {/* Amount & Dates */}
          <div className="grid md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
            <div>
              <label className="text-xs text-gray-500 uppercase">Amount</label>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(invoice.amount)}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Invoice Date</label>
              <p className="text-gray-800">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Due Date</label>
              <p className="text-gray-800">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Seller</h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{invoice.seller?.profile?.companyName || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{invoice.seller?.email}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Buyer</h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{invoice.buyer?.profile?.companyName || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{invoice.buyer?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bids */}
          {invoice.bids?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Bids ({invoice.bids.length})</h4>
              <div className="space-y-2">
                {invoice.bids.map((bid, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 size={14} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          {bid.financier?.profile?.companyName || 'Financier'}
                        </p>
                        <p className="text-xs text-gray-500">{bid.interestRate}% interest</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{formatCurrency(bid.amount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        bid.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{bid.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disbursement */}
          {invoice.disbursement && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Disbursement</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-green-600 uppercase">Amount</label>
                  <p className="font-bold text-green-800">{formatCurrency(invoice.disbursement.amount)}</p>
                </div>
                <div>
                  <label className="text-xs text-green-600 uppercase">Status</label>
                  <p className="font-medium text-green-800">{invoice.disbursement.status}</p>
                </div>
                <div>
                  <label className="text-xs text-green-600 uppercase">Date</label>
                  <p className="text-green-800">
                    {new Date(invoice.disbursement.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterType !== 'all') params.productType = filterType;

      const response = await adminService.getInvoices(params);
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
  }, [filterStatus, filterType]);

  const filteredInvoices = invoices.filter(invoice => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        invoice.invoiceNumber?.toLowerCase().includes(search) ||
        invoice.seller?.profile?.companyName?.toLowerCase().includes(search) ||
        invoice.buyer?.profile?.companyName?.toLowerCase().includes(search)
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

  const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const stats = {
    total: invoices.length,
    openForBidding: invoices.filter(i => i.status === 'OPEN_FOR_BIDDING').length,
    financed: invoices.filter(i => i.status === 'FINANCED').length,
    totalAmount,
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoice Management</h1>
          <p className="text-gray-500 text-sm">Monitor all platform invoices</p>
        </div>
        <button
          onClick={fetchInvoices}
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
            <span className="text-gray-500 text-xs">Total Invoices</span>
            <FileText size={14} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Open for Bidding</span>
            <Clock size={14} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.openForBidding}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Financed</span>
            <CheckCircle size={14} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.financed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Total Value</span>
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
          <button onClick={fetchInvoices} className="ml-auto text-red-600 hover:text-red-800 font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice #, seller, buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-72"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="OPEN_FOR_BIDDING">Open for Bidding</option>
              <option value="BID_ACCEPTED">Bid Accepted</option>
              <option value="FINANCED">Financed</option>
              <option value="REPAID">Repaid</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Products</option>
              <option value="INVOICE_FINANCING">Invoice Financing</option>
              <option value="DYNAMIC_DISCOUNTING">Dynamic Discounting</option>
              <option value="GST_FINANCING">GST Financing</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading invoices...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredInvoices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No invoices found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'There are no invoices matching your filters'}
            </p>
          </div>
        )}

        {/* Invoices Table */}
        {!loading && filteredInvoices.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800 font-mono">{invoice.invoiceNumber}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-800">{invoice.seller?.profile?.companyName || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-800">{invoice.buyer?.profile?.companyName || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="font-medium text-gray-800">{formatCurrency(invoice.amount)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <ProductTypeBadge type={invoice.productType} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{formatDate(invoice.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
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
        {!loading && filteredInvoices.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {filteredInvoices.length} invoices
            </span>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </AdminLayout>
  );
}
