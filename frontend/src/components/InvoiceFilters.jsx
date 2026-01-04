import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_ACCEPTANCE', label: 'Pending Acceptance' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'OPEN_FOR_BIDDING', label: 'Open for Bidding' },
  { value: 'BID_SELECTED', label: 'Bid Selected' },
  { value: 'DISBURSED', label: 'Disbursed' },
  { value: 'SETTLED', label: 'Settled' },
  { value: 'DISPUTED', label: 'Disputed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: '', label: 'All Products' },
  { value: 'DYNAMIC_DISCOUNTING', label: 'Dynamic Discounting' },
  { value: 'DD_EARLY_PAYMENT', label: 'Early Payment' },
  { value: 'GST_BACKED', label: 'GST Financing' },
];

const DATE_FIELD_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'dueDate', label: 'Due Date' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'totalAmount', label: 'Amount' },
];

export default function InvoiceFilters({
  onFilterChange,
  showAdvanced = true,
  defaultExpanded = false,
  className = '',
}) {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    productType: '',
    minAmount: '',
    maxAmount: '',
    dateField: 'createdAt',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Call onFilterChange when filters change
  useEffect(() => {
    const activeFilters = {};

    if (debouncedSearch) activeFilters.search = debouncedSearch;
    if (filters.status) activeFilters.status = filters.status;
    if (filters.productType) activeFilters.productType = filters.productType;
    if (filters.minAmount) activeFilters.minAmount = filters.minAmount;
    if (filters.maxAmount) activeFilters.maxAmount = filters.maxAmount;
    if (filters.startDate) activeFilters.startDate = filters.startDate;
    if (filters.endDate) activeFilters.endDate = filters.endDate;
    if (filters.dateField !== 'createdAt') activeFilters.dateField = filters.dateField;
    if (filters.sortBy !== 'createdAt') activeFilters.sortBy = filters.sortBy;
    if (filters.sortOrder !== 'desc') activeFilters.sortOrder = filters.sortOrder;

    onFilterChange(activeFilters);
  }, [debouncedSearch, filters.status, filters.productType, filters.minAmount, filters.maxAmount, filters.startDate, filters.endDate, filters.dateField, filters.sortBy, filters.sortOrder, onFilterChange]);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      productType: '',
      minAmount: '',
      maxAmount: '',
      dateField: 'createdAt',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.productType ||
    filters.minAmount || filters.maxAmount || filters.startDate || filters.endDate;

  const activeFilterCount = [
    filters.search, filters.status, filters.productType,
    filters.minAmount || filters.maxAmount, filters.startDate || filters.endDate
  ].filter(Boolean).length;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Main Filter Row */}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoice #, seller, buyer..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Product Type Filter */}
          <select
            value={filters.productType}
            onChange={(e) => handleChange('productType', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {PRODUCT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Toggle Advanced Filters */}
          {showAdvanced && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition ${
                isExpanded || hasActiveFilters
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Amount Range */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <DollarSign className="w-3 h-3 inline mr-1" />
                Amount Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => handleChange('minAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => handleChange('maxAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date Field Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                Date Type
              </label>
              <select
                value={filters.dateField}
                onChange={(e) => handleChange('dateField', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DATE_FIELD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Sort By
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                  title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
