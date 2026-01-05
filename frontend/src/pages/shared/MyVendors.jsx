import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  UserPlus,
  Filter,
  RefreshCw,
  AlertCircle,
  Building2
} from 'lucide-react';
import { vendorService } from '../../services/api';
import { VendorCard, VendorCardSkeleton } from '../../components/VendorCard';
import AddVendorModal from '../../components/AddVendorModal';
import VendorReferralModal from '../../components/VendorReferralModal';

/**
 * Get page title based on user type
 */
const getPageTitle = (userType) => {
  switch (userType) {
    case 'BUYER':
      return 'My Vendors';
    case 'SELLER':
      return 'My Customers';
    case 'FINANCIER':
      return 'My Partners';
    default:
      return 'My Vendors';
  }
};

/**
 * Get page description based on user type
 */
const getPageDescription = (userType) => {
  switch (userType) {
    case 'BUYER':
      return 'Manage your supplier relationships and track transaction history';
    case 'SELLER':
      return 'Manage your customer relationships and track transaction history';
    case 'FINANCIER':
      return 'Manage your business partners and track financing relationships';
    default:
      return 'Manage your vendor relationships';
  }
};

/**
 * MyVendors Page Component
 * Shared across all user types (Buyers, Sellers, Financiers)
 */
export default function MyVendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  // Get user type from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userType = user?.userType || 'BUYER';

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch vendors
  const fetchVendors = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await vendorService.getMyVendors({
        search: debouncedSearch,
        status: statusFilter,
        page: page.toString(),
        limit: '20',
      });

      if (response.success) {
        setVendors(response.data.vendors || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  // Initial fetch
  useEffect(() => {
    fetchVendors(1);
  }, [fetchVendors]);

  // Handle remove vendor
  const handleRemove = async (vendor) => {
    if (!window.confirm(`Are you sure you want to remove ${vendor.companyName} from your list?`)) {
      return;
    }

    try {
      await vendorService.removeVendor(vendor.vendorId);
      fetchVendors(pagination.page);
    } catch (err) {
      console.error('Failed to remove vendor:', err);
      alert(`Failed to remove vendor: ${err.message}`);
    }
  };

  // Handle add vendor success
  const handleVendorAdded = () => {
    setShowAddModal(false);
    fetchVendors(1);
  };

  // Handle referral success
  const handleReferralSent = () => {
    setShowReferralModal(false);
    alert('Referral sent successfully! They will be added to your list once they complete registration.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 text-indigo-600" size={28} />
              {getPageTitle(userType)}
            </h1>
            <p className="text-gray-600 mt-1">{getPageDescription(userType)}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowReferralModal(true)}
              className="flex items-center px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
            >
              <UserPlus size={18} className="mr-2" />
              Refer New
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={18} className="mr-2" />
              Add Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by company name or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ALL">All</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchVendors(pagination.page)}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
          <span>
            <strong className="text-gray-900">{pagination.total}</strong> total vendors
          </span>
          {debouncedSearch && (
            <span>
              Showing results for "<strong className="text-indigo-600">{debouncedSearch}</strong>"
            </span>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="text-red-500 mr-3" size={20} />
          <div>
            <p className="text-red-800 font-medium">Error loading vendors</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <VendorCardSkeleton key={i} />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No vendors found
          </h3>
          <p className="text-gray-600 mb-6">
            {debouncedSearch
              ? `No vendors match "${debouncedSearch}"`
              : 'Get started by adding vendors to your list'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={18} className="mr-2" />
              Add Existing Vendor
            </button>
            <button
              onClick={() => setShowReferralModal(true)}
              className="flex items-center px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
            >
              <UserPlus size={18} className="mr-2" />
              Refer New Vendor
            </button>
          </div>
        </div>
      ) : (
        /* Vendor Grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => fetchVendors(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchVendors(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddVendorModal
          userType={userType}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleVendorAdded}
          onReferNew={() => {
            setShowAddModal(false);
            setShowReferralModal(true);
          }}
        />
      )}

      {showReferralModal && (
        <VendorReferralModal
          userType={userType}
          onClose={() => setShowReferralModal(false)}
          onSuccess={handleReferralSent}
        />
      )}
    </div>
  );
}
