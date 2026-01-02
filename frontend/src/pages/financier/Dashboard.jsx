import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, FileText, Clock, CheckCircle, IndianRupee,
  Calendar, Building2, ChevronRight, AlertCircle, CreditCard,
  Wallet, PieChart, Target, ArrowUpRight, ArrowDownRight,
  Briefcase, DollarSign, Timer, BarChart3, Filter, Loader2, Settings,
  Shield, Percent
} from 'lucide-react';
import { invoiceService, bidService, disbursementService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../../components/NotificationDropdown';

export default function FinancierDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);

  // Real data state
  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [disbursements, setDisbursements] = useState([]);

  const financierInfo = profile?.financier || {};
  const companyInitials = financierInfo.companyName ? financierInfo.companyName.substring(0, 2).toUpperCase() : 'FI';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [invoicesRes, bidsRes, disbursementsRes] = await Promise.all([
        invoiceService.getAvailable().catch(() => ({ data: [] })),
        bidService.getMyBids().catch(() => ({ data: [] })),
        disbursementService.list().catch(() => ({ data: [] })),
      ]);

      setAvailableInvoices(invoicesRes.data || []);
      setMyBids(bidsRes.data || []);
      setDisbursements(disbursementsRes.data || []);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const activeBids = myBids.filter(b => b.status === 'PENDING');
  const acceptedBids = myBids.filter(b => b.status === 'ACCEPTED');
  const completedDisbursements = disbursements.filter(d => d.status === 'COMPLETED');
  const pendingCollections = disbursements.filter(d => d.status === 'DISBURSED' || d.status === 'PENDING');

  const totalDisbursed = completedDisbursements.reduce((sum, d) => sum + (d.amount || 0), 0);
  const upcomingCollectionsAmount = pendingCollections.reduce((sum, d) => sum + (d.amount || 0), 0);
  const activePortfolioValue = acceptedBids.reduce((sum, b) => sum + (b.invoice?.totalAmount || 0), 0);

  const stats = {
    availableToInvest: 2.5, // This would come from financier's balance
    activePortfolio: (activePortfolioValue / 10000000).toFixed(2),
    totalDisbursed: (totalDisbursed / 10000000).toFixed(2),
    avgYield: activeBids.length > 0
      ? (activeBids.reduce((sum, b) => sum + (b.discountRate || 0), 0) / activeBids.length).toFixed(1)
      : 0,
    upcomingCollections: (upcomingCollectionsAmount / 10000000).toFixed(2),
    overdueAmount: 0 // Calculate from overdue disbursements
  };

  // Transform available invoices for marketplace highlights
  const marketplaceHighlights = availableInvoices.slice(0, 3).map(inv => {
    const daysTodue = Math.ceil((new Date(inv.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return {
      id: inv.id,
      buyer: inv.buyerName || inv.buyer?.companyName || 'Unknown Buyer',
      seller: inv.sellerName || inv.seller?.companyName || 'Unknown Seller',
      amount: inv.totalAmount || 0,
      rate: `${((inv.discountOffer?.discountPercentage || 2) - 0.5).toFixed(1)}-${((inv.discountOffer?.discountPercentage || 2) + 0.5).toFixed(1)}%`,
      dueDate: new Date(inv.dueDate).toLocaleDateString('en-IN'),
      rating: 'A', // Would come from buyer credit rating
      expiresIn: daysTodue <= 1 ? `${daysTodue * 24}h` : `${daysTodue}d`,
      invoiceId: inv.id
    };
  });

  // Transform disbursements for upcoming collections
  const upcomingCollections = pendingCollections.slice(0, 3).map(d => {
    const dueDate = d.invoice?.dueDate ? new Date(d.invoice.dueDate) : new Date();
    const daysLeft = Math.max(0, Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)));
    return {
      id: d.id,
      buyer: d.invoice?.buyerName || 'Unknown Buyer',
      amount: d.amount || 0,
      dueDate: dueDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysLeft: daysLeft,
      status: daysLeft <= 3 ? 'reminder_sent' : 'on_track'
    };
  });

  // Build recent activity from bids and disbursements
  const recentActivity = [
    ...myBids.slice(0, 2).map(b => ({
      id: `bid-${b.id}`,
      type: b.status === 'ACCEPTED' ? 'bid_won' : 'bid_placed',
      buyer: b.invoice?.buyerName || 'Unknown',
      amount: b.invoice?.totalAmount || 0,
      rate: b.discountRate,
      time: new Date(b.createdAt).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      createdAt: new Date(b.createdAt)
    })),
    ...disbursements.slice(0, 2).map(d => ({
      id: `disb-${d.id}`,
      type: d.status === 'COMPLETED' ? 'collected' : 'disbursed',
      buyer: d.invoice?.buyerName || 'Unknown',
      amount: d.amount || 0,
      time: new Date(d.createdAt).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      createdAt: new Date(d.createdAt)
    }))
  ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);

  const portfolioBreakdown = [
    { label: 'Manufacturing', value: 35, color: 'bg-blue-500' },
    { label: 'Retail', value: 28, color: 'bg-green-500' },
    { label: 'Technology', value: 22, color: 'bg-purple-500' },
    { label: 'Others', value: 15, color: 'bg-gray-400' },
  ];

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
          <Link to="/financier" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CI</span>
            </div>
            <span className="text-xl font-bold text-gray-800">CRED<span className="text-red-600">INVOICE</span></span>
            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Financier</span>
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
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{companyInitials}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{financierInfo.companyName || 'Financier'}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-1">
            <Link to="/financier" className="flex items-center space-x-3 px-3 py-2.5 bg-purple-50 text-purple-700 rounded-lg font-medium">
              <TrendingUp size={20} /><span>Dashboard</span>
            </Link>

            {/* Financing Options Section */}
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Financing Options</p>
            </div>
            <Link to="/financier/marketplace" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Percent size={20} /><span>Dynamic Discounting</span>
            </Link>
            <Link to="/financier/gst-financing" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Shield size={20} /><span>GST Financing</span>
              {availableInvoices.filter(i => i.productType === 'GST_BACKED').length > 0 && (
                <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                  {availableInvoices.filter(i => i.productType === 'GST_BACKED').length}
                </span>
              )}
            </Link>

            {/* Portfolio Section */}
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Portfolio</p>
            </div>
            <Link to="/financier/bids" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <CreditCard size={20} /><span>My Bids</span>
              {activeBids.length > 0 && (
                <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{activeBids.length}</span>
              )}
            </Link>
            <Link to="/financier/portfolio" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Briefcase size={20} /><span>Investments</span>
            </Link>
            <Link to="/financier/collections" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Wallet size={20} /><span>Collections</span>
              {pendingCollections.length > 0 && (
                <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{pendingCollections.length}</span>
              )}
            </Link>
            <Link to="/financier" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <BarChart3 size={20} /><span>Reports</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {financierInfo.contactName || user?.email?.split('@')[0] || 'User'}</h1>
              <p className="text-gray-500 text-sm">Here's your investment overview</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisQuarter">This Quarter</option>
              </select>
              <button
                onClick={() => navigate('/financier/marketplace')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium flex items-center space-x-2"
              >
                <Target size={18} />
                <span>Browse Marketplace</span>
              </button>
            </div>
          </div>

          {/* Alert for new opportunities */}
          {availableInvoices.length > 0 && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Target size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">{availableInvoices.length} invoice(s) available in marketplace</p>
                  <p className="text-sm text-green-600">
                    Total value: ₹{(availableInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0) / 10000000).toFixed(2)} Cr
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/financier/marketplace')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                View Opportunities
              </button>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Available to Invest</span>
                <Wallet size={14} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">₹{stats.availableToInvest}<span className="text-sm font-normal text-gray-500">Cr</span></p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Active Portfolio</span>
                <Briefcase size={14} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">₹{stats.activePortfolio}<span className="text-sm font-normal text-gray-500">Cr</span></p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Total Disbursed</span>
                <TrendingUp size={14} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">₹{stats.totalDisbursed}<span className="text-sm font-normal text-gray-500">Cr</span></p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Avg. Yield</span>
                <BarChart3 size={14} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.avgYield}%<span className="text-sm font-normal text-gray-500">p.a.</span></p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Upcoming Collections</span>
                <Calendar size={14} className="text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">₹{stats.upcomingCollections}<span className="text-sm font-normal text-gray-500">Cr</span></p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Active Bids</span>
                <CreditCard size={14} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{activeBids.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Marketplace Highlights */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Top Opportunities</h2>
                <button onClick={() => navigate('/financier/marketplace')} className="text-purple-600 text-sm font-medium hover:text-purple-700">View All →</button>
              </div>
              {marketplaceHighlights.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Target size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No invoices available for bidding</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {marketplaceHighlights.map(item => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Building2 size={24} className="text-purple-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-800">{item.buyer}</p>
                              <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">{item.rating}</span>
                            </div>
                            <p className="text-sm text-gray-500">Seller: {item.seller}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-800">₹{(item.amount / 100000).toFixed(1)}L</p>
                          <p className="text-xs text-gray-500">Invoice Value</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-green-600">{item.rate}</p>
                          <p className="text-xs text-gray-500">Expected Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-orange-600">{item.expiresIn}</p>
                          <p className="text-xs text-gray-500">Expires</p>
                        </div>
                        <button
                          onClick={() => navigate(`/financier/marketplace/${item.invoiceId}`)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
                        >
                          Place Bid
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Portfolio by Sector</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#E5E7EB" strokeWidth="16" />
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#3B82F6" strokeWidth="16"
                        strokeDasharray={`${35 * 3.52} ${65 * 3.52}`} />
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#22C55E" strokeWidth="16"
                        strokeDasharray={`${28 * 3.52} ${72 * 3.52}`} strokeDashoffset={`${-35 * 3.52}`} />
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#8B5CF6" strokeWidth="16"
                        strokeDasharray={`${22 * 3.52} ${78 * 3.52}`} strokeDashoffset={`${-63 * 3.52}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-gray-800">₹{stats.activePortfolio}Cr</span>
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {portfolioBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Upcoming Collections */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Upcoming Collections</h2>
                <button onClick={() => navigate('/financier/collections')} className="text-purple-600 text-sm font-medium hover:text-purple-700">View All →</button>
              </div>
              {upcomingCollections.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Wallet size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No upcoming collections</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {upcomingCollections.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.status === 'on_track' ? 'bg-green-100' : 'bg-orange-100'
                        }`}>
                          {item.status === 'on_track' ? (
                            <CheckCircle size={18} className="text-green-600" />
                          ) : (
                            <Clock size={18} className="text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.buyer}</p>
                          <p className="text-sm text-gray-500">{item.dueDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">₹{(item.amount / 100000).toFixed(2)}L</p>
                        <p className={`text-xs ${item.daysLeft <= 5 ? 'text-orange-600' : 'text-gray-500'}`}>
                          {item.daysLeft} days left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Recent Activity</h2>
              </div>
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'disbursed' ? 'bg-blue-100' :
                        activity.type === 'bid_won' ? 'bg-green-100' :
                        activity.type === 'collected' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        {activity.type === 'disbursed' && <ArrowUpRight size={18} className="text-blue-600" />}
                        {activity.type === 'bid_won' && <CheckCircle size={18} className="text-green-600" />}
                        {activity.type === 'collected' && <ArrowDownRight size={18} className="text-purple-600" />}
                        {activity.type === 'bid_placed' && <CreditCard size={18} className="text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {activity.type === 'disbursed' && `Disbursed to ${activity.buyer}`}
                          {activity.type === 'bid_won' && `Won bid for ${activity.buyer} @ ${activity.rate}%`}
                          {activity.type === 'collected' && `Collected from ${activity.buyer}`}
                          {activity.type === 'bid_placed' && `Placed bid for ${activity.buyer} @ ${activity.rate}%`}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <span className={`font-semibold text-sm ${
                        activity.type === 'collected' ? 'text-green-600' : 'text-gray-800'
                      }`}>
                        {activity.type === 'collected' ? '+' : ''}₹{(activity.amount / 100000).toFixed(2)}L
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
