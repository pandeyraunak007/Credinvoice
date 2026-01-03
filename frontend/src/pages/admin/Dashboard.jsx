import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Shield, FileText, IndianRupee, Clock, AlertCircle, TrendingUp,
  TrendingDown, ArrowRight, Building2, Loader, RefreshCw, Briefcase, PiggyBank
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { adminService, analyticsService } from '../../services/api';

const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

const StatCard = ({ icon: Icon, label, value, change, changeType, color, link }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    red: 'bg-red-50 text-red-600',
  };

  const content = (
    <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-xs font-medium ${
            changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {changeType === 'positive' ? <TrendingUp size={14} className="mr-1" /> :
             changeType === 'negative' ? <TrendingDown size={14} className="mr-1" /> : null}
            {change}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
};

const UserBreakdownCard = ({ buyers, sellers, financiers }) => {
  const total = (buyers || 0) + (sellers || 0) + (financiers || 0);

  const data = [
    { label: 'Buyers', value: buyers || 0, color: 'bg-blue-500', percent: total ? ((buyers || 0) / total * 100).toFixed(1) : 0 },
    { label: 'Sellers', value: sellers || 0, color: 'bg-green-500', percent: total ? ((sellers || 0) / total * 100).toFixed(1) : 0 },
    { label: 'Financiers', value: financiers || 0, color: 'bg-purple-500', percent: total ? ((financiers || 0) / total * 100).toFixed(1) : 0 },
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">User Breakdown</h3>
        <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
          View all <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full overflow-hidden flex mb-4 bg-gray-100">
        {data.map((item, i) => (
          <div
            key={i}
            className={`${item.color} transition-all duration-500`}
            style={{ width: `${item.percent}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-800">{item.value}</span>
              <span className="text-xs text-gray-500">({item.percent}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon: Icon, title, description, count, link, color }) => {
  const colorClasses = {
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
  };

  return (
    <Link
      to={link}
      className={`block p-4 rounded-xl border-2 ${colorClasses[color]} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Icon size={24} />
          <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm opacity-80">{description}</p>
          </div>
        </div>
        {count > 0 && (
          <span className="px-3 py-1 bg-white/80 rounded-full text-lg font-bold">{count}</span>
        )}
      </div>
    </Link>
  );
};

const RecentActivityItem = ({ action, user, entity, time }) => {
  const actionColors = {
    KYC_APPROVED: 'bg-green-100 text-green-700',
    KYC_REJECTED: 'bg-red-100 text-red-700',
    USER_CREATED: 'bg-blue-100 text-blue-700',
    INVOICE_CREATED: 'bg-purple-100 text-purple-700',
    BID_PLACED: 'bg-cyan-100 text-cyan-700',
    DISBURSEMENT_COMPLETED: 'bg-emerald-100 text-emerald-700',
    DEFAULT: 'bg-gray-100 text-gray-700',
  };

  const formatAction = (action) => {
    return action?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'Activity';
  };

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`px-2 py-1 rounded text-xs font-medium ${actionColors[action] || actionColors.DEFAULT}`}>
        {formatAction(action)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate">
          {user || 'System'} - {entity || 'N/A'}
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [platformSummary, setPlatformSummary] = useState({});

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dashboard stats and audit logs in parallel
      const [dashboardRes, auditRes, summaryRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAuditLogs({ limit: 10 }),
        analyticsService.getAdminPlatformSummary('month').catch(() => ({})),
      ]);

      setStats(dashboardRes.data || dashboardRes);
      setRecentActivity(auditRes.data || []);
      setPlatformSummary(summaryRes.data || {});
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Platform overview and key metrics">
        <div className="flex items-center justify-center py-20">
          <Loader size={32} className="animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Platform overview and key metrics</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle size={18} className="text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={fetchDashboardData} className="ml-auto text-red-600 hover:text-red-800 font-medium">
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers || 0}
          color="blue"
          link="/admin/users"
        />
        <StatCard
          icon={Shield}
          label="Pending KYC"
          value={stats.pendingKyc || 0}
          color="orange"
          link="/admin/kyc"
        />
        <StatCard
          icon={FileText}
          label="Total Invoices"
          value={stats.totalInvoices || 0}
          color="purple"
          link="/admin/invoices"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Disbursed"
          value={formatCurrency(stats.totalDisbursed)}
          color="green"
          link="/admin/transactions"
        />
        <StatCard
          icon={Clock}
          label="Open for Bidding"
          value={stats.openForBidding || 0}
          color="cyan"
          link="/admin/invoices"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Repayments"
          value={stats.pendingRepayments || 0}
          color="red"
          link="/admin/transactions"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <QuickActionCard
          icon={Shield}
          title="KYC Applications"
          description="Review pending applications"
          count={stats.pendingKyc}
          link="/admin/kyc"
          color="yellow"
        />
        <QuickActionCard
          icon={AlertCircle}
          title="Pending Repayments"
          description="Track overdue payments"
          count={stats.pendingRepayments}
          link="/admin/transactions"
          color="red"
        />
        <QuickActionCard
          icon={FileText}
          title="Open Invoices"
          description="Invoices awaiting bids"
          count={stats.openForBidding}
          link="/admin/invoices"
          color="blue"
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Breakdown */}
        <UserBreakdownCard
          buyers={stats.buyerCount || stats.usersByType?.BUYER || 0}
          sellers={stats.sellerCount || stats.usersByType?.SELLER || 0}
          financiers={stats.financierCount || stats.usersByType?.FINANCIER || 0}
        />

        {/* Platform Summary */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">This Month</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">New Users</span>
              </div>
              <span className="font-semibold text-gray-800">{platformSummary.newUsers || stats.newUsersThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-purple-600" />
                </div>
                <span className="text-sm text-gray-600">New Invoices</span>
              </div>
              <span className="font-semibold text-gray-800">{platformSummary.newInvoices || stats.newInvoicesThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <IndianRupee size={16} className="text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Volume</span>
              </div>
              <span className="font-semibold text-gray-800">{formatCurrency(platformSummary.totalVolume || stats.volumeThisMonth || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                  <Briefcase size={16} className="text-cyan-600" />
                </div>
                <span className="text-sm text-gray-600">Active Bids</span>
              </div>
              <span className="font-semibold text-gray-800">{platformSummary.activeBids || stats.activeBids || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
            <Link to="/admin/audit-logs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              View all <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, i) => (
                <RecentActivityItem
                  key={i}
                  action={activity.action}
                  user={activity.userEmail || activity.user?.email}
                  entity={activity.entityType}
                  time={formatDate(activity.createdAt)}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
