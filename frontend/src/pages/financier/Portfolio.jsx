import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Filter, Building2, Calendar, Clock, CheckCircle,
  TrendingUp, AlertCircle, IndianRupee, Briefcase, Download, Eye,
  ChevronRight, BarChart3, PieChart, Loader2, RefreshCw, X, Send,
  BanknoteIcon, Shield, Wallet
} from 'lucide-react';
import { bidService, disbursementService, profileService } from '../../services/api';

const StatusBadge = ({ status }) => {
  const config = {
    disbursed: { label: 'Disbursed', color: 'bg-green-100 text-green-700' },
    pending_disbursement: { label: 'Pending Disbursement', color: 'bg-yellow-100 text-yellow-700' },
    collected: { label: 'Collected', color: 'bg-blue-100 text-blue-700' },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
  };
  const { label, color } = config[status] || config.disbursed;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

// Process Disbursement Modal
const ProcessDisbursementModal = ({ isOpen, onClose, investment, onProcess, isLoading }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [step, setStep] = useState(1); // 1: Review, 2: Confirm

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
      const primary = (response.data || []).find(acc => acc.isPrimary);
      if (primary) setSelectedAccount(primary.id);
    } catch (err) {
      console.error('Failed to fetch bank accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  if (!isOpen || !investment) return null;

  const disbursementAmount = investment.disbursedAmount || investment.amount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {step === 1 ? 'Process Disbursement' : 'Confirm Disbursement'}
              </h3>
              <p className="text-sm text-gray-500">Invoice: {investment.invoiceId}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <>
              {/* Disbursement Summary */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Invoice Amount</span>
                  <span className="font-medium">₹{(investment.amount / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex items-center justify-between mb-3 text-green-600">
                  <span>Your Discount Rate</span>
                  <span className="font-semibold">{investment.myRate}%</span>
                </div>
                <div className="border-t border-purple-200 pt-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Amount to Disburse</span>
                  <span className="text-xl font-bold text-purple-600">₹{(disbursementAmount / 100000).toFixed(2)}L</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-500 mb-1">Disbursement to</p>
                <p className="font-medium text-gray-800">{investment.seller}</p>
                <p className="text-sm text-gray-500">Buyer: {investment.buyer}</p>
              </div>

              {/* Bank Account Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Source Account
                </label>
                {loadingAccounts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                  </div>
                ) : bankAccounts.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Wallet size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-600 font-medium">No bank accounts found</p>
                    <p className="text-sm text-gray-500">Add a bank account to process disbursements</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bankAccounts.map((account) => (
                      <label
                        key={account.id}
                        className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition ${
                          selectedAccount === account.id
                            ? 'border-purple-500 bg-purple-50'
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
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <BanknoteIcon size={20} className="text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-800">{account.bankName}</p>
                            {account.isPrimary && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Primary</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            A/C: ****{account.accountNumber?.slice(-4)} • {account.ifscCode}
                          </p>
                        </div>
                        {selectedAccount === account.id && (
                          <CheckCircle size={20} className="text-purple-600" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Expected Returns */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2 text-green-700">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">
                    Expected Return: ₹{(investment.expectedReturn / 1000).toFixed(1)}K on {investment.dueDate}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={32} className="text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Confirm Fund Transfer</h4>
                <p className="text-gray-600">You are about to disburse</p>
                <p className="text-3xl font-bold text-gray-800 my-3">₹{(disbursementAmount / 100000).toFixed(2)}L</p>
                <p className="text-gray-600">to {investment.seller}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Invoice</span>
                  <span className="font-medium">{investment.invoiceId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Your Rate</span>
                  <span className="font-medium text-green-600">{investment.myRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Repayment Due</span>
                  <span className="font-medium">{investment.dueDate}</span>
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
                    By confirming, you authorize the transfer of funds to the seller's bank account.
                    The buyer will repay you by the due date.
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
              onClick={onClose}
              disabled={isLoading}
              className={`${step === 1 ? 'flex-1' : ''} px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (step === 1 && selectedAccount) {
                  setStep(2);
                } else if (step === 2) {
                  onProcess(investment, selectedAccount);
                }
              }}
              disabled={isLoading || (step === 1 && !selectedAccount)}
              className="flex-1 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
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
                  <Send size={18} />
                  <span>Process Disbursement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mark Completed Modal
const MarkCompletedModal = ({ isOpen, onClose, investment, onMarkCompleted, isLoading }) => {
  const [reference, setReference] = useState('');

  if (!isOpen || !investment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Mark Disbursement Completed</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{investment.invoiceId}</p>
                <p className="text-sm text-gray-600">₹{(investment.disbursedAmount / 100000).toFixed(2)}L to {investment.seller}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Reference (Optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., UTR123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onMarkCompleted(investment, reference)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Mark Completed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Portfolio() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeInvestments, setActiveInvestments] = useState([]);
  const [collectedInvestments, setCollectedInvestments] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalActive: 0,
    totalDisbursed: 0,
    totalCollected: 0,
    avgYield: 0,
    activeCount: 0,
    collectedCount: 0,
    pendingDisbursement: 0,
    overdue: 0
  });

  // Modal states
  const [processModal, setProcessModal] = useState({ open: false, investment: null });
  const [completedModal, setCompletedModal] = useState({ open: false, investment: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      // Fetch my bids that are accepted (these become investments)
      const bidsResponse = await bidService.getMyBids({ status: 'ACCEPTED' });
      const acceptedBids = bidsResponse.data || [];

      // Fetch disbursements
      const disbursementsResponse = await disbursementService.list();
      const disbursements = disbursementsResponse.data || [];

      // Transform to active and collected investments
      const active = [];
      const collected = [];

      disbursements.forEach(d => {
        const inv = d.invoice || {};
        const dueDate = new Date(inv.dueDate);
        const now = new Date();
        const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        const expectedReturn = (inv.totalAmount * (d.discountRate || 0)) / 100;

        const investment = {
          id: d.id,
          invoiceId: inv.invoiceNumber || d.invoiceId,
          buyer: inv.buyerName || 'Unknown Buyer',
          seller: inv.sellerName || 'Unknown Seller',
          amount: inv.totalAmount || 0,
          disbursedAmount: d.amount || 0,
          myRate: d.discountRate || 0,
          dueDate: dueDate.toLocaleDateString('en-IN'),
          disbursedDate: d.disbursedAt ? new Date(d.disbursedAt).toLocaleDateString('en-IN') : null,
          daysLeft: Math.max(0, daysLeft),
          status: d.status === 'COMPLETED' ? 'collected' :
                  d.status === 'PENDING' ? 'pending_disbursement' :
                  daysLeft < 0 ? 'overdue' : 'disbursed',
          buyerRating: 'A',
          expectedReturn: expectedReturn,
          daysOverdue: daysLeft < 0 ? Math.abs(daysLeft) : 0
        };

        if (d.status === 'COMPLETED') {
          collected.push({
            ...investment,
            collected: inv.totalAmount || 0,
            collectedDate: d.completedAt ? new Date(d.completedAt).toLocaleDateString('en-IN') : '-',
            profit: expectedReturn,
            actualYield: ((expectedReturn / (d.amount || 1)) * 365 / Math.max(1, Math.ceil((new Date(d.completedAt) - new Date(d.disbursedAt)) / (1000 * 60 * 60 * 24)))).toFixed(1)
          });
        } else {
          active.push(investment);
        }
      });

      setActiveInvestments(active);
      setCollectedInvestments(collected);

      // Calculate stats
      const totalActive = active.reduce((sum, a) => sum + a.disbursedAmount, 0) / 10000000;
      const totalCollected = collected.reduce((sum, c) => sum + c.collected, 0) / 10000000;
      const pendingDisbursement = active.filter(a => a.status === 'pending_disbursement').reduce((sum, a) => sum + a.amount, 0) / 100000;
      const overdue = active.filter(a => a.status === 'overdue').reduce((sum, a) => sum + a.amount, 0) / 100000;

      setPortfolioStats({
        totalActive: totalActive.toFixed(2),
        totalDisbursed: (totalActive + totalCollected).toFixed(2),
        totalCollected: totalCollected.toFixed(2),
        avgYield: 12.4,
        activeCount: active.length,
        collectedCount: collected.length,
        pendingDisbursement: pendingDisbursement.toFixed(1),
        overdue: overdue.toFixed(1)
      });
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Process disbursement handler (for financier to initiate fund transfer)
  const handleProcessDisbursement = async (investment, bankAccountId) => {
    setActionLoading(true);
    try {
      // For financier-funded disbursements
      await disbursementService.initiateFinancier({
        invoiceId: investment.originalInvoiceId || investment.invoiceId,
        bidId: investment.bidId,
        bankAccountId: bankAccountId
      });
      setProcessModal({ open: false, investment: null });
      await fetchPortfolio();
      alert('Disbursement processed successfully! Funds will be transferred to the seller.');
    } catch (err) {
      console.error('Failed to process disbursement:', err);
      alert(err.message || 'Failed to process disbursement');
    } finally {
      setActionLoading(false);
    }
  };

  // Mark disbursement as completed handler
  const handleMarkCompleted = async (investment, reference) => {
    setActionLoading(true);
    try {
      await disbursementService.updateStatus(investment.id, {
        status: 'COMPLETED',
        transactionReference: reference || undefined
      });
      setCompletedModal({ open: false, investment: null });
      await fetchPortfolio();
      alert('Disbursement marked as completed!');
    } catch (err) {
      console.error('Failed to update disbursement:', err);
      alert(err.message || 'Failed to update disbursement status');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredActive = activeInvestments.filter(inv =>
    !searchTerm || inv.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCollected = collectedInvestments.filter(inv =>
    !searchTerm || inv.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading portfolio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/financier')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">My Portfolio</h1>
                <p className="text-sm text-gray-500">Track your active investments and returns</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={18} />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase size={16} className="text-purple-600" />
              <span className="text-gray-500 text-sm">Active Portfolio</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">₹{portfolioStats.totalActive}Cr</p>
            <p className="text-xs text-gray-500 mt-1">{portfolioStats.activeCount} investments</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-gray-500 text-sm">Total Disbursed</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{portfolioStats.totalDisbursed}Cr</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-gray-500 text-sm">Total Collected</span>
            </div>
            <p className="text-2xl font-bold text-green-600">₹{portfolioStats.totalCollected}Cr</p>
            <p className="text-xs text-gray-500 mt-1">{portfolioStats.collectedCount} investments</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 size={16} className="text-green-600" />
              <span className="text-gray-500 text-sm">Avg. Yield</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{portfolioStats.avgYield}%</p>
            <p className="text-xs text-gray-500 mt-1">Annualized</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Clock size={16} className="text-orange-600" />
              <span className="text-gray-500 text-sm">Pending Disbursement</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">₹{portfolioStats.pendingDisbursement}L</p>
            <p className="text-xs text-gray-500 mt-1">{activeInvestments.filter(a => a.status === 'pending_disbursement').length} invoices</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-gray-500 text-sm">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-red-600">₹{portfolioStats.overdue}L</p>
            <p className="text-xs text-gray-500 mt-1">{activeInvestments.filter(a => a.status === 'overdue').length} invoices</p>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  activeTab === 'active' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Active ({activeInvestments.length})
              </button>
              <button
                onClick={() => setActiveTab('collected')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  activeTab === 'collected' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Collected ({collectedInvestments.length})
              </button>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by buyer or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
              />
            </div>
          </div>

          {/* Active Investments Table */}
          {activeTab === 'active' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer / Seller</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">My Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expected Return</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredActive.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{inv.invoiceId}</p>
                        <p className="text-xs text-gray-500">Disbursed: {inv.disbursedDate || 'Pending'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Building2 size={18} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{inv.buyer}</p>
                            <p className="text-sm text-gray-500">{inv.seller}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-800">₹{(inv.amount / 100000).toFixed(2)}L</p>
                        {inv.disbursedAmount > 0 && (
                          <p className="text-xs text-gray-500">Disbursed: ₹{(inv.disbursedAmount / 100000).toFixed(2)}L</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-green-600">{inv.myRate}%</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-green-600">+₹{(inv.expectedReturn / 1000).toFixed(1)}K</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{inv.dueDate}</p>
                        {inv.status === 'overdue' ? (
                          <p className="text-xs text-red-600">{inv.daysOverdue} days overdue</p>
                        ) : (
                          <p className="text-xs text-gray-500">{inv.daysLeft} days left</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {inv.status === 'pending_disbursement' && (
                            <button
                              onClick={() => setProcessModal({ open: true, investment: inv })}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                            >
                              Process
                            </button>
                          )}
                          {inv.status === 'disbursed' && (
                            <button
                              onClick={() => setCompletedModal({ open: true, investment: inv })}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                            >
                              Mark Done
                            </button>
                          )}
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Eye size={18} className="text-gray-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Collected Investments Table */}
          {activeTab === 'collected' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer / Seller</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Disbursed</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collected</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual Yield</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCollected.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{inv.invoiceId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle size={18} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{inv.buyer}</p>
                            <p className="text-sm text-gray-500">{inv.seller}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-gray-800">₹{(inv.disbursedAmount / 100000).toFixed(2)}L</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-800">₹{(inv.collected / 100000).toFixed(2)}L</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-green-600">+₹{(inv.profit / 1000).toFixed(1)}K</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-green-600">{inv.actualYield}% p.a.</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800">{inv.collectedDate}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {((activeTab === 'active' && filteredActive.length === 0) ||
            (activeTab === 'collected' && filteredCollected.length === 0)) && (
            <div className="text-center py-12">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No investments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProcessDisbursementModal
        isOpen={processModal.open}
        onClose={() => setProcessModal({ open: false, investment: null })}
        investment={processModal.investment}
        onProcess={handleProcessDisbursement}
        isLoading={actionLoading}
      />

      <MarkCompletedModal
        isOpen={completedModal.open}
        onClose={() => setCompletedModal({ open: false, investment: null })}
        investment={completedModal.investment}
        onMarkCompleted={handleMarkCompleted}
        isLoading={actionLoading}
      />
    </div>
  );
}
