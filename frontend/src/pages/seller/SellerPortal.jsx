import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Bell, TrendingUp, FileText, Clock, CheckCircle, XCircle, 
  IndianRupee, Calendar, Building2, ChevronRight, AlertCircle,
  CreditCard, Wallet, History, HelpCircle, X,
  ThumbsUp, ThumbsDown, Timer, Percent, Info, Phone, Mail, Calculator
} from 'lucide-react';

// ============ SELLER DASHBOARD ============
export function SellerDashboard() {
  const navigate = useNavigate();
  
  const stats = {
    pendingOffers: 3,
    pendingValue: 8.5,
    activeFinancing: 5,
    activeValue: 15.2,
    receivedThisMonth: 23.4,
    upcomingRepayments: 4.8
  };

  const pendingOffers = [
    { id: 1, buyer: 'Ansai Mart', invoiceNumber: 'INV-2024-0078', amount: 289100, discount: 2.0, earlyDate: '2025-01-15', expiresIn: '23h', urgent: false },
    { id: 2, buyer: 'TechCorp India', invoiceNumber: 'INV-2024-0082', amount: 450000, discount: 1.8, earlyDate: '2025-01-20', expiresIn: '6h', urgent: true },
    { id: 3, buyer: 'Retail Plus', invoiceNumber: 'INV-2024-0085', amount: 175000, discount: 2.5, earlyDate: '2025-01-18', expiresIn: '2d', urgent: false },
  ];

  const recentPayments = [
    { id: 1, buyer: 'Ansai Mart', amount: 245000, date: 'Dec 27, 2024', source: 'Financier', financier: 'HDFC Bank' },
    { id: 2, buyer: 'TechCorp India', amount: 380000, date: 'Dec 25, 2024', source: 'Buyer Direct', financier: null },
    { id: 3, buyer: 'Global Traders', amount: 520000, date: 'Dec 22, 2024', source: 'Financier', financier: 'Urban Finance' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/seller" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CI</span>
            </div>
            <span className="text-xl font-bold text-gray-800">CRED<span className="text-red-600">INVOICE</span></span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Seller</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">KT</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Kumar Textiles</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-1">
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 bg-green-50 text-green-700 rounded-lg font-medium">
              <TrendingUp size={20} /><span>Dashboard</span>
            </Link>
            <Link to="/seller/offers/1" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Percent size={20} /><span>Discount Offers</span>
              <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">3</span>
            </Link>
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <FileText size={20} /><span>My Invoices</span>
            </Link>
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <CreditCard size={20} /><span>GST Financing</span>
            </Link>
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Wallet size={20} /><span>Payments</span>
            </Link>
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <History size={20} /><span>Repayments</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, Rajesh</h1>
            <p className="text-gray-500 text-sm">Here's your financing overview for today</p>
          </div>

          {/* Urgent Alert */}
          {pendingOffers.some(o => o.urgent) && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">Urgent: 1 offer expiring soon</p>
                  <p className="text-sm text-orange-600">TechCorp India offer expires in 6 hours</p>
                </div>
              </div>
              <button onClick={() => navigate('/seller/offers/2')} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                Review Now
              </button>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Pending Offers</span>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingOffers}</p>
              <p className="text-gray-500 text-sm mt-1">₹{stats.pendingValue}L value</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Active Financing</span>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard size={16} className="text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.activeFinancing}</p>
              <p className="text-gray-500 text-sm mt-1">₹{stats.activeValue}L outstanding</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Received This Month</span>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">₹{stats.receivedThisMonth}<span className="text-lg font-normal text-gray-500">L</span></p>
              <p className="text-green-600 text-sm mt-1">↑ 18% from last month</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Upcoming Repayments</span>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600">₹{stats.upcomingRepayments}<span className="text-lg font-normal text-gray-500">L</span></p>
              <p className="text-gray-500 text-sm mt-1">Next 30 days</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Pending Offers */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Pending Discount Offers</h2>
                <button className="text-green-600 text-sm font-medium hover:text-green-700">View All →</button>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingOffers.map(offer => (
                  <div key={offer.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-800">{offer.buyer}</p>
                            {offer.urgent && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Urgent</span>}
                          </div>
                          <p className="text-sm text-gray-500">{offer.invoiceNumber}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-800">₹{(offer.amount / 100000).toFixed(2)}L</p>
                        <p className="text-sm text-green-600">-{offer.discount}% discount</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Expires in</p>
                        <p className={`font-medium ${offer.urgent ? 'text-red-600' : 'text-gray-800'}`}>{offer.expiresIn}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/seller/offers/${offer.id}`)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Recent Payments</h2>
                <button className="text-green-600 text-sm font-medium hover:text-green-700">View All →</button>
              </div>
              <div className="p-4 space-y-4">
                {recentPayments.map(payment => (
                  <div key={payment.id} className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payment.source === 'Financier' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {payment.source === 'Financier' ? <CreditCard size={18} className="text-purple-600" /> : <Building2 size={18} className="text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{payment.buyer}</p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-sm">+₹{(payment.amount / 100000).toFixed(2)}L</p>
                      <p className="text-xs text-gray-500">{payment.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:border-green-300 hover:bg-green-50 transition">
              <FileText size={20} /><span className="font-medium">Upload Invoice for Financing</span>
            </button>
            <button className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:border-green-300 hover:bg-green-50 transition">
              <Calculator size={20} /><span className="font-medium">Calculate Financing Cost</span>
            </button>
            <button className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:border-green-300 hover:bg-green-50 transition">
              <HelpCircle size={20} /><span className="font-medium">Help & Support</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============ OFFER DETAIL PAGE ============
export function OfferDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const offer = {
    id: id || 1,
    buyer: { name: 'Ansai Mart', gstin: '27AABCU9603R1ZN', email: 'ap@ansaimart.com', phone: '+91 22 9876 5432', creditRating: 'AA', paymentHistory: '98% on-time' },
    invoice: { number: 'INV-2024-0078', date: '2024-12-28', dueDate: '2025-02-28' },
    amounts: { invoiceTotal: 289100 },
    discount: { percent: 2.0, amount: 5782, netAmount: 283318, earlyPaymentDate: '2025-01-15', daysEarly: 44 },
    hoursRemaining: 23,
    createdAt: '2024-12-28 10:30 AM',
    expiresAt: '2024-12-30 10:30 AM',
  };

  const handleAccept = () => { setShowAcceptModal(false); alert('Offer accepted! You will receive payment by ' + offer.discount.earlyPaymentDate); navigate('/seller'); };
  const handleReject = () => { setShowRejectModal(false); alert('Offer rejected.'); navigate('/seller'); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/seller')} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Discount Offer</h1>
                <p className="text-sm text-gray-500">From {offer.buyer.name} • {offer.invoice.number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-orange-100 rounded-lg">
              <Timer size={16} className="text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Expires in {offer.hoursRemaining}h</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Offer Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium mb-1">Early Payment Offer</p>
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-gray-800">₹{offer.discount.netAmount.toLocaleString('en-IN')}</span>
                  <span className="text-lg text-gray-500 line-through">₹{offer.amounts.invoiceTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="mt-2 text-green-700">Get paid <strong>{offer.discount.daysEarly} days early</strong> with {offer.discount.percent}% discount</p>
              </div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-green-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{offer.discount.percent}%</p>
                  <p className="text-xs text-gray-500">Discount</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Invoice Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between"><span className="text-gray-600">Invoice Number</span><span className="font-medium">{offer.invoice.number}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Invoice Date</span><span className="font-medium">{offer.invoice.date}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Original Due Date</span><span className="font-medium">{offer.invoice.dueDate}</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Calculation</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between"><span className="text-gray-600">Invoice Total</span><span className="font-medium">₹{offer.amounts.invoiceTotal.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between text-green-600"><span>Discount ({offer.discount.percent}%)</span><span className="font-medium">-₹{offer.discount.amount.toLocaleString('en-IN')}</span></div>
                    <div className="border-t pt-3 flex justify-between"><span className="font-semibold">You will receive</span><span className="font-bold text-lg text-green-600">₹{offer.discount.netAmount.toLocaleString('en-IN')}</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Buyer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 size={28} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">{offer.buyer.name}</p>
                        <p className="text-sm text-gray-500 font-mono">{offer.buyer.gstin}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2"><Mail size={14} className="text-gray-400" /><span>{offer.buyer.email}</span></div>
                      <div className="flex items-center space-x-2"><Phone size={14} className="text-gray-400" /><span>{offer.buyer.phone}</span></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Buyer Credibility</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center"><span className="text-gray-600">Credit Rating</span><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">{offer.buyer.creditRating}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Payment History</span><span className="font-medium text-green-600">{offer.buyer.paymentHistory}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Your History</span><span className="font-medium">12 invoices • ₹45L</span></div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Info size={16} className="text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">What happens next?</p>
                      <p className="text-blue-700 mt-1">If you accept, you'll receive payment on or before {offer.discount.earlyPaymentDate}.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">Offer received on {offer.createdAt}</div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setShowRejectModal(true)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium flex items-center space-x-2">
                <ThumbsDown size={18} /><span>Reject Offer</span>
              </button>
              <button onClick={() => setShowAcceptModal(true)} className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center space-x-2">
                <ThumbsUp size={18} /><span>Accept Offer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Compare Your Options</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3"><Clock size={18} className="text-gray-500" /><span className="font-medium">Wait for Due Date</span></div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Receive</span><span className="font-medium">₹{offer.amounts.invoiceTotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">When</span><span className="font-medium">{offer.invoice.dueDate} (61 days)</span></div>
              </div>
            </div>
            <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle size={18} className="text-green-600" />
                <span className="font-medium text-green-800">Accept Early Payment</span>
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Recommended</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-green-700">Receive</span><span className="font-medium text-green-800">₹{offer.discount.netAmount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-green-700">When</span><span className="font-medium text-green-800">{offer.discount.earlyPaymentDate} (17 days)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Accept This Offer?</h3>
              <p className="text-gray-500 text-center mb-6">You will receive ₹{offer.discount.netAmount.toLocaleString('en-IN')} on or before {offer.discount.earlyPaymentDate}</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Invoice Amount</span><span className="font-medium">₹{offer.amounts.invoiceTotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-sm text-green-600 mb-2"><span>Discount</span><span>-₹{offer.discount.amount.toLocaleString('en-IN')}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>You'll Receive</span><span className="text-green-600">₹{offer.discount.netAmount.toLocaleString('en-IN')}</span></div>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setShowAcceptModal(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleAccept} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Yes, Accept</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Reject This Offer?</h3>
              <p className="text-gray-500 text-center mb-6">You'll wait until {offer.invoice.dueDate} for full payment</p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g., Discount too high..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleReject} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
