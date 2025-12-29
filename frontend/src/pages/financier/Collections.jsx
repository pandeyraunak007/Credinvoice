import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Building2, Calendar, Clock, CheckCircle, AlertCircle,
  IndianRupee, Download, Phone, Mail, Bell, Filter, ChevronDown, Loader2, RefreshCw
} from 'lucide-react';
import { disbursementService } from '../../services/api';

const StatusBadge = ({ status, daysOverdue }) => {
  const config = {
    on_track: { label: 'On Track', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    due_soon: { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    reminder_sent: { label: 'Reminder Sent', color: 'bg-orange-100 text-orange-700', icon: Bell },
    overdue: { label: `${daysOverdue}d Overdue`, color: 'bg-red-100 text-red-700', icon: AlertCircle },
    collected: { label: 'Collected', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  };
  const { label, color, icon: Icon } = config[status] || config.on_track;
  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} />
      <span>{label}</span>
    </span>
  );
};

export default function Collections() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [upcomingCollections, setUpcomingCollections] = useState([]);
  const [recentCollections, setRecentCollections] = useState([]);
  const [stats, setStats] = useState({
    upcomingTotal: 0,
    thisWeek: 0,
    nextWeek: 0,
    overdue: 0,
    collectedThisMonth: 0
  });

  const fetchCollections = async () => {
    try {
      setLoading(true);
      // Fetch upcoming repayments
      const upcomingResponse = await disbursementService.getUpcomingRepayments();
      const repayments = upcomingResponse.data || [];

      // Fetch all disbursements for collected ones
      const disbursementsResponse = await disbursementService.list();
      const disbursements = disbursementsResponse.data || [];

      // Transform upcoming repayments
      const upcoming = repayments.map(r => {
        const inv = r.invoice || {};
        const dueDate = new Date(r.dueDate || inv.dueDate);
        const now = new Date();
        const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        const expectedReturn = (inv.totalAmount * (r.discountRate || 0)) / 100;

        let status = 'on_track';
        if (daysLeft < 0) status = 'overdue';
        else if (daysLeft <= 3) status = 'due_soon';

        return {
          id: r.id,
          invoiceId: inv.invoiceNumber || r.invoiceId,
          buyer: inv.buyerName || 'Unknown Buyer',
          buyerContact: 'Contact',
          buyerPhone: r.buyer?.phone || '+91 XXXX XXXX',
          buyerEmail: r.buyer?.email || 'contact@buyer.com',
          amount: inv.totalAmount || 0,
          dueDate: dueDate.toLocaleDateString('en-IN'),
          daysLeft: Math.max(0, daysLeft),
          status: status,
          daysOverdue: daysLeft < 0 ? Math.abs(daysLeft) : 0,
          myRate: r.discountRate || 0,
          disbursedAmount: r.amount || 0,
          expectedReturn: expectedReturn
        };
      });

      // Transform collected disbursements
      const collected = disbursements
        .filter(d => d.status === 'COMPLETED')
        .map(d => {
          const inv = d.invoice || {};
          const profit = (inv.totalAmount * (d.discountRate || 0)) / 100;
          return {
            id: d.id,
            invoiceId: inv.invoiceNumber || d.invoiceId,
            buyer: inv.buyerName || 'Unknown',
            amount: inv.totalAmount || 0,
            collectedDate: d.completedAt ? new Date(d.completedAt).toLocaleDateString('en-IN') : '-',
            collectedAmount: inv.totalAmount || 0,
            profit: profit,
            daysEarly: 0
          };
        });

      setUpcomingCollections(upcoming);
      setRecentCollections(collected);

      // Calculate stats
      const now = new Date();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const twoWeeks = 14 * 24 * 60 * 60 * 1000;

      setStats({
        upcomingTotal: (upcoming.reduce((sum, c) => sum + c.amount, 0) / 10000000).toFixed(2),
        thisWeek: (upcoming.filter(c => c.daysLeft <= 7).reduce((sum, c) => sum + c.amount, 0) / 10000000).toFixed(2),
        nextWeek: (upcoming.filter(c => c.daysLeft > 7 && c.daysLeft <= 14).reduce((sum, c) => sum + c.amount, 0) / 10000000).toFixed(2),
        overdue: (upcoming.filter(c => c.status === 'overdue').reduce((sum, c) => sum + c.amount, 0) / 10000000).toFixed(3),
        collectedThisMonth: (collected.reduce((sum, c) => sum + c.collectedAmount, 0) / 10000000).toFixed(2)
      });
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleSendReminder = (collection) => {
    setSelectedCollection(collection);
    setShowReminderModal(true);
  };

  const sendReminder = () => {
    console.log('Sending reminder to:', selectedCollection?.buyer);
    setShowReminderModal(false);
    alert(`Reminder sent to ${selectedCollection?.buyer}`);
  };

  const handleMarkPaid = async (repaymentId) => {
    try {
      await disbursementService.markRepaymentPaid(repaymentId);
      fetchCollections();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      alert(error.message || 'Failed to mark as paid');
    }
  };

  const filteredUpcoming = upcomingCollections.filter(c =>
    !searchTerm || c.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading collections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/financier')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Collections</h1>
                <p className="text-sm text-gray-500">Track upcoming and past collections</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={18} />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Total Upcoming</p>
            <p className="text-2xl font-bold text-gray-800">₹{stats.upcomingTotal}Cr</p>
            <p className="text-xs text-gray-500 mt-1">5 collections</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Due This Week</p>
            <p className="text-2xl font-bold text-orange-600">₹{stats.thisWeek}Cr</p>
            <p className="text-xs text-gray-500 mt-1">2 collections</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Due Next Week</p>
            <p className="text-2xl font-bold text-blue-600">₹{stats.nextWeek}Cr</p>
            <p className="text-xs text-gray-500 mt-1">1 collection</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-600">₹{stats.overdue}Cr</p>
            <p className="text-xs text-red-500 mt-1">1 collection</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Collected This Month</p>
            <p className="text-2xl font-bold text-green-600">₹{stats.collectedThisMonth}Cr</p>
            <p className="text-xs text-green-500 mt-1">100% success rate</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Upcoming Collections - 2 columns */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    activeTab === 'upcoming' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Upcoming ({upcomingCollections.length})
                </button>
                <button
                  onClick={() => setActiveTab('collected')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    activeTab === 'collected' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Recently Collected
                </button>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-48"
                />
              </div>
            </div>

            {/* Upcoming Tab */}
            {activeTab === 'upcoming' && (
              <div className="divide-y divide-gray-100">
                {filteredUpcoming.map(collection => (
                  <div key={collection.id} className={`p-5 ${collection.status === 'overdue' ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          collection.status === 'overdue' ? 'bg-red-100' :
                          collection.status === 'due_soon' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          {collection.status === 'overdue' ? (
                            <AlertCircle size={24} className="text-red-600" />
                          ) : collection.status === 'due_soon' ? (
                            <Clock size={24} className="text-yellow-600" />
                          ) : (
                            <CheckCircle size={24} className="text-green-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-800">{collection.buyer}</h3>
                            <StatusBadge status={collection.status} daysOverdue={collection.daysOverdue} />
                          </div>
                          <p className="text-sm text-gray-500">{collection.invoiceId}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-gray-600">
                              <Calendar size={14} className="inline mr-1" />
                              Due: {collection.dueDate}
                            </span>
                            {collection.daysLeft > 0 && (
                              <span className="text-gray-500">({collection.daysLeft} days left)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800">₹{(collection.amount / 100000).toFixed(2)}L</p>
                        <p className="text-sm text-green-600">+₹{(collection.expectedReturn / 1000).toFixed(1)}K profit</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Phone size={14} />
                          <span>{collection.buyerPhone}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Mail size={14} />
                          <span>{collection.buyerEmail}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(collection.status === 'overdue' || collection.status === 'due_soon') && (
                          <button 
                            onClick={() => handleSendReminder(collection)}
                            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200"
                          >
                            Send Reminder
                          </button>
                        )}
                        <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                          Contact Buyer
                        </button>
                        <button
                          onClick={() => handleMarkPaid(collection.id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                        >
                          Mark Collected
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Collected Tab */}
            {activeTab === 'collected' && (
              <div className="divide-y divide-gray-100">
                {recentCollections.map(collection => (
                  <div key={collection.id} className="p-5 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <CheckCircle size={24} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{collection.buyer}</h3>
                          <p className="text-sm text-gray-500">{collection.invoiceId}</p>
                          <p className="text-sm text-gray-500 mt-1">Collected on {collection.collectedDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800">₹{(collection.collectedAmount / 100000).toFixed(2)}L</p>
                        <p className="text-sm text-green-600">+₹{(collection.profit / 1000).toFixed(1)}K profit</p>
                        {collection.daysEarly > 0 && (
                          <p className="text-xs text-blue-600">{collection.daysEarly} days early</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collection Calendar Summary - 1 column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">This Week</h3>
              <div className="space-y-3">
                {upcomingCollections.filter(c => c.daysLeft <= 7).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{c.buyer}</p>
                      <p className="text-xs text-gray-500">{c.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">₹{(c.amount / 100000).toFixed(1)}L</p>
                      <StatusBadge status={c.status} daysOverdue={c.daysOverdue} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Collection Reminders</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto-remind 3 days before</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto-remind on due date</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Daily overdue alerts</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2">Collection Success Rate</h3>
              <p className="text-4xl font-bold">98.5%</p>
              <p className="text-purple-200 text-sm mt-2">Based on last 6 months</p>
              <div className="mt-4 h-2 bg-purple-400 rounded-full">
                <div className="h-full w-[98.5%] bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && selectedCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Send Payment Reminder</h3>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="font-medium text-gray-800">{selectedCollection.buyer}</p>
                <p className="text-sm text-gray-500">{selectedCollection.invoiceId}</p>
                <p className="text-lg font-bold text-gray-800 mt-2">₹{(selectedCollection.amount / 100000).toFixed(2)}L</p>
                <p className="text-sm text-red-600">Due: {selectedCollection.dueDate}</p>
              </div>

              <div className="space-y-3 mb-4">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600" />
                  <span className="text-sm text-gray-700">Send Email to {selectedCollection.buyerEmail}</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600" />
                  <span className="text-sm text-gray-700">Send SMS to {selectedCollection.buyerPhone}</span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={sendReminder}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center justify-center space-x-2"
                >
                  <Bell size={18} />
                  <span>Send Reminder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
