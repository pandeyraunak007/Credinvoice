import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, Building2, User,
  FileText, Eye, Download, Shield, ExternalLink, RefreshCw, MessageSquare,
  Check, X, ChevronDown, ChevronUp, Calendar, CreditCard, MapPin, Phone, Mail, Loader
} from 'lucide-react';
import { adminService } from '../../services/api';

const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Clock },
    UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-100 text-purple-700', icon: Eye },
    APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  };
  const { label, color, icon: Icon } = config[status] || config.PENDING;
  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={14} />
      <span>{label}</span>
    </span>
  );
};

const DocumentStatusBadge = ({ status }) => {
  const config = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: 'Verified', color: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  };
  const { label, color } = config[status] || config.PENDING;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
};

export default function KYCReviewDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('details');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getKycApplicationDetails(id);
      setApplication(response.data);
    } catch (err) {
      console.error('Failed to fetch KYC details:', err);
      setError(err.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await adminService.approveKyc(id, { notes: internalNotes });
      setShowApproveModal(false);
      navigate('/admin/kyc');
    } catch (err) {
      console.error('Failed to approve KYC:', err);
      alert('Failed to approve: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.rejectKyc(id, { reason: rejectionReason, notes: internalNotes });
      setShowRejectModal(false);
      navigate('/admin/kyc');
    } catch (err) {
      console.error('Failed to reject KYC:', err);
      alert('Failed to reject: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader size={32} className="animate-spin text-blue-600" />
          <span className="text-gray-600">Loading application...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Application</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin/kyc')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Queue
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Application Not Found</h2>
          <button
            onClick={() => navigate('/admin/kyc')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Queue
          </button>
        </div>
      </div>
    );
  }

  const { user, entity, entityType } = application;
  const kycStatus = entity?.kycStatus || 'PENDING';
  const isApproved = kycStatus === 'APPROVED';
  const isRejected = kycStatus === 'REJECTED';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/admin/kyc')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-gray-800">
                    {entity?.companyName || user?.email || 'KYC Application'}
                  </h1>
                  <StatusBadge status={kycStatus} />
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    entityType === 'BUYER' ? 'bg-blue-100 text-blue-700' :
                    entityType === 'SELLER' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {entityType}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {user?.email} | Submitted {formatDate(entity?.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isApproved && !isRejected && (
                <>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2"
                  >
                    <CheckCircle size={18} />
                    <span>Approve KYC</span>
                  </button>
                </>
              )}
              {isApproved && (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center space-x-2">
                  <CheckCircle size={18} />
                  <span>Already Approved</span>
                </span>
              )}
              {isRejected && (
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium flex items-center space-x-2">
                  <XCircle size={18} />
                  <span>Rejected</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex space-x-6 border-t border-gray-100">
          {['details', 'documents', 'bank'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm capitalize transition ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'bank' ? 'Bank Accounts' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                {/* Business Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Building2 size={20} />
                    <span>Business Details</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium">{entity?.companyName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PAN</p>
                      <p className="font-medium font-mono">{entity?.pan || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">GSTIN</p>
                      <p className="font-medium font-mono">{entity?.gstin || '-'}</p>
                    </div>
                    {entityType === 'FINANCIER' && (
                      <div>
                        <p className="text-sm text-gray-500">RBI License</p>
                        <p className="font-medium font-mono">{entity?.rbiLicense || '-'}</p>
                      </div>
                    )}
                    {entity?.industry && (
                      <div>
                        <p className="text-sm text-gray-500">Industry</p>
                        <p className="font-medium">{entity?.industry}</p>
                      </div>
                    )}
                    {entity?.businessType && (
                      <div>
                        <p className="text-sm text-gray-500">Business Type</p>
                        <p className="font-medium">{entity?.businessType}</p>
                      </div>
                    )}
                  </div>
                  {entity?.address && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="font-medium">
                        {entity?.address}{entity?.city ? `, ${entity?.city}` : ''}
                        {entity?.state ? `, ${entity?.state}` : ''}
                        {entity?.pincode ? ` - ${entity?.pincode}` : ''}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <User size={20} />
                    <span>Contact Person</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Contact Name</p>
                      <p className="font-medium">{entity?.contactName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{entity?.contactPhone || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">User Account</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">User ID</span>
                      <span className="text-sm font-mono">{user?.id?.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Status</span>
                      <span className={`text-sm font-medium ${
                        user?.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'
                      }`}>{user?.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Created</span>
                      <span className="text-sm">{formatDate(user?.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Internal Notes</h3>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add notes for internal reference..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <FileText size={20} />
                <span>KYC Documents</span>
              </h3>
              {entity?.kycDocuments?.length > 0 ? (
                <div className="space-y-3">
                  {entity.kycDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                          <FileText size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{doc.documentType.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500">Uploaded {formatDate(doc.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DocumentStatusBadge status={doc.status} />
                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white rounded-lg"
                        >
                          <Eye size={16} className="text-gray-500" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No documents uploaded yet</p>
                </div>
              )}
            </div>
          )}

          {/* Bank Accounts Tab */}
          {activeTab === 'bank' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <CreditCard size={20} />
                <span>Bank Accounts</span>
              </h3>
              {entity?.bankAccounts?.length > 0 ? (
                <div className="space-y-3">
                  {entity.bankAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                          <CreditCard size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{account.bankName}</p>
                          <p className="text-sm text-gray-500 font-mono">
                            {account.accountNo} | {account.ifscCode}
                          </p>
                          <p className="text-xs text-gray-400">{account.accountType}</p>
                        </div>
                      </div>
                      {account.isPrimary && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No bank accounts added yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Approve KYC Application</h3>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <p className="text-center text-gray-600 mb-4">
                Are you sure you want to approve KYC for <strong>{entity?.companyName || user?.email}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {actionLoading ? <Loader size={18} className="animate-spin" /> : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Reject KYC Application</h3>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-600" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 bg-white"
                  onChange={(e) => setRejectionReason(e.target.value)}
                  value={rejectionReason}
                >
                  <option value="">Select reason</option>
                  <option value="Document information mismatch">Document information mismatch</option>
                  <option value="Invalid or forged documents">Invalid or forged documents</option>
                  <option value="Incomplete application">Incomplete application</option>
                  <option value="Entity/signatory blacklisted">Entity/signatory blacklisted</option>
                  <option value="Other">Other</option>
                </select>
                {rejectionReason === 'Other' && (
                  <textarea
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide detailed reason..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {actionLoading ? <Loader size={18} className="animate-spin" /> : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
