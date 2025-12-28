import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Download, Clock, CheckCircle, Building2, Calendar,
  IndianRupee, Percent, CreditCard, ChevronRight, Eye, MessageSquare, 
  History, User, Phone, Mail, MapPin, TrendingUp, Printer, Share2
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
    pending_acceptance: { label: 'Pending Acceptance', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    open_for_bidding: { label: 'Open for Bidding', color: 'bg-purple-100 text-purple-700', icon: CreditCard },
    bid_selected: { label: 'Bid Selected', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
    disbursed: { label: 'Disbursed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    settled: { label: 'Settled', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  };
  const { label, color, icon: Icon } = config[status] || config.draft;
  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${color}`}>
      <Icon size={14} />
      <span>{label}</span>
    </span>
  );
};

const StatusTimeline = ({ events }) => (
  <div className="space-y-4">
    {events.map((event, index) => (
      <div key={index} className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          event.status === 'completed' ? 'bg-green-100' : event.status === 'current' ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {event.status === 'completed' ? <CheckCircle size={16} className="text-green-600" /> :
           event.status === 'current' ? <Clock size={16} className="text-blue-600" /> :
           <div className="w-2 h-2 bg-gray-300 rounded-full" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className={`font-medium ${event.status === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>{event.title}</p>
            {event.date && <span className="text-sm text-gray-500">{event.date}</span>}
          </div>
          {event.description && <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>}
        </div>
      </div>
    ))}
  </div>
);

export default function InvoiceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('details');

  const invoice = {
    id: id || 'INV-2024-0076',
    status: 'open_for_bidding',
    productType: 'Dynamic Discounting + Early Payment',
    invoiceNumber: id || 'INV-2024-0076',
    invoiceDate: '2024-12-27',
    dueDate: '2025-02-27',
    subtotal: 423729,
    cgst: 38136,
    sgst: 38136,
    totalAmount: 500000,
    discountPercent: 1.8,
    discountAmount: 9000,
    netAmount: 491000,
    earlyPaymentDate: '2025-01-15',
    daysEarly: 43,
    seller: {
      name: 'Steel Corp India',
      gstin: '29GGGGG1314R9Z6',
      address: '123 Industrial Area, Mumbai, Maharashtra',
      email: 'accounts@steelcorp.in',
      phone: '+91 22 1234 5678',
      contactPerson: 'Rahul Mehta'
    },
    bidsCount: 4,
    bidsExpiry: '2024-12-30 06:00 PM',
    lowestBid: { financier: 'Urban Finance Ltd', rate: 1.5 },
    lineItems: [
      { description: 'Cold Rolled Steel Sheets', hsn: '7209', qty: 500, unit: 'kg', rate: 85, amount: 42500 },
      { description: 'Hot Rolled Steel Coils', hsn: '7208', qty: 1000, unit: 'kg', rate: 78, amount: 78000 },
      { description: 'Galvanized Steel Pipes', hsn: '7306', qty: 200, unit: 'pcs', rate: 450, amount: 90000 },
      { description: 'Stainless Steel Rods', hsn: '7222', qty: 800, unit: 'kg', rate: 265, amount: 212000 },
    ],
  };

  const timelineEvents = [
    { title: 'Invoice Created', date: 'Dec 27, 10:30 AM', status: 'completed', description: 'AI extracted 12 fields' },
    { title: 'Discount Offer Sent', date: 'Dec 27, 10:45 AM', status: 'completed', description: '1.8% discount offered' },
    { title: 'Seller Accepted', date: 'Dec 27, 12:15 PM', status: 'completed', description: 'Steel Corp accepted' },
    { title: 'Open for Bidding', date: 'Dec 27, 02:30 PM', status: 'current', description: '4 bids received' },
    { title: 'Bid Selection', status: 'pending' },
    { title: 'Disbursement', status: 'pending' },
    { title: 'Settlement', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-gray-800">{invoice.id}</h1>
                  <StatusBadge status={invoice.status} />
                </div>
                <p className="text-sm text-gray-500">{invoice.productType}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg"><Printer size={20} className="text-gray-600" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-lg"><Download size={20} className="text-gray-600" /></button>
              <div className="h-6 w-px bg-gray-300" />
              {invoice.status === 'open_for_bidding' && (
                <button 
                  onClick={() => navigate(`/invoices/${invoice.id}/bids`)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <CreditCard size={18} />
                  <span>View Bids</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{invoice.bidsCount}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex space-x-6 border-t border-gray-100">
          {['details', 'documents', 'activity'].map(tab => (
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

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'details' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                {/* Bidding Alert */}
                {invoice.status === 'open_for_bidding' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <CreditCard size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-purple-800">{invoice.bidsCount} bids received</p>
                        <p className="text-sm text-purple-600">Lowest: {invoice.lowestBid.financier} @ {invoice.lowestBid.rate}%</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/invoices/${invoice.id}/bids`)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      Review Bids
                    </button>
                  </div>
                )}

                {/* Invoice Summary */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Invoice Summary</h2>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                      <Eye size={14} /><span>View Document</span>
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-6 mb-6">
                      <div><p className="text-sm text-gray-500">Invoice Number</p><p className="font-medium">{invoice.invoiceNumber}</p></div>
                      <div><p className="text-sm text-gray-500">Invoice Date</p><p className="font-medium">{invoice.invoiceDate}</p></div>
                      <div><p className="text-sm text-gray-500">Due Date</p><p className="font-medium">{invoice.dueDate}</p></div>
                      <div><p className="text-sm text-gray-500">Total Amount</p><p className="font-bold text-xl">₹{invoice.totalAmount.toLocaleString('en-IN')}</p></div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">HSN</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Qty</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Rate</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {invoice.lineItems.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm">{item.description}</td>
                              <td className="px-4 py-3 text-sm text-gray-500 font-mono">{item.hsn}</td>
                              <td className="px-4 py-3 text-sm text-right">{item.qty} {item.unit}</td>
                              <td className="px-4 py-3 text-sm text-right">₹{item.rate}</td>
                              <td className="px-4 py-3 text-sm font-medium text-right">₹{item.amount.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr><td colSpan="4" className="px-4 py-2 text-sm text-right">Subtotal</td><td className="px-4 py-2 text-sm font-medium text-right">₹{invoice.subtotal.toLocaleString('en-IN')}</td></tr>
                          <tr><td colSpan="4" className="px-4 py-2 text-sm text-right">CGST (9%)</td><td className="px-4 py-2 text-sm text-right">₹{invoice.cgst.toLocaleString('en-IN')}</td></tr>
                          <tr><td colSpan="4" className="px-4 py-2 text-sm text-right">SGST (9%)</td><td className="px-4 py-2 text-sm text-right">₹{invoice.sgst.toLocaleString('en-IN')}</td></tr>
                          <tr className="border-t border-gray-200"><td colSpan="4" className="px-4 py-3 font-semibold text-right">Total</td><td className="px-4 py-3 text-lg font-bold text-right">₹{invoice.totalAmount.toLocaleString('en-IN')}</td></tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Discount Details */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-800">Discount Terms</h2></div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Percent size={20} className="text-green-600" />
                          </div>
                          <div><p className="text-sm text-gray-600">Discount Rate</p><p className="text-xl font-bold text-green-600">{invoice.discountPercent}%</p></div>
                        </div>
                        <div className="text-right"><p className="text-sm text-gray-600">Discount Amount</p><p className="text-lg font-semibold text-green-600">-₹{invoice.discountAmount.toLocaleString('en-IN')}</p></div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-3">Payment Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-gray-600">Invoice Amount</span><span className="font-medium">₹{invoice.totalAmount.toLocaleString('en-IN')}</span></div>
                          <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{invoice.discountAmount.toLocaleString('en-IN')}</span></div>
                          <div className="border-t pt-2 flex justify-between"><span className="font-semibold">Net to Seller</span><span className="font-bold text-lg">₹{invoice.netAmount.toLocaleString('en-IN')}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seller Details */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-800">Seller Details</h2></div>
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 size={28} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{invoice.seller.name}</h3>
                        <p className="text-sm text-gray-500 font-mono">{invoice.seller.gstin}</p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center space-x-2 text-sm"><User size={16} className="text-gray-400" /><span>{invoice.seller.contactPerson}</span></div>
                          <div className="flex items-center space-x-2 text-sm"><Phone size={16} className="text-gray-400" /><span>{invoice.seller.phone}</span></div>
                          <div className="flex items-center space-x-2 text-sm"><Mail size={16} className="text-gray-400" /><span>{invoice.seller.email}</span></div>
                          <div className="flex items-center space-x-2 text-sm"><MapPin size={16} className="text-gray-400" /><span className="truncate">{invoice.seller.address}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Status Timeline</h3>
                  <StatusTimeline events={timelineEvents} />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3"><Download size={18} className="text-gray-500" /><span>Download Invoice</span></div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3"><MessageSquare size={18} className="text-gray-500" /><span>Contact Seller</span></div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-6">Attached Documents</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><FileText size={24} className="text-red-600" /></div>
                    <div><p className="font-medium">Original Invoice</p><p className="text-sm text-gray-500">{invoice.id}.pdf • 2.4 MB</p></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg"><Eye size={18} className="text-gray-500" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg"><Download size={18} className="text-gray-500" /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-6">Activity Log</h2>
              <div className="space-y-4">
                {[
                  { action: 'Invoice sent for bidding', user: 'Amit Verma', timestamp: '2024-12-27 02:30 PM' },
                  { action: 'Seller accepted discount offer', user: 'Steel Corp India', timestamp: '2024-12-27 12:15 PM' },
                  { action: 'Discount offer sent to seller', user: 'Amit Verma', timestamp: '2024-12-27 10:45 AM' },
                  { action: 'Invoice created with AI extraction', user: 'Amit Verma', timestamp: '2024-12-27 10:30 AM' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                      <TrendingUp size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{activity.action}</p>
                      <p className="text-sm text-gray-500">by {activity.user} • {activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
