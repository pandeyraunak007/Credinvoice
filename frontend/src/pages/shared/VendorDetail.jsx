import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
  Star,
  Award,
  Clock,
  TrendingUp,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  Loader,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { vendorService } from '../../services/api';

/**
 * Format currency in Indian style
 */
const formatCurrency = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date
 */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get score color class
 */
const getScoreColor = (score) => {
  if (score === null || score === undefined) return 'text-gray-400';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Get score background color class
 */
const getScoreBgColor = (score) => {
  if (score === null || score === undefined) return 'bg-gray-100';
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-blue-100';
  if (score >= 40) return 'bg-yellow-100';
  return 'bg-red-100';
};

/**
 * Get status color class
 */
const getStatusColor = (status) => {
  switch (status) {
    case 'PAID':
    case 'DISBURSED':
      return 'bg-green-100 text-green-700';
    case 'OPEN_FOR_BIDDING':
    case 'ACCEPTED':
      return 'bg-blue-100 text-blue-700';
    case 'DRAFT':
    case 'PENDING':
      return 'bg-gray-100 text-gray-700';
    case 'OVERDUE':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * VendorDetail Page Component
 */
export default function VendorDetail() {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userType = user?.userType || 'BUYER';

  // Fetch vendor detail
  const fetchVendorDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await vendorService.getVendorDetail(vendorId);

      if (response.success) {
        setVendorData(response.data);
        setNotes(response.data.mapping?.notes || '');
      }
    } catch (err) {
      console.error('Failed to fetch vendor detail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchVendorDetail();
  }, [fetchVendorDetail]);

  // Handle save notes
  const handleSaveNotes = async () => {
    try {
      setSaving(true);

      await vendorService.updateVendor(vendorId, { notes });

      setEditingNotes(false);
      fetchVendorDetail();
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert(`Failed to save notes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle remove vendor
  const handleRemove = async () => {
    if (!window.confirm(`Are you sure you want to remove ${vendorData.vendor.companyName} from your list?`)) {
      return;
    }

    try {
      await vendorService.removeVendor(vendorId);
      navigate('/vendors');
    } catch (err) {
      console.error('Failed to remove vendor:', err);
      alert(`Failed to remove vendor: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-indigo-600 mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => navigate('/vendors')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Vendors
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Vendor</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return null;
  }

  const { mapping, vendor, transactions = [], stats = {} } = vendorData;
  const isSeller = vendor.vendorType === 'SELLER';
  const score = isSeller ? vendor.performanceScore : vendor.reliabilityScore;
  const scoreLabel = isSeller ? 'Performance Score' : 'Reliability Score';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/vendors')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Vendors
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <Building2 size={32} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vendor.companyName}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-2 py-0.5 rounded text-sm font-medium ${
                  isSeller ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isSeller ? 'Supplier' : 'Customer'}
                </span>
                {vendor.kycStatus === 'APPROVED' && (
                  <span className="flex items-center text-sm text-green-600">
                    <CheckCircle size={14} className="mr-1" />
                    KYC Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRemove}
              className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
            >
              <Trash2 size={18} className="mr-2" />
              Remove
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          {vendor.gstin && (
            <div className="flex items-center text-gray-600">
              <FileText size={18} className="mr-2 text-gray-400" />
              <span>GSTIN: <strong>{vendor.gstin}</strong></span>
            </div>
          )}
          {(vendor.city || vendor.state) && (
            <div className="flex items-center text-gray-600">
              <MapPin size={18} className="mr-2 text-gray-400" />
              <span>{[vendor.address, vendor.city, vendor.state, vendor.pincode].filter(Boolean).join(', ')}</span>
            </div>
          )}
          {vendor.contactPhone && (
            <div className="flex items-center text-gray-600">
              <Phone size={18} className="mr-2 text-gray-400" />
              <span>{vendor.contactPhone}</span>
              {vendor.contactName && <span className="ml-1 text-gray-500">({vendor.contactName})</span>}
            </div>
          )}
        </div>

        {/* Added Info */}
        <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            Added: {formatDate(mapping?.mappedAt)}
          </div>
          {mapping?.addedBy && (
            <span className={`px-2 py-0.5 rounded ${
              mapping.addedBy === 'AUTO' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {mapping.addedBy === 'AUTO' ? 'Auto-added from transaction' : 'Manually added'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Performance & Notes */}
        <div className="space-y-6">
          {/* Performance Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{scoreLabel}</h3>

            {score !== null && score !== undefined ? (
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(score)} mb-3`}>
                  {isSeller ? (
                    <Star size={40} className={getScoreColor(score)} fill="currentColor" />
                  ) : (
                    <Award size={40} className={getScoreColor(score)} fill="currentColor" />
                  )}
                </div>
                <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                  {Math.round(score)}
                </div>
                <p className="text-gray-500 text-sm">out of 100</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Not enough data for rating</p>
              </div>
            )}

            {/* Additional Metrics */}
            <div className="mt-6 space-y-3 pt-6 border-t border-gray-100">
              {isSeller ? (
                <>
                  {vendor.totalInvoicesSettled !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Invoices Settled</span>
                      <span className="font-medium">{vendor.totalInvoicesSettled}</span>
                    </div>
                  )}
                  {vendor.avgDaysToPayment !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Days to Payment</span>
                      <span className="font-medium">{Math.round(vendor.avgDaysToPayment)} days</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {vendor.totalInvoicesPaid !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Invoices Paid</span>
                      <span className="font-medium">{vendor.totalInvoicesPaid}</span>
                    </div>
                  )}
                  {vendor.onTimePaymentRate !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">On-Time Payment Rate</span>
                      <span className="font-medium">{Math.round(vendor.onTimePaymentRate)}%</span>
                    </div>
                  )}
                  {vendor.avgDaysToPayment !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Days to Payment</span>
                      <span className="font-medium">{Math.round(vendor.avgDaysToPayment)} days</span>
                    </div>
                  )}
                </>
              )}

              {vendor.lastMetricsUpdate && (
                <p className="text-xs text-gray-400 pt-3 border-t border-gray-100">
                  Last updated: {formatDate(vendor.lastMetricsUpdate)}
                </p>
              )}
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="flex items-center text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  <Edit size={14} className="mr-1" />
                  Edit
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this vendor..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setNotes(mapping?.notes || '');
                      setEditingNotes(false);
                    }}
                    className="flex items-center px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                  >
                    <X size={14} className="mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {saving ? (
                      <Loader size={14} className="animate-spin mr-1" />
                    ) : (
                      <Save size={14} className="mr-1" />
                    )}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-sm ${notes ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                {notes || 'No notes added'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Transaction History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              {stats.totalInvoices > 0 && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span><strong>{stats.totalInvoices}</strong> invoices</span>
                  <span><strong>{formatCurrency(stats.totalAmount)}</strong> total</span>
                </div>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Invoice #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Due Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">{tx.invoiceNumber || tx.invoice?.invoiceNumber || '-'}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(tx.invoiceDate || tx.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(tx.dueDate || tx.disbursedAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium">{formatCurrency(tx.amount)}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            to={`/invoices/${tx.id}`}
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
