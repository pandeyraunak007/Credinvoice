import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, Building2, User,
  FileText, Eye, Download, Shield, ExternalLink, RefreshCw, MessageSquare,
  Check, X, ChevronDown, ChevronUp, Calendar, CreditCard, MapPin, Phone, Mail
} from 'lucide-react';

const VerificationBadge = ({ status, size = 'sm' }) => {
  const config = {
    verified: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
    manual: { label: 'Manual Review', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  };
  const { label, color, icon: Icon } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={size === 'sm' ? 12 : 14} />
      <span>{label}</span>
    </span>
  );
};

const DocumentCard = ({ doc, onVerify, onReject, onRequestResubmit }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-xl overflow-hidden ${
      doc.status === 'verified' ? 'border-green-200 bg-green-50' :
      doc.status === 'failed' ? 'border-red-200 bg-red-50' :
      doc.status === 'manual' ? 'border-orange-200 bg-orange-50' :
      'border-gray-200 bg-white'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              doc.status === 'verified' ? 'bg-green-100' :
              doc.status === 'failed' ? 'bg-red-100' :
              'bg-gray-100'
            }`}>
              <FileText size={20} className={
                doc.status === 'verified' ? 'text-green-600' :
                doc.status === 'failed' ? 'text-red-600' : 'text-gray-600'
              } />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{doc.name}</h4>
              <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
              {doc.extractedData && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Extracted: </span>
                  {Object.entries(doc.extractedData).map(([key, val], i) => (
                    <span key={key}>{key}: <strong>{val}</strong>{i < Object.entries(doc.extractedData).length - 1 ? ' | ' : ''}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <VerificationBadge status={doc.status} />
            <button className="p-2 hover:bg-white rounded-lg"><Eye size={16} className="text-gray-500" /></button>
            <button className="p-2 hover:bg-white rounded-lg"><Download size={16} className="text-gray-500" /></button>
          </div>
        </div>

        {/* AI Validation Results */}
        {doc.aiValidation && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">AI Validation</span>
              <span className={`text-sm font-medium ${
                doc.aiValidation.score >= 90 ? 'text-green-600' :
                doc.aiValidation.score >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                Score: {doc.aiValidation.score}%
              </span>
            </div>
            <div className="space-y-1">
              {doc.aiValidation.checks.map((check, i) => (
                <div key={i} className="flex items-center space-x-2 text-sm">
                  {check.passed ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <XCircle size={14} className="text-red-500" />
                  )}
                  <span className={check.passed ? 'text-gray-600' : 'text-red-600'}>{check.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {doc.status === 'manual' && (
          <div className="mt-4 flex items-center space-x-2">
            <button
              onClick={() => onVerify(doc.id)}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              <Check size={16} />
              <span>Approve</span>
            </button>
            <button
              onClick={() => onRequestResubmit(doc.id)}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
            >
              <RefreshCw size={16} />
              <span>Request Resubmit</span>
            </button>
            <button
              onClick={() => onReject(doc.id)}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              <X size={16} />
              <span>Reject</span>
            </button>
          </div>
        )}

        {doc.rejectionReason && (
          <div className="mt-3 p-3 bg-red-100 rounded-lg">
            <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {doc.rejectionReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function KYCReviewDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('documents');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Mock application data
  const application = {
    id: id || 'KYC-2024-00245',
    status: 'pending',
    submittedAt: '2024-12-28 10:30 AM',
    lastUpdatedAt: '2024-12-28 02:45 PM',
    assignedTo: 'Priya Sharma',
    priority: 'high',
    
    entity: {
      type: 'company',
      legalName: 'TechCorp Solutions Pvt Ltd',
      tradeName: 'TechCorp',
      cin: 'U72200MH2018PTC123456',
      pan: 'AABCT1234M',
      gstin: '29AABCT1234M1ZQ',
      dateOfIncorporation: '2018-05-15',
      industry: 'Technology',
      annualTurnover: '₹25 Cr',
      employeeCount: '50-100',
      registeredAddress: '123, Tech Park, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
    },

    bank: {
      bankName: 'HDFC Bank',
      accountNumber: '****4567',
      ifscCode: 'HDFC0001234',
      accountType: 'Current',
      pennyDropStatus: 'verified',
      pennyDropDate: '2024-12-28 11:00 AM',
    },

    signatory: {
      name: 'Rajesh Kumar',
      designation: 'Director',
      pan: 'ABCPK1234L',
      aadhaar: '****-****-5678',
      email: 'rajesh@techcorp.in',
      mobile: '+91 98765 43210',
      din: '08765432',
    },

    directors: [
      { name: 'Rajesh Kumar', din: '08765432', pan: 'ABCPK1234L' },
      { name: 'Priya Sharma', din: '08765433', pan: 'ABCPS5678M' },
    ],

    verifications: {
      pan: { status: 'verified', source: 'NSDL', verifiedAt: '2024-12-28 10:45 AM', matchScore: 100 },
      gstin: { status: 'verified', source: 'GST Network', verifiedAt: '2024-12-28 10:50 AM', gstStatus: 'Active' },
      cin: { status: 'verified', source: 'MCA21', verifiedAt: '2024-12-28 11:00 AM', companyStatus: 'Active' },
      bank: { status: 'verified', source: 'Penny Drop', verifiedAt: '2024-12-28 11:15 AM' },
      aadhaar: { status: 'manual', source: 'UIDAI', reason: 'Name mismatch - manual verification needed' },
    },

    documents: [
      {
        id: 1, name: 'Company PAN Card', type: 'PDF', size: '245 KB', status: 'verified',
        aiValidation: { score: 98, checks: [
          { name: 'PAN format valid', passed: true },
          { name: 'Name matches entity', passed: true },
          { name: 'Document clarity', passed: true },
        ]},
        extractedData: { PAN: 'AABCT1234M', Name: 'TECHCORP SOLUTIONS PVT LTD' }
      },
      {
        id: 2, name: 'GST Certificate', type: 'PDF', size: '312 KB', status: 'verified',
        aiValidation: { score: 95, checks: [
          { name: 'GSTIN format valid', passed: true },
          { name: 'Trade name matches', passed: true },
          { name: 'Address matches', passed: true },
        ]},
        extractedData: { GSTIN: '29AABCT1234M1ZQ', TradeName: 'TechCorp Solutions' }
      },
      {
        id: 3, name: 'Certificate of Incorporation', type: 'PDF', size: '1.2 MB', status: 'verified',
        aiValidation: { score: 92, checks: [
          { name: 'CIN format valid', passed: true },
          { name: 'Company name matches', passed: true },
          { name: 'Date of incorporation valid', passed: true },
        ]},
        extractedData: { CIN: 'U72200MH2018PTC123456', DateOfIncorporation: '15-May-2018' }
      },
      {
        id: 4, name: 'Cancelled Cheque', type: 'JPG', size: '856 KB', status: 'verified',
        aiValidation: { score: 88, checks: [
          { name: 'Account number readable', passed: true },
          { name: 'IFSC code valid', passed: true },
          { name: 'Account name matches', passed: true },
        ]},
        extractedData: { AccountNo: '****4567', IFSC: 'HDFC0001234' }
      },
      {
        id: 5, name: 'Signatory Aadhaar', type: 'PDF', size: '425 KB', status: 'manual',
        aiValidation: { score: 72, checks: [
          { name: 'Aadhaar format valid', passed: true },
          { name: 'Name matches signatory', passed: false },
          { name: 'Document clarity', passed: true },
        ]},
        extractedData: { Aadhaar: '****5678', Name: 'RAJESH K' },
        flagReason: 'Name on Aadhaar (RAJESH K) differs from signatory name (Rajesh Kumar)'
      },
      {
        id: 6, name: 'Signatory PAN', type: 'PDF', size: '198 KB', status: 'verified',
        aiValidation: { score: 96, checks: [
          { name: 'PAN format valid', passed: true },
          { name: 'Name matches signatory', passed: true },
          { name: 'Document clarity', passed: true },
        ]},
        extractedData: { PAN: 'ABCPK1234L', Name: 'RAJESH KUMAR' }
      },
      {
        id: 7, name: 'Board Resolution', type: 'PDF', size: '534 KB', status: 'verified',
        aiValidation: { score: 85, checks: [
          { name: 'Resolution date valid', passed: true },
          { name: 'Signatory name mentioned', passed: true },
          { name: 'Company stamp present', passed: true },
        ]}
      },
    ],

    timeline: [
      { date: '2024-12-28 02:45 PM', event: 'Aadhaar flagged for manual review', actor: 'System', type: 'warning' },
      { date: '2024-12-28 02:30 PM', event: 'Board resolution verified', actor: 'System', type: 'success' },
      { date: '2024-12-28 11:15 AM', event: 'Bank account verified via penny drop', actor: 'System', type: 'success' },
      { date: '2024-12-28 11:00 AM', event: 'CIN verified with MCA', actor: 'System', type: 'success' },
      { date: '2024-12-28 10:50 AM', event: 'GSTIN verified with GST Network', actor: 'System', type: 'success' },
      { date: '2024-12-28 10:45 AM', event: 'PAN verified with NSDL', actor: 'System', type: 'success' },
      { date: '2024-12-28 10:35 AM', event: 'Documents uploaded for processing', actor: 'System', type: 'info' },
      { date: '2024-12-28 10:30 AM', event: 'KYC application submitted', actor: 'Applicant', type: 'info' },
    ]
  };

  const handleApprove = () => {
    console.log('Approving KYC with notes:', internalNotes);
    setShowApproveModal(false);
    alert('KYC Application Approved Successfully!');
    navigate('/admin/kyc');
  };

  const handleReject = () => {
    console.log('Rejecting KYC with reason:', rejectionReason);
    setShowRejectModal(false);
    alert('KYC Application Rejected');
    navigate('/admin/kyc');
  };

  const pendingDocuments = application.documents.filter(d => d.status === 'manual').length;
  const allDocsVerified = pendingDocuments === 0;

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
                  <h1 className="text-xl font-bold text-gray-800">{application.id}</h1>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    Pending Review
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                    High Priority
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {application.entity.legalName} • Submitted {application.submittedAt}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!allDocsVerified && (
                <div className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm">
                  <AlertCircle size={14} className="inline mr-1" />
                  {pendingDocuments} document(s) need review
                </div>
              )}
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50"
              >
                Reject
              </button>
              <button
                onClick={() => setShowApproveModal(true)}
                disabled={!allDocsVerified}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <CheckCircle size={18} />
                <span>Approve KYC</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex space-x-6 border-t border-gray-100">
          {['documents', 'entity', 'verifications', 'timeline'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm capitalize transition ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-2 gap-4">
              {application.documents.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onVerify={(id) => console.log('Verifying doc:', id)}
                  onReject={(id) => console.log('Rejecting doc:', id)}
                  onRequestResubmit={(id) => console.log('Requesting resubmit:', id)}
                />
              ))}
            </div>
          )}

          {/* Entity Tab */}
          {activeTab === 'entity' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                {/* Business Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Building2 size={20} />
                    <span>Business Details</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-sm text-gray-500">Legal Name</p><p className="font-medium">{application.entity.legalName}</p></div>
                    <div><p className="text-sm text-gray-500">Trade Name</p><p className="font-medium">{application.entity.tradeName}</p></div>
                    <div><p className="text-sm text-gray-500">Entity Type</p><p className="font-medium capitalize">{application.entity.type}</p></div>
                    <div><p className="text-sm text-gray-500">CIN</p><p className="font-medium font-mono">{application.entity.cin}</p></div>
                    <div><p className="text-sm text-gray-500">PAN</p><p className="font-medium font-mono">{application.entity.pan}</p></div>
                    <div><p className="text-sm text-gray-500">GSTIN</p><p className="font-medium font-mono">{application.entity.gstin}</p></div>
                    <div><p className="text-sm text-gray-500">Date of Incorporation</p><p className="font-medium">{application.entity.dateOfIncorporation}</p></div>
                    <div><p className="text-sm text-gray-500">Industry</p><p className="font-medium">{application.entity.industry}</p></div>
                    <div><p className="text-sm text-gray-500">Annual Turnover</p><p className="font-medium">{application.entity.annualTurnover}</p></div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Registered Address</p>
                    <p className="font-medium">{application.entity.registeredAddress}, {application.entity.city}, {application.entity.state} - {application.entity.pincode}</p>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <CreditCard size={20} />
                    <span>Bank Details</span>
                    <VerificationBadge status={application.bank.pennyDropStatus} />
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div><p className="text-sm text-gray-500">Bank Name</p><p className="font-medium">{application.bank.bankName}</p></div>
                    <div><p className="text-sm text-gray-500">Account Number</p><p className="font-medium font-mono">{application.bank.accountNumber}</p></div>
                    <div><p className="text-sm text-gray-500">IFSC Code</p><p className="font-medium font-mono">{application.bank.ifscCode}</p></div>
                    <div><p className="text-sm text-gray-500">Account Type</p><p className="font-medium">{application.bank.accountType}</p></div>
                  </div>
                </div>

                {/* Signatory Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <User size={20} />
                    <span>Authorized Signatory</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{application.signatory.name}</p></div>
                    <div><p className="text-sm text-gray-500">Designation</p><p className="font-medium">{application.signatory.designation}</p></div>
                    <div><p className="text-sm text-gray-500">DIN</p><p className="font-medium font-mono">{application.signatory.din}</p></div>
                    <div><p className="text-sm text-gray-500">PAN</p><p className="font-medium font-mono">{application.signatory.pan}</p></div>
                    <div><p className="text-sm text-gray-500">Aadhaar</p><p className="font-medium font-mono">{application.signatory.aadhaar}</p></div>
                    <div><p className="text-sm text-gray-500">Mobile</p><p className="font-medium">{application.signatory.mobile}</p></div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">External Verification</h3>
                  <div className="space-y-2">
                    <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <span className="text-sm">Check MCA21</span>
                      <ExternalLink size={14} className="text-gray-400" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <span className="text-sm">Verify GSTIN</span>
                      <ExternalLink size={14} className="text-gray-400" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <span className="text-sm">Check CIBIL</span>
                      <ExternalLink size={14} className="text-gray-400" />
                    </a>
                  </div>
                </div>

                {/* Directors */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Directors</h3>
                  <div className="space-y-3">
                    {application.directors.map((dir, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-800">{dir.name}</p>
                        <p className="text-sm text-gray-500">DIN: {dir.din} | PAN: {dir.pan}</p>
                      </div>
                    ))}
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

          {/* Verifications Tab */}
          {activeTab === 'verifications' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(application.verifications).map(([key, val]) => (
                    <tr key={key}>
                      <td className="px-6 py-4 font-medium text-gray-800 uppercase">{key}</td>
                      <td className="px-6 py-4 text-gray-600">{val.source}</td>
                      <td className="px-6 py-4"><VerificationBadge status={val.status} /></td>
                      <td className="px-6 py-4 text-gray-600">{val.verifiedAt || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{val.matchScore ? `Match: ${val.matchScore}%` : val.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-4">
                {application.timeline.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      item.type === 'success' ? 'bg-green-500' :
                      item.type === 'warning' ? 'bg-orange-500' :
                      item.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.event}</p>
                      <p className="text-sm text-gray-500">{item.date} • {item.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                Are you sure you want to approve KYC for <strong>{application.entity.legalName}</strong>?
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
                <button onClick={() => setShowApproveModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleApprove} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>
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
                >
                  <option value="">Select reason</option>
                  <option value="doc_mismatch">Document information mismatch</option>
                  <option value="invalid_docs">Invalid or forged documents</option>
                  <option value="incomplete">Incomplete application</option>
                  <option value="blacklisted">Entity/signatory blacklisted</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide detailed reason..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button 
                  onClick={handleReject} 
                  disabled={!rejectionReason}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
