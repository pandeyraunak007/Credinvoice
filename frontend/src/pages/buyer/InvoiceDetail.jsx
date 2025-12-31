import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, Clock, CheckCircle, Building2, Calendar,
  IndianRupee, Percent, CreditCard, ChevronRight, Eye, MessageSquare,
  History, User, Phone, Mail, MapPin, TrendingUp, Printer, Share2,
  Wallet, Users, AlertCircle, Loader2, X, Shield, BanknoteIcon, Building
} from 'lucide-react';
import { invoiceService, discountService, profileService } from '../../services/api';

const StatusBadge = ({ status }) => {
  const config = {
    DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
    PENDING_ACCEPTANCE: { label: 'Pending Acceptance', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    ACCEPTED: { label: 'Accepted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    OPEN_FOR_BIDDING: { label: 'Open for Bidding', color: 'bg-purple-100 text-purple-700', icon: CreditCard },
    BID_SELECTED: { label: 'Bid Selected', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
    DISBURSED: { label: 'Disbursed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    SETTLED: { label: 'Settled', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: X },
  };
  const { label, color, icon: Icon } = config[status] || config.DRAFT;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${color}`}>
      <Icon size={14} />
      <span>{label}</span>
    </span>
  );
};

const StatusTimeline = ({ invoice }) => {
  const getEvents = () => {
    const events = [];

    // Invoice Created
    events.push({
      title: 'Invoice Created',
      date: invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      status: 'completed',
      description: `By ${invoice.uploadedByType === 'BUYER' ? 'Buyer' : 'Seller'}`
    });

    // Discount Offer
    if (invoice.discountOffer) {
      events.push({
        title: 'Discount Offer Sent',
        date: new Date(invoice.discountOffer.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        description: `${invoice.discountOffer.discountPercentage}% discount offered`
      });

      if (invoice.discountOffer.status === 'ACCEPTED') {
        events.push({
          title: 'Seller Accepted',
          date: invoice.discountOffer.respondedAt ? new Date(invoice.discountOffer.respondedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
          status: 'completed',
          description: invoice.sellerName
        });

        if (invoice.discountOffer.fundingType) {
          events.push({
            title: 'Funding Type Selected',
            status: 'completed',
            description: invoice.discountOffer.fundingType === 'SELF_FUNDED' ? 'Self-Funded' : 'Financier-Funded'
          });
        }
      } else if (invoice.discountOffer.status === 'REJECTED') {
        events.push({
          title: 'Seller Rejected',
          status: 'completed',
          description: 'Offer was declined'
        });
      } else {
        events.push({
          title: 'Awaiting Seller Response',
          status: 'current',
          description: 'Pending acceptance'
        });
      }
    }

    // Bidding status
    if (invoice.status === 'OPEN_FOR_BIDDING') {
      events.push({
        title: 'Open for Bidding',
        status: 'current',
        description: `${invoice._count?.bids || invoice.bids?.length || 0} bids received`
      });
    }

    // Bid Selected
    if (invoice.status === 'BID_SELECTED') {
      events.push({
        title: 'Bid Selected',
        status: 'completed',
        description: 'Financier bid accepted, awaiting disbursement'
      });
    }

    // Disbursement
    if (invoice.disbursement) {
      const disbStatus = invoice.disbursement.status;
      events.push({
        title: 'Disbursement',
        date: invoice.disbursement.disbursedAt ? new Date(invoice.disbursement.disbursedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
        status: disbStatus === 'COMPLETED' ? 'completed' : disbStatus === 'DISBURSED' ? 'completed' : 'current',
        description: disbStatus === 'PENDING' ? 'Awaiting payment processing' :
                     disbStatus === 'DISBURSED' ? 'Funds transferred to seller' :
                     disbStatus === 'COMPLETED' ? 'Transaction completed' : disbStatus
      });
    }

    // Add pending events
    if (invoice.status !== 'SETTLED' && invoice.status !== 'DISBURSED') {
      if (!invoice.disbursement) {
        events.push({ title: 'Disbursement', status: 'pending' });
      }
      events.push({ title: 'Settlement', status: 'pending' });
    }

    return events;
  };

  return (
    <div className="space-y-4">
      {getEvents().map((event, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            event.status === 'completed' ? 'bg-green-100' : event.status === 'current' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {event.status === 'completed' ? <CheckCircle size={16} className="text-green-600" /> :
             event.status === 'current' ? <Clock size={16} className="text-blue-600" /> :
             <div className="w-2 h-2 bg-gray-300 rounded-full" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className={`font-medium ${event.status === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>{event.title}</p>
              {event.date && <span className="text-xs text-gray-500">{event.date}</span>}
            </div>
            {event.description && <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

// Payment Authorization Modal
const PaymentAuthorizationModal = ({ isOpen, onClose, invoice, onAuthorize, isLoading }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [step, setStep] = useState(1); // 1: Select Account, 2: Confirm

  useEffect(() => {
    if (isOpen) {
      fetchBankAccounts();
      setStep(1);
      setSelectedAccount(null);
    }
  }, [isOpen]);

  const fetchBankAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await profileService.getBankAccounts();
      setBankAccounts(response.data || []);
      // Auto-select primary account
      const primary = (response.data || []).find(acc => acc.isPrimary);
      if (primary) setSelectedAccount(primary.id);
    } catch (err) {
      console.error('Failed to fetch bank accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  if (!isOpen || !invoice) return null;

  const discountOffer = invoice.discountOffer;
  const discountAmount = invoice.totalAmount * (discountOffer?.discountPercentage || 0) / 100;
  const netAmount = invoice.totalAmount - discountAmount;

  const handleConfirm = () => {
    if (step === 1 && selectedAccount) {
      setStep(2);
    } else if (step === 2) {
      onAuthorize(selectedAccount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {step === 1 ? 'Select Payment Account' : 'Confirm Payment'}
              </h3>
              <p className="text-sm text-gray-500">Invoice: {invoice.invoiceNumber}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <>
              {/* Payment Summary */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Invoice Amount</span>
                  <span className="font-medium">₹{invoice.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between mb-2 text-green-600">
                  <span>Discount ({discountOffer?.discountPercentage}%)</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-green-200 pt-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Amount to Pay</span>
                  <span className="text-xl font-bold text-gray-800">₹{netAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-500 mb-1">Payment to</p>
                <p className="font-medium text-gray-800">{invoice.sellerName}</p>
                <p className="text-sm text-gray-500">{invoice.sellerGstin}</p>
              </div>

              {/* Bank Account Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Bank Account
                </label>
                {loadingAccounts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                  </div>
                ) : bankAccounts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Building size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-600 font-medium">No bank accounts found</p>
                    <p className="text-sm text-gray-500 mb-3">Add a bank account to authorize payment</p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                      + Add Bank Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bankAccounts.map((account) => (
                      <label
                        key={account.id}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                          selectedAccount === account.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="bankAccount"
                          value={account.id}
                          checked={selectedAccount === account.id}
                          onChange={() => setSelectedAccount(account.id)}
                          className="sr-only"
                        />
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Building size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-800">{account.bankName}</p>
                            {account.isPrimary && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Primary</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            A/C: ****{account.accountNumber?.slice(-4)} • {account.accountType}
                          </p>
                          <p className="text-xs text-gray-400">{account.ifscCode}</p>
                        </div>
                        {selectedAccount === account.id && (
                          <CheckCircle size={20} className="text-blue-600" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Confirm Payment Authorization</h4>
                <p className="text-gray-600">You are about to authorize a payment of</p>
                <p className="text-3xl font-bold text-gray-800 my-3">₹{netAmount.toLocaleString('en-IN')}</p>
                <p className="text-gray-600">to {invoice.sellerName}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Invoice</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Early Payment Date</span>
                  <span className="font-medium">
                    {discountOffer?.earlyPaymentDate
                      ? new Date(discountOffer.earlyPaymentDate).toLocaleDateString('en-IN')
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Your Savings</span>
                  <span className="font-medium text-green-600">₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">From Account</span>
                  <span className="font-medium">
                    {bankAccounts.find(a => a.id === selectedAccount)?.bankName} ****
                    {bankAccounts.find(a => a.id === selectedAccount)?.accountNumber?.slice(-4)}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <div className="flex items-start space-x-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    By confirming, you authorize the transfer of funds to the seller's account.
                    This action cannot be reversed.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              onClick={step === 1 ? onClose : () => setStep(1)}
              disabled={isLoading}
              className={`${step === 1 ? 'flex-1' : ''} px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || (step === 1 && !selectedAccount)}
              className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : step === 1 ? (
                <span>Continue</span>
              ) : (
                <>
                  <Shield size={18} />
                  <span>Authorize Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Funding Type Modal
const FundingTypeModal = ({ isOpen, onClose, invoice, onSelectFundingType, isLoading }) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Choose Funding Type</h3>
            <p className="text-sm text-gray-500">Invoice: {invoice.invoiceNumber}</p>
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
                    Pay the discounted amount directly from your account. Immediate processing.
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-green-600 font-medium">No additional fees</span>
                  </div>
                </div>
              </div>
            </button>

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
                    Let financiers bid to fund this invoice. Choose the best offer.
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-purple-600 font-medium">Competitive rates</span>
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

export default function InvoiceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('details');
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [fundingModal, setFundingModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getById(id);
      setInvoice(response.data);
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFundingType = async (fundingType) => {
    if (!invoice?.discountOffer?.id) return;

    setActionLoading(true);
    try {
      await discountService.selectFundingType(invoice.discountOffer.id, fundingType);
      setFundingModal(false);
      await fetchInvoice();

      if (fundingType === 'SELF_FUNDED') {
        // Open payment authorization modal
        setPaymentModal(true);
      }
    } catch (err) {
      console.error('Failed to select funding type:', err);
      alert(err.message || 'Failed to select funding type');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAuthorizePayment = async (bankAccountId) => {
    if (!invoice?.discountOffer?.id) return;

    setActionLoading(true);
    try {
      await discountService.authorizePayment(invoice.discountOffer.id, bankAccountId);
      setPaymentModal(false);
      await fetchInvoice();
      alert('Payment authorized successfully! The disbursement is now being processed.');
    } catch (err) {
      console.error('Failed to authorize payment:', err);
      alert(err.message || 'Failed to authorize payment');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading invoice...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Invoice</h2>
          <p className="text-gray-600 mb-4">{error || 'Invoice not found'}</p>
          <button
            onClick={() => navigate('/invoices')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const discountOffer = invoice.discountOffer;
  const discountAmount = discountOffer ? invoice.totalAmount * discountOffer.discountPercentage / 100 : 0;
  const netAmount = invoice.totalAmount - discountAmount;

  // Determine which action button to show
  const showFundingSelection = invoice.status === 'ACCEPTED' && discountOffer?.status === 'ACCEPTED' && !discountOffer?.fundingType;
  const showPaymentAuthorization = invoice.status === 'ACCEPTED' && discountOffer?.fundingType === 'SELF_FUNDED' && !invoice.disbursement;
  const showViewBids = invoice.status === 'OPEN_FOR_BIDDING';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-gray-800">{invoice.invoiceNumber}</h1>
                  <StatusBadge status={invoice.status} />
                </div>
                <p className="text-sm text-gray-500">{invoice.productType || 'Dynamic Discounting'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg"><Printer size={20} className="text-gray-600" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-lg"><Download size={20} className="text-gray-600" /></button>
              <div className="h-6 w-px bg-gray-300" />

              {showFundingSelection && (
                <button
                  onClick={() => setFundingModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <CreditCard size={18} />
                  <span>Choose Funding</span>
                </button>
              )}

              {showPaymentAuthorization && (
                <button
                  onClick={() => setPaymentModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Wallet size={18} />
                  <span>Authorize Payment</span>
                </button>
              )}

              {showViewBids && (
                <button
                  onClick={() => navigate(`/invoices/${invoice.id}/bids`)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <CreditCard size={18} />
                  <span>View Bids</span>
                  {invoice._count?.bids > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{invoice._count.bids}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex space-x-6 border-t border-gray-100">
          {['details', 'documents', 'activity'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm capitalize transition ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'details' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                {/* Action Alert */}
                {showFundingSelection && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Seller accepted your offer!</p>
                        <p className="text-sm text-green-600">Choose how you want to fund this early payment</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFundingModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Choose Funding
                    </button>
                  </div>
                )}

                {showPaymentAuthorization && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Wallet size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Ready for Payment</p>
                        <p className="text-sm text-blue-600">
                          Authorize payment of {formatCurrency(netAmount)} to {invoice.sellerName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPaymentModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Authorize Payment
                    </button>
                  </div>
                )}

                {showViewBids && invoice._count?.bids > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <CreditCard size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-purple-800">{invoice._count.bids} bid(s) received</p>
                        <p className="text-sm text-purple-600">Review and select the best offer</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/invoices/${invoice.id}/bids`)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      Review Bids
                    </button>
                  </div>
                )}

                {/* Invoice Summary */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Invoice Summary</h2>
                    {invoice.documentUrl && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                        <Eye size={14} /><span>View Document</span>
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-6 mb-6">
                      <div><p className="text-sm text-gray-500">Invoice Number</p><p className="font-medium">{invoice.invoiceNumber}</p></div>
                      <div><p className="text-sm text-gray-500">Invoice Date</p><p className="font-medium">{formatDate(invoice.invoiceDate)}</p></div>
                      <div><p className="text-sm text-gray-500">Due Date</p><p className="font-medium">{formatDate(invoice.dueDate)}</p></div>
                      <div><p className="text-sm text-gray-500">Total Amount</p><p className="font-bold text-xl">{formatCurrency(invoice.totalAmount)}</p></div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Qty</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Rate</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {invoice.items?.length > 0 ? (
                            invoice.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-sm">{item.description}</td>
                                <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="px-4 py-3 text-sm font-medium text-right">{formatCurrency(item.amount)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                No line items available
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr><td colSpan="3" className="px-4 py-2 text-sm text-right">Subtotal</td><td className="px-4 py-2 text-sm font-medium text-right">{formatCurrency(invoice.subtotal)}</td></tr>
                          <tr><td colSpan="3" className="px-4 py-2 text-sm text-right">Tax</td><td className="px-4 py-2 text-sm text-right">{formatCurrency(invoice.taxAmount)}</td></tr>
                          <tr className="border-t border-gray-200"><td colSpan="3" className="px-4 py-3 font-semibold text-right">Total</td><td className="px-4 py-3 text-lg font-bold text-right">{formatCurrency(invoice.totalAmount)}</td></tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Discount Details */}
                {discountOffer && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-800">Discount Terms</h2></div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Percent size={20} className="text-green-600" />
                            </div>
                            <div><p className="text-sm text-gray-600">Discount Rate</p><p className="text-xl font-bold text-green-600">{discountOffer.discountPercentage}%</p></div>
                          </div>
                          <div className="text-right"><p className="text-sm text-gray-600">Discount Amount</p><p className="text-lg font-semibold text-green-600">-{formatCurrency(discountAmount)}</p></div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-3">Payment Breakdown</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-gray-600">Invoice Amount</span><span className="font-medium">{formatCurrency(invoice.totalAmount)}</span></div>
                            <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discountAmount)}</span></div>
                            <div className="border-t pt-2 flex justify-between"><span className="font-semibold">Net to Seller</span><span className="font-bold text-lg">{formatCurrency(netAmount)}</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Early Payment Date</p>
                          <p className="font-medium">{formatDate(discountOffer.earlyPaymentDate)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Offer Status</p>
                          <p className="font-medium">{discountOffer.status}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Funding Type</p>
                          <p className="font-medium">{discountOffer.fundingType || 'Not Selected'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disbursement Status */}
                {invoice.disbursement && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-800">Payment Status</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        invoice.disbursement.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        invoice.disbursement.status === 'DISBURSED' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {invoice.disbursement.status === 'PENDING' ? 'Processing' :
                         invoice.disbursement.status === 'DISBURSED' ? 'Transferred' :
                         invoice.disbursement.status === 'COMPLETED' ? 'Completed' : invoice.disbursement.status}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                          <p className="text-xl font-bold text-gray-800">{formatCurrency(invoice.disbursement.amount)}</p>
                          {invoice.disbursement.transactionRef && (
                            <p className="text-xs text-gray-500 mt-1 font-mono">Ref: {invoice.disbursement.transactionRef}</p>
                          )}
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Payment Details</p>
                          <p className="font-medium text-gray-800">
                            {invoice.disbursement.payerType === 'BUYER' ? 'Self-Funded' : 'Financier-Funded'}
                          </p>
                          {invoice.disbursement.disbursedAt && (
                            <p className="text-sm text-gray-500 mt-1">
                              Processed: {formatDate(invoice.disbursement.disbursedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      {invoice.disbursement.status === 'PENDING' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-yellow-700">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-sm">Payment is being processed. This usually takes a few minutes.</span>
                          </div>
                        </div>
                      )}
                      {invoice.disbursement.status === 'COMPLETED' && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-700">
                            <CheckCircle size={16} />
                            <span className="text-sm">Payment completed successfully. Funds have been transferred to the seller.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Repayment Info (for financier-funded) */}
                {invoice.disbursement?.repayment && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-800">Repayment Schedule</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        invoice.disbursement.repayment.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        invoice.disbursement.repayment.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {invoice.disbursement.repayment.status === 'PAID' ? 'Paid' :
                         invoice.disbursement.repayment.status === 'OVERDUE' ? 'Overdue' : 'Due'}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Repayment Amount</p>
                          <p className="text-xl font-bold text-gray-800">{formatCurrency(invoice.disbursement.repayment.amount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Due Date</p>
                          <p className="text-lg font-semibold text-gray-800">{formatDate(invoice.disbursement.repayment.dueDate)}</p>
                        </div>
                      </div>
                      {invoice.disbursement.financier && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Financier</p>
                          <p className="font-medium text-gray-800">{invoice.disbursement.financier.companyName}</p>
                        </div>
                      )}
                      {invoice.disbursement.repayment.status === 'PENDING' && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-orange-700">
                            <Clock size={16} />
                            <span className="text-sm">
                              Please ensure repayment is made by the due date to avoid penalties.
                            </span>
                          </div>
                        </div>
                      )}
                      {invoice.disbursement.repayment.status === 'OVERDUE' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-red-700">
                            <AlertCircle size={16} />
                            <span className="text-sm">
                              This repayment is overdue. Please make payment immediately to avoid additional charges.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Seller Details */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-800">Seller Details</h2></div>
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 size={28} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{invoice.sellerName || 'N/A'}</h3>
                        <p className="text-sm text-gray-500 font-mono">{invoice.sellerGstin}</p>
                        {invoice.seller && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {invoice.seller.contactName && (
                              <div className="flex items-center space-x-2 text-sm"><User size={16} className="text-gray-400" /><span>{invoice.seller.contactName}</span></div>
                            )}
                            {invoice.seller.contactPhone && (
                              <div className="flex items-center space-x-2 text-sm"><Phone size={16} className="text-gray-400" /><span>{invoice.seller.contactPhone}</span></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Status Timeline</h3>
                  <StatusTimeline invoice={invoice} />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3"><Download size={18} className="text-gray-500" /><span>Download Invoice</span></div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3"><MessageSquare size={18} className="text-gray-500" /><span>Contact Seller</span></div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-6">Attached Documents</h2>
              {invoice.documentUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><FileText size={24} className="text-red-600" /></div>
                      <div><p className="font-medium">Original Invoice</p><p className="text-sm text-gray-500">{invoice.invoiceNumber}.pdf</p></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Eye size={18} className="text-gray-500" /></button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Download size={18} className="text-gray-500" /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <p>No documents attached</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-6">Activity Log</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                    <TrendingUp size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Invoice created</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(invoice.createdAt)} • by {invoice.uploadedByType}
                    </p>
                  </div>
                </div>
                {discountOffer && (
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                      <Percent size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Discount offer sent</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(discountOffer.createdAt)} • {discountOffer.discountPercentage}% discount
                      </p>
                    </div>
                  </div>
                )}
                {discountOffer?.respondedAt && (
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Seller {discountOffer.status.toLowerCase()}</p>
                      <p className="text-sm text-gray-500">{formatDate(discountOffer.respondedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <FundingTypeModal
        isOpen={fundingModal}
        onClose={() => setFundingModal(false)}
        invoice={invoice}
        onSelectFundingType={handleSelectFundingType}
        isLoading={actionLoading}
      />

      <PaymentAuthorizationModal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        invoice={invoice}
        onAuthorize={handleAuthorizePayment}
        isLoading={actionLoading}
      />
    </div>
  );
}
