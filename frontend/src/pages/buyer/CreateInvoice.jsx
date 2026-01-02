import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Upload, FileText, Search, Building2, User,
  Calendar, IndianRupee, Package, Paperclip, CheckCircle, AlertCircle,
  X, Loader2, ChevronDown, UserPlus, Send, Save, Info, Check, Percent, Zap,
  Sparkles, FileImage, Edit3
} from 'lucide-react';
import { invoiceService, profileService, discountService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// AI Extraction Section Component
const AIExtractionSection = ({ onExtracted, onManualEntry }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a JPG, PNG, or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtractedData(null);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsExtracting(true);
    setError(null);

    try {
      const response = await invoiceService.extractFromFile(file);
      const result = response.data;

      // Check if extraction was successful
      if (!result || !result.success) {
        throw new Error('Failed to extract invoice data from the image');
      }

      // Extract flat values from the nested fields structure
      const fields = result.fields || {};
      const extractedValues = {
        invoiceNumber: fields.invoiceNumber?.value || '',
        invoiceDate: fields.invoiceDate?.value || '',
        dueDate: fields.dueDate?.value || '',
        sellerName: fields.sellerName?.value || '',
        sellerGstin: fields.sellerGstin?.value || '',
        buyerName: fields.buyerName?.value || '',
        buyerGstin: fields.buyerGstin?.value || '',
        subtotal: fields.subtotal?.value || 0,
        taxAmount: fields.taxAmount?.value || 0,
        totalAmount: fields.totalAmount?.value || 0,
      };

      setExtractedData(extractedValues);

      // Pass extracted data to parent
      onExtracted(extractedValues);
    } catch (err) {
      console.error('AI extraction failed:', err);
      setError(err.message || 'Failed to extract invoice data. Please try again or enter manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setExtractedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Sparkles size={20} className="text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-800">AI Invoice Extraction</h3>
            <p className="text-sm text-gray-500">Upload an invoice image to auto-fill the form</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!file ? (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload size={36} className="text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-1">Click to upload invoice</p>
              <p className="text-sm text-gray-400">JPG, PNG, or PDF (Max 10MB)</p>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <button
              onClick={onManualEntry}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              <Edit3 size={16} />
              <span>Enter Details Manually</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Preview */}
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              {preview ? (
                <img src={preview} alt="Invoice preview" className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <FileText size={24} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={handleReset}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Extraction Failed</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Extracted Data Preview */}
            {extractedData && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-700 mb-2 flex items-center">
                  <CheckCircle size={14} className="mr-1.5" />
                  Data extracted successfully
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Invoice #:</span> <span className="text-gray-800">{extractedData.invoiceNumber || '-'}</span></div>
                  <div><span className="text-gray-500">Total:</span> <span className="text-gray-800">{extractedData.totalAmount ? `₹${extractedData.totalAmount.toLocaleString('en-IN')}` : '-'}</span></div>
                  <div><span className="text-gray-500">Seller:</span> <span className="text-gray-800">{extractedData.sellerName || '-'}</span></div>
                  <div><span className="text-gray-500">Due:</span> <span className="text-gray-800">{extractedData.dueDate || '-'}</span></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {!extractedData ? (
                <button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Extract Data</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                  <Upload size={16} />
                  <span>Upload Different</span>
                </button>
              )}
            </div>

            {extractedData && (
              <p className="text-center text-xs text-gray-500">
                Form pre-filled. Review and edit below.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Form Section Component
const FormSection = ({ title, icon: Icon, children, collapsible = false, allowOverflow = false }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${allowOverflow ? '' : 'overflow-hidden'}`}>
      <div
        className={`px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between rounded-t-xl ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon size={20} className="text-gray-600" />}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {collapsible && (
          <ChevronDown size={20} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </div>
      {isOpen && <div className={`p-6 ${allowOverflow ? 'overflow-visible' : ''}`}>{children}</div>}
    </div>
  );
};

// Form Field Component
const FormField = ({ label, required, error, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// Seller Search Dropdown Component
const SellerSearchDropdown = ({ value, onChange, onAddNew, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch sellers function
  const fetchSellers = useCallback(async (searchTerm = '') => {
    console.log('[SellerDropdown] Starting fetch, search:', searchTerm);
    setLoading(true);
    setFetchError(null);
    try {
      const response = await profileService.getVerifiedSellers(searchTerm);
      console.log('[SellerDropdown] API Response:', response);
      const sellersList = response?.data || [];
      console.log('[SellerDropdown] Sellers list:', sellersList);
      setSellers(sellersList);
    } catch (err) {
      console.error('[SellerDropdown] Fetch error:', err);
      setFetchError(err.message);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      console.log('[SellerDropdown] Dropdown opened, fetching sellers...');
      fetchSellers(search);
    }
  }, [isOpen]);

  // Fetch on search change (with debounce)
  useEffect(() => {
    if (!isOpen || search === '') return;

    const timer = setTimeout(() => {
      fetchSellers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (seller) => {
    console.log('[SellerDropdown] Selected seller:', seller);
    onChange(seller);
    setIsOpen(false);
    setSearch('');
  };

  const handleOpen = () => {
    console.log('[SellerDropdown] Toggle dropdown, current isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full px-4 py-3 border rounded-lg cursor-pointer flex items-center justify-between ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        } ${value ? 'bg-green-50 border-green-300' : ''}`}
        onClick={handleOpen}
      >
        {value ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Building2 size={16} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{value.companyName}</p>
              <p className="text-xs text-gray-500 font-mono">{value.gstin}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Click to select a seller...</span>
        )}
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl"
          style={{ zIndex: 9999, top: '100%' }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search by name or GSTIN..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Sellers List */}
          <div className="max-h-72 overflow-y-auto">
            {fetchError ? (
              <div className="py-6 text-center text-red-500">
                <AlertCircle size={24} className="mx-auto mb-2" />
                <p className="text-sm font-medium">Failed to load sellers</p>
                <p className="text-xs mt-1">{fetchError}</p>
                <button
                  onClick={() => fetchSellers('')}
                  className="mt-2 text-blue-600 text-sm hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="py-8 text-center text-gray-500">
                <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading sellers...</p>
              </div>
            ) : sellers.length > 0 ? (
              <div className="py-1">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Available Sellers ({sellers.length})
                </div>
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0"
                    onClick={() => handleSelect(seller)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{seller.companyName}</p>
                        <p className="text-xs text-gray-500">
                          {seller.gstin ? (
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{seller.gstin}</span>
                          ) : (
                            <span className="text-gray-400">No GSTIN</span>
                          )}
                          {seller.city && <span className="ml-2">{seller.city}, {seller.state}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {seller.kycStatus === 'APPROVED' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                      )}
                      <ChevronDown size={16} className="text-gray-300 -rotate-90" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-1">No sellers found</p>
                <p className="text-sm text-gray-400">
                  {search ? `No results for "${search}"` : 'No verified sellers available'}
                </p>
              </div>
            )}
          </div>

          {/* Add New Seller Button */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); onAddNew(); }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <UserPlus size={18} />
              <span>Invite New Seller</span>
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Can't find your seller? Send them an invitation to join.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Buyer Search Dropdown Component (for Sellers creating GST-backed invoices)
const BuyerSearchDropdown = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch buyers function
  const fetchBuyers = useCallback(async (searchTerm = '') => {
    console.log('[BuyerDropdown] Starting fetch, search:', searchTerm);
    setLoading(true);
    setFetchError(null);
    try {
      const response = await profileService.getVerifiedBuyers(searchTerm);
      console.log('[BuyerDropdown] API Response:', response);
      const buyersList = response?.data || [];
      console.log('[BuyerDropdown] Buyers list:', buyersList);
      setBuyers(buyersList);
    } catch (err) {
      console.error('[BuyerDropdown] Fetch error:', err);
      setFetchError(err.message);
      setBuyers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      console.log('[BuyerDropdown] Dropdown opened, fetching buyers...');
      fetchBuyers(search);
    }
  }, [isOpen]);

  // Fetch on search change (with debounce)
  useEffect(() => {
    if (!isOpen || search === '') return;

    const timer = setTimeout(() => {
      fetchBuyers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (buyer) => {
    console.log('[BuyerDropdown] Selected buyer:', buyer);
    onChange(buyer);
    setIsOpen(false);
    setSearch('');
  };

  const handleOpen = () => {
    console.log('[BuyerDropdown] Toggle dropdown, current isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full px-4 py-3 border rounded-lg cursor-pointer flex items-center justify-between ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        } ${value ? 'bg-green-50 border-green-300' : ''}`}
        onClick={handleOpen}
      >
        {value ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Building2 size={16} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{value.companyName}</p>
              <p className="text-xs text-gray-500 font-mono">{value.gstin}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Click to select a buyer...</span>
        )}
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl"
          style={{ zIndex: 9999, top: '100%' }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search by name or GSTIN..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Buyers List */}
          <div className="max-h-72 overflow-y-auto">
            {fetchError ? (
              <div className="py-6 text-center text-red-500">
                <AlertCircle size={24} className="mx-auto mb-2" />
                <p className="text-sm font-medium">Failed to load buyers</p>
                <p className="text-xs mt-1">{fetchError}</p>
                <button
                  onClick={() => fetchBuyers('')}
                  className="mt-2 text-blue-600 text-sm hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="py-8 text-center text-gray-500">
                <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading buyers...</p>
              </div>
            ) : buyers.length > 0 ? (
              <div className="py-1">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Available Buyers ({buyers.length})
                </div>
                {buyers.map((buyer) => (
                  <div
                    key={buyer.id}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0"
                    onClick={() => handleSelect(buyer)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{buyer.companyName}</p>
                        <p className="text-xs text-gray-500">
                          {buyer.gstin ? (
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{buyer.gstin}</span>
                          ) : (
                            <span className="text-gray-400">No GSTIN</span>
                          )}
                          {buyer.city && <span className="ml-2">{buyer.city}, {buyer.state}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {buyer.kycStatus === 'APPROVED' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                      )}
                      <ChevronDown size={16} className="text-gray-300 -rotate-90" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-1">No buyers found</p>
                <p className="text-sm text-gray-400">
                  {search ? `No results for "${search}"` : 'No verified buyers available'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Line Item Row Component
const LineItemRow = ({ item, index, onChange, onRemove, canRemove }) => {
  const handleChange = (field, value) => {
    const updated = { ...item, [field]: value };
    // Auto-calculate amount
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(updated.quantity) || 0;
      const rate = parseFloat(updated.rate) || 0;
      updated.amount = (qty * rate).toFixed(2);
    }
    onChange(index, updated);
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-start py-3 border-b border-gray-100 last:border-0">
      <div className="col-span-4">
        <input
          type="text"
          value={item.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Item description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
      <div className="col-span-2">
        <input
          type="text"
          value={item.hsnCode}
          onChange={(e) => handleChange('hsnCode', e.target.value)}
          placeholder="HSN Code"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => handleChange('quantity', e.target.value)}
          placeholder="Qty"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-right"
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          value={item.rate}
          onChange={(e) => handleChange('rate', e.target.value)}
          placeholder="Rate"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-right"
        />
      </div>
      <div className="col-span-1">
        <input
          type="text"
          value={item.amount}
          readOnly
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right font-medium"
        />
      </div>
      <div className="col-span-1 flex justify-center">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Discount Offer Confirmation Modal
const DiscountOfferConfirmModal = ({ isOpen, onClose, onConfirm, data, isSubmitting }) => {
  if (!isOpen) return null;

  const {
    invoiceNumber,
    sellerName,
    buyerName,
    totalAmount,
    discountPercentage,
    discountedAmount,
    earlyPaymentDate,
    dueDate,
  } = data;

  const savingsAmount = totalAmount - discountedAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Confirm Discount Offer</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-500 mb-1">You are about to submit</p>
            <p className="text-xl font-bold text-gray-800">Invoice {invoiceNumber}</p>
            <p className="text-sm text-gray-600 mt-1">with a discount offer to <span className="font-medium">{sellerName}</span></p>
          </div>

          {/* Summary Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Original Amount</span>
              <span className="font-medium text-gray-800">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Discount Offered</span>
              <span className="font-medium text-green-600">-{discountPercentage}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-100 pt-3">
              <span className="text-gray-800 font-medium">Discounted Amount</span>
              <span className="font-bold text-lg text-blue-600">₹{discountedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Savings Highlight */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap size={20} className="text-green-600" />
                <span className="text-green-800 font-medium">Your Savings</span>
              </div>
              <span className="font-bold text-green-700 text-lg">₹{savingsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Payment Timeline */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Payment Timeline</p>
            <div className="flex items-center justify-between text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <p className="text-xs text-gray-500">Early Payment</p>
                <p className="font-medium text-gray-800">{new Date(earlyPaymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 mx-3 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-50 px-2">
                  vs
                </div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Calendar size={16} className="text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">Original Due</p>
                <p className="font-medium text-gray-600">{new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              The seller will receive a notification to accept or reject this offer. You can track the status in your invoices.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Confirm & Submit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Seller Referral Modal
const SellerReferralModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    gstin: '',
    contactPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await profileService.createSellerReferral(formData);
      setSuccess(true);
      setTimeout(() => {
        onSubmit(formData);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Invite New Seller</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Invitation Sent!</h4>
            <p className="text-gray-600">The seller will receive an email to join the platform.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Invite your seller to join CredInvoice. They'll need to complete KYC before you can create invoices with them.
            </p>

            <FormField label="Company Name" required>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ABC Textiles Pvt Ltd"
                required
              />
            </FormField>

            <FormField label="Email" required>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="seller@company.com"
                required
              />
            </FormField>

            <FormField label="GSTIN" hint="Optional but helps identify the seller">
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
            </FormField>

            <FormField label="Contact Phone" hint="Optional">
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210"
              />
            </FormField>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.companyName || !formData.email}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showDiscountConfirmModal, setShowDiscountConfirmModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Determine if user is a seller (for GST-backed financing flow)
  const isSeller = user?.userType === 'SELLER';

  // AI extraction mode state
  const [showAISection, setShowAISection] = useState(true);
  const [hasExtractedData, setHasExtractedData] = useState(false);

  // Get buyer/seller info from profile based on user type
  const buyerInfo = profile?.buyer || {};
  const sellerInfo = profile?.seller || {};

  // Form state - default productType based on user type
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    productType: isSeller ? 'GST_BACKED' : 'DD_EARLY_PAYMENT',
  });

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [selectedBuyer, setSelectedBuyer] = useState(null); // For seller flow

  const [lineItems, setLineItems] = useState([
    { description: '', hsnCode: '', quantity: '', rate: '', amount: '0.00' }
  ]);

  const [amounts, setAmounts] = useState({
    subtotal: '',
    cgst: '',
    sgst: '',
    igst: '',
    totalAmount: '',
  });

  const [attachments, setAttachments] = useState([]);

  // Discount offer state
  const [enableDiscount, setEnableDiscount] = useState(true);
  const [discountOffer, setDiscountOffer] = useState({
    discountPercentage: '2',
    earlyPaymentDate: '',
  });

  // Calculate totals from line items
  useEffect(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const cgst = parseFloat(amounts.cgst) || 0;
    const sgst = parseFloat(amounts.sgst) || 0;
    const igst = parseFloat(amounts.igst) || 0;
    const total = subtotal + cgst + sgst + igst;

    setAmounts(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      totalAmount: total.toFixed(2),
    }));
  }, [lineItems, amounts.cgst, amounts.sgst, amounts.igst]);

  // Set default early payment date when due date changes
  useEffect(() => {
    if (invoiceData.dueDate && !discountOffer.earlyPaymentDate) {
      // Default to 15 days before due date or 7 days from today, whichever is later
      const dueDate = new Date(invoiceData.dueDate);
      const defaultEarly = new Date(dueDate);
      defaultEarly.setDate(defaultEarly.getDate() - 15);

      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 7);

      const earlyDate = defaultEarly > minDate ? defaultEarly : minDate;
      setDiscountOffer(prev => ({
        ...prev,
        earlyPaymentDate: earlyDate.toISOString().split('T')[0]
      }));
    }
  }, [invoiceData.dueDate]);

  // Calculate discounted amount
  const discountedAmount = useMemo(() => {
    const total = parseFloat(amounts.totalAmount) || 0;
    const discountPct = parseFloat(discountOffer.discountPercentage) || 0;
    return total - (total * discountPct / 100);
  }, [amounts.totalAmount, discountOffer.discountPercentage]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', hsnCode: '', quantity: '', rate: '', amount: '0.00' }]);
  };

  const handleUpdateLineItem = (index, item) => {
    const updated = [...lineItems];
    updated[index] = item;
    setLineItems(updated);
  };

  const handleRemoveLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!invoiceData.invoiceNumber) newErrors.invoiceNumber = 'Invoice number is required';
    if (!invoiceData.invoiceDate) newErrors.invoiceDate = 'Invoice date is required';
    if (!invoiceData.dueDate) newErrors.dueDate = 'Due date is required';

    // Validate based on user type
    if (isSeller) {
      // Seller creating GST-backed invoice
      if (!selectedBuyer) newErrors.buyer = 'Please select a buyer';
      if (!selectedBuyer?.companyName) newErrors.buyer = 'Buyer name is required';
      if (!sellerInfo.companyName) newErrors.seller = 'Seller company name is missing in profile';
    } else {
      // Buyer creating DD invoice
      if (!selectedSeller) newErrors.seller = 'Please select a seller';
      if (!selectedSeller?.companyName) newErrors.seller = 'Seller name is required';
      if (!buyerInfo.companyName) newErrors.buyer = 'Buyer company name is missing in profile';
    }

    const subtotal = parseFloat(amounts.subtotal) || 0;
    const totalAmount = parseFloat(amounts.totalAmount) || 0;

    if (subtotal <= 0) {
      newErrors.subtotal = 'Subtotal must be greater than 0. Add line items or enter amounts.';
    }
    if (totalAmount <= 0) {
      newErrors.totalAmount = 'Total amount must be greater than 0';
    }

    // Check due date is after invoice date
    if (invoiceData.invoiceDate && invoiceData.dueDate) {
      if (new Date(invoiceData.dueDate) <= new Date(invoiceData.invoiceDate)) {
        newErrors.dueDate = 'Due date must be after invoice date';
      }
    }

    // Validate discount offer if enabled (only for buyers, sellers use bidding)
    if (!isSeller && enableDiscount) {
      const discountPct = parseFloat(discountOffer.discountPercentage);
      if (!discountPct || discountPct <= 0 || discountPct > 50) {
        newErrors.discountPercentage = 'Discount must be between 0.1% and 50%';
      }
      if (!discountOffer.earlyPaymentDate) {
        newErrors.earlyPaymentDate = 'Early payment date is required';
      } else {
        const earlyDate = new Date(discountOffer.earlyPaymentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (earlyDate <= today) {
          newErrors.earlyPaymentDate = 'Early payment date must be in the future';
        }
        if (invoiceData.dueDate && earlyDate >= new Date(invoiceData.dueDate)) {
          newErrors.earlyPaymentDate = 'Early payment date must be before due date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (asDraft = false) => {
    if (!asDraft && !validateForm()) return;

    // If discount is enabled and not a draft, show confirmation modal first (only for buyers)
    if (!isSeller && !asDraft && enableDiscount) {
      setShowDiscountConfirmModal(true);
      return;
    }

    // For drafts, seller submissions, or non-discount submissions, proceed directly
    await executeSubmit(asDraft);
  };

  const executeSubmit = async (asDraft = false) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build data based on user type
      let data;

      if (isSeller) {
        // Seller creating GST-backed invoice - seller info from profile, buyer from dropdown
        data = {
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate,
          dueDate: invoiceData.dueDate,
          sellerGstin: sellerInfo.gstin || null,
          sellerName: sellerInfo.companyName || '',
          sellerId: sellerInfo.id || null,
          buyerGstin: selectedBuyer?.gstin || null,
          buyerName: selectedBuyer?.companyName || '',
          buyerId: selectedBuyer?.id || null,
          subtotal: parseFloat(amounts.subtotal) || 0,
          taxAmount: (parseFloat(amounts.cgst) || 0) + (parseFloat(amounts.sgst) || 0) + (parseFloat(amounts.igst) || 0),
          totalAmount: parseFloat(amounts.totalAmount) || 0,
          productType: 'GST_BACKED', // Always GST_BACKED for seller-created invoices
        };
      } else {
        // Buyer creating DD invoice - buyer info from profile, seller from dropdown
        data = {
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate,
          dueDate: invoiceData.dueDate,
          sellerGstin: selectedSeller?.gstin || null,
          sellerName: selectedSeller?.companyName || '',
          sellerId: selectedSeller?.id || null,
          buyerGstin: buyerInfo.gstin || null,
          buyerName: buyerInfo.companyName || '',
          subtotal: parseFloat(amounts.subtotal) || 0,
          taxAmount: (parseFloat(amounts.cgst) || 0) + (parseFloat(amounts.sgst) || 0) + (parseFloat(amounts.igst) || 0),
          totalAmount: parseFloat(amounts.totalAmount) || 0,
          productType: invoiceData.productType,
        };
      }

      // 1. Create the invoice
      const response = await invoiceService.create(data);
      const invoiceId = response.data?.id;

      if (!invoiceId) {
        throw new Error('Failed to create invoice - no ID returned');
      }

      // 2. Create discount offer if enabled and not draft (only for buyers)
      if (!isSeller && !asDraft && enableDiscount) {
        try {
          await discountService.createOffer({
            invoiceId: invoiceId,
            discountPercentage: parseFloat(discountOffer.discountPercentage),
            earlyPaymentDate: discountOffer.earlyPaymentDate,
          });
        } catch (discountError) {
          console.error('Failed to create discount offer:', discountError);
          // Continue even if discount offer fails - invoice is created
        }
      }

      setShowDiscountConfirmModal(false);
      // Redirect based on user type
      navigate(isSeller ? '/seller/invoices' : '/invoices');
    } catch (error) {
      console.error('Failed to create invoice:', error);
      setSubmitError(error.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDiscountOffer = async () => {
    await executeSubmit(false);
  };

  // Handle AI extracted data
  const handleExtractedData = (data) => {
    // Update invoice data
    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: data.invoiceNumber || prev.invoiceNumber,
      invoiceDate: data.invoiceDate || prev.invoiceDate,
      dueDate: data.dueDate || prev.dueDate,
    }));

    // Update amounts
    setAmounts(prev => ({
      ...prev,
      subtotal: data.subtotal?.toString() || prev.subtotal,
      totalAmount: data.totalAmount?.toString() || prev.totalAmount,
    }));

    // If tax amount is extracted, try to distribute it
    if (data.taxAmount) {
      const halfTax = (data.taxAmount / 2).toFixed(2);
      setAmounts(prev => ({
        ...prev,
        cgst: halfTax,
        sgst: halfTax,
      }));
    }

    // Mark that we have extracted data and hide the AI section
    setHasExtractedData(true);
    setShowAISection(false);
  };

  // Handle manual entry choice
  const handleManualEntry = () => {
    setShowAISection(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(isSeller ? '/seller/invoices' : '/invoices')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Create New Invoice</h1>
                <p className="text-sm text-gray-500">
                  {isSeller
                    ? 'Create an invoice for GST-backed financing'
                    : 'Enter invoice details for dynamic discounting'}
                </p>
              </div>
            </div>
            <button onClick={() => navigate(isSeller ? '/seller/invoices' : '/invoices')} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 pb-32">
        <div className="space-y-6">
          {/* AI Extraction Section - Show only when showAISection is true */}
          {showAISection && (
            <AIExtractionSection
              onExtracted={handleExtractedData}
              onManualEntry={handleManualEntry}
            />
          )}

          {/* Show form sections when AI section is hidden */}
          {!showAISection && (
            <>
              {/* Extracted Data Banner */}
              {hasExtractedData && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Sparkles size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Invoice Data Extracted</p>
                      <p className="text-sm text-green-600">Please review and edit the pre-filled information below</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAISection(true)}
                    className="text-sm text-green-700 hover:text-green-800 font-medium"
                  >
                    Upload Another
                  </button>
                </div>
              )}

          {/* Invoice Details Section */}
          <FormSection title="Invoice Details" icon={FileText}>
            <div className="grid grid-cols-3 gap-6">
              <FormField label="Invoice Number" required error={errors.invoiceNumber}>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                  placeholder="e.g., INV-2024-001"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.invoiceNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>
              <FormField label="Invoice Date" required error={errors.invoiceDate}>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </FormField>
              <FormField label="Due Date" required error={errors.dueDate}>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </FormField>
            </div>
          </FormSection>

          {/* For Buyers: Seller Selection Section */}
          {!isSeller && (
            <FormSection title="Seller Information" icon={Building2} allowOverflow={true}>
              <FormField
                label="Select Seller"
                required
                error={errors.seller}
                hint="Choose from your verified sellers or invite a new one"
              >
                <SellerSearchDropdown
                  value={selectedSeller}
                  onChange={setSelectedSeller}
                  onAddNew={() => setShowReferralModal(true)}
                  error={errors.seller}
                />
              </FormField>

              {selectedSeller && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Business Type</p>
                      <p className="font-medium text-gray-800">{selectedSeller.businessType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium text-gray-800">
                        {selectedSeller.city && selectedSeller.state
                          ? `${selectedSeller.city}, ${selectedSeller.state}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">KYC Status</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" /> Verified
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </FormSection>
          )}

          {/* For Sellers: Buyer Selection Section */}
          {isSeller && (
            <FormSection title="Buyer Information" icon={Building2} allowOverflow={true}>
              <FormField
                label="Select Buyer"
                required
                error={errors.buyer}
                hint="Choose the buyer for this GST-backed invoice"
              >
                <BuyerSearchDropdown
                  value={selectedBuyer}
                  onChange={setSelectedBuyer}
                  error={errors.buyer}
                />
              </FormField>

              {selectedBuyer && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Industry</p>
                      <p className="font-medium text-gray-800">{selectedBuyer.industry || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium text-gray-800">
                        {selectedBuyer.city && selectedBuyer.state
                          ? `${selectedBuyer.city}, ${selectedBuyer.state}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">KYC Status</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" /> Verified
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </FormSection>
          )}

          {/* For Buyers: Buyer Information Section (Pre-filled from profile) */}
          {!isSeller && (
            <FormSection title="Buyer Information (Your Company)" icon={User}>
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Company Name">
                  <input
                    type="text"
                    value={buyerInfo.companyName || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  />
                </FormField>
                <FormField label="GSTIN">
                  <input
                    type="text"
                    value={buyerInfo.gstin || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono"
                  />
                </FormField>
                <FormField label="Address">
                  <input
                    type="text"
                    value={buyerInfo.address || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  />
                </FormField>
                <FormField label="Contact">
                  <input
                    type="text"
                    value={buyerInfo.contactName || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  />
                </FormField>
              </div>
              <p className="mt-3 text-xs text-gray-500 flex items-center">
                <Info size={14} className="mr-1" />
                This information is from your profile. Update it in Settings if needed.
              </p>
            </FormSection>
          )}

          {/* For Sellers: Seller Information Section (Pre-filled from profile) */}
          {isSeller && (
            <FormSection title="Seller Information (Your Company)" icon={User}>
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Company Name">
                  <input
                    type="text"
                    value={sellerInfo.companyName || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  />
                </FormField>
                <FormField label="GSTIN">
                  <input
                    type="text"
                    value={sellerInfo.gstin || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono"
                  />
                </FormField>
                <FormField label="Address">
                  <input
                    type="text"
                    value={sellerInfo.address || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  />
                </FormField>
                <FormField label="Contact">
                  <input
                    type="text"
                    value={sellerInfo.contactName || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                  />
                </FormField>
              </div>
              <p className="mt-3 text-xs text-gray-500 flex items-center">
                <Info size={14} className="mr-1" />
                This information is from your profile. Update it in Settings if needed.
              </p>
            </FormSection>
          )}

          {/* Line Items Section */}
          <FormSection title="Items Details" icon={Package}>
            <div className="mb-4">
              <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200">
                <div className="col-span-4">Description</div>
                <div className="col-span-2">HSN Code</div>
                <div className="col-span-2 text-right">Quantity</div>
                <div className="col-span-2 text-right">Rate (₹)</div>
                <div className="col-span-1 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>
            </div>

            {lineItems.map((item, index) => (
              <LineItemRow
                key={index}
                item={item}
                index={index}
                onChange={handleUpdateLineItem}
                onRemove={handleRemoveLineItem}
                canRemove={lineItems.length > 1}
              />
            ))}

            <button
              type="button"
              onClick={handleAddLineItem}
              className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <Plus size={18} />
              <span>Add Line Item</span>
            </button>
          </FormSection>

          {/* Amount Details Section */}
          <FormSection title="Amount Details" icon={IndianRupee}>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField label="Subtotal" error={errors.subtotal}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="text"
                      value={amounts.subtotal}
                      readOnly
                      className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border rounded-lg text-right font-medium ${
                        errors.subtotal ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </div>
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="CGST">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={amounts.cgst}
                        onChange={(e) => setAmounts({ ...amounts, cgst: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>
                  </FormField>
                  <FormField label="SGST">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={amounts.sgst}
                        onChange={(e) => setAmounts({ ...amounts, sgst: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>
                  </FormField>
                </div>
                <FormField label="IGST (for inter-state)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={amounts.igst}
                      onChange={(e) => setAmounts({ ...amounts, igst: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                    />
                  </div>
                </FormField>
              </div>

              <div className="flex items-end">
                <div className="w-full p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-600 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-blue-800">
                    ₹{parseFloat(amounts.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  {errors.totalAmount && (
                    <p className="mt-2 text-xs text-red-600">{errors.totalAmount}</p>
                  )}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Discount Offer Section - Only for Buyers (DD flow) */}
          {!isSeller && (
          <FormSection title="Early Payment Discount Offer" icon={Zap}>
            <div className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enableDiscount ? 'bg-green-100' : 'bg-gray-200'}`}>
                    <Percent size={20} className={enableDiscount ? 'text-green-600' : 'text-gray-400'} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Offer Early Payment Discount</p>
                    <p className="text-sm text-gray-500">Incentivize the seller to accept early payment</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableDiscount(!enableDiscount)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enableDiscount ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableDiscount ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {enableDiscount && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField label="Discount Percentage" required error={errors.discountPercentage}>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="50"
                          value={discountOffer.discountPercentage}
                          onChange={(e) => setDiscountOffer({ ...discountOffer, discountPercentage: e.target.value })}
                          placeholder="2.0"
                          className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.discountPercentage ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </FormField>

                    <FormField label="Early Payment Date" required error={errors.earlyPaymentDate} hint="Date by which payment will be made">
                      <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={discountOffer.earlyPaymentDate}
                          onChange={(e) => setDiscountOffer({ ...discountOffer, earlyPaymentDate: e.target.value })}
                          min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                          max={invoiceData.dueDate}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.earlyPaymentDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </FormField>
                  </div>

                  {/* Discount Summary */}
                  {parseFloat(amounts.totalAmount) > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium mb-1">Discount Offer Summary</p>
                          <p className="text-xs text-green-600">
                            Seller receives early payment by {discountOffer.earlyPaymentDate ? new Date(discountOffer.earlyPaymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            <span className="line-through">₹{parseFloat(amounts.totalAmount).toLocaleString('en-IN')}</span>
                          </p>
                          <p className="text-xl font-bold text-green-700">
                            ₹{discountedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-green-600">
                            Save ₹{(parseFloat(amounts.totalAmount) - discountedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <p>
                      This discount offer will be sent to the seller for acceptance. Once accepted, you'll choose the funding type (self-funded or financier-funded).
                    </p>
                  </div>
                </>
              )}
            </div>
          </FormSection>
          )}

          {/* Attachments Section */}
          <FormSection title="Attachments" icon={Paperclip}>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-400 mt-1">PDF, JPEG, PNG (Max 10MB each)</p>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText size={20} className="text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormSection>
          </>
          )}
        </div>
      </div>

      {/* Footer - Only show when form is visible */}
      {!showAISection && (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        {submitError && (
          <div className="max-w-5xl mx-auto mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle size={18} className="text-red-600" />
            <span className="text-sm text-red-700">{submitError}</span>
          </div>
        )}
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(isSeller ? '/seller/invoices' : '/invoices')}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              <Save size={18} />
              <span>Save as Draft</span>
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>
                    {isSeller
                      ? 'Submit for Financing'
                      : enableDiscount
                        ? 'Submit with Discount Offer'
                        : 'Submit Invoice'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Seller Referral Modal */}
      <SellerReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        onSubmit={(data) => console.log('Referral sent:', data)}
      />

      {/* Discount Offer Confirmation Modal */}
      <DiscountOfferConfirmModal
        isOpen={showDiscountConfirmModal}
        onClose={() => setShowDiscountConfirmModal(false)}
        onConfirm={handleConfirmDiscountOffer}
        isSubmitting={isSubmitting}
        data={{
          invoiceNumber: invoiceData.invoiceNumber,
          sellerName: selectedSeller?.companyName || '',
          buyerName: buyerInfo.companyName || '',
          totalAmount: parseFloat(amounts.totalAmount) || 0,
          discountPercentage: parseFloat(discountOffer.discountPercentage) || 0,
          discountedAmount: discountedAmount,
          earlyPaymentDate: discountOffer.earlyPaymentDate,
          dueDate: invoiceData.dueDate,
        }}
      />
    </div>
  );
}
