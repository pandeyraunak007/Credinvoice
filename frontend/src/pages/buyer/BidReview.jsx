import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Clock, CheckCircle, AlertCircle, Building2, Timer, Award,
  ChevronDown, ChevronUp, Info, Check, X, Shield, Star, Phone, Mail, RefreshCw
} from 'lucide-react';

const BidCard = ({ bid, isLowest, isSelected, onSelect, expanded, onToggleExpand }) => (
  <div className={`bg-white rounded-xl border-2 transition-all overflow-hidden ${
    isSelected ? 'border-blue-500 ring-2 ring-blue-100' : isLowest ? 'border-green-500' : 'border-gray-200'
  }`}>
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isLowest ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Building2 size={28} className={isLowest ? 'text-green-600' : 'text-gray-600'} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-800 text-lg">{bid.financierName}</h3>
              {isLowest && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center space-x-1">
                  <Award size={12} /><span>Lowest Rate</span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{bid.financierType} • RBI Licensed</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Discount Rate</p>
          <p className={`text-3xl font-bold ${isLowest ? 'text-green-600' : 'text-gray-800'}`}>{bid.discountRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-5 p-4 bg-gray-50 rounded-lg">
        <div><p className="text-xs text-gray-500 uppercase">Haircut</p><p className="text-lg font-semibold">{bid.haircut}%</p></div>
        <div><p className="text-xs text-gray-500 uppercase">Processing Fee</p><p className="text-lg font-semibold">{bid.processingFee}%</p></div>
        <div><p className="text-xs text-gray-500 uppercase">Net to Seller</p><p className="text-lg font-semibold text-green-600">₹{bid.netAmount.toLocaleString('en-IN')}</p></div>
        <div><p className="text-xs text-gray-500 uppercase">Effective Cost</p><p className="text-lg font-semibold">{bid.effectiveCost}% p.a.</p></div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2 text-sm">
          <Timer size={16} className="text-gray-400" />
          <span className="text-gray-600">Valid until: </span>
          <span className={`font-medium ${bid.hoursRemaining < 6 ? 'text-orange-600' : 'text-gray-800'}`}>
            {bid.validUntil} ({bid.hoursRemaining}h remaining)
          </span>
        </div>
        <button onClick={onToggleExpand} className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
          <span>{expanded ? 'Hide Details' : 'View Details'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
    </div>

    {expanded && (
      <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Payment Calculation</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Invoice Amount</span><span className="font-medium">₹5,00,000</span></div>
            <div className="flex justify-between text-blue-600"><span>Discount ({bid.discountRate}%)</span><span>-₹{((500000 * bid.discountRate) / 100).toLocaleString('en-IN')}</span></div>
            {bid.processingFee > 0 && <div className="flex justify-between"><span>Processing Fee ({bid.processingFee}%)</span><span>-₹{((500000 * bid.processingFee) / 100).toLocaleString('en-IN')}</span></div>}
            <div className="border-t pt-2 flex justify-between font-semibold"><span>Net to Seller</span><span className="text-green-600">₹{bid.netAmount.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Financier Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2"><Shield size={14} className="text-gray-400" /><span>License: {bid.license}</span></div>
              <div className="flex items-center space-x-2"><Star size={14} className="text-yellow-500" /><span>Rating: {bid.rating}/5 ({bid.totalDeals} deals)</span></div>
              <div className="flex items-center space-x-2"><Clock size={14} className="text-gray-400" /><span>Avg. Disbursement: {bid.avgDisbursementTime}</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2"><Phone size={14} className="text-gray-400" /><span>{bid.phone}</span></div>
              <div className="flex items-center space-x-2"><Mail size={14} className="text-gray-400" /><span>{bid.email}</span></div>
            </div>
          </div>
        </div>

        {bid.terms && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info size={16} className="text-yellow-600 mt-0.5" />
              <div><p className="text-sm font-medium text-yellow-800">Special Terms</p><p className="text-sm text-yellow-700">{bid.terms}</p></div>
            </div>
          </div>
        )}
      </div>
    )}

    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
      {isSelected ? (
        <div className="flex items-center space-x-2 text-green-600"><CheckCircle size={20} /><span className="font-medium">Selected</span></div>
      ) : <div />}
      <div className="flex items-center space-x-3">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">Contact</button>
        <button onClick={() => onSelect(bid.id)} className={`px-6 py-2 rounded-lg text-sm font-medium ${
          isSelected ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}>
          {isSelected ? 'Confirm Selection' : 'Select This Bid'}
        </button>
      </div>
    </div>
  </div>
);

export default function BidReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedBid, setSelectedBid] = useState(null);
  const [expandedBid, setExpandedBid] = useState(null);
  const [sortBy, setSortBy] = useState('rate');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const invoice = { id: id || 'INV-2024-0076', seller: 'Steel Corp India', totalAmount: 500000, dueDate: '2025-02-27', earlyPaymentDate: '2025-01-15' };

  const bids = [
    { id: 1, financierName: 'Urban Finance Ltd', financierType: 'NBFC', discountRate: 1.5, haircut: 0, processingFee: 0.25, netAmount: 491250, effectiveCost: 9.13, validUntil: 'Dec 30, 6:00 PM', hoursRemaining: 18, license: 'NBFC-ND-00123', rating: 4.8, totalDeals: 234, avgDisbursementTime: '4-6 hours', phone: '+91 22 4567 8901', email: 'deals@urbanfinance.in', terms: null },
    { id: 2, financierName: 'HDFC Bank', financierType: 'Bank', discountRate: 1.6, haircut: 0, processingFee: 0.5, netAmount: 489500, effectiveCost: 9.75, validUntil: 'Dec 30, 5:00 PM', hoursRemaining: 17, license: 'RBI-BANK-00045', rating: 4.9, totalDeals: 1250, avgDisbursementTime: '2-4 hours', phone: '+91 22 6789 0123', email: 'scf@hdfc.com', terms: 'Subject to buyer credit limit' },
    { id: 3, financierName: 'ICICI Bank', financierType: 'Bank', discountRate: 1.7, haircut: 0, processingFee: 0.4, netAmount: 489500, effectiveCost: 10.12, validUntil: 'Dec 30, 4:00 PM', hoursRemaining: 16, license: 'RBI-BANK-00032', rating: 4.7, totalDeals: 890, avgDisbursementTime: '3-5 hours', phone: '+91 22 5678 9012', email: 'scf@icici.com', terms: null },
    { id: 4, financierName: 'Bajaj Finance', financierType: 'NBFC', discountRate: 1.8, haircut: 0, processingFee: 0, netAmount: 491000, effectiveCost: 10.95, validUntil: 'Dec 30, 8:00 PM', hoursRemaining: 20, license: 'NBFC-ND-00089', rating: 4.6, totalDeals: 567, avgDisbursementTime: '6-8 hours', phone: '+91 20 3456 7890', email: 'scf@bajajfinance.in', terms: 'Zero processing fee for first 3 transactions' },
  ];

  const sortedBids = [...bids].sort((a, b) => {
    if (sortBy === 'rate') return a.discountRate - b.discountRate;
    if (sortBy === 'netAmount') return b.netAmount - a.netAmount;
    return a.effectiveCost - b.effectiveCost;
  });

  const lowestBid = bids.reduce((min, bid) => bid.discountRate < min.discountRate ? bid : min, bids[0]);
  const selectedBidData = bids.find(b => b.id === selectedBid);

  const handleSelectBid = (bidId) => { setSelectedBid(bidId); setShowConfirmModal(true); };
  const handleConfirmBid = () => { setShowConfirmModal(false); alert('Bid confirmed! Financier will proceed with disbursement.'); navigate(`/invoices/${id}`); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(`/invoices/${id}`)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Review Bids</h1>
                <p className="text-sm text-gray-500">{invoice.id} • {invoice.seller}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Timer size={16} className="text-orange-500" />
                <span className="text-gray-600">Bidding closes in</span>
                <span className="font-semibold text-orange-600">16h 42m</span>
              </div>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RefreshCw size={16} /><span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Invoice Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="grid grid-cols-5 gap-6">
              <div><p className="text-sm text-gray-500">Invoice Amount</p><p className="text-xl font-bold">₹{invoice.totalAmount.toLocaleString('en-IN')}</p></div>
              <div><p className="text-sm text-gray-500">Seller</p><p className="font-medium">{invoice.seller}</p></div>
              <div><p className="text-sm text-gray-500">Due Date</p><p className="font-medium">{invoice.dueDate}</p></div>
              <div><p className="text-sm text-gray-500">Early Payment</p><p className="font-medium">{invoice.earlyPaymentDate}</p></div>
              <div><p className="text-sm text-gray-500">Total Bids</p><p className="text-xl font-bold text-purple-600">{bids.length}</p></div>
            </div>
          </div>

          {/* Best Bid */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Award size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Best Available Offer</p>
                  <p className="text-xl font-bold text-green-800">{lowestBid.financierName} @ {lowestBid.discountRate}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700">Net Amount to Seller</p>
                <p className="text-2xl font-bold text-green-800">₹{lowestBid.netAmount.toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => handleSelectBid(lowestBid.id)} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium">
                Accept Best Offer
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">{bids.length} bids from financiers</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white">
                <option value="rate">Lowest Rate</option>
                <option value="netAmount">Highest Net Amount</option>
                <option value="effectiveCost">Effective Cost</option>
              </select>
            </div>
          </div>

          {/* Bids */}
          <div className="space-y-4">
            {sortedBids.map((bid) => (
              <BidCard
                key={bid.id}
                bid={bid}
                isLowest={bid.id === lowestBid.id}
                isSelected={selectedBid === bid.id}
                onSelect={handleSelectBid}
                expanded={expandedBid === bid.id}
                onToggleExpand={() => setExpandedBid(expandedBid === bid.id ? null : bid.id)}
              />
            ))}
          </div>

          {/* Help */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start space-x-3">
              <Info size={20} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">How to choose?</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• <strong>Discount Rate:</strong> Lower is better</li>
                  <li>• <strong>Net Amount:</strong> What seller receives - higher is better</li>
                  <li>• <strong>Effective Cost:</strong> Annualized cost for comparison</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedBidData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Bid Selection</h3>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedBidData.financierName}</p>
                    <p className="text-sm text-gray-500">{selectedBidData.financierType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500">Discount Rate</p><p className="font-semibold">{selectedBidData.discountRate}%</p></div>
                  <div><p className="text-gray-500">Net to Seller</p><p className="font-semibold text-green-600">₹{selectedBidData.netAmount.toLocaleString('en-IN')}</p></div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Important</p>
                    <p className="text-yellow-700">Once confirmed, you'll repay ₹{invoice.totalAmount.toLocaleString('en-IN')} on {invoice.dueDate}.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleConfirmBid} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2">
                  <CheckCircle size={18} /><span>Confirm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
