import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, TrendingUp, FileText, Clock, CheckCircle, IndianRupee, 
  Calendar, Building2, ChevronRight, AlertCircle, CreditCard, 
  Wallet, PieChart, Target, ArrowUpRight, ArrowDownRight,
  Briefcase, DollarSign, Timer, BarChart3, Filter
} from 'lucide-react';

export default function FinancierDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  const stats = {
    availableToInvest: 2.5, // Cr
    activePortfolio: 8.75,
    totalDisbursed: 45.2,
    avgYield: 12.4,
    upcomingCollections: 1.85,
    overdueAmount: 0.12
  };

  const marketplaceHighlights = [
    { id: 1, buyer: 'Ansai Mart', seller: 'Steel Corp India', amount: 500000, rate: '1.5-2.0%', dueDate: '2025-02-27', rating: 'AA', expiresIn: '16h', invoiceId: 'INV-2024-0076' },
    { id: 2, buyer: 'TechCorp India', seller: 'Kumar Textiles', amount: 750000, rate: '1.8-2.2%', dueDate: '2025-03-15', rating: 'A+', expiresIn: '1d', invoiceId: 'INV-2024-0080' },
    { id: 3, buyer: 'Retail Plus', seller: 'Auto Parts Ltd', amount: 320000, rate: '2.0-2.5%', dueDate: '2025-02-20', rating: 'A', expiresIn: '2d', invoiceId: 'INV-2024-0081' },
  ];

  const upcomingCollections = [
    { id: 1, buyer: 'Global Traders', amount: 425000, dueDate: 'Jan 05, 2025', daysLeft: 8, status: 'on_track' },
    { id: 2, buyer: 'Ansai Mart', amount: 280000, dueDate: 'Jan 08, 2025', daysLeft: 11, status: 'on_track' },
    { id: 3, buyer: 'Metro Supplies', amount: 185000, dueDate: 'Jan 02, 2025', daysLeft: 5, status: 'reminder_sent' },
  ];

  const recentActivity = [
    { id: 1, type: 'disbursed', buyer: 'TechCorp India', amount: 380000, time: '2 hours ago' },
    { id: 2, type: 'bid_won', buyer: 'Ansai Mart', amount: 245000, rate: 1.6, time: '5 hours ago' },
    { id: 3, type: 'collected', buyer: 'Retail Plus', amount: 520000, time: '1 day ago' },
    { id: 4, type: 'bid_placed', buyer: 'Global Traders', amount: 175000, rate: 1.8, time: '1 day ago' },
  ];

  const portfolioBreakdown = [
    { label: 'Manufacturing', value: 35, color: 'bg-blue-500' },
    { label: 'Retail', value: 28, color: 'bg-green-500' },
    { label: 'Technology', value: 22, color: 'bg-purple-500' },
    { label: 'Others', value: 15, color: 'bg-gray-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/financier" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CI</span>
            </div>
            <span className="text-xl font-bold text-gray-800">CRED<span className="text-red-600">INVOICE</span></span>
            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Financier</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">5</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">UF</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Urban Finance Ltd</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-1">
            <Link to="/financier" className="flex items-center space-x-3 px-3 py-2.5 bg-purple-50 text-purple-700 rounded-lg font-medium">
              <TrendingUp size={20} /><span>Dashboard</span>
            </Link>
            <Link to="/financier/marketplace" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Target size={20} /><span>Marketplace</span>
              <span className="ml-auto bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">12 new</span>
            </Link>
            <Link to="/financier/bids" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <CreditCard size={20} /><span>My Bids</span>
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">4</span>
            </Link>
            <Link to="/financier/portfolio" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Briefcase size={20} /><span>Portfolio</span>
            </Link>
            <Link to="/financier/collections" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Wallet size={20} /><span>Collections</span>
              <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">3</span>
            </Link>
            <Link to="/financier" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <BarChart3 size={20} /><span>Reports</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, Rajesh</h1>
              <p className="text-gray-500 text-sm">Here's your investment overview</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisQuarter">This Quarter</option>
              </select>
              <button 
                onClick={() => navigate('/financier/marketplace')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium flex items-center space-x-2"
              >
                <Target size={18} />
                <span>Browse Marketplace</span>
              </button>
            </div>
          </div>

          {/* Alert for new opportunities */}
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Target size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">12 new invoices available in marketplace</p>
                <p className="text-sm text-green-600">Total value: ₹2.8 Cr • Avg yield: 11.5% p.a.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/financier/marketplace')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              View Opportunities
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Available to Invest</span>
                <Wallet size={14} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">₹{stats.availableToInvest}<span className="text-sm font-normal text-gray-500">Cr</span></p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Active Portfolio</span>
                <Briefcase size={14} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">₹{stats.activePortfolio}<span className="text-sm font-normal text-gray-500">Cr</span></p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Total Disbursed</span>
                <TrendingUp size={14} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">₹{stats.totalDisbursed}<span className="text-sm font-normal text-gray-500">Cr</span></p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Avg. Yield</span>
                <BarChart3 size={14} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.avgYield}%<span className="text-sm font-normal text-gray-500">p.a.</span></p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Upcoming Collections</span>
                <Calendar size={14} className="text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">₹{stats.upcomingCollections}<span className="text-sm font-normal text-gray-500">Cr</span></p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium">Overdue</span>
                <AlertCircle size={14} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">₹{stats.overdueAmount}<span className="text-sm font-normal text-gray-500">Cr</span></p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Marketplace Highlights */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Top Opportunities</h2>
                <button onClick={() => navigate('/financier/marketplace')} className="text-purple-600 text-sm font-medium hover:text-purple-700">View All →</button>
              </div>
              <div className="divide-y divide-gray-100">
                {marketplaceHighlights.map(item => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 size={24} className="text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-800">{item.buyer}</p>
                            <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">{item.rating}</span>
                          </div>
                          <p className="text-sm text-gray-500">Seller: {item.seller}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-800">₹{(item.amount / 100000).toFixed(1)}L</p>
                        <p className="text-xs text-gray-500">Invoice Value</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">{item.rate}</p>
                        <p className="text-xs text-gray-500">Expected Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-orange-600">{item.expiresIn}</p>
                        <p className="text-xs text-gray-500">Expires</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/financier/marketplace/${item.invoiceId}`)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
                      >
                        Place Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Portfolio by Sector</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#E5E7EB" strokeWidth="16" />
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#3B82F6" strokeWidth="16" 
                        strokeDasharray={`${35 * 3.52} ${65 * 3.52}`} />
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#22C55E" strokeWidth="16" 
                        strokeDasharray={`${28 * 3.52} ${72 * 3.52}`} strokeDashoffset={`${-35 * 3.52}`} />
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#8B5CF6" strokeWidth="16" 
                        strokeDasharray={`${22 * 3.52} ${78 * 3.52}`} strokeDashoffset={`${-63 * 3.52}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-gray-800">₹8.75Cr</span>
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {portfolioBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Upcoming Collections */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Upcoming Collections</h2>
                <button onClick={() => navigate('/financier/collections')} className="text-purple-600 text-sm font-medium hover:text-purple-700">View All →</button>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingCollections.map(item => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.status === 'on_track' ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {item.status === 'on_track' ? (
                          <CheckCircle size={18} className="text-green-600" />
                        ) : (
                          <Clock size={18} className="text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.buyer}</p>
                        <p className="text-sm text-gray-500">{item.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">₹{(item.amount / 100000).toFixed(2)}L</p>
                      <p className={`text-xs ${item.daysLeft <= 5 ? 'text-orange-600' : 'text-gray-500'}`}>
                        {item.daysLeft} days left
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Recent Activity</h2>
              </div>
              <div className="p-4 space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'disbursed' ? 'bg-blue-100' :
                      activity.type === 'bid_won' ? 'bg-green-100' :
                      activity.type === 'collected' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      {activity.type === 'disbursed' && <ArrowUpRight size={18} className="text-blue-600" />}
                      {activity.type === 'bid_won' && <CheckCircle size={18} className="text-green-600" />}
                      {activity.type === 'collected' && <ArrowDownRight size={18} className="text-purple-600" />}
                      {activity.type === 'bid_placed' && <CreditCard size={18} className="text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {activity.type === 'disbursed' && `Disbursed to ${activity.buyer}`}
                        {activity.type === 'bid_won' && `Won bid for ${activity.buyer} @ ${activity.rate}%`}
                        {activity.type === 'collected' && `Collected from ${activity.buyer}`}
                        {activity.type === 'bid_placed' && `Placed bid for ${activity.buyer} @ ${activity.rate}%`}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <span className={`font-semibold text-sm ${
                      activity.type === 'collected' ? 'text-green-600' : 'text-gray-800'
                    }`}>
                      {activity.type === 'collected' ? '+' : ''}₹{(activity.amount / 100000).toFixed(2)}L
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
