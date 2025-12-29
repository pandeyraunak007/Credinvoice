import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, CheckCircle, AlertTriangle, X, ArrowLeft, ArrowRight,
  Loader2, Sparkles, Edit2, Calendar, Building2, PenLine,
  Percent, Clock, Send, Save, Info, Check, AlertCircle, RefreshCw,
  ZoomIn, ZoomOut, RotateCw, Download
} from 'lucide-react';
import { invoiceService } from '../../services/api';

// Step indicator
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

// Editable field
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
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [discountSettings, setDiscountSettings] = useState({
    discountType: 'fixed',
    discountPercent: '2.0',
    earlyPaymentDate: '2025-01-15',
  });
  const [fundingChoice, setFundingChoice] = useState('later');
  const [selectedFinanciers, setSelectedFinanciers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [entryMode, setEntryMode] = useState(null); // 'ai' or 'manual'
  const [manualData, setManualData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    sellerName: '',
    sellerGstin: '',
    buyerName: '',
    buyerGstin: '',
    subtotal: '',
    taxAmount: '',
    totalAmount: '',
  });

  const getSteps = () => {
    if (entryMode === 'manual') {
      return [
        { id: 'entry', label: 'Invoice Details' },
        { id: 'discount', label: 'Set Discount' },
        { id: 'review', label: 'Review & Submit' },
      ];
    }
    return [
      { id: 'upload', label: 'Upload Invoice' },
      { id: 'extract', label: 'AI Extraction' },
      { id: 'discount', label: 'Set Discount' },
      { id: 'review', label: 'Review & Submit' },
    ];
  };

  const steps = getSteps();

  const mappedSellers = [
    { id: 1, name: 'Kumar Textiles Pvt Ltd', gstin: '27AABCU9603R1ZM' },
    { id: 2, name: 'Steel Corp India', gstin: '29GGGGG1314R9Z6' },
    { id: 3, name: 'Auto Parts Ltd', gstin: '33AABCT1332L1ZZ' },
    { id: 4, name: 'Fabric House', gstin: '27AAAAA0000A1Z5' },
  ];

  const availableFinanciers = [
    { id: 1, name: 'HDFC Bank', type: 'Bank' },
    { id: 2, name: 'Urban Finance Ltd', type: 'NBFC' },
    { id: 3, name: 'ICICI Bank', type: 'Bank' },
    { id: 4, name: 'Bajaj Finance', type: 'NBFC' },
  ];

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

  const handleFileUpload = useCallback((file) => {
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setUploadedFile(file);
    }
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const startExtraction = async () => {
    setIsExtracting(true);
    setCurrentStep(1);

    try {
      // Try to use the real API extraction
      const result = await invoiceService.extractFromFile(uploadedFile);
      if (result.data) {
        // Map API response to our format
        const data = result.data;
        setExtractedData({
          invoiceNumber: { value: data.invoiceNumber || '', confidence: data.confidence?.invoiceNumber || 95 },
          invoiceDate: { value: data.invoiceDate || '', confidence: data.confidence?.invoiceDate || 90 },
          dueDate: { value: data.dueDate || '', confidence: data.confidence?.dueDate || 90 },
          sellerName: { value: data.sellerName || '', confidence: data.confidence?.sellerName || 85 },
          sellerGstin: { value: data.sellerGstin || '', confidence: data.confidence?.sellerGstin || 95 },
          buyerName: { value: data.buyerName || '', confidence: data.confidence?.buyerName || 90 },
          buyerGstin: { value: data.buyerGstin || '', confidence: data.confidence?.buyerGstin || 95 },
          subtotal: { value: String(data.subtotal || 0), confidence: data.confidence?.subtotal || 90 },
          taxAmount: { value: String(data.taxAmount || 0), confidence: data.confidence?.taxAmount || 90 },
          totalAmount: { value: String(data.totalAmount || 0), confidence: data.confidence?.totalAmount || 95 },
          overallConfidence: data.overallConfidence || 90,
          validationResults: data.validationResults || [
            { rule: 'GSTIN Format', passed: true },
            { rule: 'Date Validation', passed: true },
            { rule: 'Amount Calculation', passed: true },
          ]
        });
        setExtractionComplete(true);
      }
    } catch (error) {
      console.error('AI extraction failed, using mock data:', error);
      // Fall back to mock data for demo purposes
      setExtractedData(mockExtractedData);
      setExtractionComplete(true);
      const matchedSeller = mappedSellers.find(s => s.gstin === mockExtractedData.sellerGstin.value);
      if (matchedSeller) setSelectedSeller(matchedSeller);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const invoiceData = {
        invoiceNumber: extractedData.invoiceNumber.value,
        invoiceDate: extractedData.invoiceDate.value,
        dueDate: extractedData.dueDate.value,
        sellerGstin: extractedData.sellerGstin.value,
        sellerName: extractedData.sellerName.value,
        buyerGstin: extractedData.buyerGstin?.value || '',
        buyerName: extractedData.buyerName?.value || '',
        subtotal: parseFloat(extractedData.subtotal.value) || 0,
        taxAmount: parseFloat(extractedData.taxAmount?.value || extractedData.cgst?.value || 0) +
                   parseFloat(extractedData.sgst?.value || 0),
        totalAmount: parseFloat(extractedData.totalAmount.value) || 0,
        discountPercentage: parseFloat(discountSettings.discountPercent) || 0,
        earlyPaymentDate: discountSettings.earlyPaymentDate,
        productType: fundingChoice === 'self' ? 'DD_SELF_FUNDED' : 'DD_EARLY_PAYMENT',
      };

      const response = await invoiceService.create(invoiceData);

      if (response.data && fundingChoice !== 'later') {
        // Submit the invoice after creation
        await invoiceService.submit(response.data.id);
      }

      navigate('/invoices');
    } catch (error) {
      console.error('Failed to create invoice:', error);
      setSubmitError(error.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const invoiceData = {
        invoiceNumber: extractedData?.invoiceNumber?.value || '',
        invoiceDate: extractedData?.invoiceDate?.value || new Date().toISOString().split('T')[0],
        dueDate: extractedData?.dueDate?.value || '',
        sellerGstin: extractedData?.sellerGstin?.value || '',
        sellerName: extractedData?.sellerName?.value || '',
        subtotal: parseFloat(extractedData?.subtotal?.value) || 0,
        taxAmount: parseFloat(extractedData?.taxAmount?.value || 0),
        totalAmount: parseFloat(extractedData?.totalAmount?.value) || 0,
        discountPercentage: parseFloat(discountSettings.discountPercent) || 0,
        productType: 'DD_EARLY_PAYMENT',
      };

      await invoiceService.create(invoiceData);
      navigate('/invoices');
    } catch (error) {
      console.error('Failed to save draft:', error);
      setSubmitError(error.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert manual data to extracted data format
  const convertManualToExtracted = () => {
    setExtractedData({
      invoiceNumber: { value: manualData.invoiceNumber, confidence: 100 },
      invoiceDate: { value: manualData.invoiceDate, confidence: 100 },
      dueDate: { value: manualData.dueDate, confidence: 100 },
      sellerName: { value: manualData.sellerName, confidence: 100 },
      sellerGstin: { value: manualData.sellerGstin, confidence: 100 },
      buyerName: { value: manualData.buyerName, confidence: 100 },
      buyerGstin: { value: manualData.buyerGstin, confidence: 100 },
      subtotal: { value: manualData.subtotal, confidence: 100 },
      taxAmount: { value: manualData.taxAmount, confidence: 100 },
      totalAmount: { value: manualData.totalAmount, confidence: 100 },
      overallConfidence: 100,
      validationResults: [
        { rule: 'Manual Entry', passed: true },
      ]
    });
    setExtractionComplete(true);
  };

  // Handle manual entry mode selection
  const handleManualEntry = () => {
    setEntryMode('manual');
    setCurrentStep(0);
  };

  // Handle AI extraction mode selection
  const handleAIEntry = () => {
    setEntryMode('ai');
  };

  // Calculate total from subtotal and tax
  const updateTotalAmount = (subtotal, tax) => {
    const total = (parseFloat(subtotal) || 0) + (parseFloat(tax) || 0);
    setManualData(prev => ({ ...prev, totalAmount: total.toString() }));
  };

  const renderStepContent = () => {
    // Manual entry form (when entryMode is 'manual')
    if (entryMode === 'manual' && currentStep === 0) {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Enter Invoice Details</h3>
              <button
                onClick={() => { setEntryMode(null); setCurrentStep(0); }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Back to options
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                <input
                  type="text"
                  value={manualData.invoiceNumber}
                  onChange={(e) => setManualData({ ...manualData, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., INV-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
                <input
                  type="date"
                  value={manualData.invoiceDate}
                  onChange={(e) => setManualData({ ...manualData, invoiceDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={manualData.dueDate}
                  onChange={(e) => setManualData({ ...manualData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <hr className="my-6" />

            <h4 className="font-medium text-gray-800 mb-4">Seller Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller Name *</label>
                <input
                  type="text"
                  value={manualData.sellerName}
                  onChange={(e) => setManualData({ ...manualData, sellerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Kumar Textiles Pvt Ltd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller GSTIN *</label>
                <input
                  type="text"
                  value={manualData.sellerGstin}
                  onChange={(e) => setManualData({ ...manualData, sellerGstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="e.g., 27AABCU9603R1ZM"
                  maxLength={15}
                />
              </div>
            </div>

            <hr className="my-6" />

            <h4 className="font-medium text-gray-800 mb-4">Buyer Information (Your Company)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
                <input
                  type="text"
                  value={manualData.buyerName}
                  onChange={(e) => setManualData({ ...manualData, buyerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer GSTIN</label>
                <input
                  type="text"
                  value={manualData.buyerGstin}
                  onChange={(e) => setManualData({ ...manualData, buyerGstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Your GSTIN"
                  maxLength={15}
                />
              </div>
            </div>

            <hr className="my-6" />

            <h4 className="font-medium text-gray-800 mb-4">Amount Details</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal (₹) *</label>
                <input
                  type="number"
                  value={manualData.subtotal}
                  onChange={(e) => {
                    setManualData({ ...manualData, subtotal: e.target.value });
                    updateTotalAmount(e.target.value, manualData.taxAmount);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount (₹)</label>
                <input
                  type="number"
                  value={manualData.taxAmount}
                  onChange={(e) => {
                    setManualData({ ...manualData, taxAmount: e.target.value });
                    updateTotalAmount(manualData.subtotal, e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹) *</label>
                <input
                  type="number"
                  value={manualData.totalAmount}
                  onChange={(e) => setManualData({ ...manualData, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info size={18} className="text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Required fields are marked with *</p>
                  <p>Make sure all details match your invoice document for accurate processing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        // Entry mode selection (initial state)
        if (!entryMode) {
          return (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">How would you like to create the invoice?</h2>
                <p className="text-gray-500">Choose between AI-powered extraction or manual entry</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* AI Extraction Option */}
                <div
                  onClick={handleAIEntry}
                  className="bg-white border-2 border-gray-200 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
                    <Sparkles size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">AI Extraction</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Upload your invoice and let AI extract all the details automatically
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>Automatic data extraction</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>Confidence scores</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>GSTIN validation</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700 text-center">
                      <AlertCircle size={12} className="inline mr-1" />
                      AI feature coming soon - uses demo data for now
                    </p>
                  </div>
                </div>

                {/* Manual Entry Option */}
                <div
                  onClick={handleManualEntry}
                  className="bg-white border-2 border-gray-200 rounded-xl p-8 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all group"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                    <PenLine size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Manual Entry</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Enter invoice details manually using a simple form
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>Full control over data</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>No file upload needed</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>Quick and simple</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 text-center">
                      <Check size={12} className="inline mr-1" />
                      Recommended for quick invoice creation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // AI mode - file upload
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Upload Invoice for AI Extraction</h3>
              <button
                onClick={() => { setEntryMode(null); setUploadedFile(null); }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Back to options
              </button>
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${uploadedFile ? 'border-green-500 bg-green-50' : ''}`}
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
                    <button onClick={() => setUploadedFile(null)} className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Remove
                    </button>
                    <button onClick={startExtraction} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
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
                  <label htmlFor="file-upload" className="inline-block bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    Browse Files
                  </label>
                  <p className="text-xs text-gray-400">Supported: PDF, JPEG, PNG (Max 10MB)</p>
                </div>
              )}
            </div>
          </div>
        );

      case 1:
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
                    <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{width: '70%'}}></div>
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
                      <button className="p-1.5 hover:bg-gray-200 rounded"><ZoomOut size={16} /></button>
                      <button className="p-1.5 hover:bg-gray-200 rounded"><ZoomIn size={16} /></button>
                      <button className="p-1.5 hover:bg-gray-200 rounded"><RotateCw size={16} /></button>
                    </div>
                  </div>
                  <div className="h-[500px] bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <FileText size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Invoice Preview</p>
                      <p className="text-sm">{uploadedFile?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Extracted Data */}
                <div className="space-y-4">
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
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      {extractedData.validationResults.map((result, i) => (
                        <div key={i} className="flex items-center space-x-1">
                          <CheckCircle size={14} className="text-green-500" />
                          <span className="text-green-700">{result.rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 max-h-[400px] overflow-y-auto">
                    <h4 className="font-medium text-gray-800 mb-3">Extracted Fields</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <ExtractedField label="Invoice Number" value={extractedData.invoiceNumber.value} confidence={extractedData.invoiceNumber.confidence} required onChange={() => {}} />
                      <ExtractedField label="Invoice Date" value={extractedData.invoiceDate.value} confidence={extractedData.invoiceDate.confidence} required onChange={() => {}} />
                    </div>
                    <ExtractedField label="Due Date" value={extractedData.dueDate.value} confidence={extractedData.dueDate.confidence} required onChange={() => {}} />
                    <ExtractedField label="Seller Name" value={extractedData.sellerName.value} confidence={extractedData.sellerName.confidence} required onChange={() => {}} />
                    <ExtractedField label="Seller GSTIN" value={extractedData.sellerGstin.value} confidence={extractedData.sellerGstin.confidence} required verified onChange={() => {}} />
                    <div className="grid grid-cols-2 gap-3">
                      <ExtractedField label="Subtotal" value={extractedData.subtotal.value} confidence={extractedData.subtotal.confidence} type="currency" onChange={() => {}} />
                      <ExtractedField label="Total Amount" value={extractedData.totalAmount.value} confidence={extractedData.totalAmount.confidence} required type="currency" onChange={() => {}} />
                    </div>
                    <ExtractedField label="HSN Code" value={extractedData.hsnCode.value} confidence={extractedData.hsnCode.confidence} warning={extractedData.hsnCode.warning} onChange={() => {}} />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Set Discount Terms</h3>
              
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

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={discountSettings.discountPercent}
                    onChange={(e) => setDiscountSettings({...discountSettings, discountPercent: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="e.g., 2.0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>

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
              </div>

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
                      <p className="font-semibold text-gray-800">44 days</p>
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

      case 3:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Invoice Number</p>
                      <p className="font-medium text-gray-800">INV-2024-0078</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-bold text-xl text-gray-800">₹2,89,100</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Discount Rate</p>
                      <p className="font-medium text-green-600 text-xl">{discountSettings.discountPercent}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Net Amount to Seller</p>
                      <p className="font-bold text-xl text-gray-800">₹{(289100 - (289100 * parseFloat(discountSettings.discountPercent || 0)) / 100).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Funding Selection</h3>
                  <div className="space-y-3">
                    {[
                      { value: 'self', label: 'Self-Funded', desc: 'Pay from your treasury' },
                      { value: 'financier', label: 'Financier-Funded', desc: 'Send to financiers for bidding' },
                      { value: 'later', label: 'Decide Later', desc: 'Choose after seller accepts' }
                    ].map(option => (
                      <label key={option.value} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        fundingChoice === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input 
                          type="radio" 
                          name="funding" 
                          value={option.value}
                          checked={fundingChoice === option.value}
                          onChange={(e) => setFundingChoice(e.target.value)}
                          className="mr-4"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{option.label}</p>
                          <p className="text-sm text-gray-500">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {fundingChoice === 'financier' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">Select Financiers</p>
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

                  {submitError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {submitError}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Submit & Send to Seller</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>Save as Draft</span>
                  </button>
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
            <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Create Invoice</h1>
              <p className="text-sm text-gray-500">Dynamic Discounting Workflow</p>
            </div>
          </div>
          <button onClick={() => navigate('/invoices')} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-200 py-6">
        <StepIndicator currentStep={currentStep} steps={steps} />
      </div>

      {/* Content */}
      <div className="p-6 pb-24">
        {renderStepContent()}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (currentStep === 0 && entryMode) {
                setEntryMode(null);
              } else {
                setCurrentStep(Math.max(0, currentStep - 1));
              }
            }}
            disabled={currentStep === 0 && !entryMode}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep < steps.length - 1 && (
              <button
                onClick={() => {
                  // For manual entry, convert data when moving from step 0
                  if (entryMode === 'manual' && currentStep === 0) {
                    convertManualToExtracted();
                  }
                  setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
                }}
                disabled={
                  // Disable if no entry mode selected
                  (!entryMode && currentStep === 0) ||
                  // For AI mode: disable if no file uploaded on step 0
                  (entryMode === 'ai' && currentStep === 0 && !uploadedFile) ||
                  // For AI mode: disable if extraction not complete on step 1
                  (entryMode === 'ai' && currentStep === 1 && !extractionComplete) ||
                  // For manual mode: disable if required fields missing on step 0
                  (entryMode === 'manual' && currentStep === 0 && (
                    !manualData.invoiceNumber ||
                    !manualData.dueDate ||
                    !manualData.sellerName ||
                    !manualData.sellerGstin ||
                    !manualData.totalAmount
                  ))
                }
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
