import React, { useState, useEffect } from 'react';
import {
  Search, Building2, User, Clock, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Loader, MoreVertical, Eye, Ban, Check, ChevronDown
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/api';

const StatusBadge = ({ status }) => {
  const config = {
    ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700' },
    SUSPENDED: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  };
  const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

const KYCBadge = ({ status }) => {
  const config = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  };
  const { label, color } = config[status] || { label: status || 'N/A', color: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
};

const UserTypeBadge = ({ type }) => {
  const config = {
    BUYER: { label: 'Buyer', color: 'bg-blue-100 text-blue-700' },
    SELLER: { label: 'Seller', color: 'bg-green-100 text-green-700' },
    FINANCIER: { label: 'Financier', color: 'bg-purple-100 text-purple-700' },
    ADMIN: { label: 'Admin', color: 'bg-gray-800 text-white' },
  };
  const { label, color } = config[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
};

const UserDetailModal = ({ user, onClose, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);

  if (!user) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await adminService.updateUserStatus(user.id, { status: newStatus });
      onStatusUpdate();
      onClose();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                <Building2 size={24} className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{user.profile?.companyName || 'N/A'}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase">User Type</label>
              <div className="mt-1"><UserTypeBadge type={user.userType} /></div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Status</label>
              <div className="mt-1"><StatusBadge status={user.status || 'ACTIVE'} /></div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">KYC Status</label>
              <div className="mt-1"><KYCBadge status={user.profile?.kycStatus} /></div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Created</label>
              <p className="text-gray-800">{new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Profile Details */}
          {user.profile && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Business Details</h3>
              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase">PAN</label>
                  <p className="text-gray-800 font-mono">{user.profile.pan || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">GSTIN</label>
                  <p className="text-gray-800 font-mono">{user.profile.gstin || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Phone</label>
                  <p className="text-gray-800">{user.profile.phoneNumber || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Industry</label>
                  <p className="text-gray-800">{user.profile.industry || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 uppercase">Address</label>
                  <p className="text-gray-800">
                    {[user.profile.address, user.profile.city, user.profile.state, user.profile.pincode]
                      .filter(Boolean).join(', ') || '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Accounts */}
          {user.bankAccounts?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Bank Accounts</h3>
              <div className="space-y-2">
                {user.bankAccounts.map((account, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{account.bankName}</p>
                        <p className="text-sm text-gray-500 font-mono">{account.accountNo}</p>
                      </div>
                      {account.isPrimary && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Primary</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {user.status !== 'SUSPENDED' ? (
              <button
                onClick={() => handleStatusChange('SUSPENDED')}
                disabled={updating}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Ban size={16} />
                <span>{updating ? 'Updating...' : 'Suspend User'}</span>
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('ACTIVE')}
                disabled={updating}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Check size={16} />
                <span>{updating ? 'Updating...' : 'Activate User'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterType !== 'all') params.userType = filterType.toUpperCase();
      if (filterStatus !== 'all') params.status = filterStatus.toUpperCase();

      const response = await adminService.getUsers(params);
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await adminService.getUserDetails(userId);
      setSelectedUser(response.data || response);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      // Use basic user data if details fail
      const user = users.find(u => u.id === userId);
      if (user) setSelectedUser(user);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterType, filterStatus]);

  const filteredUsers = users.filter(user => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        user.email?.toLowerCase().includes(search) ||
        user.profile?.companyName?.toLowerCase().includes(search) ||
        user.profile?.pan?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const stats = {
    total: users.length,
    buyers: users.filter(u => u.userType === 'BUYER').length,
    sellers: users.filter(u => u.userType === 'SELLER').length,
    financiers: users.filter(u => u.userType === 'FINANCIER').length,
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm">View and manage all platform users</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-500 text-xs mb-1">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-500 text-xs mb-1">Buyers</p>
          <p className="text-2xl font-bold text-blue-600">{stats.buyers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-500 text-xs mb-1">Sellers</p>
          <p className="text-2xl font-bold text-green-600">{stats.sellers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-500 text-xs mb-1">Financiers</p>
          <p className="text-2xl font-bold text-purple-600">{stats.financiers}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle size={18} className="text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={fetchUsers} className="ml-auto text-red-600 hover:text-red-800 font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
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
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Types</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="financier">Financiers</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No users found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'There are no users matching your filters'}
            </p>
          </div>
        )}

        {/* Users Table */}
        {!loading && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company / User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.profile?.companyName || 'Not provided'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <UserTypeBadge type={user.userType} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={user.status || 'ACTIVE'} />
                    </td>
                    <td className="px-4 py-4">
                      <KYCBadge status={user.profile?.kycStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{formatDate(user.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => fetchUserDetails(user.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {filteredUsers.length} users
            </span>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onStatusUpdate={fetchUsers}
        />
      )}
    </AdminLayout>
  );
}
