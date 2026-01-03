import React, { useState, useEffect } from 'react';
import {
  Search, ScrollText, Clock, User, AlertCircle, RefreshCw, Loader,
  ChevronDown, ChevronUp, Filter, Calendar, Building2
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { adminService } from '../../services/api';

const ActionBadge = ({ action }) => {
  const config = {
    // User actions
    USER_CREATED: { color: 'bg-blue-100 text-blue-700' },
    USER_LOGIN: { color: 'bg-gray-100 text-gray-700' },
    USER_LOGOUT: { color: 'bg-gray-100 text-gray-700' },
    USER_STATUS_CHANGED: { color: 'bg-orange-100 text-orange-700' },

    // KYC actions
    KYC_SUBMITTED: { color: 'bg-blue-100 text-blue-700' },
    KYC_APPROVED: { color: 'bg-green-100 text-green-700' },
    KYC_REJECTED: { color: 'bg-red-100 text-red-700' },
    DOCUMENT_UPLOADED: { color: 'bg-cyan-100 text-cyan-700' },

    // Invoice actions
    INVOICE_CREATED: { color: 'bg-purple-100 text-purple-700' },
    INVOICE_SUBMITTED: { color: 'bg-blue-100 text-blue-700' },
    INVOICE_ACCEPTED: { color: 'bg-cyan-100 text-cyan-700' },
    INVOICE_OPENED_FOR_BIDDING: { color: 'bg-indigo-100 text-indigo-700' },

    // Bid actions
    BID_PLACED: { color: 'bg-purple-100 text-purple-700' },
    BID_ACCEPTED: { color: 'bg-green-100 text-green-700' },
    BID_REJECTED: { color: 'bg-red-100 text-red-700' },
    BID_WITHDRAWN: { color: 'bg-gray-100 text-gray-700' },

    // Discount actions
    DISCOUNT_OFFER_CREATED: { color: 'bg-teal-100 text-teal-700' },
    DISCOUNT_OFFER_ACCEPTED: { color: 'bg-green-100 text-green-700' },
    DISCOUNT_OFFER_REJECTED: { color: 'bg-red-100 text-red-700' },

    // Disbursement actions
    DISBURSEMENT_INITIATED: { color: 'bg-amber-100 text-amber-700' },
    DISBURSEMENT_COMPLETED: { color: 'bg-green-100 text-green-700' },
    DISBURSEMENT_FAILED: { color: 'bg-red-100 text-red-700' },

    // Repayment actions
    REPAYMENT_COMPLETED: { color: 'bg-emerald-100 text-emerald-700' },
    REPAYMENT_OVERDUE: { color: 'bg-red-100 text-red-700' },

    DEFAULT: { color: 'bg-gray-100 text-gray-700' },
  };

  const formatAction = (action) => {
    return action?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  };

  const { color } = config[action] || config.DEFAULT;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {formatAction(action)}
    </span>
  );
};

const EntityBadge = ({ entityType }) => {
  const config = {
    USER: { color: 'bg-blue-50 text-blue-600' },
    PROFILE: { color: 'bg-cyan-50 text-cyan-600' },
    INVOICE: { color: 'bg-purple-50 text-purple-600' },
    BID: { color: 'bg-indigo-50 text-indigo-600' },
    DISCOUNT_OFFER: { color: 'bg-teal-50 text-teal-600' },
    DISBURSEMENT: { color: 'bg-amber-50 text-amber-600' },
    REPAYMENT: { color: 'bg-emerald-50 text-emerald-600' },
    DOCUMENT: { color: 'bg-orange-50 text-orange-600' },
    DEFAULT: { color: 'bg-gray-50 text-gray-600' },
  };

  const { color } = config[entityType] || config.DEFAULT;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {entityType || 'N/A'}
    </span>
  );
};

const LogDetailRow = ({ log, expanded, onToggle }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatChanges = (changes) => {
    if (!changes) return null;
    try {
      const parsed = typeof changes === 'string' ? JSON.parse(changes) : changes;
      return (
        <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
          <pre className="whitespace-pre-wrap">{JSON.stringify(parsed, null, 2)}</pre>
        </div>
      );
    } catch {
      return <p className="mt-3 text-xs text-gray-500">{String(changes)}</p>;
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <User size={14} className="text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">{log.userEmail || 'System'}</p>
              <p className="text-xs text-gray-500">{log.userId?.slice(0, 8) || '-'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <ActionBadge action={log.action} />
        </td>
        <td className="px-4 py-4">
          <EntityBadge entityType={log.entityType} />
        </td>
        <td className="px-4 py-4">
          <p className="text-xs font-mono text-gray-600">{log.entityId?.slice(0, 8) || '-'}...</p>
        </td>
        <td className="px-4 py-4">
          <p className="text-sm text-gray-600">{formatDate(log.createdAt)}</p>
        </td>
        <td className="px-4 py-4 text-center">
          <button className="p-1 text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-4 py-4">
            <div className="pl-11">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Details</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">IP Address</p>
                  <p className="font-mono text-gray-800">{log.ipAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">User Agent</p>
                  <p className="text-gray-800 truncate">{log.userAgent || 'N/A'}</p>
                </div>
              </div>
              {log.changes && (
                <>
                  <h4 className="text-sm font-medium text-gray-800 mt-4 mb-2">Changes</h4>
                  {formatChanges(log.changes)}
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 100 };
      if (filterAction !== 'all') params.action = filterAction;

      const response = await adminService.getAuditLogs(params);
      setLogs(response.data || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const filteredLogs = logs.filter(log => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        log.userEmail?.toLowerCase().includes(search) ||
        log.action?.toLowerCase().includes(search) ||
        log.entityType?.toLowerCase().includes(search) ||
        log.entityId?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const actionTypes = [
    'all',
    'USER_CREATED',
    'USER_LOGIN',
    'KYC_SUBMITTED',
    'KYC_APPROVED',
    'KYC_REJECTED',
    'INVOICE_CREATED',
    'BID_PLACED',
    'BID_ACCEPTED',
    'DISBURSEMENT_COMPLETED',
  ];

  const stats = {
    total: logs.length,
    today: logs.filter(l => {
      const today = new Date().toDateString();
      return new Date(l.createdAt).toDateString() === today;
    }).length,
    userActions: logs.filter(l => l.entityType === 'USER').length,
    invoiceActions: logs.filter(l => l.entityType === 'INVOICE').length,
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
          <p className="text-gray-500 text-sm">Platform activity and change history</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Total Logs</span>
            <ScrollText size={14} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Today</span>
            <Calendar size={14} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.today}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">User Actions</span>
            <User size={14} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.userActions}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Invoice Actions</span>
            <Building2 size={14} className="text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-cyan-600">{stats.invoiceActions}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle size={18} className="text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={fetchLogs} className="ml-auto text-red-600 hover:text-red-800 font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, action, entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-72"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              {actionTypes.map(action => (
                <option key={action} value={action}>
                  {action === 'all' ? 'All Actions' : action.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading audit logs...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ScrollText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No audit logs found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'There are no audit logs matching your filters'}
            </p>
          </div>
        )}

        {/* Logs Table */}
        {!loading && filteredLogs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => (
                  <LogDetailRow
                    key={log.id}
                    log={log}
                    expanded={expandedLog === log.id}
                    onToggle={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredLogs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {filteredLogs.length} logs
            </span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
