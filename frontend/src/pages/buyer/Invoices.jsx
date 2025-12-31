import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Filter, Download, Plus, FileText, Clock, CheckCircle,
  XCircle, AlertCircle, ChevronRight, ChevronDown, MoreVertical,
  Eye, Edit, Trash2, Send, CreditCard, Building2, Calendar,
  ArrowUpDown, RefreshCw, ArrowLeft, Loader2, Wallet, Users, X
} from 'lucide-react';
import { invoiceService, discountService } from '../../services/api';

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

// Funding Type Selection Modal
const FundingTypeModal = ({ isOpen, onClose, invoice, onSelectFundingType, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Choose Funding Type</h3>
            <p className="text-sm text-gray-500">Invoice: {invoice?.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            The seller has accepted your discount offer. How would you like to fund this early payment?
          </p>

          <div className="space-y-4">
            {/* Self-Funded Option */}
            <button
              onClick={() => onSelectFundingType('SELF_FUNDED')}
              disabled={isLoading}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left group disabled:opacity-50"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition">
                  <Wallet size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">Self-Funded</h4>
                  <p className="text-sm text-gray-600">
                    Pay the discounted amount directly from your account. Immediate processing with no financier fees.
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-green-600 font-medium">No additional fees</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">Instant authorization</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Financier-Funded Option */}
            <button
              onClick={() => onSelectFundingType('FINANCIER_FUNDED')}
              disabled={isLoading}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-left group disabled:opacity-50"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition">
                  <Users size={24} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">Financier-Funded</h4>
                  <p className="text-sm text-gray-600">
                    Let financiers bid to fund this invoice. Choose the best offer and repay on the due date.
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-purple-600 font-medium">Competitive rates</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">Multiple bids</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {isLoading && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-gray-600">
              <Loader2 size={18} className="animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Bulk Discount Modal
const BulkDiscountModal = ({ isOpen, onClose, selectedInvoices, onSubmit, isLoading }) => {
  const [discountPercentage, setDiscountPercentage] = useState('2');
  const [earlyPaymentDays, setEarlyPaymentDays] = useState('15');
  const [expiryHours, setExpiryHours] = useState('72');

  if (!isOpen) return null;

  const totalAmount = selectedInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const discountAmount = totalAmount * (parseFloat(discountPercentage) || 0) / 100;
  const netAmount = totalAmount - discountAmount;

  const handleSubmit = () => {
    onSubmit({
      discountPercentage: parseFloat(discountPercentage),
      earlyPaymentDays: parseInt(earlyPaymentDays),
      expiryHours: parseInt(expiryHours),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Bulk Discount Offer</h3>
            <p className="text-sm text-gray-500">{selectedInvoices.length} invoices selected</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Selected Invoices Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Selected Invoices</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {selectedInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-gray-800">{inv.invoiceNumber}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{inv.sellerName}</span>
                  </div>
                  <span className="font-medium text-gray-800">
                    ₹{(inv.totalAmount / 100000).toFixed(2)}L
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
              <span className="font-medium text-gray-700">Total Value</span>
              <span className="font-bold text-gray-800">₹{(totalAmount / 100000).toFixed(2)}L</span>
            </div>
          </div>

          {/* Discount Settings */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Rate (%)
              </label>
              <input
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Early Payment (Days)
              </label>
              <select
                value={earlyPaymentDays}
                onChange={(e) => setEarlyPaymentDays(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">7 days</option>
                <option value="10">10 days</option>
                <option value="15">15 days</option>
                <option value="21">21 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Expires In
              </label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
                <option value="120">5 days</option>
                <option value="168">7 days</option>
              </select>
            </div>
          </div>

          {/* Calculation Summary */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-medium text-green-800 mb-3">Discount Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-green-600">Total Invoice Value</p>
                <p className="text-xl font-bold text-gray-800">₹{(totalAmount / 100000).toFixed(2)}L</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Total Discount</p>
                <p className="text-xl font-bold text-green-600">-₹{(discountAmount / 100000).toFixed(2)}L</p>
              </div>
              <div>
                <p className="text-sm text-green-600">You'll Pay</p>
                <p className="text-xl font-bold text-gray-800">₹{(netAmount / 100000).toFixed(2)}L</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle size={16} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">How it works:</p>
                <ul className="mt-1 space-y-1 text-blue-700">
                  <li>• Each seller will receive an individual discount offer</li>
                  <li>• Sellers have until the expiry time to accept or reject</li>
                  <li>• After acceptance, you'll choose the funding method for each invoice</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !discountPercentage || selectedInvoices.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating Offers...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send {selectedInvoices.length} Offer{selectedInvoices.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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

  // Funding type modal state
  const [fundingModal, setFundingModal] = useState({ isOpen: false, invoice: null });
  const [fundingLoading, setFundingLoading] = useState(false);

  // Bulk discount modal state
  const [bulkDiscountModal, setBulkDiscountModal] = useState(false);
  const [bulkDiscountLoading, setBulkDiscountLoading] = useState(false);

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

  const handleOpenFundingModal = (e, invoice) => {
    e.stopPropagation();
    setFundingModal({ isOpen: true, invoice });
  };

  const handleSelectFundingType = async (fundingType) => {
    if (!fundingModal.invoice?.discountOffer?.id) {
      console.error('No discount offer ID found');
      return;
    }

    setFundingLoading(true);
    try {
      await discountService.selectFundingType(fundingModal.invoice.discountOffer.id, fundingType);
      setFundingModal({ isOpen: false, invoice: null });
      fetchInvoices();

      if (fundingType === 'SELF_FUNDED') {
        // Navigate to invoice detail for payment authorization
        navigate(`/invoices/${fundingModal.invoice.id}`);
      }
    } catch (err) {
      console.error('Failed to select funding type:', err);
      alert(err.message || 'Failed to select funding type');
    } finally {
      setFundingLoading(false);
    }
  };

  // Invoice selection handlers
  const handleSelectInvoice = (invoice, isSelected) => {
    if (isSelected) {
      setSelectedInvoices(prev => [...prev, invoice]);
    } else {
      setSelectedInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Only select invoices that are eligible for discount (DRAFT or no discount offer yet)
      const eligibleInvoices = filteredInvoices.filter(inv =>
        inv.status === 'DRAFT' || (inv.status !== 'SETTLED' && inv.status !== 'REJECTED' && !inv.discountOffer)
      );
      setSelectedInvoices(eligibleInvoices);
    } else {
      setSelectedInvoices([]);
    }
  };

  const isInvoiceSelected = (invoiceId) => {
    return selectedInvoices.some(inv => inv.id === invoiceId);
  };

  // Check if invoice is eligible for bulk discount
  const isEligibleForDiscount = (invoice) => {
    return invoice.status === 'DRAFT' ||
           (invoice.status !== 'SETTLED' && invoice.status !== 'REJECTED' && !invoice.discountOffer);
  };

  // Get eligible invoices from filtered list
  const eligibleInvoices = filteredInvoices.filter(isEligibleForDiscount);
  const allEligibleSelected = eligibleInvoices.length > 0 &&
    eligibleInvoices.every(inv => isInvoiceSelected(inv.id));

  // Bulk discount submission handler
  const handleBulkDiscountSubmit = async (discountParams) => {
    setBulkDiscountLoading(true);

    const results = { success: [], failed: [] };

    try {
      // Create discount offers for each selected invoice
      for (const invoice of selectedInvoices) {
        try {
          const earlyPaymentDate = new Date();
          earlyPaymentDate.setDate(earlyPaymentDate.getDate() + discountParams.earlyPaymentDays);

          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + discountParams.expiryHours);

          await discountService.createOffer({
            invoiceId: invoice.id,
            discountPercentage: discountParams.discountPercentage,
            earlyPaymentDate: earlyPaymentDate.toISOString(),
            expiresAt: expiresAt.toISOString(),
          });

          results.success.push(invoice.invoiceNumber);
        } catch (err) {
          console.error(`Failed to create offer for ${invoice.invoiceNumber}:`, err);
          results.failed.push({ invoice: invoice.invoiceNumber, error: err.message });
        }
      }

      // Show results
      if (results.success.length > 0) {
        alert(`Successfully created ${results.success.length} discount offer(s)!\n${
          results.failed.length > 0 ? `\nFailed: ${results.failed.length} invoice(s)` : ''
        }`);
      } else if (results.failed.length > 0) {
        alert(`Failed to create discount offers:\n${results.failed.map(f => `${f.invoice}: ${f.error}`).join('\n')}`);
      }

      setBulkDiscountModal(false);
      setSelectedInvoices([]);
      fetchInvoices();
    } catch (err) {
      console.error('Bulk discount submission failed:', err);
      alert(err.message || 'Failed to create discount offers');
    } finally {
      setBulkDiscountLoading(false);
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
        // Check if funding type is already selected
        const fundingType = invoice.discountOffer?.fundingType;
        if (fundingType === 'SELF_FUNDED') {
          // Funding type selected as self-funded, show authorize payment button
          return (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}`); }}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 flex items-center space-x-1"
            >
              <Wallet size={14} />
              <span>Authorize Payment</span>
            </button>
          );
        }
        // No funding type selected yet, show selection button
        return (
          <button
            onClick={(e) => handleOpenFundingModal(e, invoice)}
            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 flex items-center space-x-1"
          >
            <CreditCard size={14} />
            <span>Choose Funding</span>
          </button>
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

          {/* Bulk Action Bar */}
          {selectedInvoices.length > 0 && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-blue-800 font-medium">
                  {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
                </span>
                <span className="text-blue-600 text-sm">
                  (Total: ₹{(selectedInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) / 100000).toFixed(2)}L)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedInvoices([])}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Clear Selection
                </button>
                <button
                  onClick={() => setBulkDiscountModal(true)}
                  className="flex items-center space-x-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <CreditCard size={16} />
                  <span>Create Bulk Discount Offer</span>
                </button>
              </div>
            </div>
          )}

          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing <strong>{filteredInvoices.length}</strong> of {invoices.length} invoices
              {eligibleInvoices.length > 0 && (
                <span className="ml-2 text-blue-600">
                  ({eligibleInvoices.length} eligible for discount)
                </span>
              )}
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
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={allEligibleSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      disabled={eligibleInvoices.length === 0}
                      title={eligibleInvoices.length === 0 ? 'No eligible invoices' : 'Select all eligible invoices'}
                    />
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
                    const eligible = isEligibleForDiscount(invoice);
                    const selected = isInvoiceSelected(invoice.id);
                    return (
                      <tr
                        key={invoice.id}
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                        className={`hover:bg-gray-50 transition cursor-pointer ${selected ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selected}
                            onChange={(e) => handleSelectInvoice(invoice, e.target.checked)}
                            disabled={!eligible}
                            title={eligible ? 'Select for bulk discount' : 'Not eligible for discount offer'}
                          />
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

      {/* Funding Type Selection Modal */}
      <FundingTypeModal
        isOpen={fundingModal.isOpen}
        onClose={() => setFundingModal({ isOpen: false, invoice: null })}
        invoice={fundingModal.invoice}
        onSelectFundingType={handleSelectFundingType}
        isLoading={fundingLoading}
      />

      {/* Bulk Discount Modal */}
      <BulkDiscountModal
        isOpen={bulkDiscountModal}
        onClose={() => setBulkDiscountModal(false)}
        selectedInvoices={selectedInvoices}
        onSubmit={handleBulkDiscountSubmit}
        isLoading={bulkDiscountLoading}
      />
    </div>
  );
}
