import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, Building2, Calendar, Clock, Star,
  ChevronDown, ChevronUp, TrendingUp, Shield, AlertCircle, 
  IndianRupee, Target, RefreshCw, SlidersHorizontal, X, Check
} from 'lucide-react';

const RatingBadge = ({ rating }) => {
  const config = {
    'AAA': 'bg-green-100 text-green-700 border-green-200',
    'AA': 'bg-green-100 text-green-700 border-green-200',
    'A+': 'bg-blue-100 text-blue-700 border-blue-200',
    'A': 'bg-blue-100 text-blue-700 border-blue-200',
    'BBB': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'BB': 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${config[rating] || 'bg-gray-100 text-gray-700'}`}>
      {rating}
    </span>
  );
};

const InvoiceCard = ({ invoice, onPlaceBid }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
      {/* Main Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <Building2 size={28} className="text-purple-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-800 text-lg">{invoice.buyer}</h3>
                <RatingBadge rating={invoice.buyerRating} />
              </div>
              <p className="text-sm text-gray-500">Seller: {invoice.seller}</p>
              <p className="text-xs text-gray-400 font-mono">{invoice.invoiceId}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">₹{(invoice.amount / 100000).toFixed(2)}L</p>
            <p className="text-sm text-gray-500">Invoice Value</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Expected Rate</p>
            <p className="text-lg font-semibold text-green-600">{invoice.expectedRate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Tenure</p>
            <p className="text-lg font-semibold text-gray-800">{invoice.tenure} days</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Due Date</p>
            <p className="text-lg font-semibold text-gray-800">{invoice.dueDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Bids</p>
            <p className="text-lg font-semibold text-purple-600">{invoice.bidsCount}</p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-500">
              <Shield size={14} />
              <span>GST Verified</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Star size={14} className="text-yellow-500" />
              <span>{invoice.buyerHistory} invoices • {invoice.onTimeRate}% on-time</span>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${invoice.expiresInHours <= 6 ? 'text-red-600' : 'text-orange-600'}`}>
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
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Buyer Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">GSTIN</span>
                  <span className="font-mono text-gray-800">{invoice.buyerGstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Credit Limit</span>
                  <span className="text-gray-800">₹{invoice.creditLimit}Cr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Utilization</span>
                  <span className="text-gray-800">{invoice.utilization}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Avg. Payment Days</span>
                  <span className="text-gray-800">{invoice.avgPaymentDays} days</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Invoice Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice Date</span>
                  <span className="text-gray-800">{invoice.invoiceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Seller GSTIN</span>
                  <span className="font-mono text-gray-800">{invoice.sellerGstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Product Type</span>
                  <span className="text-gray-800">{invoice.productType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount Offered</span>
                  <span className="text-green-600 font-medium">{invoice.discountOffered}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Bids */}
          {invoice.bidsCount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>{invoice.bidsCount} bids</strong> already placed • Lowest: <strong>{invoice.lowestBid}%</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-500">Est. Yield: </span>
          <span className="font-semibold text-green-600">{invoice.estYield}% p.a.</span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(`/financier/marketplace/${invoice.invoiceId}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium"
          >
            View Full Details
          </button>
          <button 
            onClick={() => onPlaceBid(invoice)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            Place Bid
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Marketplace() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    minRating: 'all',
    sector: 'all',
    tenure: 'all'
  });
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [bidData, setBidData] = useState({ rate: '', processingFee: '0.25' });

  const invoices = [
    {
      id: 1, invoiceId: 'INV-2024-0076', buyer: 'Ansai Mart', buyerRating: 'AA', buyerGstin: '27AABCU9603R1ZN',
      seller: 'Steel Corp India', sellerGstin: '29GGGGG1314R9Z6', amount: 500000, expectedRate: '1.5-2.0%',
      tenure: 43, dueDate: 'Feb 27', invoiceDate: 'Dec 27', productType: 'DD + Early Payment',
      discountOffered: 1.8, bidsCount: 4, lowestBid: 1.5, expiresIn: '16h', expiresInHours: 16,
      buyerHistory: 45, onTimeRate: 98, creditLimit: 5, utilization: 65, avgPaymentDays: 2,
      estYield: 12.7, sector: 'Manufacturing'
    },
    {
      id: 2, invoiceId: 'INV-2024-0080', buyer: 'TechCorp India', buyerRating: 'A+', buyerGstin: '29AABCT5678P1ZQ',
      seller: 'Kumar Textiles', sellerGstin: '27AABCU9603R1ZM', amount: 750000, expectedRate: '1.8-2.2%',
      tenure: 58, dueDate: 'Mar 15', invoiceDate: 'Dec 26', productType: 'DD + Early Payment',
      discountOffered: 2.0, bidsCount: 2, lowestBid: 1.9, expiresIn: '1d 4h', expiresInHours: 28,
      buyerHistory: 32, onTimeRate: 95, creditLimit: 8, utilization: 48, avgPaymentDays: 1,
      estYield: 11.3, sector: 'Technology'
    },
    {
      id: 3, invoiceId: 'INV-2024-0081', buyer: 'Retail Plus', buyerRating: 'A', buyerGstin: '33AABCR1234M1ZR',
      seller: 'Auto Parts Ltd', sellerGstin: '33AABCT1332L1ZZ', amount: 320000, expectedRate: '2.0-2.5%',
      tenure: 35, dueDate: 'Feb 20', invoiceDate: 'Dec 28', productType: 'DD + Early Payment',
      discountOffered: 2.2, bidsCount: 1, lowestBid: 2.1, expiresIn: '2d', expiresInHours: 48,
      buyerHistory: 28, onTimeRate: 92, creditLimit: 3, utilization: 72, avgPaymentDays: 3,
      estYield: 15.4, sector: 'Retail'
    },
    {
      id: 4, invoiceId: 'INV-2024-0082', buyer: 'Global Traders', buyerRating: 'AA', buyerGstin: '27AABCG9876T1ZS',
      seller: 'Fabric House', sellerGstin: '27AAAAA0000A1Z5', amount: 425000, expectedRate: '1.6-2.0%',
      tenure: 50, dueDate: 'Mar 05', invoiceDate: 'Dec 25', productType: 'DD + Early Payment',
      discountOffered: 1.8, bidsCount: 3, lowestBid: 1.7, expiresIn: '8h', expiresInHours: 8,
      buyerHistory: 67, onTimeRate: 99, creditLimit: 6, utilization: 55, avgPaymentDays: 0,
      estYield: 11.7, sector: 'Manufacturing'
    },
    {
      id: 5, invoiceId: 'INV-2024-0083', buyer: 'Metro Supplies', buyerRating: 'A', buyerGstin: '29AABCM4567N1ZT',
      seller: 'Plastic Industries', sellerGstin: '27BBBBB2222B1Z5', amount: 185000, expectedRate: '2.2-2.8%',
      tenure: 40, dueDate: 'Feb 25', invoiceDate: 'Dec 28', productType: 'DD + Early Payment',
      discountOffered: 2.5, bidsCount: 0, lowestBid: null, expiresIn: '3d', expiresInHours: 72,
      buyerHistory: 15, onTimeRate: 88, creditLimit: 2, utilization: 80, avgPaymentDays: 5,
      estYield: 18.2, sector: 'Retail'
    },
  ];

  const stats = {
    totalInvoices: invoices.length,
    totalValue: invoices.reduce((sum, i) => sum + i.amount, 0),
    avgYield: 13.8
  };

  const handlePlaceBid = (invoice) => {
    setSelectedInvoice(invoice);
    setBidData({ rate: '', processingFee: '0.25' });
    setShowBidModal(true);
  };

  const submitBid = () => {
    console.log('Submitting bid:', { invoice: selectedInvoice?.invoiceId, ...bidData });
    setShowBidModal(false);
    alert(`Bid placed successfully for ${selectedInvoice?.invoiceId} at ${bidData.rate}%!`);
  };

  const filteredInvoices = invoices.filter(inv => {
    if (searchTerm && !inv.buyer.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filters.minRating !== 'all') {
      const ratings = ['AAA', 'AA', 'A+', 'A', 'BBB', 'BB'];
      if (ratings.indexOf(inv.buyerRating) > ratings.indexOf(filters.minRating)) return false;
    }
    if (filters.sector !== 'all' && inv.sector !== filters.sector) return false;
    return true;
  });

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
                <h1 className="text-xl font-bold text-gray-800">Invoice Marketplace</h1>
                <p className="text-sm text-gray-500">Browse and bid on approved invoices</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw size={16} /><span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-5 mb-6 text-white">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-purple-200 text-sm">Available Invoices</p>
              <p className="text-3xl font-bold">{stats.totalInvoices}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm">Total Value</p>
              <p className="text-3xl font-bold">₹{(stats.totalValue / 10000000).toFixed(2)}Cr</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm">Avg. Expected Yield</p>
              <p className="text-3xl font-bold">{stats.avgYield}%<span className="text-lg font-normal"> p.a.</span></p>
            </div>
            <div>
              <p className="text-purple-200 text-sm">Your Active Bids</p>
              <p className="text-3xl font-bold">4</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by buyer name or invoice ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters({...filters, minRating: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white min-w-[150px]"
            >
              <option value="all">All Ratings</option>
              <option value="AAA">AAA & above</option>
              <option value="AA">AA & above</option>
              <option value="A+">A+ & above</option>
              <option value="A">A & above</option>
            </select>
            <select
              value={filters.sector}
              onChange={(e) => setFilters({...filters, sector: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white min-w-[150px]"
            >
              <option value="all">All Sectors</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Technology">Technology</option>
            </select>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal size={18} />
              <span>More Filters</span>
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  placeholder="₹0"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenure</label>
                <select
                  value={filters.tenure}
                  onChange={(e) => setFilters({...filters, tenure: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="all">Any</option>
                  <option value="30">Up to 30 days</option>
                  <option value="60">Up to 60 days</option>
                  <option value="90">Up to 90 days</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => setFilters({ minAmount: '', maxAmount: '', minRating: 'all', sector: 'all', tenure: 'all' })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            Showing <strong>{filteredInvoices.length}</strong> invoices
          </p>
          <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white">
            <option>Sort by: Expiring Soon</option>
            <option>Sort by: Highest Amount</option>
            <option>Sort by: Highest Yield</option>
            <option>Sort by: Best Rating</option>
          </select>
        </div>

        {/* Invoice Cards */}
        <div className="space-y-4">
          {filteredInvoices.map(invoice => (
            <InvoiceCard 
              key={invoice.id} 
              invoice={invoice} 
              onPlaceBid={handlePlaceBid}
            />
          ))}
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Place Your Bid</h3>
              <button onClick={() => setShowBidModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Invoice Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedInvoice.buyer}</p>
                    <p className="text-sm text-gray-500">{selectedInvoice.invoiceId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Amount</p><p className="font-semibold">₹{(selectedInvoice.amount / 100000).toFixed(2)}L</p></div>
                  <div><p className="text-gray-500">Tenure</p><p className="font-semibold">{selectedInvoice.tenure} days</p></div>
                  <div><p className="text-gray-500">Due Date</p><p className="font-semibold">{selectedInvoice.dueDate}</p></div>
                </div>
              </div>

              {/* Current Bids Info */}
              {selectedInvoice.bidsCount > 0 && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>{selectedInvoice.bidsCount} bids</strong> already placed • Current lowest: <strong>{selectedInvoice.lowestBid}%</strong>
                  </p>
                </div>
              )}

              {/* Bid Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Discount Rate (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={bidData.rate}
                      onChange={(e) => setBidData({...bidData, rate: e.target.value})}
                      placeholder="e.g., 1.6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Expected range: {selectedInvoice.expectedRate}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={bidData.processingFee}
                    onChange={(e) => setBidData({...bidData, processingFee: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Calculation Preview */}
                {bidData.rate && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">If you win this bid:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">You disburse to seller</p>
                        <p className="font-semibold text-gray-800">
                          ₹{((selectedInvoice.amount * (1 - parseFloat(bidData.rate || 0) / 100 - parseFloat(bidData.processingFee || 0) / 100)) / 100000).toFixed(2)}L
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Buyer repays you</p>
                        <p className="font-semibold text-gray-800">₹{(selectedInvoice.amount / 100000).toFixed(2)}L</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Your earnings</p>
                        <p className="font-semibold text-green-600">
                          ₹{((selectedInvoice.amount * (parseFloat(bidData.rate || 0) + parseFloat(bidData.processingFee || 0)) / 100) / 100000).toFixed(2)}L
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Annualized yield</p>
                        <p className="font-semibold text-green-600">
                          {(((parseFloat(bidData.rate || 0) + parseFloat(bidData.processingFee || 0)) / selectedInvoice.tenure) * 365).toFixed(1)}% p.a.
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
                  disabled={!bidData.rate}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Check size={18} />
                  <span>Submit Bid</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
