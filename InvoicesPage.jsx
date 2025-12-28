import React, { useState } from 'react';
import { 
  Search, Filter, Download, Plus, FileText, Clock, CheckCircle, 
  XCircle, AlertCircle, ChevronRight, ChevronDown, MoreVertical,
  Eye, Edit, Trash2, Send, CreditCard, Building2, Calendar,
  IndianRupee, ArrowUpDown, RefreshCw
} from 'lucide-react';

// Invoice status configurations
const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  pending_acceptance: { label: 'Pending Acceptance', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  open_for_bidding: { label: 'Open for Bidding', color: 'bg-purple-100 text-purple-700', icon: CreditCard },
  bid_selected: { label: 'Bid Selected', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
  disbursed: { label: 'Disbursed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  settled: { label: 'Settled', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: AlertCircle },
};

// Mock invoice data
const mockInvoices = [
  { id: 'INV-2024-0077', seller: 'Kumar Textiles Pvt Ltd', sellerGstin: '27AABCU9603R1ZM', amount: 250000, discount: 2.0, status: 'pending_acceptance', date: '2024-12-28', dueDate: '2025-02-28', daysRemaining: 3, productType: 'dd' },
  { id: 'INV-2024-0076', seller: 'Steel Corp India', sellerGstin: '29GGGGG1314R9Z6', amount: 500000, discount: 1.8, status: 'open_for_bidding', date: '2024-12-27', dueDate: '2025-02-27', bidsCount: 4, productType: 'dd_early' },
  { id: 'INV-2024-0075', seller: 'Auto Parts Ltd', sellerGstin: '33AABCT1332L1ZZ', amount: 125000, discount: 2.5, status: 'accepted', date: '2024-12-26', dueDate: '2025-02-26', productType: 'dd' },
  { id: 'INV-2024-0074', seller: 'Fabric House', sellerGstin: '27AAAAA0000A1Z5', amount: 310000, discount: 1.5, status: 'disbursed', date: '2024-12-25', dueDate: '2025-02-25', fundingType: 'Financier', financier: 'Urban Finance', productType: 'dd_early' },
  { id: 'INV-2024-0073', seller: 'Metal Works Co', sellerGstin: '24AAAAA1111A1Z5', amount: 180000, discount: 2.0, status: 'settled', date: '2024-12-20', dueDate: '2025-01-20', fundingType: 'Self-Funded', productType: 'dd' },
  { id: 'INV-2024-0072', seller: 'Plastic Industries', sellerGstin: '27BBBBB2222B1Z5', amount: 95000, discount: 2.2, status: 'rejected', date: '2024-12-18', dueDate: '2025-02-18', rejectionReason: 'Seller declined discount', productType: 'dd' },
  { id: 'INV-2024-0071', seller: 'Kumar Textiles Pvt Ltd', sellerGstin: '27AABCU9603R1ZM', amount: 420000, discount: 1.8, status: 'bid_selected', date: '2024-12-15', dueDate: '2025-02-15', selectedBid: { financier: 'HDFC Bank', rate: 1.6 }, productType: 'dd_early' },
  { id: 'INV-2024-0070', seller: 'Electronics Hub', sellerGstin: '29CCCCC3333C1Z5', amount: 275000, discount: null, status: 'draft', date: '2024-12-14', dueDate: '2025-02-14', productType: 'dd' },
];

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sellerFilter, setSellerFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique sellers for filter
  const uniqueSellers = [...new Set(mockInvoices.map(inv => inv.seller))];

  // Filter and sort invoices
  const filteredInvoices = mockInvoices
    .filter(inv => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (sellerFilter !== 'all' && inv.seller !== sellerFilter) return false;
      if (searchTerm && !inv.id.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !inv.seller.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') return order * (new Date(b.date) - new Date(a.date));
      if (sortBy === 'amount') return order * (b.amount - a.amount);
      if (sortBy === 'seller') return order * a.seller.localeCompare(b.seller);
      return 0;
    });

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getActionButtons = (invoice) => {
    switch (invoice.status) {
      case 'draft':
        return (
          <div className="flex items-center space-x-2">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">Submit</button>
          </div>
        );
      case 'pending_acceptance':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-orange-600 text-sm">{invoice.daysRemaining}d remaining</span>
            <button className="text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
          </div>
        );
      case 'accepted':
        return (
          <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700">
            Choose Funding
          </button>
        );
      case 'open_for_bidding':
        return (
          <button className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 flex items-center space-x-1">
            <span>View Bids</span>
            <span className="bg-white/20 px-1.5 rounded">{invoice.bidsCount}</span>
          </button>
        );
      case 'bid_selected':
        return (
          <div className="text-sm">
            <span className="text-gray-500">Selected: </span>
            <span className="font-medium text-gray-800">{invoice.selectedBid.financier} @ {invoice.selectedBid.rate}%</span>
          </div>
        );
      case 'disbursed':
        return (
          <div className="text-sm">
            <span className="text-green-600 font-medium">{invoice.fundingType}</span>
            {invoice.financier && <span className="text-gray-500"> via {invoice.financier}</span>}
          </div>
        );
      default:
        return null;
    }
  };

  // Summary stats
  const stats = {
    total: mockInvoices.length,
    pending: mockInvoices.filter(i => i.status === 'pending_acceptance').length,
    bidding: mockInvoices.filter(i => i.status === 'open_for_bidding').length,
    value: mockInvoices.reduce((sum, i) => sum + i.amount, 0),
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
          <p className="text-gray-500 text-sm">Manage your invoices and discount offers</p>
        </div>
        <button 
          onClick={() => window.location.href = '/create-invoice'}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus size={20} />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Pending Acceptance</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Open for Bidding</p>
          <p className="text-2xl font-bold text-purple-600">{stats.bidding}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.value)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Invoice ID or Seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white min-w-[180px]"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_acceptance">Pending Acceptance</option>
              <option value="accepted">Accepted</option>
              <option value="open_for_bidding">Open for Bidding</option>
              <option value="bid_selected">Bid Selected</option>
              <option value="disbursed">Disbursed</option>
              <option value="settled">Settled</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Seller Filter */}
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white min-w-[180px]"
            >
              <option value="all">All Sellers</option>
              {uniqueSellers.map(seller => (
                <option key={seller} value={seller}>{seller}</option>
              ))}
            </select>

            {/* More Filters Toggle */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={18} />
              <span>More Filters</span>
              <ChevronDown size={16} className={`transform transition ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Export */}
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <option>All Time</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>Last 30 Days</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <option>All Amounts</option>
                  <option>Under ₹1L</option>
                  <option>₹1L - ₹5L</option>
                  <option>₹5L - ₹10L</option>
                  <option>Above ₹10L</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <option>All Types</option>
                  <option>Dynamic Discounting</option>
                  <option>DD + Early Payment</option>
                  <option>GST-Backed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Funding Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <option>All</option>
                  <option>Self-Funded</option>
                  <option>Financier-Funded</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count & Bulk Actions */}
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Showing <strong>{filteredInvoices.length}</strong> of {mockInvoices.length} invoices
            </span>
            {selectedInvoices.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-600">{selectedInvoices.length} selected</span>
                <button className="text-sm text-red-600 hover:text-red-700">Delete</button>
                <button className="text-sm text-blue-600 hover:text-blue-700">Export Selected</button>
              </div>
            )}
          </div>
          <button 
            onClick={() => {/* refresh */}}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInvoices(filteredInvoices.map(i => i.id));
                      } else {
                        setSelectedInvoices([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => { setSortBy('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    <span>Invoice</span>
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => { setSortBy('seller'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    <span>Seller</span>
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => { setSortBy('amount'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    <span>Amount</span>
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Discount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => {
                const StatusIcon = statusConfig[invoice.status]?.icon || FileText;
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices([...selectedInvoices, invoice.id]);
                          } else {
                            setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{invoice.id}</p>
                        <p className="text-sm text-gray-500">{invoice.date}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{invoice.seller}</p>
                        <p className="text-sm text-gray-500 font-mono">{invoice.sellerGstin}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-800">{formatCurrency(invoice.amount)}</p>
                    </td>
                    <td className="px-4 py-4">
                      {invoice.discount ? (
                        <div>
                          <p className="font-medium text-green-600">{invoice.discount}%</p>
                          <p className="text-sm text-gray-500">-{formatCurrency(invoice.amount * invoice.discount / 100)}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-700">{invoice.dueDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[invoice.status]?.color}`}>
                        <StatusIcon size={12} />
                        <span>{statusConfig[invoice.status]?.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getActionButtons(invoice)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                            <Eye size={16} />
                            <span>View Details</span>
                          </button>
                          {invoice.status === 'draft' && (
                            <>
                              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                                <Edit size={16} />
                                <span>Edit</span>
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                          {invoice.status === 'pending_acceptance' && (
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                              <Send size={16} />
                              <span>Resend Notification</span>
                            </button>
                          )}
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                            <Download size={16} />
                            <span>Download Invoice</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">1-8 of 8</span>
            <div className="flex items-center space-x-1">
              <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled>
                <ChevronRight size={18} className="rotate-180 text-gray-500" />
              </button>
              <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled>
                <ChevronRight size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State (when no invoices) */}
      {filteredInvoices.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No invoices found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or create a new invoice</p>
          <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={18} />
            <span>Create Invoice</span>
          </button>
        </div>
      )}
    </div>
  );
}
