import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  FileText,
  TrendingUp,
  Star,
  Award,
  MoreVertical,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';

/**
 * Get color class based on score
 */
const getScoreColor = (score) => {
  if (score === null || score === undefined) return 'text-gray-400';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Get background color class based on score
 */
const getScoreBgColor = (score) => {
  if (score === null || score === undefined) return 'bg-gray-100';
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-blue-100';
  if (score >= 40) return 'bg-yellow-100';
  return 'bg-red-100';
};

/**
 * Format currency in Indian style
 */
const formatCurrency = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * VendorCard Component
 * Displays vendor information in a card format
 */
export function VendorCard({
  vendor,
  onRemove,
  onEdit,
  showActions = true,
  className = ''
}) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSeller = vendor.vendorType === 'SELLER';
  const score = isSeller ? vendor.performanceScore : vendor.reliabilityScore;
  const scoreLabel = isSeller ? 'Performance' : 'Reliability';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Building2 size={20} className="text-indigo-600" />
          </div>
          <div>
            <Link
              to={`/vendors/${vendor.vendorId}`}
              className="font-medium text-gray-900 hover:text-indigo-600 transition"
            >
              {vendor.companyName}
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                isSeller ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isSeller ? 'Supplier' : 'Customer'}
              </span>
              {vendor.gstin && <span>{vendor.gstin}</span>}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {showActions && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-gray-100 transition"
            >
              <MoreVertical size={18} className="text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <Link
                  to={`/vendors/${vendor.vendorId}`}
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye size={14} className="mr-2" />
                  View Details
                </Link>
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(vendor);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit size={14} className="mr-2" />
                    Edit Notes
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onRemove(vendor);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location & Contact */}
      <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
        {(vendor.city || vendor.state) && (
          <div className="flex items-center">
            <MapPin size={14} className="mr-1 text-gray-400" />
            {[vendor.city, vendor.state].filter(Boolean).join(', ')}
          </div>
        )}
        {vendor.contactPhone && (
          <div className="flex items-center">
            <Phone size={14} className="mr-1 text-gray-400" />
            {vendor.contactPhone}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {/* Performance/Reliability Score */}
        <div className="flex items-center space-x-2">
          {score !== null && score !== undefined ? (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getScoreBgColor(score)}`}>
              {isSeller ? (
                <Star size={14} className={getScoreColor(score)} fill="currentColor" />
              ) : (
                <Award size={14} className={getScoreColor(score)} fill="currentColor" />
              )}
              <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                {Math.round(score)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Not Rated</span>
          )}
          <span className="text-xs text-gray-500">{scoreLabel}</span>
        </div>

        {/* Transaction Stats */}
        <div className="flex items-center space-x-4 text-sm">
          {vendor.invoiceCount !== undefined && (
            <div className="flex items-center text-gray-600">
              <FileText size={14} className="mr-1 text-gray-400" />
              <span>{vendor.invoiceCount} invoices</span>
            </div>
          )}
          {vendor.totalInvoiceAmount > 0 && (
            <div className="flex items-center text-gray-600">
              <TrendingUp size={14} className="mr-1 text-gray-400" />
              <span>{formatCurrency(vendor.totalInvoiceAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {vendor.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500 italic">"{vendor.notes}"</p>
        </div>
      )}

      {/* Added By Badge */}
      {vendor.addedBy && (
        <div className="mt-2">
          <span className={`text-xs px-2 py-0.5 rounded ${
            vendor.addedBy === 'AUTO'
              ? 'bg-green-50 text-green-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {vendor.addedBy === 'AUTO' ? 'Auto-added from transaction' : 'Manually added'}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * VendorCardSkeleton - Loading state for VendorCard
 */
export function VendorCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      <div className="flex gap-3 mb-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default VendorCard;
