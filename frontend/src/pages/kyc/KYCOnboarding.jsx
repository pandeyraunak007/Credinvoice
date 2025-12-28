import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Upload, FileText, Building2, User,
  CreditCard, MapPin, Shield, AlertCircle, CheckCircle, Eye, X,
  Camera, Smartphone, RefreshCw, Info, Download, Trash2, Loader
} from 'lucide-react';
import { kycService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Step Indicator
const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-between mb-8 px-4">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm border-2
            ${index < currentStep ? 'bg-green-500 border-green-500 text-white' : 
              index === currentStep ? 'bg-blue-600 border-blue-600 text-white' : 
              'bg-white border-gray-300 text-gray-500'}
          `}>
            {index < currentStep ? <Check size={20} /> : index + 1}
          </div>
          <span className={`mt-2 text-xs font-medium ${index <= currentStep ? 'text-gray-800' : 'text-gray-400'}`}>
            {step.label}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// Document Upload Component
const DocumentUpload = ({ label, description, required, accepted, uploaded, onUpload, onRemove, status, error }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <div className={`border-2 border-dashed rounded-xl p-4 transition ${
      error ? 'border-red-300 bg-red-50' : 
      uploaded ? 'border-green-300 bg-green-50' : 
      'border-gray-300 hover:border-gray-400'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-800">{label}</p>
            {required && <span className="text-red-500">*</span>}
            {status === 'verified' && <CheckCircle size={16} className="text-green-500" />}
            {status === 'pending' && <RefreshCw size={16} className="text-yellow-500" />}
            {status === 'rejected' && <AlertCircle size={16} className="text-red-500" />}
          </div>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          <p className="text-xs text-gray-400 mt-1">Accepted: {accepted}</p>
        </div>
        
        {uploaded ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
              <FileText size={16} className="text-blue-600" />
              <span className="text-sm text-gray-700 max-w-[150px] truncate">{uploaded.name}</span>
            </div>
            <button onClick={() => onRemove()} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <input type="file" className="hidden" accept={accepted} onChange={handleFileChange} />
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Upload size={16} />
              <span className="text-sm font-medium">Upload</span>
            </div>
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Form Field Component
const FormField = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default function KYCOnboarding() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [entityType, setEntityType] = useState('company'); // company, partnership, proprietorship, llp
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Entity Details
    entityType: 'company',
    legalName: '',
    tradeName: '',
    cin: '',
    llpin: '',
    pan: '',
    gstin: '',
    dateOfIncorporation: '',
    registeredAddress: '',
    city: '',
    state: '',
    pincode: '',
    
    // Business Details
    businessType: '',
    industry: '',
    annualTurnover: '',
    employeeCount: '',
    websiteUrl: '',
    
    // Bank Details
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountType: 'current',
    
    // Authorized Signatory
    signatoryName: '',
    signatoryDesignation: '',
    signatoryPan: '',
    signatoryAadhaar: '',
    signatoryEmail: '',
    signatoryMobile: '',
    
    // Directors (for company)
    directors: [{ name: '', din: '', pan: '' }],
  });
  
  const [documents, setDocuments] = useState({
    panCard: null,
    gstCertificate: null,
    incorporationCert: null,
    moa: null,
    aoa: null,
    boardResolution: null,
    bankStatement: null,
    cancelledCheque: null,
    addressProof: null,
    signatoryPan: null,
    signatoryAadhaar: null,
    signatoryPhoto: null,
  });

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const steps = [
    { id: 'entity', label: 'Entity Type' },
    { id: 'business', label: 'Business Details' },
    { id: 'bank', label: 'Bank Details' },
    { id: 'signatory', label: 'Authorized Signatory' },
    { id: 'documents', label: 'Documents' },
    { id: 'review', label: 'Review & Submit' },
  ];

  const entityTypes = [
    { value: 'company', label: 'Private Limited Company', description: 'Registered under Companies Act 2013', icon: Building2 },
    { value: 'llp', label: 'Limited Liability Partnership', description: 'Registered under LLP Act 2008', icon: Building2 },
    { value: 'partnership', label: 'Partnership Firm', description: 'Registered under Partnership Act', icon: User },
    { value: 'proprietorship', label: 'Sole Proprietorship', description: 'Individual business owner', icon: User },
  ];

  const industries = [
    'Manufacturing', 'Retail & E-commerce', 'Technology & IT', 'Healthcare', 
    'Financial Services', 'Construction', 'Textiles', 'Automobiles', 
    'Food & Beverages', 'Chemicals', 'Others'
  ];

  const states = [
    'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 
    'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Others'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleDocumentUpload = (docType, file) => {
    setDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const handleDocumentRemove = (docType) => {
    setDocuments(prev => ({ ...prev, [docType]: null }));
  };

  const addDirector = () => {
    setFormData(prev => ({
      ...prev,
      directors: [...prev.directors, { name: '', din: '', pan: '' }]
    }));
  };

  const updateDirector = (index, field, value) => {
    const updated = [...formData.directors];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, directors: updated }));
  };

  const removeDirector = (index) => {
    if (formData.directors.length > 1) {
      setFormData(prev => ({
        ...prev,
        directors: prev.directors.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 0:
        if (!formData.entityType) newErrors.entityType = 'Please select entity type';
        break;
      case 1:
        if (!formData.legalName) newErrors.legalName = 'Legal name is required';
        if (!formData.pan) newErrors.pan = 'PAN is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) newErrors.pan = 'Invalid PAN format';
        if (!formData.gstin) newErrors.gstin = 'GSTIN is required';
        else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) newErrors.gstin = 'Invalid GSTIN format';
        if (entityType === 'company' && !formData.cin) newErrors.cin = 'CIN is required';
        if (!formData.registeredAddress) newErrors.registeredAddress = 'Address is required';
        if (!formData.pincode) newErrors.pincode = 'Pincode is required';
        break;
      case 2:
        if (!formData.bankName) newErrors.bankName = 'Bank name is required';
        if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
        if (formData.accountNumber !== formData.confirmAccountNumber) newErrors.confirmAccountNumber = 'Account numbers do not match';
        if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) newErrors.ifscCode = 'Invalid IFSC format';
        break;
      case 3:
        if (!formData.signatoryName) newErrors.signatoryName = 'Name is required';
        if (!formData.signatoryPan) newErrors.signatoryPan = 'PAN is required';
        if (!formData.signatoryAadhaar) newErrors.signatoryAadhaar = 'Aadhaar is required';
        else if (!/^[0-9]{12}$/.test(formData.signatoryAadhaar)) newErrors.signatoryAadhaar = 'Invalid Aadhaar format';
        if (!formData.signatoryMobile) newErrors.signatoryMobile = 'Mobile is required';
        break;
      case 4:
        if (!documents.panCard) newErrors.panCard = 'PAN Card is required';
        if (!documents.gstCertificate) newErrors.gstCertificate = 'GST Certificate is required';
        if (entityType === 'company' && !documents.incorporationCert) newErrors.incorporationCert = 'Certificate of Incorporation is required';
        if (!documents.cancelledCheque) newErrors.cancelledCheque = 'Cancelled cheque is required';
        if (!documents.signatoryAadhaar) newErrors.signatoryAadhaar = 'Signatory Aadhaar is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare profile data
      const profileData = {
        companyName: formData.legalName,
        gstin: formData.gstin || null,
        pan: formData.pan || null,
        address: formData.registeredAddress || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        contactName: formData.signatoryName || null,
        contactPhone: formData.signatoryMobile || null,
        industry: formData.industry || null,
      };

      // Prepare bank data
      const bankData = formData.accountNumber ? {
        accountNo: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankName: formData.bankName,
        accountType: formData.accountType === 'current' ? 'CURRENT' : 'SAVINGS',
        isPrimary: true,
      } : null;

      // Submit to backend
      const result = await kycService.submitCompleteKYC(profileData, bankData, documents);
      console.log('KYC submission result:', result);

      // Refresh profile to get updated KYC status
      await refreshProfile();

      setSubmitSuccess(true);

      // Navigate after short delay
      setTimeout(() => {
        navigate('/kyc/status');
      }, 2000);
    } catch (error) {
      console.error('KYC submission error:', error);
      setSubmitError(error.message || 'Failed to submit KYC. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Select Your Entity Type</h2>
              <p className="text-gray-500 mt-2">Choose the legal structure of your business</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {entityTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      setEntityType(type.value);
                      handleInputChange('entityType', type.value);
                    }}
                    className={`p-6 border-2 rounded-xl text-left transition ${
                      entityType === type.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        entityType === type.value ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Icon size={24} className={entityType === type.value ? 'text-blue-600' : 'text-gray-600'} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{type.label}</h3>
                        <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <Info size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">KYC Requirements</p>
                  <p className="text-sm text-blue-700 mt-1">
                    As per RBI and SEBI guidelines, all businesses must complete KYC verification before accessing financial services. 
                    This includes PAN verification, GSTIN validation, and authorized signatory verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Business Details</h2>
              <p className="text-gray-500 mt-2">Enter your company registration details</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Legal Name" required error={errors.legalName}>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                    placeholder="As per registration certificate"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
                <FormField label="Trade Name (if different)">
                  <input
                    type="text"
                    value={formData.tradeName}
                    onChange={(e) => handleInputChange('tradeName', e.target.value)}
                    placeholder="Brand/Trade name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {entityType === 'company' && (
                  <FormField label="CIN (Corporate Identification Number)" required error={errors.cin}>
                    <input
                      type="text"
                      value={formData.cin}
                      onChange={(e) => handleInputChange('cin', e.target.value.toUpperCase())}
                      placeholder="L12345MH2020PLC123456"
                      maxLength={21}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </FormField>
                )}
                {entityType === 'llp' && (
                  <FormField label="LLPIN" required error={errors.llpin}>
                    <input
                      type="text"
                      value={formData.llpin}
                      onChange={(e) => handleInputChange('llpin', e.target.value.toUpperCase())}
                      placeholder="AAA-1234"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </FormField>
                )}
                <FormField label="PAN" required error={errors.pan}>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="GSTIN" required error={errors.gstin}>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </FormField>
                <FormField label="Date of Incorporation" required>
                  <input
                    type="date"
                    value={formData.dateOfIncorporation}
                    onChange={(e) => handleInputChange('dateOfIncorporation', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="Industry" required>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select industry</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Annual Turnover">
                  <select
                    value={formData.annualTurnover}
                    onChange={(e) => handleInputChange('annualTurnover', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select range</option>
                    <option value="0-1cr">Up to ₹1 Crore</option>
                    <option value="1-10cr">₹1 - 10 Crore</option>
                    <option value="10-50cr">₹10 - 50 Crore</option>
                    <option value="50-100cr">₹50 - 100 Crore</option>
                    <option value="100cr+">Above ₹100 Crore</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Registered Address" required error={errors.registeredAddress}>
                <textarea
                  value={formData.registeredAddress}
                  onChange={(e) => handleInputChange('registeredAddress', e.target.value)}
                  placeholder="Full registered office address"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <div className="grid grid-cols-3 gap-6">
                <FormField label="City" required>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
                <FormField label="State" required>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Pincode" required error={errors.pincode}>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Bank Account Details</h2>
              <p className="text-gray-500 mt-2">Link your primary business bank account for settlements</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Important</p>
                    <p className="text-yellow-700">Bank account must be in the name of the registered entity. Personal accounts are not accepted.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="Bank Name" required error={errors.bankName}>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="e.g., HDFC Bank"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
                <FormField label="Account Type" required>
                  <select
                    value={formData.accountType}
                    onChange={(e) => handleInputChange('accountType', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="current">Current Account</option>
                    <option value="cc">Cash Credit Account</option>
                    <option value="od">Overdraft Account</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="Account Number" required error={errors.accountNumber}>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter account number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </FormField>
                <FormField label="Confirm Account Number" required error={errors.confirmAccountNumber}>
                  <input
                    type="text"
                    value={formData.confirmAccountNumber}
                    onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter account number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </FormField>
              </div>

              <FormField label="IFSC Code" required error={errors.ifscCode}>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                  placeholder="e.g., HDFC0001234"
                  maxLength={11}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </FormField>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield size={20} className="text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Penny Drop Verification</p>
                    <p className="text-blue-700">We'll deposit ₹1 to verify your account. This is an RBI-mandated process.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Authorized Signatory</h2>
              <p className="text-gray-500 mt-2">Person authorized to operate the account on behalf of the company</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Full Name" required error={errors.signatoryName}>
                  <input
                    type="text"
                    value={formData.signatoryName}
                    onChange={(e) => handleInputChange('signatoryName', e.target.value)}
                    placeholder="As per PAN card"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
                <FormField label="Designation" required>
                  <input
                    type="text"
                    value={formData.signatoryDesignation}
                    onChange={(e) => handleInputChange('signatoryDesignation', e.target.value)}
                    placeholder="e.g., Director, Partner, Proprietor"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="PAN" required error={errors.signatoryPan}>
                  <input
                    type="text"
                    value={formData.signatoryPan}
                    onChange={(e) => handleInputChange('signatoryPan', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </FormField>
                <FormField label="Aadhaar Number" required error={errors.signatoryAadhaar}>
                  <input
                    type="text"
                    value={formData.signatoryAadhaar}
                    onChange={(e) => handleInputChange('signatoryAadhaar', e.target.value.replace(/\D/g, ''))}
                    placeholder="1234 5678 9012"
                    maxLength={12}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="Email" required>
                  <input
                    type="email"
                    value={formData.signatoryEmail}
                    onChange={(e) => handleInputChange('signatoryEmail', e.target.value)}
                    placeholder="email@company.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
                <FormField label="Mobile Number" required error={errors.signatoryMobile}>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500">+91</span>
                    <input
                      type="text"
                      value={formData.signatoryMobile}
                      onChange={(e) => handleInputChange('signatoryMobile', e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </FormField>
              </div>

              {/* Directors Section for Companies */}
              {entityType === 'company' && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Directors Information</h3>
                    <button
                      onClick={addDirector}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Director
                    </button>
                  </div>
                  
                  {formData.directors.map((director, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700">Director {index + 1}</span>
                        {formData.directors.length > 1 && (
                          <button onClick={() => removeDirector(index)} className="text-red-500 text-sm">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={director.name}
                          onChange={(e) => updateDirector(index, 'name', e.target.value)}
                          placeholder="Full Name"
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={director.din}
                          onChange={(e) => updateDirector(index, 'din', e.target.value)}
                          placeholder="DIN"
                          className="px-3 py-2 border border-gray-300 rounded-lg font-mono"
                        />
                        <input
                          type="text"
                          value={director.pan}
                          onChange={(e) => updateDirector(index, 'pan', e.target.value.toUpperCase())}
                          placeholder="PAN"
                          maxLength={10}
                          className="px-3 py-2 border border-gray-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Upload Documents</h2>
              <p className="text-gray-500 mt-2">Upload required documents for verification</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Entity Documents</h3>
              <div className="space-y-3">
                <DocumentUpload
                  label="Company PAN Card"
                  description="Clear copy of entity PAN card"
                  required
                  accepted=".pdf,.jpg,.jpeg,.png"
                  uploaded={documents.panCard}
                  onUpload={(file) => handleDocumentUpload('panCard', file)}
                  onRemove={() => handleDocumentRemove('panCard')}
                  error={errors.panCard}
                />
                <DocumentUpload
                  label="GST Registration Certificate"
                  description="GST certificate with GSTIN clearly visible"
                  required
                  accepted=".pdf,.jpg,.jpeg,.png"
                  uploaded={documents.gstCertificate}
                  onUpload={(file) => handleDocumentUpload('gstCertificate', file)}
                  onRemove={() => handleDocumentRemove('gstCertificate')}
                  error={errors.gstCertificate}
                />
                {entityType === 'company' && (
                  <>
                    <DocumentUpload
                      label="Certificate of Incorporation"
                      description="MCA issued incorporation certificate"
                      required
                      accepted=".pdf"
                      uploaded={documents.incorporationCert}
                      onUpload={(file) => handleDocumentUpload('incorporationCert', file)}
                      onRemove={() => handleDocumentRemove('incorporationCert')}
                      error={errors.incorporationCert}
                    />
                    <DocumentUpload
                      label="Memorandum of Association (MOA)"
                      description="Latest MOA document"
                      accepted=".pdf"
                      uploaded={documents.moa}
                      onUpload={(file) => handleDocumentUpload('moa', file)}
                      onRemove={() => handleDocumentRemove('moa')}
                    />
                    <DocumentUpload
                      label="Board Resolution"
                      description="Resolution authorizing signatory for this platform"
                      accepted=".pdf"
                      uploaded={documents.boardResolution}
                      onUpload={(file) => handleDocumentUpload('boardResolution', file)}
                      onRemove={() => handleDocumentRemove('boardResolution')}
                    />
                  </>
                )}
              </div>

              <h3 className="font-semibold text-gray-800 mt-6">Bank Documents</h3>
              <div className="space-y-3">
                <DocumentUpload
                  label="Cancelled Cheque"
                  description="Cancelled cheque leaf with account details"
                  required
                  accepted=".pdf,.jpg,.jpeg,.png"
                  uploaded={documents.cancelledCheque}
                  onUpload={(file) => handleDocumentUpload('cancelledCheque', file)}
                  onRemove={() => handleDocumentRemove('cancelledCheque')}
                  error={errors.cancelledCheque}
                />
                <DocumentUpload
                  label="Bank Statement (Last 6 months)"
                  description="Recent bank statement for verification"
                  accepted=".pdf"
                  uploaded={documents.bankStatement}
                  onUpload={(file) => handleDocumentUpload('bankStatement', file)}
                  onRemove={() => handleDocumentRemove('bankStatement')}
                />
              </div>

              <h3 className="font-semibold text-gray-800 mt-6">Signatory Documents</h3>
              <div className="space-y-3">
                <DocumentUpload
                  label="Signatory PAN Card"
                  description="PAN card of authorized signatory"
                  required
                  accepted=".pdf,.jpg,.jpeg,.png"
                  uploaded={documents.signatoryPan}
                  onUpload={(file) => handleDocumentUpload('signatoryPan', file)}
                  onRemove={() => handleDocumentRemove('signatoryPan')}
                />
                <DocumentUpload
                  label="Signatory Aadhaar Card"
                  description="Aadhaar card (front and back)"
                  required
                  accepted=".pdf,.jpg,.jpeg,.png"
                  uploaded={documents.signatoryAadhaar}
                  onUpload={(file) => handleDocumentUpload('signatoryAadhaar', file)}
                  onRemove={() => handleDocumentRemove('signatoryAadhaar')}
                  error={errors.signatoryAadhaar}
                />
                <DocumentUpload
                  label="Passport Size Photo"
                  description="Recent passport size photograph"
                  accepted=".jpg,.jpeg,.png"
                  uploaded={documents.signatoryPhoto}
                  onUpload={(file) => handleDocumentUpload('signatoryPhoto', file)}
                  onRemove={() => handleDocumentRemove('signatoryPhoto')}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Review & Submit</h2>
              <p className="text-gray-500 mt-2">Please review your information before submitting</p>
            </div>

            <div className="space-y-6">
              {/* Entity Summary */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Business Details</h3>
                  <button onClick={() => setCurrentStep(1)} className="text-blue-600 text-sm font-medium">Edit</button>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Entity Type</p><p className="font-medium capitalize">{entityType}</p></div>
                  <div><p className="text-gray-500">Legal Name</p><p className="font-medium">{formData.legalName || '-'}</p></div>
                  <div><p className="text-gray-500">PAN</p><p className="font-medium font-mono">{formData.pan || '-'}</p></div>
                  <div><p className="text-gray-500">GSTIN</p><p className="font-medium font-mono">{formData.gstin || '-'}</p></div>
                  {entityType === 'company' && <div><p className="text-gray-500">CIN</p><p className="font-medium font-mono">{formData.cin || '-'}</p></div>}
                  <div><p className="text-gray-500">Industry</p><p className="font-medium">{formData.industry || '-'}</p></div>
                </div>
              </div>

              {/* Bank Summary */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Bank Details</h3>
                  <button onClick={() => setCurrentStep(2)} className="text-blue-600 text-sm font-medium">Edit</button>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Bank Name</p><p className="font-medium">{formData.bankName || '-'}</p></div>
                  <div><p className="text-gray-500">Account Number</p><p className="font-medium font-mono">****{formData.accountNumber?.slice(-4) || '-'}</p></div>
                  <div><p className="text-gray-500">IFSC Code</p><p className="font-medium font-mono">{formData.ifscCode || '-'}</p></div>
                </div>
              </div>

              {/* Signatory Summary */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Authorized Signatory</h3>
                  <button onClick={() => setCurrentStep(3)} className="text-blue-600 text-sm font-medium">Edit</button>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Name</p><p className="font-medium">{formData.signatoryName || '-'}</p></div>
                  <div><p className="text-gray-500">PAN</p><p className="font-medium font-mono">{formData.signatoryPan || '-'}</p></div>
                  <div><p className="text-gray-500">Mobile</p><p className="font-medium">+91 {formData.signatoryMobile || '-'}</p></div>
                </div>
              </div>

              {/* Documents Summary */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Uploaded Documents</h3>
                  <button onClick={() => setCurrentStep(4)} className="text-blue-600 text-sm font-medium">Edit</button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(documents).map(([key, file]) => (
                      <div key={key} className={`p-3 rounded-lg border ${file ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center space-x-2">
                          {file ? <CheckCircle size={16} className="text-green-500" /> : <FileText size={16} className="text-gray-400" />}
                          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Declaration */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600" />
                  <span className="text-sm text-yellow-800">
                    I hereby declare that the information provided above is true and correct to the best of my knowledge. 
                    I understand that any false information may result in rejection of my application and legal action. 
                    I consent to the verification of my documents through government databases (UIDAI, MCA, GSTN, etc.) 
                    as per CKYC guidelines.
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Complete Your KYC</h1>
                <p className="text-sm text-gray-500">As per RBI & SEBI guidelines</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={20} className="text-green-600" />
              <span className="text-sm text-gray-600">256-bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <StepIndicator currentStep={currentStep} steps={steps} />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 pb-32">
        {renderStepContent()}
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">KYC Submitted Successfully!</h3>
            <p className="text-gray-600">Your application is under review. You will be notified once verified.</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to status page...</p>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        {submitError && (
          <div className="max-w-5xl mx-auto mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle size={18} className="text-red-600" />
            <span className="text-sm text-red-700">{submitError}</span>
          </div>
        )}
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center space-x-2 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700"
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Submit KYC Application</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
