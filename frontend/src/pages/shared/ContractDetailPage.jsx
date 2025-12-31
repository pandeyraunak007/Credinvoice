import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Download, ArrowLeft, RefreshCw, Users, Building2,
  Calendar, DollarSign, CheckCircle, Clock, AlertCircle, Printer
} from 'lucide-react';
import { contractService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const contractTypeConfig = {
  TWO_PARTY: {
    label: 'Self-Funded (2-Party)',
    color: 'bg-blue-100 text-blue-700',
    description: 'Direct payment from Buyer to Seller',
  },
  THREE_PARTY: {
    label: 'Financier-Funded (3-Party)',
    color: 'bg-purple-100 text-purple-700',
    description: 'Financier provides early payment to Seller',
  },
};

const statusConfig = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export default function ContractDetailPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContractText, setShowContractText] = useState(false);

  const fetchContract = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await contractService.getById(contractId);
      setContract(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  const handleDownload = async () => {
    try {
      await contractService.download(contractId);
    } catch (err) {
      alert('Failed to download contract');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${contract?.contractNumber} - Contract</title>
          <style>
            body { font-family: 'Courier New', monospace; white-space: pre-wrap; padding: 20px; }
          </style>
        </head>
        <body>${contract?.contractText}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getBackPath = () => {
    switch (user?.userType) {
      case 'SELLER': return '/seller/contracts';
      case 'FINANCIER': return '/financier/contracts';
      default: return '/contracts';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={32} />
          <p className="text-gray-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Contract</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(getBackPath())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  if (!contract) return null;

  const StatusIcon = statusConfig[contract.status]?.icon || CheckCircle;
  const isThreeParty = contract.contractType === 'THREE_PARTY';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(getBackPath())}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-800">{contract.contractNumber}</h1>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${contractTypeConfig[contract.contractType]?.color}`}>
                  {contractTypeConfig[contract.contractType]?.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[contract.status]?.color}`}>
                  {statusConfig[contract.status]?.label}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Generated on {formatDate(contract.generatedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Printer size={18} />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={18} />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Invoice Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
              <FileText size={16} className="mr-2" />
              Invoice Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Invoice Number</p>
                <p className="font-semibold text-gray-800">{contract.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Invoice Date</p>
                <p className="font-medium text-gray-800">{formatDate(contract.invoiceDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Original Due Date</p>
                <p className="font-medium text-gray-800">{formatDate(contract.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Invoice Amount</p>
                <p className="font-semibold text-gray-800 text-lg">{formatCurrency(contract.invoiceAmount)}</p>
              </div>
            </div>
          </div>

          {/* Discount Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
              <DollarSign size={16} className="mr-2" />
              Discount Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Discount Rate</p>
                <p className="font-semibold text-green-600 text-lg">{contract.discountPercentage}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Discount Amount</p>
                <p className="font-medium text-green-600">{formatCurrency(contract.discountAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Early Payment Date</p>
                <p className="font-medium text-gray-800">{formatDate(contract.earlyPaymentDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Seller Receives</p>
                <p className="font-semibold text-blue-600 text-lg">{formatCurrency(contract.sellerReceives)}</p>
              </div>
            </div>
          </div>

          {/* Payment Flow */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
              <Clock size={16} className="mr-2" />
              Payment Flow
            </h3>
            {isThreeParty ? (
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium">Step 1: Financier → Seller</p>
                  <p className="font-semibold text-purple-700">{formatCurrency(contract.financierPays)}</p>
                  <p className="text-xs text-gray-500">Within 2 business days</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Step 2: Buyer → Financier</p>
                  <p className="font-semibold text-blue-700">{formatCurrency(contract.buyerRepays)}</p>
                  <p className="text-xs text-gray-500">By {formatDate(contract.repaymentDueDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Financier Rate</p>
                  <p className="font-medium text-gray-800">{contract.financierRate}% (annualized)</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Buyer → Seller</p>
                  <p className="font-semibold text-green-700">{formatCurrency(contract.buyerPays)}</p>
                  <p className="text-xs text-gray-500">By {formatDate(contract.earlyPaymentDate)}</p>
                </div>
                <p className="text-sm text-gray-600">
                  Direct payment from Buyer to Seller. No financier involved.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Parties</h3>
          <div className={`grid grid-cols-1 ${isThreeParty ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
            {/* Buyer */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Building2 size={18} className="text-blue-600" />
                <h4 className="font-medium text-blue-800">Buyer</h4>
              </div>
              <p className="font-semibold text-gray-800">{contract.buyer?.companyName || 'N/A'}</p>
              <p className="text-sm text-gray-600">GSTIN: {contract.buyer?.gstin || 'N/A'}</p>
              {contract.buyer?.address && (
                <p className="text-sm text-gray-500 mt-1">{contract.buyer.address}</p>
              )}
            </div>

            {/* Seller */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Users size={18} className="text-green-600" />
                <h4 className="font-medium text-green-800">Seller</h4>
              </div>
              <p className="font-semibold text-gray-800">{contract.seller?.companyName || 'N/A'}</p>
              <p className="text-sm text-gray-600">GSTIN: {contract.seller?.gstin || 'N/A'}</p>
              {contract.seller?.address && (
                <p className="text-sm text-gray-500 mt-1">{contract.seller.address}</p>
              )}
            </div>

            {/* Financier (only for 3-party) */}
            {isThreeParty && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Building2 size={18} className="text-purple-600" />
                  <h4 className="font-medium text-purple-800">Financier</h4>
                </div>
                <p className="font-semibold text-gray-800">{contract.financier?.companyName || 'N/A'}</p>
                <p className="text-sm text-gray-600">
                  {contract.financier?.entityType || 'Financial Institution'}
                </p>
                {contract.financier?.rbiLicense && (
                  <p className="text-sm text-gray-500">License: {contract.financier.rbiLicense}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contract Text */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Contract Document</h3>
            <button
              onClick={() => setShowContractText(!showContractText)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showContractText ? 'Hide Document' : 'View Document'}
            </button>
          </div>

          {showContractText && contract.contractText && (
            <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {contract.contractText}
              </pre>
            </div>
          )}

          {!showContractText && (
            <p className="text-gray-500 text-sm">
              Click "View Document" to see the full contract text, or download the contract for your records.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
