import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Download, Eye, ArrowLeft, RefreshCw, Filter,
  Users, Building2, Calendar, DollarSign, Clock, CheckCircle
} from 'lucide-react';
import { contractService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const contractTypeConfig = {
  TWO_PARTY: {
    label: 'Self-Funded',
    color: 'bg-blue-100 text-blue-700',
    description: 'Buyer pays Seller directly',
  },
  THREE_PARTY: {
    label: 'Financier-Funded',
    color: 'bg-purple-100 text-purple-700',
    description: 'Financier provides early payment',
  },
};

const statusConfig = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export default function ContractsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    contractType: '',
    status: '',
  });

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter.contractType) params.contractType = filter.contractType;
      if (filter.status) params.status = filter.status;

      const response = await contractService.list(params);
      setContracts(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [filter]);

  const handleDownload = async (e, contractId) => {
    e.stopPropagation();
    try {
      await contractService.downloadPDF(contractId);
    } catch (err) {
      alert('Failed to download contract');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getBackPath = () => {
    switch (user?.userType) {
      case 'SELLER': return '/seller';
      case 'FINANCIER': return '/financier';
      default: return '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={32} />
          <p className="text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-800">Contracts</h1>
              <p className="text-gray-500 text-sm">View your financing contracts</p>
            </div>
          </div>
          <button
            onClick={fetchContracts}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-4">
          <div className="flex items-center space-x-4">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filter.contractType}
              onChange={(e) => setFilter({ ...filter, contractType: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="">All Types</option>
              <option value="TWO_PARTY">Self-Funded</option>
              <option value="THREE_PARTY">Financier-Funded</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <span className="text-sm text-gray-500 ml-auto">
              {contracts.length} contract{contracts.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && contracts.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Contracts Found</h3>
            <p className="text-gray-500">
              Contracts are generated when discount offers are finalized.
            </p>
          </div>
        )}

        {/* Contracts List */}
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              onClick={() => navigate(`/contracts/${contract.id}`)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-blue-300 transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {contract.contractNumber}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${contractTypeConfig[contract.contractType]?.color}`}>
                      {contractTypeConfig[contract.contractType]?.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[contract.status]?.color}`}>
                      {statusConfig[contract.status]?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Invoice</p>
                        <p className="text-sm font-medium text-gray-800">{contract.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Invoice Amount</p>
                        <p className="text-sm font-medium text-gray-800">{formatCurrency(contract.invoiceAmount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Seller Receives</p>
                        <p className="text-sm font-medium text-green-600">{formatCurrency(contract.sellerReceives)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Generated</p>
                        <p className="text-sm font-medium text-gray-800">{formatDate(contract.generatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>Discount: {contract.discountPercentage}%</span>
                    </span>
                    {contract.contractType === 'THREE_PARTY' && contract.financierRate && (
                      <span className="flex items-center space-x-1">
                        <Building2 size={14} />
                        <span>Financier Rate: {contract.financierRate}%</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/contracts/${contract.id}`);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="View Contract"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={(e) => handleDownload(e, contract.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Download Contract"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
