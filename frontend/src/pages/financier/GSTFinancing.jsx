import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Building2, Calendar, Clock,
  ChevronDown, ChevronUp, Shield, AlertCircle,
  RefreshCw, X, Check, Loader2, Percent, TrendingUp,
  FileText, IndianRupee, Info
} from 'lucide-react';
import { invoiceService, bidService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const InvoiceCard = ({ invoice, onPlaceBid, myBid }) => {
  const [expanded, setExpanded] = useState(false);
  const hasBid = !!myBid;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
      {/* Header with GST Badge */}
      <div className="px-5 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield size={16} className="text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">GST-Backed Invoice Financing</span>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
          {invoice.bidsCount} bid{invoice.bidsCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Building2 size={28} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{invoice.seller}</h3>
              <p className="text-sm text-gray-500">Buyer: {invoice.buyer}</p>
              <p className="text-xs text-gray-400 font-mono">{invoice.invoiceId}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">₹{(invoice.amount / 100000).toFixed(2)}L</p>
            <p className="text-sm text-gray-500">Invoice Value</p>
          </div>
        </div>

        {/* Key Metrics for GST Financing */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Tenure</p>
            <p className="text-lg font-semibold text-gray-800">{invoice.tenure} days</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Due Date</p>
            <p className="text-lg font-semibold text-gray-800">{invoice.dueDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Lowest Bid</p>
            <p className="text-lg font-semibold text-emerald-600">
              {invoice.lowestBid ? `${invoice.lowestBid}%` : 'No bids'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Lowest Haircut</p>
            <p className="text-lg font-semibold text-blue-600">
              {invoice.lowestHaircut ? `${invoice.lowestHaircut}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-emerald-600">
              <Shield size={14} />
              <span>GST Verified</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <FileText size={14} />
              <span>Invoice #{invoice.invoiceId}</span>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${invoice.expiresInHours <= 24 ? 'text-red-600' : 'text-orange-600'}`}>
            <Clock size={14} />
            <span className="font-medium">Expires in {invoice.expiresIn}</span>
          </div>
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span>{expanded ? 'Hide Details' : 'View Details'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Seller Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Company</span>
                  <span className="text-gray-800">{invoice.seller}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GSTIN</span>
                  <span className="font-mono text-gray-800">{invoice.sellerGstin || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Buyer Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Company</span>
                  <span className="text-gray-800">{invoice.buyer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GSTIN</span>
                  <span className="font-mono text-gray-800">{invoice.buyerGstin || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Invoice Details</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Date</span>
                <span className="text-gray-800">{invoice.invoiceDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date</span>
                <span className="text-gray-800">{invoice.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="text-gray-800 font-semibold">₹{(invoice.amount / 100000).toFixed(2)}L</span>
              </div>
            </div>
          </div>

          {/* Existing Bids Summary */}
          {invoice.bidsCount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>{invoice.bidsCount} bid{invoice.bidsCount > 1 ? 's' : ''}</strong> already placed
                {invoice.lowestBid && <> • Lowest Rate: <strong>{invoice.lowestBid}%</strong></>}
                {invoice.lowestHaircut && <> • Lowest Haircut: <strong>{invoice.lowestHaircut}%</strong></>}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-500">Estimated Return: </span>
          <span className="font-semibold text-emerald-600">{invoice.estYield}% p.a.</span>
        </div>
        <div className="flex items-center space-x-3">
          {hasBid ? (
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
              <Check size={16} />
              <span>Bid: {myBid.discountRate}% rate, {myBid.haircutPercentage || 0}% haircut</span>
            </div>
          ) : (
            <button
              onClick={() => onPlaceBid(invoice)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center space-x-2"
            >
              <TrendingUp size={16} />
              <span>Place Bid</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function GSTFinancing() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [bidData, setBidData] = useState({ rate: '', haircut: '10', processingFee: '0.25' });
  const [submittingBid, setSubmittingBid] = useState(false);
  const [myBids, setMyBids] = useState([]);

  const fetchInvoices = async (isPolling = false) => {
    try {
      if (!isPolling) {
        setLoading(true);
        setError(null);
      }
      // Fetch only GST_BACKED invoices
      const response = await invoiceService.getAvailable({ productType: 'GST_BACKED' });

      const transformedInvoices = (response.data || []).map(inv => {
        const lowestBid = inv.bids?.length > 0
          ? Math.min(...inv.bids.map(b => b.discountRate))
          : null;
        const lowestHaircut = inv.bids?.length > 0
          ? Math.min(...inv.bids.filter(b => b.haircutPercentage).map(b => b.haircutPercentage))
          : null;

        return {
          id: inv.id,
          invoiceId: inv.invoiceNumber || inv.id.slice(0, 8),
          buyer: inv.buyerName || inv.buyer?.companyName || 'Unknown Buyer',
          buyerGstin: inv.buyerGstin || '',
          seller: inv.sellerName || inv.seller?.companyName || 'Unknown Seller',
          sellerGstin: inv.sellerGstin || '',
          amount: inv.totalAmount || 0,
          tenure: Math.ceil((new Date(inv.dueDate) - new Date()) / (1000 * 60 * 60 * 24)),
          dueDate: new Date(inv.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          invoiceDate: new Date(inv.invoiceDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          bidsCount: inv.bids?.length || inv._count?.bids || 0,
          lowestBid,
          lowestHaircut,
          expiresIn: getExpiresIn(inv.createdAt),
          expiresInHours: Math.ceil((new Date(inv.dueDate) - new Date()) / (1000 * 60 * 60)),
          estYield: calculateYield(2, inv.dueDate), // Default 2% rate for estimation
        };
      });

      setInvoices(transformedInvoices);
    } catch (err) {
      console.error('Failed to fetch GST invoices:', err);
      if (!isPolling) {
        setError(err.message || 'Failed to load invoices');
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  };

  const fetchMyBids = async () => {
    try {
      const response = await bidService.getMyBids();
      setMyBids(response.data || []);
    } catch (err) {
      console.error('Failed to fetch my bids:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchMyBids();

    const pollInterval = setInterval(() => {
      fetchInvoices(true);
      fetchMyBids();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const getExpiresIn = (createdAt) => {
    if (!createdAt) return '7d';
    const created = new Date(createdAt);
    const expires = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const hoursLeft = Math.max(0, Math.ceil((expires - now) / (1000 * 60 * 60)));
    if (hoursLeft < 24) return `${hoursLeft}h`;
    return `${Math.ceil(hoursLeft / 24)}d`;
  };

  const calculateYield = (rate, dueDate) => {
    const days = Math.max(1, Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)));
    return ((rate / days) * 365).toFixed(1);
  };

  const stats = {
    totalInvoices: invoices.length,
    totalValue: invoices.reduce((sum, i) => sum + i.amount, 0),
    avgTenure: invoices.length > 0 ? Math.round(invoices.reduce((sum, i) => sum + i.tenure, 0) / invoices.length) : 0,
    activeBids: myBids.filter(b => b.status === 'PENDING' && b.invoice?.productType === 'GST_BACKED').length
  };

  const handlePlaceBid = (invoice) => {
    setSelectedInvoice(invoice);
    setBidData({ rate: '', haircut: '10', processingFee: '0.25' });
    setShowBidModal(true);
  };

  const submitBid = async () => {
    if (!selectedInvoice || !bidData.rate) return;

    setSubmittingBid(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 7);

      await bidService.create({
        invoiceId: selectedInvoice.id,
        discountRate: parseFloat(bidData.rate),
        haircutPercentage: parseFloat(bidData.haircut || 0),
        processingFee: parseFloat(bidData.processingFee || 0),
        validUntil: validUntil.toISOString(),
      });

      notify.success('Bid Placed', 'Your bid has been submitted successfully');
      setShowBidModal(false);
      fetchInvoices();
      fetchMyBids();
    } catch (err) {
      console.error('Failed to submit bid:', err);
      notify.error('Bid Failed', err.message || 'Failed to submit bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (searchTerm && !inv.seller.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !inv.buyer.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading GST Financing opportunities...</span>
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
            onClick={() => fetchInvoices()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/financier')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">GST-Backed Invoice Financing</h1>
                <p className="text-sm text-gray-500">Bid on seller invoices backed by GST verification</p>
              </div>
            </div>
            <button
              onClick={() => { fetchInvoices(); fetchMyBids(); }}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={16} /><span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* How it works info */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-800 mb-2">How GST-Backed Financing Works</h3>
              <div className="grid grid-cols-4 gap-4 text-sm text-emerald-700">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <span>Seller uploads invoice with buyer details</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <span>You place a bid with interest rate & haircut</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <span>Seller accepts best bid, you disburse funds</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                  <span>Buyer pays you on invoice due date</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 mb-6 text-white">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-emerald-100 text-sm">Available Invoices</p>
              <p className="text-3xl font-bold">{stats.totalInvoices}</p>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Total Value</p>
              <p className="text-3xl font-bold">₹{(stats.totalValue / 10000000).toFixed(2)}Cr</p>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Avg. Tenure</p>
              <p className="text-3xl font-bold">{stats.avgTenure}<span className="text-lg font-normal"> days</span></p>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Your Active Bids</p>
              <p className="text-3xl font-bold">{stats.activeBids}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by seller, buyer or invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            Showing <strong>{filteredInvoices.length}</strong> GST-backed invoice{filteredInvoices.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Invoice Cards */}
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Shield className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">No GST-backed invoices available</p>
              <p className="text-gray-500 text-sm mt-1">Check back later for new financing opportunities</p>
            </div>
          ) : (
            filteredInvoices.map(invoice => {
              const existingBid = myBids.find(bid => bid.invoiceId === invoice.id);
              return (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onPlaceBid={handlePlaceBid}
                  myBid={existingBid}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Bid Modal for GST Financing */}
      {showBidModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Place Your Bid</h3>
                <p className="text-sm text-emerald-600">GST-Backed Invoice Financing</p>
              </div>
              <button onClick={() => setShowBidModal(false)} className="p-1 hover:bg-white/50 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Invoice Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Building2 size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedInvoice.seller}</p>
                    <p className="text-sm text-gray-500">Invoice: {selectedInvoice.invoiceId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Amount</p><p className="font-semibold">₹{(selectedInvoice.amount / 100000).toFixed(2)}L</p></div>
                  <div><p className="text-gray-500">Tenure</p><p className="font-semibold">{selectedInvoice.tenure} days</p></div>
                  <div><p className="text-gray-500">Due Date</p><p className="font-semibold">{selectedInvoice.dueDate}</p></div>
                </div>
              </div>

              {/* Bid Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="15"
                      value={bidData.rate}
                      onChange={(e) => setBidData({...bidData, rate: e.target.value})}
                      placeholder="e.g., 2.0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Your interest rate for financing this invoice</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Haircut / Risk Margin (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="30"
                      value={bidData.haircut}
                      onChange={(e) => setBidData({...bidData, haircut: e.target.value})}
                      placeholder="e.g., 10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Percentage withheld as risk buffer (seller receives invoice value minus haircut)</p>
                </div>

                {/* Calculation Preview */}
                {bidData.rate && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h4 className="font-medium text-emerald-800 mb-2">If you win this bid:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">You disburse to seller</p>
                        <p className="font-semibold text-gray-800">
                          ₹{((selectedInvoice.amount * (100 - parseFloat(bidData.haircut || 0)) / 100) / 100000).toFixed(2)}L
                        </p>
                        <p className="text-xs text-gray-500">(Invoice - {bidData.haircut || 0}% haircut)</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Buyer repays you</p>
                        <p className="font-semibold text-gray-800">₹{(selectedInvoice.amount / 100000).toFixed(2)}L</p>
                        <p className="text-xs text-gray-500">(Full invoice amount)</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Your earnings</p>
                        <p className="font-semibold text-emerald-600">
                          ₹{((selectedInvoice.amount * parseFloat(bidData.haircut || 0) / 100) / 100000).toFixed(2)}L
                        </p>
                        <p className="text-xs text-gray-500">(Haircut amount)</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Effective yield</p>
                        <p className="font-semibold text-emerald-600">
                          {((parseFloat(bidData.haircut || 0) / selectedInvoice.tenure) * 365).toFixed(1)}% p.a.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submitBid}
                  disabled={!bidData.rate || submittingBid}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submittingBid ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Submit Bid</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
