import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Building2, Mail, Phone, MapPin, CreditCard, Shield,
  FileText, Edit2, Save, X, Loader2, Check, AlertCircle, LogOut, Key,
  Bell, ChevronRight, Camera
} from 'lucide-react';
import { profileService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const navigate = useNavigate();
  const { user, profile, logout, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userType = user?.userType;
  const entityProfile = userType === 'BUYER' ? profile?.buyer :
                        userType === 'SELLER' ? profile?.seller :
                        userType === 'FINANCIER' ? profile?.financier : null;

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, bankRes] = await Promise.all([
        profileService.getProfile(),
        profileService.getBankAccounts().catch(() => ({ data: [] })),
      ]);
      setProfileData(profileRes.data);
      setBankAccounts(bankRes.data || []);

      // Initialize form data based on user type
      const entity = profileRes.data?.[userType?.toLowerCase()];
      if (entity) {
        setFormData({
          companyName: entity.companyName || '',
          gstin: entity.gstin || '',
          pan: entity.pan || '',
          contactName: entity.contactName || '',
          contactEmail: entity.contactEmail || '',
          contactPhone: entity.contactPhone || '',
          address: entity.address || '',
          city: entity.city || '',
          state: entity.state || '',
          pincode: entity.pincode || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await profileService.updateProfile(formData);
      setSuccess('Profile updated successfully');
      setEditMode(false);
      await refreshProfile();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/login');
  };

  const getBackLink = () => {
    switch (userType) {
      case 'BUYER': return '/';
      case 'SELLER': return '/seller';
      case 'FINANCIER': return '/financier';
      default: return '/';
    }
  };

  const getThemeColor = () => {
    switch (userType) {
      case 'BUYER': return 'blue';
      case 'SELLER': return 'green';
      case 'FINANCIER': return 'purple';
      default: return 'blue';
    }
  };

  const color = getThemeColor();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading account...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(getBackLink())} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CI</span>
              </div>
              <span className="text-xl font-bold text-gray-800">CRED<span className="text-red-600">INVOICE</span></span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className={`h-24 bg-gradient-to-r from-${color}-500 to-${color}-600`}></div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12">
              <div className="relative">
                <div className={`w-24 h-24 bg-${color}-100 border-4 border-white rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Building2 size={40} className={`text-${color}-600`} />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow hover:bg-gray-50">
                  <Camera size={14} className="text-gray-600" />
                </button>
              </div>
              <div className="ml-6 pb-2">
                <h1 className="text-2xl font-bold text-gray-800">{entityProfile?.companyName || 'Company Name'}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`px-2 py-0.5 bg-${color}-100 text-${color}-700 text-xs rounded-full font-medium`}>
                    {userType}
                  </span>
                  {entityProfile?.kycStatus === 'APPROVED' && (
                    <span className="flex items-center space-x-1 text-green-600 text-sm">
                      <Shield size={14} />
                      <span>KYC Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={18} className="text-red-500" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
            <Check size={20} className="text-green-600" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'bank', label: 'Bank Accounts', icon: CreditCard },
            { id: 'security', label: 'Security', icon: Key },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg flex-1 justify-center transition ${
                activeTab === tab.id
                  ? 'bg-white shadow text-gray-800 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Business Information</h2>
                <p className="text-sm text-gray-500">Manage your business profile details</p>
              </div>
              {editMode ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center space-x-2 px-4 py-2 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 disabled:opacity-50`}
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>Save</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className={`flex items-center space-x-2 px-4 py-2 border border-${color}-200 text-${color}-700 rounded-lg hover:bg-${color}-50`}
                >
                  <Edit2 size={18} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Company Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Company Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Company Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">{formData.companyName || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">GSTIN</label>
                    <p className="font-medium text-gray-800 font-mono">{formData.gstin || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">PAN</label>
                    <p className="font-medium text-gray-800 font-mono">{formData.pan || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Contact Person</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">{formData.contactName || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email</label>
                    {editMode ? (
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">{formData.contactEmail || user?.email || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Phone</label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">{formData.contactPhone || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-500 mb-1">Street Address</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">{formData.address || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">City</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">{formData.city || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">State</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">{formData.state || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Pincode</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">{formData.pincode || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Accounts Tab */}
        {activeTab === 'bank' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Bank Accounts</h2>
                <p className="text-sm text-gray-500">Manage your linked bank accounts</p>
              </div>
              <button className={`flex items-center space-x-2 px-4 py-2 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700`}>
                <CreditCard size={18} />
                <span>Add Account</span>
              </button>
            </div>

            <div className="p-6">
              {bankAccounts.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No bank accounts linked</h3>
                  <p className="text-gray-500">Add a bank account to receive payments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bankAccounts.map((account, index) => (
                    <div key={account.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <CreditCard size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{account.bankName}</p>
                          <p className="text-sm text-gray-500">
                            A/C: ****{account.accountNo?.slice(-4) || '****'}
                          </p>
                          <p className="text-xs text-gray-400">IFSC: {account.ifscCode}</p>
                        </div>
                      </div>
                      {account.isPrimary && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Security Settings</h2>
              <p className="text-sm text-gray-500">Manage your account security</p>
            </div>

            <div className="p-6 space-y-4">
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Key size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield size={20} className="text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Coming Soon</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Bell size={20} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Notification Preferences</p>
                    <p className="text-sm text-gray-500">Manage email and push notifications</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>

              <div className="border-t border-gray-100 pt-4 mt-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 p-4 border border-red-200 text-red-600 rounded-xl hover:bg-red-50"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout from all devices</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
