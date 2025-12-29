import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Filter, Building2, User, Clock, CheckCircle, XCircle,
  AlertCircle, Eye, ChevronRight, RefreshCw, Download, Calendar,
  FileText, Shield, TrendingUp, BarChart3, Users, Bell, Loader, LogOut
} from 'lucide-react';
import { adminService, authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-100 text-purple-700' },
    APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  };
  const { label, color } = config[status] || config.PENDING;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

const EntityTypeBadge = ({ type }) => {
  const config = {
    BUYER: { label: 'Buyer', color: 'bg-blue-100 text-blue-700' },
    SELLER: { label: 'Seller', color: 'bg-green-100 text-green-700' },
    FINANCIER: { label: 'Financier', color: 'bg-purple-100 text-purple-700' },
  };
  const { label, color } = config[type] || config.BUYER;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
};

export default function AdminKYCQueue() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('all');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeTab !== 'all') {
        params.status = activeTab.toUpperCase();
      }
      if (filterEntityType !== 'all') {
        params.userType = filterEntityType.toUpperCase();
      }

      const response = await adminService.getKycApplications(params);
      setApplications(response.data || []);

      // Calculate stats
      const all = response.data || [];
      setStats({
        pending: all.filter(a => a.kycStatus === 'PENDING' || a.kycStatus === 'SUBMITTED').length,
        approved: all.filter(a => a.kycStatus === 'APPROVED').length,
        rejected: all.filter(a => a.kycStatus === 'REJECTED').length,
        total: all.length
      });
    } catch (err) {
      console.error('Failed to fetch KYC applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab, filterEntityType]);

  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        app.companyName?.toLowerCase().includes(search) ||
        app.email?.toLowerCase().includes(search) ||
        app.pan?.toLowerCase().includes(search) ||
        app.gstin?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CI</span>
            </div>
            <span className="text-xl font-bold text-gray-800">CRED<span className="text-red-600">INVOICE</span></span>
            <span className="ml-2 px-2 py-0.5 bg-gray-800 text-white text-xs rounded-full font-medium">Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              {stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AD</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-1">
            <Link to="/admin" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <TrendingUp size={20} /><span>Dashboard</span>
            </Link>
            <Link to="/admin/kyc" className="flex items-center space-x-3 px-3 py-2.5 bg-gray-100 text-gray-900 rounded-lg font-medium">
              <Shield size={20} /><span>KYC Review</span>
              {stats.pending > 0 && (
                <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{stats.pending}</span>
              )}
            </Link>
            <Link to="/admin/users" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Users size={20} /><span>Users</span>
            </Link>
            <Link to="/admin/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <FileText size={20} /><span>Invoices</span>
            </Link>
            <Link to="/admin/reports" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <BarChart3 size={20} /><span>Reports</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">KYC Review Queue</h1>
              <p className="text-gray-500 text-sm">Review and approve KYC applications</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchApplications}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">Total Applications</span>
                <Users size={14} className="text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">Pending Review</span>
                <Clock size={14} className="text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">Approved</span>
                <CheckCircle size={14} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">Rejected</span>
                <XCircle size={14} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle size={18} className="text-red-600" />
              <span className="text-red-700">{error}</span>
              <button onClick={fetchApplications} className="ml-auto text-red-600 hover:text-red-800 font-medium">
                Retry
              </button>
            </div>
          )}

          {/* Tabs and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'approved', label: 'Approved' },
                  { key: 'rejected', label: 'Rejected' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeTab === tab.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, PAN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
                  />
                </div>
                <select
                  value={filterEntityType}
                  onChange={(e) => setFilterEntityType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="buyer">Buyers</option>
                  <option value="seller">Sellers</option>
                  <option value="financier">Financiers</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader size={32} className="animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading applications...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredApplications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">No applications found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'There are no KYC applications to review'}
                </p>
              </div>
            )}

            {/* Applications Table */}
            {!loading && filteredApplications.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PAN / GSTIN</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredApplications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 size={18} className="text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{app.companyName || 'Not provided'}</p>
                              <p className="text-xs text-gray-500">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <EntityTypeBadge type={app.entityType} />
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-mono text-gray-800">{app.pan || '-'}</p>
                            <p className="text-xs text-gray-500 font-mono">{app.gstin || '-'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full w-20">
                              <div
                                className={`h-full rounded-full ${
                                  app.documentsCount === 0 ? 'bg-gray-300' :
                                  app.verifiedDocs === app.documentsCount ? 'bg-green-500' :
                                  app.pendingDocs > 0 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${app.documentsCount ? (app.verifiedDocs / app.documentsCount) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {app.verifiedDocs}/{app.documentsCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">{formatDate(app.createdAt)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={app.kycStatus} />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => navigate(`/admin/kyc/${app.id}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredApplications.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Showing {filteredApplications.length} applications
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
