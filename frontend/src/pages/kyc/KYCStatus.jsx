import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Clock, AlertCircle, XCircle, RefreshCw,
  FileText, Building2, CreditCard, User, Shield, Download, Eye,
  Phone, Mail, MessageSquare, ChevronRight, Upload, Edit2, Info
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    verified: { label: 'Verified', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    pending: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    resubmit: { label: 'Resubmission Required', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
    not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock },
  };
  const { label, color, icon: Icon } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${color}`}>
      <Icon size={14} />
      <span>{label}</span>
    </span>
  );
};

const VerificationItem = ({ title, status, lastUpdated, message, onResubmit }) => (
  <div className={`p-4 rounded-xl border ${
    status === 'verified' ? 'bg-green-50 border-green-200' :
    status === 'rejected' || status === 'resubmit' ? 'bg-red-50 border-red-200' :
    'bg-white border-gray-200'
  }`}>
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          status === 'verified' ? 'bg-green-100' :
          status === 'rejected' || status === 'resubmit' ? 'bg-red-100' :
          status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
        }`}>
          {status === 'verified' ? <CheckCircle size={20} className="text-green-600" /> :
           status === 'rejected' || status === 'resubmit' ? <XCircle size={20} className="text-red-600" /> :
           status === 'pending' ? <Clock size={20} className="text-yellow-600" /> :
           <Clock size={20} className="text-gray-400" />}
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{title}</h4>
          {lastUpdated && <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>}
          {message && (
            <p className={`text-sm mt-1 ${status === 'rejected' || status === 'resubmit' ? 'text-red-600' : 'text-gray-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <StatusBadge status={status} />
        {(status === 'rejected' || status === 'resubmit') && onResubmit && (
          <button 
            onClick={onResubmit}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Resubmit
          </button>
        )}
      </div>
    </div>
  </div>
);

export default function KYCStatus() {
  const navigate = useNavigate();
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitType, setResubmitType] = useState(null);

  // Mock KYC status data
  const kycData = {
    overallStatus: 'pending', // verified, pending, rejected, resubmit
    submittedAt: 'December 28, 2024, 10:30 AM',
    lastUpdatedAt: 'December 28, 2024, 02:45 PM',
    estimatedCompletion: '24-48 hours',
    applicationId: 'KYC-2024-00234',
    
    entity: {
      name: 'Kumar Textiles Pvt Ltd',
      type: 'Private Limited Company',
      pan: 'AABCK1234L',
      gstin: '27AABCK1234L1ZM',
      cin: 'U17100MH2015PTC123456'
    },

    verifications: {
      panVerification: { status: 'verified', lastUpdated: 'Dec 28, 2:00 PM', message: 'PAN verified with NSDL database' },
      gstVerification: { status: 'verified', lastUpdated: 'Dec 28, 2:15 PM', message: 'GSTIN verified with GST Network' },
      cinVerification: { status: 'pending', lastUpdated: 'Dec 28, 2:30 PM', message: 'Verification in progress with MCA' },
      bankVerification: { status: 'verified', lastUpdated: 'Dec 28, 2:45 PM', message: 'Bank account verified via penny drop' },
      addressVerification: { status: 'pending', lastUpdated: null, message: 'Awaiting verification' },
      signatoryKyc: { status: 'resubmit', lastUpdated: 'Dec 28, 3:00 PM', message: 'Aadhaar image is blurred. Please upload a clear copy.' },
    },

    documents: [
      { name: 'Company PAN Card', status: 'verified', uploadedAt: 'Dec 28, 10:30 AM' },
      { name: 'GST Certificate', status: 'verified', uploadedAt: 'Dec 28, 10:30 AM' },
      { name: 'Certificate of Incorporation', status: 'pending', uploadedAt: 'Dec 28, 10:30 AM' },
      { name: 'Cancelled Cheque', status: 'verified', uploadedAt: 'Dec 28, 10:30 AM' },
      { name: 'Signatory Aadhaar', status: 'rejected', uploadedAt: 'Dec 28, 10:30 AM', reason: 'Image is blurred' },
      { name: 'Signatory PAN', status: 'verified', uploadedAt: 'Dec 28, 10:30 AM' },
    ],

    timeline: [
      { date: 'Dec 28, 3:00 PM', event: 'Signatory Aadhaar rejected - resubmission required', type: 'warning' },
      { date: 'Dec 28, 2:45 PM', event: 'Bank account verified successfully', type: 'success' },
      { date: 'Dec 28, 2:15 PM', event: 'GSTIN verification completed', type: 'success' },
      { date: 'Dec 28, 2:00 PM', event: 'PAN verification completed', type: 'success' },
      { date: 'Dec 28, 10:30 AM', event: 'KYC application submitted', type: 'info' },
    ]
  };

  const getOverallProgress = () => {
    const statuses = Object.values(kycData.verifications);
    const verified = statuses.filter(s => s.status === 'verified').length;
    return Math.round((verified / statuses.length) * 100);
  };

  const handleResubmit = (type) => {
    setResubmitType(type);
    setShowResubmitModal(true);
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
                <h1 className="text-xl font-bold text-gray-800">KYC Verification Status</h1>
                <p className="text-sm text-gray-500">Application ID: {kycData.applicationId}</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw size={18} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Overall Status Card */}
        <div className={`rounded-2xl p-6 mb-8 ${
          kycData.overallStatus === 'verified' ? 'bg-gradient-to-r from-green-500 to-green-600' :
          kycData.overallStatus === 'rejected' ? 'bg-gradient-to-r from-red-500 to-red-600' :
          kycData.overallStatus === 'resubmit' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
          'bg-gradient-to-r from-blue-500 to-blue-600'
        } text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {kycData.overallStatus === 'verified' ? <CheckCircle size={32} /> :
                 kycData.overallStatus === 'pending' ? <Clock size={32} /> :
                 <AlertCircle size={32} />}
                <div>
                  <h2 className="text-2xl font-bold">
                    {kycData.overallStatus === 'verified' ? 'KYC Verified' :
                     kycData.overallStatus === 'pending' ? 'Verification In Progress' :
                     kycData.overallStatus === 'rejected' ? 'KYC Rejected' :
                     'Action Required'}
                  </h2>
                  <p className="text-white/80">
                    {kycData.overallStatus === 'pending' 
                      ? `Estimated completion: ${kycData.estimatedCompletion}`
                      : `Last updated: ${kycData.lastUpdatedAt}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{getOverallProgress()}%</div>
              <p className="text-white/80">Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${getOverallProgress()}%` }}
              />
            </div>
          </div>

          {/* Entity Info */}
          <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-4 gap-4">
            <div>
              <p className="text-white/70 text-sm">Entity Name</p>
              <p className="font-semibold">{kycData.entity.name}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Entity Type</p>
              <p className="font-semibold">{kycData.entity.type}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">PAN</p>
              <p className="font-semibold font-mono">{kycData.entity.pan}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">GSTIN</p>
              <p className="font-semibold font-mono">{kycData.entity.gstin}</p>
            </div>
          </div>
        </div>

        {/* Alert for required action */}
        {kycData.overallStatus === 'resubmit' && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start space-x-3">
            <AlertCircle size={24} className="text-orange-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-orange-800">Action Required</h4>
              <p className="text-sm text-orange-700 mt-1">
                Some documents need to be resubmitted. Please check the verification details below and upload the required documents.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Verification Steps - 2 columns */}
          <div className="col-span-2 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Verification Status</h3>
            
            <VerificationItem 
              title="PAN Verification"
              status={kycData.verifications.panVerification.status}
              lastUpdated={kycData.verifications.panVerification.lastUpdated}
              message={kycData.verifications.panVerification.message}
            />
            
            <VerificationItem 
              title="GST Verification"
              status={kycData.verifications.gstVerification.status}
              lastUpdated={kycData.verifications.gstVerification.lastUpdated}
              message={kycData.verifications.gstVerification.message}
            />
            
            <VerificationItem 
              title="Company Registration (CIN)"
              status={kycData.verifications.cinVerification.status}
              lastUpdated={kycData.verifications.cinVerification.lastUpdated}
              message={kycData.verifications.cinVerification.message}
            />
            
            <VerificationItem 
              title="Bank Account Verification"
              status={kycData.verifications.bankVerification.status}
              lastUpdated={kycData.verifications.bankVerification.lastUpdated}
              message={kycData.verifications.bankVerification.message}
            />
            
            <VerificationItem 
              title="Address Verification"
              status={kycData.verifications.addressVerification.status}
              lastUpdated={kycData.verifications.addressVerification.lastUpdated}
              message={kycData.verifications.addressVerification.message}
            />
            
            <VerificationItem 
              title="Authorized Signatory KYC"
              status={kycData.verifications.signatoryKyc.status}
              lastUpdated={kycData.verifications.signatoryKyc.lastUpdated}
              message={kycData.verifications.signatoryKyc.message}
              onResubmit={() => handleResubmit('signatoryAadhaar')}
            />

            {/* Documents Section */}
            <h3 className="font-semibold text-gray-800 mt-8 mb-4">Uploaded Documents</h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kycData.documents.map((doc, index) => (
                    <tr key={index} className={doc.status === 'rejected' ? 'bg-red-50' : ''}>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">{doc.name}</span>
                        </div>
                        {doc.reason && <p className="text-xs text-red-600 mt-1 ml-6">{doc.reason}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{doc.uploadedAt}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button className="p-1.5 hover:bg-gray-100 rounded"><Eye size={16} className="text-gray-500" /></button>
                          <button className="p-1.5 hover:bg-gray-100 rounded"><Download size={16} className="text-gray-500" /></button>
                          {doc.status === 'rejected' && (
                            <button 
                              onClick={() => handleResubmit(doc.name)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                            >
                              Re-upload
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline & Help - 1 column */}
          <div className="space-y-6">
            {/* Activity Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                {kycData.timeline.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.type === 'success' ? 'bg-green-500' :
                      item.type === 'warning' ? 'bg-orange-500' :
                      item.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-800">{item.event}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-blue-800 mb-3">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-4">
                If you have questions about your KYC verification, our support team is here to help.
              </p>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-100 transition">
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Call Support</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-100 transition">
                  <div className="flex items-center space-x-2">
                    <MessageSquare size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Chat with Us</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-100 transition">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Email Support</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* CKYC Info */}
            <div className="bg-gray-100 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <Shield size={20} className="text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-800">CKYC Compliant</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Your KYC details will be registered with Central KYC Registry (CERSAI) as per RBI guidelines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resubmit Modal */}
      {showResubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Resubmit Document</h3>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">Drag & drop or click to upload</p>
                <p className="text-sm text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</p>
                <input type="file" className="hidden" id="resubmit-file" />
                <label htmlFor="resubmit-file" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                  Select File
                </label>
              </div>
              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={() => setShowResubmitModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowResubmitModal(false); alert('Document uploaded successfully!'); }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
