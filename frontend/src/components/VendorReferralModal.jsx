import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Building2,
  Phone,
  FileText,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { vendorService } from '../services/api';

/**
 * VendorReferralModal Component
 * Modal to refer a new vendor who is not on the platform
 */
export default function VendorReferralModal({ userType, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    gstin: '',
    contactPhone: '',
    vendorType: userType === 'BUYER' ? 'SELLER' : userType === 'SELLER' ? 'BUYER' : 'SELLER',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.companyName || formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name is required';
    }

    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format';
    }

    if (formData.contactPhone && !/^[6-9]\d{9}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Invalid phone number (10 digits starting with 6-9)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);
      setApiError(null);

      await vendorService.referVendor({
        email: formData.email.trim(),
        companyName: formData.companyName.trim(),
        gstin: formData.gstin.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        vendorType: formData.vendorType,
      });

      onSuccess();
    } catch (err) {
      console.error('Failed to submit referral:', err);
      setApiError(err.message);
    } finally {
      setSubmitting(false);
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserPlus className="mr-2 text-indigo-600" size={20} />
            Refer a New {getVendorTypeLabel()}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Info */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-700">
            <p>
              Enter details of the vendor you want to invite. They'll receive an invitation
              to join the platform and will be automatically added to your list once they register.
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-600">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <span className="text-sm">{apiError}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vendor@company.com"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Vendor Company Ltd."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          {/* GSTIN (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GSTIN (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={(e) => handleChange({ target: { name: 'gstin', value: e.target.value.toUpperCase() } })}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  errors.gstin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.gstin && (
              <p className="mt-1 text-sm text-red-500">{errors.gstin}</p>
            )}
          </div>

          {/* Contact Phone (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={10}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>
            )}
          </div>

          {/* Vendor Type (for Financiers only) */}
          {userType === 'FINANCIER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Type
              </label>
              <select
                name="vendorType"
                value={formData.vendorType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="SELLER">Seller (MSME/Supplier)</option>
                <option value="BUYER">Buyer (Anchor/Enterprise)</option>
              </select>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {submitting ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <CheckCircle size={16} className="mr-2" />
                Send Referral
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
