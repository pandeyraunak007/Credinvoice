import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  TrendingUp, FileText, Clock, CheckCircle, XCircle,
  IndianRupee, Calendar, Building2, ChevronRight, AlertCircle,
  CreditCard, Wallet, History, HelpCircle, X, Loader2,
  ThumbsUp, ThumbsDown, Timer, Percent, Info, Phone, Mail, Calculator, Settings, Bell
} from 'lucide-react';
import { discountService, invoiceService, disbursementService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import NotificationDropdown from '../../components/NotificationDropdown';

// ============ SELLER DASHBOARD ============
export function SellerDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [pendingOffers, setPendingOffers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [stats, setStats] = useState({
    pendingOffers: 0,
    pendingValue: 0,
    activeFinancing: 0,
    activeValue: 0,
    receivedThisMonth: 0,
    upcomingRepayments: 0
  });

  // Track previous offer IDs to detect new offers
  const previousOfferIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  const sellerInfo = profile?.seller || {};
  const companyInitials = sellerInfo.companyName ? sellerInfo.companyName.substring(0, 2).toUpperCase() : 'SE';
  const contactName = sellerInfo.contactName || user?.email?.split('@')[0] || 'User';

  // Check for new offers and show notification
  const checkForNewOffers = useCallback((offers) => {
    if (isInitialLoadRef.current) {
      // First load - just store the IDs, don't notify
      previousOfferIdsRef.current = new Set(offers.map(o => o.id));
      isInitialLoadRef.current = false;
      return;
    }

    // Find new offers
    const newOffers = offers.filter(offer => !previousOfferIdsRef.current.has(offer.id));

    if (newOffers.length > 0) {
      newOffers.forEach(offer => {
        notify.discount(
          'New Discount Offer!',
          `${offer.buyer || 'A buyer'} sent a ${offer.discount || offer.discountPercentage}% discount offer for ₹${((offer.amount || 0) / 1000).toFixed(0)}K`,
          {
            duration: 8000,
            action: {
              label: 'Review Offer →',
              onClick: () => navigate(`/seller/offers/${offer.id}`),
            },
          }
        );
      });
    }

    // Update the tracked IDs
    previousOfferIdsRef.current = new Set(offers.map(o => o.id));
  }, [notify, navigate]);

  const fetchData = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      // Fetch pending discount offers for seller
      const offersResponse = await discountService.getPending();
      const offers = offersResponse.data || [];

      // Transform offers to match component format
      const transformedOffers = offers.map(offer => ({
        id: offer.id,
        buyer: offer.invoice?.buyerName || 'Unknown Buyer',
        invoiceNumber: offer.invoice?.invoiceNumber || offer.invoiceId,
        amount: offer.invoice?.totalAmount || 0,
        discount: offer.discountPercentage || 0,
        discountPercentage: offer.discountPercentage || 0,
        earlyDate: offer.earlyPaymentDate,
        expiresIn: getExpiresIn(offer.expiresAt),
        urgent: isUrgent(offer.expiresAt),
      }));

      // Check for new offers and notify
      checkForNewOffers(transformedOffers);

      setPendingOffers(transformedOffers);

      // Calculate stats
      const pendingValue = offers.reduce((sum, o) => sum + (o.invoice?.totalAmount || 0), 0) / 100000;

      // Fetch disbursements for recent payments
      const disbursementsResponse = await disbursementService.list();
      const disbursements = disbursementsResponse.data || [];
      const recentDisbursements = disbursements
        .filter(d => d.status === 'COMPLETED')
        .slice(0, 5)
        .map(d => ({
          id: d.id,
          buyer: d.invoice?.buyerName || 'Unknown',
          amount: d.amount || 0,
          date: new Date(d.completedAt || d.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          source: d.fundingType === 'SELF_FUNDED' ? 'Buyer Direct' : 'Financier',
          financier: d.financier?.companyName || null,
        }));

      setRecentPayments(recentDisbursements);

      setStats({
        pendingOffers: offers.length,
        pendingValue: pendingValue.toFixed(1),
        activeFinancing: disbursements.filter(d => d.status === 'IN_PROGRESS').length,
        activeValue: (disbursements.filter(d => d.status === 'IN_PROGRESS').reduce((sum, d) => sum + (d.amount || 0), 0) / 100000).toFixed(1),
        receivedThisMonth: (recentDisbursements.reduce((sum, d) => sum + d.amount, 0) / 100000).toFixed(1),
        upcomingRepayments: 0
      });
    } catch (error) {
      console.error('Failed to fetch seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll for new offers every 30 seconds
    const pollInterval = setInterval(() => {
      fetchData(true); // isPolling = true to avoid showing loading state
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const getExpiresIn = (expiresAt) => {
    if (!expiresAt) return '3d';
    const expires = new Date(expiresAt);
    const now = new Date();
    const hoursLeft = Math.max(0, Math.ceil((expires - now) / (1000 * 60 * 60)));
    if (hoursLeft < 24) return `${hoursLeft}h`;
    return `${Math.ceil(hoursLeft / 24)}d`;
  };

  const isUrgent = (expiresAt) => {
    if (!expiresAt) return false;
    const expires = new Date(expiresAt);
    const now = new Date();
    const hoursLeft = Math.ceil((expires - now) / (1000 * 60 * 60));
    return hoursLeft < 12;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

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
            <NotificationDropdown />
            <button
              onClick={() => navigate('/account')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <div
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg"
              onClick={() => navigate('/account')}
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{companyInitials}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{sellerInfo.companyName || 'Seller'}</span>
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
            <Link to="/seller/discounts" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Percent size={20} /><span>Discount Offers</span>
              {stats.pendingOffers > 0 && (
                <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{stats.pendingOffers}</span>
              )}
            </Link>
            <Link to="/seller/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <FileText size={20} /><span>My Invoices</span>
            </Link>
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <CreditCard size={20} /><span>GST Financing</span>
            </Link>
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Wallet size={20} /><span>Payments</span>
            </Link>
            <Link to="/seller/contracts" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <FileText size={20} /><span>Contracts</span>
            </Link>
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <History size={20} /><span>Repayments</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {contactName}</h1>
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

// ============ DISCOUNT OFFERS LIST PAGE ============
export function DiscountOffersList() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [filter, setFilter] = useState('PENDING');

  const sellerInfo = profile?.seller || {};
  const companyInitials = sellerInfo.companyName ? sellerInfo.companyName.substring(0, 2).toUpperCase() : 'SE';

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await discountService.getPending();
        const data = response.data || [];
        setOffers(data);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [filter]);

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-orange-100 text-orange-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || styles.PENDING;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading discount offers...</span>
        </div>
      </div>
    );
  }

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
            <NotificationDropdown />
            <button
              onClick={() => navigate('/account')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <div
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg"
              onClick={() => navigate('/account')}
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{companyInitials}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{sellerInfo.companyName || 'Seller'}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-1">
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <TrendingUp size={20} /><span>Dashboard</span>
            </Link>
            <Link to="/seller/discounts" className="flex items-center space-x-3 px-3 py-2.5 bg-green-50 text-green-700 rounded-lg font-medium">
              <Percent size={20} /><span>Discount Offers</span>
              {offers.length > 0 && (
                <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{offers.length}</span>
              )}
            </Link>
            <Link to="/seller/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <FileText size={20} /><span>My Invoices</span>
            </Link>
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <CreditCard size={20} /><span>GST Financing</span>
            </Link>
            <Link to="/seller" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Wallet size={20} /><span>Payments</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Discount Offers</h1>
            <p className="text-gray-500 text-sm">Review and respond to early payment discount offers from buyers</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex items-center space-x-2">
            {['PENDING', 'ACCEPTED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Offers List */}
          {offers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Percent size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No pending offers</h3>
              <p className="text-gray-500">You don't have any discount offers waiting for your response.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {offers.map((offer) => {
                  const invoice = offer.invoice || {};
                  const discountAmount = ((invoice.totalAmount || 0) * (offer.discountPercentage || 0)) / 100;
                  const netAmount = (invoice.totalAmount || 0) - discountAmount;

                  return (
                    <div key={offer.id} className="p-5 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Building2 size={28} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-lg">{invoice.buyerName || 'Unknown Buyer'}</p>
                            <p className="text-gray-500 text-sm">Invoice: {invoice.invoiceNumber || 'N/A'}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(offer.status)}`}>
                                {offer.status}
                              </span>
                              <span className="text-xs text-gray-400">
                                Created: {new Date(offer.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center px-6">
                          <p className="text-sm text-gray-500">Invoice Amount</p>
                          <p className="text-xl font-bold text-gray-800">
                            ₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="text-center px-6">
                          <p className="text-sm text-gray-500">Discount</p>
                          <p className="text-xl font-bold text-green-600">
                            -{offer.discountPercentage}%
                          </p>
                        </div>

                        <div className="text-center px-6">
                          <p className="text-sm text-gray-500">You'll Receive</p>
                          <p className="text-xl font-bold text-green-600">
                            ₹{netAmount.toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="text-center px-6">
                          <p className="text-sm text-gray-500">Early Payment</p>
                          <p className="font-medium text-gray-800">
                            {offer.earlyPaymentDate
                              ? new Date(offer.earlyPaymentDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short'
                                })
                              : 'N/A'
                            }
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/seller/offers/${offer.id}`)}
                          className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium flex items-center space-x-2"
                        >
                          <span>Review</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ============ OFFER DETAIL PAGE ============
export function OfferDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
        const response = await discountService.getById(id);
        const data = response.data;

        // Transform API data to match component format
        const invoice = data.invoice || {};
        const discountAmount = ((invoice.totalAmount || 0) * (data.discountPercentage || 0)) / 100;
        const netAmount = (invoice.totalAmount || 0) - discountAmount;
        const dueDate = new Date(invoice.dueDate);
        const earlyDate = new Date(data.earlyPaymentDate);
        const daysEarly = Math.ceil((dueDate - earlyDate) / (1000 * 60 * 60 * 24));

        setOffer({
          id: data.id,
          buyer: {
            name: invoice.buyerName || 'Unknown Buyer',
            gstin: invoice.buyerGstin || '',
            email: data.buyer?.email || 'N/A',
            phone: data.buyer?.phone || 'N/A',
            creditRating: 'A',
            paymentHistory: '95% on-time'
          },
          invoice: {
            number: invoice.invoiceNumber,
            date: new Date(invoice.invoiceDate).toLocaleDateString('en-IN'),
            dueDate: new Date(invoice.dueDate).toLocaleDateString('en-IN')
          },
          amounts: { invoiceTotal: invoice.totalAmount || 0 },
          discount: {
            percent: data.discountPercentage || 0,
            amount: discountAmount,
            netAmount: netAmount,
            earlyPaymentDate: new Date(data.earlyPaymentDate).toLocaleDateString('en-IN'),
            daysEarly: daysEarly
          },
          hoursRemaining: Math.max(0, Math.ceil((new Date(data.expiresAt) - new Date()) / (1000 * 60 * 60))),
          createdAt: new Date(data.createdAt).toLocaleString('en-IN'),
          expiresAt: new Date(data.expiresAt).toLocaleString('en-IN'),
        });
      } catch (error) {
        console.error('Failed to fetch offer:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOffer();
  }, [id]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      await discountService.accept(id);
      setShowAcceptModal(false);
      navigate('/seller');
    } catch (error) {
      console.error('Failed to accept offer:', error);
      alert(error.message || 'Failed to accept offer');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 10) {
      alert('Please provide a rejection reason (at least 10 characters)');
      return;
    }
    setProcessing(true);
    try {
      await discountService.reject(id, rejectReason.trim());
      setShowRejectModal(false);
      navigate('/seller');
    } catch (error) {
      console.error('Failed to reject offer:', error);
      alert(error.message || 'Failed to reject offer');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading offer details...</span>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-gray-600">Offer not found</p>
          <button onClick={() => navigate('/seller')} className="mt-4 text-green-600 hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
                <button onClick={() => setShowAcceptModal(false)} disabled={processing} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50">Cancel</button>
                <button onClick={handleAccept} disabled={processing} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center">
                  {processing ? <><Loader2 size={18} className="animate-spin mr-2" />Processing...</> : 'Yes, Accept'}
                </button>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for rejection <span className="text-red-500">*</span></label>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g., Discount percentage is too high, I need at least 95% of invoice value..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" rows={3} />
                <p className="text-xs text-gray-500 mt-1">Minimum 10 characters. This will be shared with the buyer.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setShowRejectModal(false)} disabled={processing} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50">Cancel</button>
                <button onClick={handleReject} disabled={processing || rejectReason.trim().length < 10} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {processing ? <><Loader2 size={18} className="animate-spin mr-2" />Processing...</> : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
