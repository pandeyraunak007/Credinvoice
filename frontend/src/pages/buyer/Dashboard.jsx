import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, FileText, TrendingUp, Clock, CreditCard, Users, AlertCircle,
  ChevronRight, Download, Building2, IndianRupee, CheckCircle, BarChart3, Loader2, Settings
} from 'lucide-react';
import { invoiceService, discountService, disbursementService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../../components/NotificationDropdown';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);

  // Real data state
  const [invoices, setInvoices] = useState([]);
  const [discountOffers, setDiscountOffers] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [kpis, setKpis] = useState({
    activeInvoices: 0,
    totalUpcoming: 0,
    discountsCaptured: 0,
    pendingActions: 0,
    upcomingRepayments: 0
  });

  const buyerInfo = profile?.buyer || {};
  const companyInitials = buyerInfo.companyName ? buyerInfo.companyName.substring(0, 2).toUpperCase() : 'BU';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [invoicesRes, offersRes, disbursementsRes, repaymentsRes] = await Promise.all([
        invoiceService.list(),
        discountService.getMyOffers().catch(() => ({ data: [] })),
        disbursementService.list().catch(() => ({ data: [] })),
        disbursementService.getUpcomingRepayments().catch(() => ({ data: [] })),
      ]);

      const invoiceData = invoicesRes.data?.invoices || invoicesRes.data || [];
      const offersData = offersRes.data || [];
      const disbursementData = disbursementsRes.data || [];
      const repaymentData = repaymentsRes.data?.repayments || repaymentsRes.data || [];

      setInvoices(invoiceData);
      setDiscountOffers(offersData);
      setDisbursements(disbursementData);
      setRepayments(repaymentData);

      // Calculate KPIs from real data
      const activeCount = invoiceData.filter(inv =>
        !['SETTLED', 'CANCELLED', 'REJECTED'].includes(inv.status)
      ).length;

      const upcomingPayments = invoiceData
        .filter(inv => ['ACCEPTED', 'BID_SELECTED', 'DISBURSED'].includes(inv.status))
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      const completedDisbursements = disbursementData.filter(d => d.status === 'COMPLETED');
      const discountSavings = completedDisbursements.reduce((sum, d) => {
        const originalAmount = d.invoice?.totalAmount || 0;
        const paidAmount = d.amount || 0;
        return sum + (originalAmount - paidAmount);
      }, 0);

      const pendingCount = invoiceData.filter(inv =>
        ['PENDING_ACCEPTANCE', 'OPEN_FOR_BIDDING', 'ACCEPTED'].includes(inv.status)
      ).length;

      // Calculate upcoming repayments total
      const upcomingRepaymentTotal = repaymentData
        .filter(r => r.status === 'PENDING')
        .reduce((sum, r) => sum + (r.amount || 0), 0);

      setKpis({
        activeInvoices: activeCount,
        totalUpcoming: (upcomingPayments / 10000000).toFixed(2), // In Crores
        discountsCaptured: (discountSavings / 100000).toFixed(1), // In Lakhs
        pendingActions: pendingCount,
        upcomingRepayments: (upcomingRepaymentTotal / 100000).toFixed(1) // In Lakhs
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build pending actions from real data
  const pendingActions = invoices
    .filter(inv => ['PENDING_ACCEPTANCE', 'OPEN_FOR_BIDDING', 'ACCEPTED'].includes(inv.status))
    .slice(0, 5)
    .map(inv => {
      const daysRemaining = Math.ceil((new Date(inv.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

      if (inv.status === 'PENDING_ACCEPTANCE') {
        return {
          id: inv.id,
          type: 'acceptance',
          seller: inv.sellerName || inv.seller?.companyName || 'Unknown Seller',
          amount: (inv.totalAmount / 100000).toFixed(1),
          days: daysRemaining,
          urgent: daysRemaining <= 3,
          invoiceId: inv.id
        };
      } else if (inv.status === 'OPEN_FOR_BIDDING') {
        return {
          id: inv.id,
          type: 'bid_review',
          seller: inv.sellerName || inv.seller?.companyName || 'Unknown Seller',
          amount: (inv.totalAmount / 100000).toFixed(1),
          bids: inv._count?.bids || inv.bids?.length || 0,
          expires: `${Math.max(0, daysRemaining)}d`,
          invoiceId: inv.id
        };
      } else if (inv.status === 'ACCEPTED' && inv.discountOffer?.status === 'ACCEPTED' && !inv.discountOffer?.fundingType) {
        return {
          id: inv.id,
          type: 'funding_choice',
          seller: inv.sellerName || inv.seller?.companyName || 'Unknown Seller',
          amount: (inv.totalAmount / 100000).toFixed(1),
          status: 'choose_funding',
          invoiceId: inv.id
        };
      } else {
        return {
          id: inv.id,
          type: 'payment',
          seller: inv.sellerName || inv.seller?.companyName || 'Unknown Seller',
          amount: (inv.totalAmount / 100000).toFixed(1),
          status: 'ready',
          invoiceId: inv.id
        };
      }
    });

  // Build recent payments from real disbursement data
  const recentPayments = disbursements
    .filter(d => d.status === 'COMPLETED')
    .slice(0, 5)
    .map(d => ({
      id: d.id,
      seller: d.invoice?.sellerName || 'Unknown Seller',
      amount: ((d.amount || 0) / 100000).toFixed(1),
      date: new Date(d.completedAt || d.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      type: d.payerType === 'BUYER' ? 'Self-Funded' : 'Financier'
    }));

  // Build upcoming repayments list
  const upcomingRepaymentsList = repayments
    .filter(r => r.status === 'PENDING' || r.status === 'OVERDUE')
    .slice(0, 5)
    .map(r => {
      const dueDate = new Date(r.dueDate);
      const today = new Date();
      const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return {
        id: r.id,
        invoiceId: r.disbursement?.invoice?.id,
        invoiceNumber: r.disbursement?.invoice?.invoiceNumber || 'N/A',
        financier: r.disbursement?.financier?.companyName || 'Unknown Financier',
        amount: ((r.amount || 0) / 100000).toFixed(1),
        dueDate: dueDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        daysLeft: daysLeft,
        status: r.status,
        isOverdue: daysLeft < 0 || r.status === 'OVERDUE'
      };
    });

  // Build alerts from real data
  const urgentAlerts = [];
  const expiringBids = invoices.filter(inv =>
    inv.status === 'OPEN_FOR_BIDDING' &&
    Math.ceil((new Date(inv.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 1
  );
  if (expiringBids.length > 0) {
    urgentAlerts.push({ id: 1, message: `${expiringBids.length} invoice(s) with bids expiring soon`, type: 'warning' });
  }

  const pendingLong = invoices.filter(inv =>
    inv.status === 'PENDING_ACCEPTANCE' &&
    Math.ceil((new Date() - new Date(inv.createdAt)) / (1000 * 60 * 60 * 24)) > 3
  );
  if (pendingLong.length > 0) {
    urgentAlerts.push({ id: 2, message: `${pendingLong.length} invoice(s) pending acceptance >3 days`, type: 'info' });
  }

  const openForBiddingCount = invoices.filter(inv => inv.status === 'OPEN_FOR_BIDDING').length;
  const pendingAcceptanceCount = invoices.filter(inv => inv.status === 'PENDING_ACCEPTANCE').length;

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
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CI</span>
            </div>
            <span className="text-xl font-bold text-gray-800">CRED<span className="text-red-600">INVOICE</span></span>
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
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{companyInitials}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{buyerInfo.companyName || 'Buyer'}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-1">
            <Link to="/" className="flex items-center space-x-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
              <TrendingUp size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <FileText size={20} />
              <span>Invoices</span>
              {invoices.length > 0 && (
                <span className="ml-auto bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{invoices.length}</span>
              )}
            </Link>
            <Link to="/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <CreditCard size={20} />
              <span>Discount Offers</span>
              {pendingAcceptanceCount > 0 && (
                <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{pendingAcceptanceCount}</span>
              )}
            </Link>
            <Link to="/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Clock size={20} />
              <span>Bidding</span>
              {openForBiddingCount > 0 && (
                <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{openForBiddingCount}</span>
              )}
            </Link>
            <Link to="/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Users size={20} />
              <span>My Vendors</span>
            </Link>
            <Link to="/analytics" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <BarChart3 size={20} />
              <span>Analytics</span>
            </Link>
            <Link to="/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Building2 size={20} />
              <span>Reports</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {buyerInfo.contactName || user?.email?.split('@')[0] || 'User'}</h1>
              <p className="text-gray-500 text-sm">Here's what's happening with your supply chain finance</p>
            </div>
            <button
              onClick={() => navigate('/invoices/create')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={20} />
              <span>Create Invoice</span>
            </button>
          </div>

          {/* Urgent Alerts */}
          {urgentAlerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {urgentAlerts.map(alert => (
                <div key={alert.id} className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <AlertCircle size={18} className={alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'} />
                  <span className={`text-sm font-medium ${alert.type === 'warning' ? 'text-amber-800' : 'text-blue-800'}`}>{alert.message}</span>
                  <button
                    onClick={() => navigate('/invoices')}
                    className={`ml-auto text-sm font-medium ${alert.type === 'warning' ? 'text-amber-700 hover:text-amber-900' : 'text-blue-700 hover:text-blue-900'}`}
                  >
                    View →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option>All Sellers</option>
              {[...new Set(invoices.map(inv => inv.sellerName || inv.seller?.companyName).filter(Boolean))].map(seller => (
                <option key={seller}>{seller}</option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="thisMonth">This Month</option>
              <option value="last30">Last 30 Days</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Active Invoices</span>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{kpis.activeInvoices}</p>
              <p className="text-gray-500 text-sm mt-1">In progress</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Upcoming Payments</span>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <IndianRupee size={16} className="text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">₹{kpis.totalUpcoming} <span className="text-lg font-normal text-gray-500">Cr</span></p>
              <p className="text-gray-500 text-sm mt-1">Due in next 30 days</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Discounts Captured</span>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">₹{kpis.discountsCaptured} <span className="text-lg font-normal text-gray-500">L</span></p>
              <p className="text-gray-500 text-sm mt-1">Total savings</p>
            </div>

            <div
              onClick={() => navigate('/invoices')}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative cursor-pointer hover:border-red-300 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Pending Actions</span>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle size={16} className="text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-600">{kpis.pendingActions}</p>
              <p className="text-red-500 text-sm mt-1">Require your attention</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => navigate('/invoices/create')}
              className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-sm"
            >
              <Plus size={20} />
              <span className="font-medium">Start Dynamic Discounting</span>
            </button>
            <button
              onClick={() => navigate('/invoices')}
              className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <Clock size={20} />
              <span className="font-medium">View Active Bids</span>
              {openForBiddingCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{openForBiddingCount}</span>
              )}
            </button>
            <button
              onClick={() => navigate('/invoices')}
              className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <CreditCard size={20} />
              <span className="font-medium">Pending Approvals</span>
              {pendingAcceptanceCount > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingAcceptanceCount}</span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Pending Actions */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Pending Actions</h2>
                <Link to="/invoices" className="text-blue-600 text-sm font-medium hover:text-blue-700">View All →</Link>
              </div>
              {pendingActions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                  <p>No pending actions. You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingActions.map(action => (
                    <div
                      key={action.id}
                      onClick={() => {
                        if (action.type === 'bid_review') {
                          navigate(`/invoices/${action.invoiceId}/bids`);
                        } else {
                          navigate(`/invoices/${action.invoiceId}`);
                        }
                      }}
                      className="p-4 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            action.type === 'acceptance' ? 'bg-orange-100' :
                            action.type === 'bid_review' ? 'bg-blue-100' :
                            action.type === 'funding_choice' ? 'bg-purple-100' : 'bg-green-100'
                          }`}>
                            {action.type === 'acceptance' && <Clock size={18} className="text-orange-600" />}
                            {action.type === 'bid_review' && <CreditCard size={18} className="text-blue-600" />}
                            {action.type === 'funding_choice' && <CreditCard size={18} className="text-purple-600" />}
                            {action.type === 'payment' && <CheckCircle size={18} className="text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{action.seller}</p>
                            <p className="text-sm text-gray-500">
                              {action.type === 'acceptance' && `Pending seller acceptance • ${action.days} days to due`}
                              {action.type === 'bid_review' && `${action.bids} bids received • Expires in ${action.expires}`}
                              {action.type === 'funding_choice' && 'Seller accepted • Choose funding type'}
                              {action.type === 'payment' && 'Ready to authorize payment'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-gray-800">₹{action.amount}L</span>
                          {action.urgent && (
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Urgent</span>
                          )}
                          <ChevronRight size={20} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Recent Payments</h2>
                <Link to="/invoices" className="text-blue-600 text-sm font-medium hover:text-blue-700">View All →</Link>
              </div>
              {recentPayments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <IndianRupee size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No payments yet</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {recentPayments.map(payment => (
                    <div key={payment.id} className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        payment.type === 'Self-Funded' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {payment.type === 'Self-Funded' ? (
                          <Building2 size={16} className="text-blue-600" />
                        ) : (
                          <CreditCard size={16} className="text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{payment.seller}</p>
                        <p className="text-xs text-gray-500">{payment.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 text-sm">₹{payment.amount}L</p>
                        <p className="text-xs text-green-600">{payment.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Repayments Section */}
          {upcomingRepaymentsList.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">Upcoming Repayments</h2>
                    <p className="text-sm text-gray-500">Financier-funded invoices to be repaid</p>
                  </div>
                </div>
                {parseFloat(kpis.upcomingRepayments) > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Due</p>
                    <p className="text-xl font-bold text-orange-600">₹{kpis.upcomingRepayments}L</p>
                  </div>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingRepaymentsList.map(repayment => (
                  <div
                    key={repayment.id}
                    onClick={() => repayment.invoiceId && navigate(`/invoices/${repayment.invoiceId}`)}
                    className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                      repayment.isOverdue ? 'bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          repayment.isOverdue ? 'bg-red-100' : 'bg-orange-100'
                        }`}>
                          {repayment.isOverdue ? (
                            <AlertCircle size={18} className="text-red-600" />
                          ) : (
                            <Clock size={18} className="text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{repayment.invoiceNumber}</p>
                          <p className="text-sm text-gray-500">
                            To: {repayment.financier}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">₹{repayment.amount}L</p>
                          <p className={`text-sm ${repayment.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {repayment.isOverdue
                              ? `${Math.abs(repayment.daysLeft)} days overdue`
                              : `Due: ${repayment.dueDate}`}
                          </p>
                        </div>
                        {repayment.isOverdue && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                            Overdue
                          </span>
                        )}
                        {!repayment.isOverdue && repayment.daysLeft <= 3 && (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                            Due Soon
                          </span>
                        )}
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
