import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Building2, User, Clock, CheckCircle, XCircle, 
  AlertCircle, Eye, ChevronRight, RefreshCw, Download, Calendar,
  FileText, Shield, TrendingUp, BarChart3, Users, Bell
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700' },
    in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-700' },
    verified: { label: 'Verified', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
    resubmit: { label: 'Resubmission', color: 'bg-orange-100 text-orange-700' },
  };
  const { label, color } = config[status] || config.pending;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

const PriorityBadge = ({ priority }) => {
  const config = {
    high: { label: 'High', color: 'bg-red-100 text-red-700' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  };
  const { label, color } = config[priority] || config.medium;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
};

const EntityTypeBadge = ({ type }) => {
  const config = {
    buyer: { label: 'Buyer', color: 'bg-blue-100 text-blue-700' },
    seller: { label: 'Seller', color: 'bg-green-100 text-green-700' },
    financier: { label: 'Financier', color: 'bg-purple-100 text-purple-700' },
  };
  const { label, color } = config[type] || config.buyer;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
};

export default function AdminKYCQueue() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const stats = {
    pending: 23,
    inReview: 8,
    verifiedToday: 15,
    rejectedToday: 3,
    avgProcessingTime: '4.2 hrs',
    slaBreaches: 2
  };

  const applications = [
    {
      id: 'KYC-2024-00245', entityName: 'TechCorp Solutions Pvt Ltd', entityType: 'buyer',
      applicationType: 'company', pan: 'AABCT1234M', gstin: '29AABCT1234M1ZQ',
      submittedAt: '2024-12-28 10:30 AM', status: 'pending', priority: 'high',
      assignedTo: null, documentsCount: 8, verifiedDocs: 5, flaggedDocs: 1,
      turnover: '₹25 Cr', industry: 'Technology'
    },
    {
      id: 'KYC-2024-00244', entityName: 'Steel Manufacturing Co', entityType: 'seller',
      applicationType: 'company', pan: 'AABCS5678N', gstin: '27AABCS5678N1ZR',
      submittedAt: '2024-12-28 09:15 AM', status: 'in_review', priority: 'medium',
      assignedTo: 'Priya Sharma', documentsCount: 8, verifiedDocs: 6, flaggedDocs: 0,
      turnover: '₹50 Cr', industry: 'Manufacturing'
    },
    {
      id: 'KYC-2024-00243', entityName: 'Kumar Textiles Pvt Ltd', entityType: 'seller',
      applicationType: 'company', pan: 'AABCK1234L', gstin: '27AABCK1234L1ZM',
      submittedAt: '2024-12-28 08:45 AM', status: 'resubmit', priority: 'medium',
      assignedTo: 'Amit Kumar', documentsCount: 8, verifiedDocs: 7, flaggedDocs: 1,
      turnover: '₹10 Cr', industry: 'Textiles', resubmitReason: 'Aadhaar image blurred'
    },
    {
      id: 'KYC-2024-00242', entityName: 'Urban Finance Ltd', entityType: 'financier',
      applicationType: 'nbfc', pan: 'AABCU9012P', gstin: '27AABCU9012P1ZS',
      submittedAt: '2024-12-27 04:30 PM', status: 'pending', priority: 'high',
      assignedTo: null, documentsCount: 12, verifiedDocs: 8, flaggedDocs: 2,
      turnover: '₹200 Cr', industry: 'Financial Services', rbiLicense: 'NBFC-ND-00123'
    },
    {
      id: 'KYC-2024-00241', entityName: 'Retail Plus India', entityType: 'buyer',
      applicationType: 'company', pan: 'AABCR3456Q', gstin: '33AABCR3456Q1ZT',
      submittedAt: '2024-12-27 03:00 PM', status: 'verified', priority: 'low',
      assignedTo: 'Rahul Mehta', documentsCount: 8, verifiedDocs: 8, flaggedDocs: 0,
      turnover: '₹15 Cr', industry: 'Retail', verifiedAt: '2024-12-28 11:00 AM'
    },
    {
      id: 'KYC-2024-00240', entityName: 'Auto Parts Trading', entityType: 'seller',
      applicationType: 'partnership', pan: 'AABCA7890R', gstin: '29AABCA7890R1ZU',
      submittedAt: '2024-12-27 02:00 PM', status: 'rejected', priority: 'medium',
      assignedTo: 'Priya Sharma', documentsCount: 6, verifiedDocs: 3, flaggedDocs: 3,
      turnover: '₹5 Cr', industry: 'Automobiles', rejectionReason: 'PAN mismatch with entity name'
    },
  ];

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'pending' && !['pending', 'in_review'].includes(app.status)) return false;
    if (activeTab === 'resubmit' && app.status !== 'resubmit') return false;
    if (activeTab === 'completed' && !['verified', 'rejected'].includes(app.status)) return false;
    if (filterEntityType !== 'all' && app.entityType !== filterEntityType) return false;
    if (filterPriority !== 'all' && app.priority !== filterPriority) return false;
    if (searchTerm && !app.entityName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !app.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !app.pan.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

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
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{stats.slaBreaches}</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AD</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
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
              <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{stats.pending}</span>
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
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={18} />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">Pending</span>
                <Clock size={14} className="text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">In Review</span>
                <Eye size={14} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.inReview}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">Verified Today</span>
                <CheckCircle size={14} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.verifiedToday}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">Rejected Today</span>
                <XCircle size={14} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.rejectedToday}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">Avg. Time</span>
                <Clock size={14} className="text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.avgProcessingTime}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">SLA Breaches</span>
                <AlertCircle size={14} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.slaBreaches}</p>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex space-x-2">
                {[
                  { key: 'pending', label: 'Pending', count: applications.filter(a => ['pending', 'in_review'].includes(a.status)).length },
                  { key: 'resubmit', label: 'Resubmission', count: applications.filter(a => a.status === 'resubmit').length },
                  { key: 'completed', label: 'Completed', count: applications.filter(a => ['verified', 'rejected'].includes(a.status)).length },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeTab === tab.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or PAN..."
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
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <PriorityBadge priority={app.priority} />
                          <div>
                            <p className="font-medium text-gray-800">{app.id}</p>
                            <p className="text-xs text-gray-500">{app.industry} • {app.turnover}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Building2 size={18} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{app.entityName}</p>
                            <p className="text-xs text-gray-500 font-mono">{app.pan} | {app.gstin}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <EntityTypeBadge type={app.entityType} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full w-20">
                            <div 
                              className={`h-full rounded-full ${
                                app.flaggedDocs > 0 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(app.verifiedDocs / app.documentsCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{app.verifiedDocs}/{app.documentsCount}</span>
                          {app.flaggedDocs > 0 && (
                            <span className="text-xs text-orange-600">({app.flaggedDocs} flagged)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-800">{app.submittedAt}</p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={app.status} />
                        {app.resubmitReason && (
                          <p className="text-xs text-orange-600 mt-1">{app.resubmitReason}</p>
                        )}
                        {app.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">{app.rejectionReason}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {app.assignedTo ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-700">
                                {app.assignedTo.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">{app.assignedTo}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
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

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredApplications.length} of {applications.length} applications
              </span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Previous</button>
                <button className="px-3 py-1 bg-gray-900 text-white rounded text-sm">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
