import React, { useState, useCallback } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertTriangle, X, ArrowLeft, ArrowRight,
  Loader2, Sparkles, Eye, Edit2, Calendar, IndianRupee, Building2,
  Percent, Clock, Send, Save, Info, Check, AlertCircle, RefreshCw,
  ZoomIn, ZoomOut, RotateCw, Download, ChevronDown
} from 'lucide-react';

// Step indicator component
const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
            ${index < currentStep ? 'bg-green-500 text-white' : 
              index === currentStep ? 'bg-blue-600 text-white' : 
              'bg-gray-200 text-gray-500'}
          `}>
            {index < currentStep ? <Check size={20} /> : index + 1}
          </div>
          <span className={`ml-2 text-sm font-medium ${index <= currentStep ? 'text-gray-800' : 'text-gray-400'}`}>
            {step.label}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className={`w-16 h-0.5 mx-4 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// Confidence indicator
const ConfidenceIndicator = ({ confidence }) => {
  const getColor = () => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getColor()}`}>
      {confidence}%
    </span>
  );
};

// Editable field component
const ExtractedField = ({ label, value, confidence, required, onChange, type = 'text', warning, verified }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const needsReview = confidence < 80;

  return (
    <div className={`p-3 rounded-lg border ${needsReview ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
          {needsReview && (
            <span className="ml-2 text-yellow-600 text-xs flex items-center">
              <AlertTriangle size={12} className="mr-1" />
              Review needed
            </span>
          )}
        </label>
        <div className="flex items-center space-x-2">
          <ConfidenceIndicator confidence={confidence} />
          {verified && <CheckCircle size={16} className="text-green-500" />}
        </div>
      </div>
      
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button 
            onClick={() => { onChange(editValue); setIsEditing(false); }}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Check size={16} />
          </button>
          <button 
            onClick={() => { setEditValue(value); setIsEditing(false); }}
            className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <span className={`text-gray-800 ${type === 'currency' ? 'font-semibold text-lg' : ''}`}>
            {type === 'currency' ? `₹${parseFloat(value).toLocaleString('en-IN')}` : value}
          </span>
          <button 
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
          >
            <Edit2 size={14} />
          </button>
        </div>
      )}
      
      {warning && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle size={12} className="mr-1" />
          {warning}
        </p>
      )}
    </div>
  );
};

export default function CreateInvoice() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [discountSettings, setDiscountSettings] = useState({
    discountType: 'fixed',
    discountPercent: '',
    earlyPaymentDate: '',
  });
  const [fundingChoice, setFundingChoice] = useState('');
  const [selectedFinanciers, setSelectedFinanciers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const steps = [
    { id: 'upload', label: 'Upload Invoice' },
    { id: 'extract', label: 'AI Extraction' },
    { id: 'discount', label: 'Set Discount' },
    { id: 'review', label: 'Review & Submit' },
  ];

  // Mock sellers
  const mappedSellers = [
    { id: 1, name: 'Kumar Textiles Pvt Ltd', gstin: '27AABCU9603R1ZM' },
    { id: 2, name: 'Steel Corp India', gstin: '29GGGGG1314R9Z6' },
    { id: 3, name: 'Auto Parts Ltd', gstin: '33AABCT1332L1ZZ' },
    { id: 4, name: 'Fabric House', gstin: '27AAAAA0000A1Z5' },
  ];

  // Mock financiers
  const availableFinanciers = [
    { id: 1, name: 'HDFC Bank', type: 'Bank' },
    { id: 2, name: 'Urban Finance Ltd', type: 'NBFC' },
    { id: 3, name: 'ICICI Bank', type: 'Bank' },
    { id: 4, name: 'Bajaj Finance', type: 'NBFC' },
  ];

  // Mock extracted data
  const mockExtractedData = {
    invoiceNumber: { value: 'INV-2024-0078', confidence: 98 },
    invoiceDate: { value: '2024-12-28', confidence: 95 },
    dueDate: { value: '2025-02-28', confidence: 92 },
    sellerName: { value: 'Kumar Textiles Pvt Ltd', confidence: 96 },
    sellerGstin: { value: '27AABCU9603R1ZM', confidence: 99 },
    buyerName: { value: 'Ansai Mart', confidence: 97 },
    buyerGstin: { value: '27AABCU9603R1ZN', confidence: 98 },
    subtotal: { value: '245000', confidence: 94 },
    cgst: { value: '22050', confidence: 91 },
    sgst: { value: '22050', confidence: 91 },
    totalAmount: { value: '289100', confidence: 96 },
    hsnCode: { value: '5208', confidence: 78, warning: 'Low confidence - please verify' },
    overallConfidence: 92.5,
    validationResults: [
      { rule: 'GSTIN Format', passed: true },
      { rule: 'Date Validation', passed: true },
      { rule: 'Amount Calculation', passed: true },
      { rule: 'Duplicate Check', passed: true },
    ]
  };

  // Handle file upload
  const handleFileUpload = useCallback((file) => {
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setUploadedFile(file);
    }
  }, []);

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  // Simulate AI extraction
  const startExtraction = () => {
    setIsExtracting(true);
    setCurrentStep(1);
    
    // Simulate extraction progress
    setTimeout(() => {
      setExtractedData(mockExtractedData);
      setIsExtracting(false);
      setExtractionComplete(true);
      
      // Auto-select seller if GSTIN matches
      const matchedSeller = mappedSellers.find(s => s.gstin === mockExtractedData.sellerGstin.value);
      if (matchedSeller) setSelectedSeller(matchedSeller);
    }, 3000);
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    if (!extractedData || !discountSettings.discountPercent) return 0;
    return (parseFloat(extractedData.totalAmount.value) * parseFloat(discountSettings.discountPercent)) / 100;
  };

  const calculateNetAmount = () => {
    if (!extractedData) return 0;
    return parseFloat(extractedData.totalAmount.value) - calculateDiscount();
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Upload
        return (
          <div className="max-w-2xl mx-auto">
            <div 
              className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-all
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${uploadedFile ? 'border-green-500 bg-green-50' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-800">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <button 
                      onClick={() => setUploadedFile(null)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                    <button 
                      onClick={startExtraction}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Sparkles size={18} />
                      <span>Extract with AI</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload size={32} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      {isDragging ? 'Drop your invoice here' : 'Drag & drop your invoice'}
                    </p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload"
                    className="inline-block bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Browse Files
                  </label>
                  <p className="text-xs text-gray-400">Supported: PDF, JPEG, PNG, TIFF (Max 10MB)</p>
                </div>
              )}
            </div>

            {/* Quick Upload Options */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Upload from Computer</p>
                  <p className="text-sm text-gray-500">Select a file from your device</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Manual Entry</p>
                  <p className="text-sm text-gray-500">Enter invoice details manually</p>
                </div>
              </button>
            </div>
          </div>
        );

      case 1: // AI Extraction
        return (
          <div className="max-w-5xl mx-auto">
            {isExtracting ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Sparkles size={40} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">AI is extracting invoice data...</h3>
                <p className="text-gray-500 mb-6">This usually takes 10-30 seconds</p>
                <div className="max-w-md mx-auto">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full animate-[progress_3s_ease-in-out]" style={{width: '100%'}}></div>
                  </div>
                  <div className="mt-4 space-y-2 text-left">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Analyzing document structure...</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock size={14} />
                      <span>Extracting text with OCR...</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock size={14} />
                      <span>Identifying invoice fields...</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock size={14} />
                      <span>Validating extracted data...</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : extractionComplete && extractedData && (
              <div className="grid grid-cols-2 gap-6">
                {/* Document Preview */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <span className="font-medium text-gray-700">Invoice Preview</span>
                    <div className="flex items-center space-x-2">
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <ZoomOut size={16} className="text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <ZoomIn size={16} className="text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <RotateCw size={16} className="text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Download size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="h-[600px] bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <FileText size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Invoice Preview</p>
                      <p className="text-sm">{uploadedFile?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Extracted Data */}
                <div className="space-y-4">
                  {/* Extraction Summary */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Extraction Complete</h3>
                          <p className="text-sm text-gray-500">Overall confidence: {extractedData.overallConfidence}%</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                        <RefreshCw size={14} />
                        <span>Re-extract</span>
                      </button>
                    </div>
                    
                    {/* Validation Results */}
                    <div className="flex items-center space-x-4 text-sm">
                      {extractedData.validationResults.map((result, i) => (
                        <div key={i} className="flex items-center space-x-1">
                          {result.passed ? 
                            <CheckCircle size={14} className="text-green-500" /> : 
                            <AlertCircle size={14} className="text-red-500" />
                          }
                          <span className={result.passed ? 'text-green-700' : 'text-red-700'}>{result.rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extracted Fields */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 max-h-[500px] overflow-y-auto">
                    <h4 className="font-medium text-gray-800 mb-3">Extracted Fields</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <ExtractedField 
                        label="Invoice Number" 
                        value={extractedData.invoiceNumber.value}
                        confidence={extractedData.invoiceNumber.confidence}
                        required
                        onChange={(v) => console.log('Updated:', v)}
                      />
                      <ExtractedField 
                        label="Invoice Date" 
                        value={extractedData.invoiceDate.value}
                        confidence={extractedData.invoiceDate.confidence}
                        required
                        type="date"
                        onChange={(v) => console.log('Updated:', v)}
                      />
                    </div>

                    <ExtractedField 
                      label="Due Date" 
                      value={extractedData.dueDate.value}
                      confidence={extractedData.dueDate.confidence}
                      required
                      type="date"
                      onChange={(v) => console.log('Updated:', v)}
                    />

                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Seller Details</h5>
                      <div className="space-y-3">
                        <ExtractedField 
                          label="Seller Name" 
                          value={extractedData.sellerName.value}
                          confidence={extractedData.sellerName.confidence}
                          required
                          onChange={(v) => console.log('Updated:', v)}
                        />
                        <ExtractedField 
                          label="Seller GSTIN" 
                          value={extractedData.sellerGstin.value}
                          confidence={extractedData.sellerGstin.confidence}
                          required
                          verified
                          onChange={(v) => console.log('Updated:', v)}
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Amount Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <ExtractedField 
                          label="Subtotal" 
                          value={extractedData.subtotal.value}
                          confidence={extractedData.subtotal.confidence}
                          required
                          type="currency"
                          onChange={(v) => console.log('Updated:', v)}
                        />
                        <ExtractedField 
                          label="CGST" 
                          value={extractedData.cgst.value}
                          confidence={extractedData.cgst.confidence}
                          type="currency"
                          onChange={(v) => console.log('Updated:', v)}
                        />
                        <ExtractedField 
                          label="SGST" 
                          value={extractedData.sgst.value}
                          confidence={extractedData.sgst.confidence}
                          type="currency"
                          onChange={(v) => console.log('Updated:', v)}
                        />
                        <ExtractedField 
                          label="Total Amount" 
                          value={extractedData.totalAmount.value}
                          confidence={extractedData.totalAmount.confidence}
                          required
                          type="currency"
                          onChange={(v) => console.log('Updated:', v)}
                        />
                      </div>
                    </div>

                    <ExtractedField 
                      label="HSN/SAC Code" 
                      value={extractedData.hsnCode.value}
                      confidence={extractedData.hsnCode.confidence}
                      warning={extractedData.hsnCode.warning}
                      onChange={(v) => console.log('Updated:', v)}
                    />
                  </div>

                  {/* Seller Selection */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Confirm Seller</h4>
                    {selectedSeller ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle size={20} className="text-green-600" />
                          <div>
                            <p className="font-medium text-gray-800">{selectedSeller.name}</p>
                            <p className="text-sm text-gray-500 font-mono">{selectedSeller.gstin}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedSeller(null)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <select 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        onChange={(e) => setSelectedSeller(mappedSellers.find(s => s.id === parseInt(e.target.value)))}
                      >
                        <option value="">Select seller from your vendors</option>
                        {mappedSellers.map(seller => (
                          <option key={seller.id} value={seller.id}>
                            {seller.name} ({seller.gstin})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Set Discount
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Set Discount Terms</h3>
              
              {/* Invoice Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Invoice Amount</p>
                    <p className="text-xl font-bold text-gray-800">₹2,89,100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Seller</p>
                    <p className="text-lg font-medium text-gray-800">Kumar Textiles</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="text-lg font-medium text-gray-800">Feb 28, 2025</p>
                  </div>
                </div>
              </div>

              {/* Discount Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDiscountSettings({...discountSettings, discountType: 'fixed'})}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      discountSettings.discountType === 'fixed' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        discountSettings.discountType === 'fixed' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Percent size={20} className={discountSettings.discountType === 'fixed' ? 'text-blue-600' : 'text-gray-500'} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Fixed Percentage</p>
                        <p className="text-sm text-gray-500">Set a fixed discount rate</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setDiscountSettings({...discountSettings, discountType: 'sliding'})}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      discountSettings.discountType === 'sliding' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        discountSettings.discountType === 'sliding' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Clock size={20} className={discountSettings.discountType === 'sliding' ? 'text-blue-600' : 'text-gray-500'} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Sliding Scale</p>
                        <p className="text-sm text-gray-500">Rate varies by payment date</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Discount Percentage */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {discountSettings.discountType === 'fixed' ? 'Discount Percentage' : 'Base Rate (per day)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={discountSettings.discountPercent}
                    onChange={(e) => setDiscountSettings({...discountSettings, discountPercent: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder={discountSettings.discountType === 'fixed' ? "e.g., 2.0" : "e.g., 0.05"}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {discountSettings.discountType === 'fixed' 
                    ? 'Typical range: 1-3% for 30-60 days early payment'
                    : 'Rate applied per day of early payment'
                  }
                </p>
              </div>

              {/* Early Payment Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Early Payment Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={discountSettings.earlyPaymentDate}
                    onChange={(e) => setDiscountSettings({...discountSettings, earlyPaymentDate: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">When will you make the early payment to the seller?</p>
              </div>

              {/* Calculation Preview */}
              {discountSettings.discountPercent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">Discount Calculation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Invoice Amount</p>
                      <p className="font-semibold text-gray-800">₹2,89,100</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Discount ({discountSettings.discountPercent}%)</p>
                      <p className="font-semibold text-green-600">-₹{((289100 * parseFloat(discountSettings.discountPercent || 0)) / 100).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Days Early</p>
                      <p className="font-semibold text-gray-800">45 days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment to Seller</p>
                      <p className="font-bold text-lg text-gray-800">₹{(289100 - (289100 * parseFloat(discountSettings.discountPercent || 0)) / 100).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3: // Review & Submit
        return (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-6">
              {/* Invoice Summary */}
              <div className="col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Invoice Number</p>
                      <p className="font-medium text-gray-800">INV-2024-0078</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Invoice Date</p>
                      <p className="font-medium text-gray-800">Dec 28, 2024</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-medium text-gray-800">Feb 28, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-bold text-xl text-gray-800">₹2,89,100</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Seller Details</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Kumar Textiles Pvt Ltd</p>
                      <p className="text-sm text-gray-500 font-mono">27AABCU9603R1ZM</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Discount Terms</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Discount Rate</p>
                      <p className="font-medium text-green-600 text-xl">{discountSettings.discountPercent || 2}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Discount Amount</p>
                      <p className="font-medium text-green-600">-₹5,782</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Early Payment Date</p>
                      <p className="font-medium text-gray-800">Jan 15, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Net Amount to Seller</p>
                      <p className="font-bold text-xl text-gray-800">₹2,83,318</p>
                    </div>
                  </div>
                </div>

                {/* Funding Selection */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Funding Selection (Optional)</h3>
                  <p className="text-sm text-gray-500 mb-4">Choose how you want to fund this early payment. You can also decide after seller accepts.</p>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      fundingChoice === 'self' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="funding" 
                        value="self"
                        checked={fundingChoice === 'self'}
                        onChange={(e) => setFundingChoice(e.target.value)}
                        className="mr-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Self-Funded</p>
                        <p className="text-sm text-gray-500">Pay from your treasury</p>
                      </div>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      fundingChoice === 'financier' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="funding" 
                        value="financier"
                        checked={fundingChoice === 'financier'}
                        onChange={(e) => setFundingChoice(e.target.value)}
                        className="mr-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Financier-Funded</p>
                        <p className="text-sm text-gray-500">Send to financiers for bidding</p>
                      </div>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      fundingChoice === 'later' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="funding" 
                        value="later"
                        checked={fundingChoice === 'later'}
                        onChange={(e) => setFundingChoice(e.target.value)}
                        className="mr-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Decide Later</p>
                        <p className="text-sm text-gray-500">Choose after seller accepts the discount</p>
                      </div>
                    </label>
                  </div>

                  {/* Financier Selection */}
                  {fundingChoice === 'financier' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">Select Financiers for Bidding</p>
                      <div className="space-y-2">
                        {availableFinanciers.map(fin => (
                          <label key={fin.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={selectedFinanciers.includes(fin.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFinanciers([...selectedFinanciers, fin.id]);
                                } else {
                                  setSelectedFinanciers(selectedFinanciers.filter(id => id !== fin.id));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="font-medium text-gray-800">{fin.name}</span>
                            <span className="text-sm text-gray-500">({fin.type})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Panel */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 sticky top-6">
                  <h4 className="font-semibold text-blue-800 mb-4">Ready to Submit</h4>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-gray-700">Invoice data verified</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-gray-700">Seller confirmed</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-gray-700">Discount terms set</span>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2">
                    <Send size={18} />
                    <span>Submit & Send to Seller</span>
                  </button>

                  <button className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center space-x-2">
                    <Save size={18} />
                    <span>Save as Draft</span>
                  </button>

                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Seller will receive email & in-app notification
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Info size={16} className="text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Note</p>
                      <p className="text-xs text-yellow-700">Seller has 48 hours to accept or reject this discount offer.</p>
                    </div>
                  </div>
                </div>
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Create Invoice</h1>
              <p className="text-sm text-gray-500">Dynamic Discounting Workflow</p>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-200 py-6">
        <StepIndicator currentStep={currentStep} steps={steps} />
      </div>

      {/* Content */}
      <div className="p-6">
        {renderStepContent()}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep < 3 && (
              <button
                onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                disabled={currentStep === 0 && !uploadedFile}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
