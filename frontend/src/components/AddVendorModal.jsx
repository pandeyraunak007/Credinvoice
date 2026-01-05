import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  Plus,
  UserPlus,
  Building2,
  Star,
  Award,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { vendorService } from '../services/api';

/**
 * Get score color class
 */
const getScoreColor = (score) => {
  if (score === null || score === undefined) return 'text-gray-400';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * AddVendorModal Component
 * Modal to search and add existing vendors
 */
export default function AddVendorModal({ userType, onClose, onSuccess, onReferNew }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(null); // vendorId being added
  const [notes, setNotes] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch available vendors
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await vendorService.getAvailableVendors(debouncedSearch);

      if (response.success) {
        setVendors(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch available vendors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  // Initial fetch
  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Handle add vendor
  const handleAdd = async (vendor) => {
    try {
      setAdding(vendor.id);
      setError(null);

      await vendorService.addVendor({
        vendorId: vendor.id,
        vendorType: vendor.vendorType,
        notes: notes || undefined,
      });

      onSuccess();
    } catch (err) {
      console.error('Failed to add vendor:', err);
      setError(err.message);
    } finally {
      setAdding(null);
    }
  };

  // Get vendor type label
  const getVendorTypeLabel = () => {
    switch (userType) {
      case 'BUYER':
        return 'Supplier';
      case 'SELLER':
        return 'Customer';
      default:
        return 'Vendor';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Plus className="mr-2 text-indigo-600" size={20} />
            Add {getVendorTypeLabel()}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={`Search ${getVendorTypeLabel().toLowerCase()}s by company name or GSTIN...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Vendor List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin text-indigo-600 mr-2" size={20} />
              <span className="text-gray-600">Loading vendors...</span>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-8">
              <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 mb-4">
                {debouncedSearch
                  ? `No ${getVendorTypeLabel().toLowerCase()}s found matching "${debouncedSearch}"`
                  : `No available ${getVendorTypeLabel().toLowerCase()}s to add`}
              </p>
              <button
                onClick={onReferNew}
                className="flex items-center mx-auto px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
              >
                <UserPlus size={18} className="mr-2" />
                Refer a New {getVendorTypeLabel()}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {vendors.map((vendor) => {
                const isSeller = vendor.vendorType === 'SELLER';
                const score = isSeller ? vendor.performanceScore : vendor.reliabilityScore;
                const isSelected = selectedVendor?.id === vendor.id;

                return (
                  <div
                    key={vendor.id}
                    className={`border rounded-lg p-3 transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedVendor(isSelected ? null : vendor)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Building2 size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{vendor.companyName}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {vendor.gstin && <span>{vendor.gstin}</span>}
                            {(vendor.city || vendor.state) && (
                              <>
                                <span>|</span>
                                <span className="flex items-center">
                                  <MapPin size={12} className="mr-1" />
                                  {[vendor.city, vendor.state].filter(Boolean).join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Score */}
                        {score !== null && score !== undefined && (
                          <div className="flex items-center space-x-1">
                            {isSeller ? (
                              <Star size={14} className={getScoreColor(score)} fill="currentColor" />
                            ) : (
                              <Award size={14} className={getScoreColor(score)} fill="currentColor" />
                            )}
                            <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                              {Math.round(score)}
                            </span>
                          </div>
                        )}

                        {/* KYC Badge */}
                        {vendor.kycStatus === 'APPROVED' && (
                          <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            <CheckCircle size={12} className="mr-1" />
                            Verified
                          </span>
                        )}

                        {/* Add Button */}
                        {isSelected ? (
                          <CheckCircle size={20} className="text-indigo-600" />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdd(vendor);
                            }}
                            disabled={adding === vendor.id}
                            className="flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                          >
                            {adding === vendor.id ? (
                              <Loader size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Plus size={14} className="mr-1" />
                                Add
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notes Input (when selected) */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-indigo-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Add notes about this vendor..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(vendor);
                          }}
                          disabled={adding === vendor.id}
                          className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                          {adding === vendor.id ? (
                            <>
                              <Loader size={16} className="animate-spin mr-2" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus size={16} className="mr-2" />
                              Add {vendor.companyName}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onReferNew}
              className="flex items-center text-indigo-600 hover:text-indigo-700 transition text-sm"
            >
              <UserPlus size={16} className="mr-1" />
              Can't find them? Refer a new vendor
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
