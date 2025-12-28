import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, Building2, Calendar, Clock, CheckCircle,
  TrendingUp, AlertCircle, IndianRupee, Briefcase, Download, Eye,
  ChevronRight, BarChart3, PieChart
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    disbursed: { label: 'Disbursed', color: 'bg-green-100 text-green-700' },
    pending_disbursement: { label: 'Pending Disbursement', color: 'bg-yellow-100 text-yellow-700' },
    collected: { label: 'Collected', color: 'bg-blue-100 text-blue-700' },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
  };
  const { label, color } = config[status] || config.disbursed;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

export default function Portfolio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  const portfolioStats = {
    totalActive: 8.75,
    totalDisbursed: 45.2,
    totalCollected: 36.45,
    avgYield: 12.4,
    activeCount: 23,
    collectedCount: 156
  };

  const activeInvestments = [
    {
      id: 1, invoiceId: 'INV-2024-0068', buyer: 'TechCorp India', seller: 'Kumar Textiles',
      amount: 380000, disbursedAmount: 373960, myRate: 1.6, dueDate: '2025-01-25',
      disbursedDate: '2024-12-20', daysLeft: 28, status: 'disbursed', buyerRating: 'A+',
      expectedReturn: 6080
    },
    {
      id: 2, invoiceId: 'INV-2024-0065', buyer: 'Ansai Mart', seller: 'Steel Corp India',
      amount: 500000, disbursedAmount: 491250, myRate: 1.5, dueDate: '2025-01-15',
      disbursedDate: '2024-12-15', daysLeft: 18, status: 'disbursed', buyerRating: 'AA',
      expectedReturn: 8750
    },
    {
      id: 3, invoiceId: 'INV-2024-0062', buyer: 'Global Traders', seller: 'Fabric House',
      amount: 425000, disbursedAmount: 417675, myRate: 1.7, dueDate: '2025-01-08',
      disbursedDate: '2024-12-10', daysLeft: 11, status: 'disbursed', buyerRating: 'AA',
      expectedReturn: 7325
    },
    {
      id: 4, invoiceId: 'INV-2024-0070', buyer: 'Retail Plus', seller: 'Auto Parts Ltd',
      amount: 280000, disbursedAmount: 0, myRate: 1.8, dueDate: '2025-02-05',
      disbursedDate: null, daysLeft: 39, status: 'pending_disbursement', buyerRating: 'A',
      expectedReturn: 5040
    },
    {
      id: 5, invoiceId: 'INV-2024-0058', buyer: 'Metro Supplies', seller: 'Plastic Industries',
      amount: 185000, disbursedAmount: 181300, myRate: 2.0, dueDate: '2024-12-28',
      disbursedDate: '2024-12-05', daysLeft: 0, status: 'overdue', buyerRating: 'A',
      expectedReturn: 3700, daysOverdue: 2
    },
  ];

  const collectedInvestments = [
    {
      id: 1, invoiceId: 'INV-2024-0045', buyer: 'Retail Plus', seller: 'Auto Parts Ltd',
      amount: 520000, disbursedAmount: 510600, collected: 520000, myRate: 1.8,
      collectedDate: '2024-12-22', profit: 9400, actualYield: 12.8
    },
    {
      id: 2, invoiceId: 'INV-2024-0042', buyer: 'TechCorp India', seller: 'Electronics Hub',
      amount: 320000, disbursedAmount: 314560, collected: 320000, myRate: 1.7,
      collectedDate: '2024-12-18', profit: 5440, actualYield: 11.9
    },
    {
      id: 3, invoiceId: 'INV-2024-0038', buyer: 'Ansai Mart', seller: 'Kumar Textiles',
      amount: 450000, disbursedAmount: 443250, collected: 450000, myRate: 1.5,
      collectedDate: '2024-12-15', profit: 6750, actualYield: 10.8
    },
  ];

  const filteredActive = activeInvestments.filter(inv => 
    !searchTerm || inv.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCollected = collectedInvestments.filter(inv => 
    !searchTerm || inv.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-xl font-bold text-gray-800">My Portfolio</h1>
                <p className="text-sm text-gray-500">Track your active investments and returns</p>
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
        {/* Portfolio Summary */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase size={16} className="text-purple-600" />
              <span className="text-gray-500 text-sm">Active Portfolio</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">₹{portfolioStats.totalActive}Cr</p>
            <p className="text-xs text-gray-500 mt-1">{portfolioStats.activeCount} investments</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-gray-500 text-sm">Total Disbursed</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{portfolioStats.totalDisbursed}Cr</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-gray-500 text-sm">Total Collected</span>
            </div>
            <p className="text-2xl font-bold text-green-600">₹{portfolioStats.totalCollected}Cr</p>
            <p className="text-xs text-gray-500 mt-1">{portfolioStats.collectedCount} investments</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 size={16} className="text-green-600" />
              <span className="text-gray-500 text-sm">Avg. Yield</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{portfolioStats.avgYield}%</p>
            <p className="text-xs text-gray-500 mt-1">Annualized</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Clock size={16} className="text-orange-600" />
              <span className="text-gray-500 text-sm">Pending Disbursement</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">₹2.8L</p>
            <p className="text-xs text-gray-500 mt-1">1 invoice</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-gray-500 text-sm">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-red-600">₹1.85L</p>
            <p className="text-xs text-gray-500 mt-1">1 invoice • 2 days</p>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  activeTab === 'active' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Active ({activeInvestments.length})
              </button>
              <button
                onClick={() => setActiveTab('collected')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  activeTab === 'collected' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Collected ({collectedInvestments.length})
              </button>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by buyer or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
              />
            </div>
          </div>

          {/* Active Investments Table */}
          {activeTab === 'active' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer / Seller</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">My Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expected Return</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredActive.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{inv.invoiceId}</p>
                        <p className="text-xs text-gray-500">Disbursed: {inv.disbursedDate || 'Pending'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Building2 size={18} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{inv.buyer}</p>
                            <p className="text-sm text-gray-500">{inv.seller}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-800">₹{(inv.amount / 100000).toFixed(2)}L</p>
                        {inv.disbursedAmount > 0 && (
                          <p className="text-xs text-gray-500">Disbursed: ₹{(inv.disbursedAmount / 100000).toFixed(2)}L</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-green-600">{inv.myRate}%</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-green-600">+₹{(inv.expectedReturn / 1000).toFixed(1)}K</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{inv.dueDate}</p>
                        {inv.status === 'overdue' ? (
                          <p className="text-xs text-red-600">{inv.daysOverdue} days overdue</p>
                        ) : (
                          <p className="text-xs text-gray-500">{inv.daysLeft} days left</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Eye size={18} className="text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Collected Investments Table */}
          {activeTab === 'collected' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer / Seller</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Disbursed</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collected</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual Yield</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCollected.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{inv.invoiceId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle size={18} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{inv.buyer}</p>
                            <p className="text-sm text-gray-500">{inv.seller}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-gray-800">₹{(inv.disbursedAmount / 100000).toFixed(2)}L</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-800">₹{(inv.collected / 100000).toFixed(2)}L</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-green-600">+₹{(inv.profit / 1000).toFixed(1)}K</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-green-600">{inv.actualYield}% p.a.</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800">{inv.collectedDate}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {((activeTab === 'active' && filteredActive.length === 0) ||
            (activeTab === 'collected' && filteredCollected.length === 0)) && (
            <div className="text-center py-12">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No investments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
