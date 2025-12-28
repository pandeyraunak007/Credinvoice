import React, { useState } from 'react';
import { Bell, Plus, FileText, TrendingUp, Clock, CreditCard, Users, AlertCircle, ChevronRight, Filter, Download, Building2, IndianRupee, Calendar, CheckCircle, XCircle, Timer } from 'lucide-react';

// Improved Buyer Dashboard for CredInvoice
// Based on CFO persona needs: Actionable insights, pending actions, quick access to workflows

export default function BuyerDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  
  // Mock data
  const kpis = {
    activeInvoices: 77,
    totalUpcoming: 7.77,
    discountsCaptured: 23.5,
    pendingActions: 12
  };

  const pendingActions = [
    { id: 1, type: 'acceptance', seller: 'Kumar Textiles', amount: 2.5, days: 2, urgent: true },
    { id: 2, type: 'bid_review', seller: 'Steel Corp', amount: 5.0, bids: 4, expires: '2h' },
    { id: 3, type: 'payment', seller: 'Auto Parts Ltd', amount: 1.2, status: 'ready' },
    { id: 4, type: 'acceptance', seller: 'Fabric House', amount: 3.1, days: 5, urgent: false },
  ];

  const recentPayments = [
    { id: 1, seller: 'Kumar Textiles', amount: 77, date: 'Dec 31, 2024', type: 'Self-Funded', status: 'completed' },
    { id: 2, seller: 'Steel Corp', amount: 125, date: 'Dec 30, 2024', type: 'Financier', status: 'completed' },
    { id: 3, seller: 'Auto Parts Ltd', amount: 45, date: 'Dec 28, 2024', type: 'Self-Funded', status: 'completed' },
    { id: 4, seller: 'Fabric House', amount: 89, date: 'Dec 27, 2024', type: 'Financier', status: 'completed' },
  ];

  const urgentAlerts = [
    { id: 1, message: '3 bids expiring today', type: 'warning' },
    { id: 2, message: '5 invoices pending acceptance >3 days', type: 'info' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CI</span>
            </div>
            <span className="text-xl font-bold text-gray-800">CRED<span className="text-red-600">INVOICE</span></span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">8</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AM</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Ansai Mart</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-1">
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
              <TrendingUp size={20} />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <FileText size={20} />
              <span>Invoices</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <CreditCard size={20} />
              <span>Discount Offers</span>
              <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">5</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Clock size={20} />
              <span>Bidding</span>
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">4</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Users size={20} />
              <span>My Vendors</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Building2 size={20} />
              <span>Reports</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, Amit</h1>
              <p className="text-gray-500 text-sm">Here's what's happening with your supply chain finance</p>
            </div>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
              <Plus size={20} />
              <span>Create Invoice</span>
            </button>
          </div>

          {/* Urgent Alerts */}
          {urgentAlerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {urgentAlerts.map(alert => (
                <div key={alert.id} className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <AlertCircle size={18} className={alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'} />
                  <span className={`text-sm font-medium ${alert.type === 'warning' ? 'text-amber-800' : 'text-blue-800'}`}>{alert.message}</span>
                  <button className={`ml-auto text-sm font-medium ${alert.type === 'warning' ? 'text-amber-700 hover:text-amber-900' : 'text-blue-700 hover:text-blue-900'}`}>View →</button>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option>All Sellers</option>
              <option>Kumar Textiles</option>
              <option>Steel Corp</option>
            </select>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="thisMonth">This Month</option>
              <option value="last30">Last 30 Days</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Active Invoices</span>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{kpis.activeInvoices}</p>
              <p className="text-green-600 text-sm mt-1">+12% from last month</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Upcoming Payments</span>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <IndianRupee size={16} className="text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">₹{kpis.totalUpcoming} <span className="text-lg font-normal text-gray-500">Cr</span></p>
              <p className="text-gray-500 text-sm mt-1">Due in next 30 days</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Discounts Captured</span>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">₹{kpis.discountsCaptured} <span className="text-lg font-normal text-gray-500">L</span></p>
              <p className="text-gray-500 text-sm mt-1">This month's savings</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Pending Actions</span>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle size={16} className="text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-600">{kpis.pendingActions}</p>
              <p className="text-red-500 text-sm mt-1">Require your attention</p>
              {kpis.pendingActions > 0 && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-sm">
              <Plus size={20} />
              <span className="font-medium">Start Dynamic Discounting</span>
            </button>
            <button className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition">
              <Clock size={20} />
              <span className="font-medium">View Active Bids</span>
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">4</span>
            </button>
            <button className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition">
              <CreditCard size={20} />
              <span className="font-medium">Pending Approvals</span>
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">5</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Pending Actions - Takes 2 columns */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Pending Actions</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All →</button>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingActions.map(action => (
                  <div key={action.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          action.type === 'acceptance' ? 'bg-orange-100' : 
                          action.type === 'bid_review' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {action.type === 'acceptance' && <Clock size={18} className="text-orange-600" />}
                          {action.type === 'bid_review' && <CreditCard size={18} className="text-blue-600" />}
                          {action.type === 'payment' && <CheckCircle size={18} className="text-green-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{action.seller}</p>
                          <p className="text-sm text-gray-500">
                            {action.type === 'acceptance' && `Discount pending • ${action.days} days remaining`}
                            {action.type === 'bid_review' && `${action.bids} bids received • Expires in ${action.expires}`}
                            {action.type === 'payment' && 'Ready to authorize payment'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-gray-800">₹{action.amount} L</span>
                        {action.urgent && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Urgent</span>
                        )}
                        <button className="text-blue-600 hover:text-blue-700">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Recent Payments</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All →</button>
              </div>
              <div className="p-4 space-y-4">
                {recentPayments.map(payment => (
                  <div key={payment.id} className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      payment.type === 'Self-Funded' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {payment.type === 'Self-Funded' ? (
                        <Building2 size={16} className="text-blue-600" />
                      ) : (
                        <CreditCard size={16} className="text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{payment.seller}</p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 text-sm">₹{payment.amount}L</p>
                      <p className="text-xs text-green-600">{payment.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Payment Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Payment Distribution</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#E5E7EB" strokeWidth="24" />
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#3B82F6" strokeWidth="24" 
                      strokeDasharray={`${60 * 5.02} ${40 * 5.02}`} />
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#8B5CF6" strokeWidth="24" 
                      strokeDasharray={`${25 * 5.02} ${75 * 5.02}`} strokeDashoffset={`${-60 * 5.02}`} />
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#D1D5DB" strokeWidth="24" 
                      strokeDasharray={`${15 * 5.02} ${85 * 5.02}`} strokeDashoffset={`${-85 * 5.02}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">₹7.77Cr</span>
                    <span className="text-sm text-gray-500">Total</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Self-Funded (60%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Financier (25%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-600">Pending (15%)</span>
                </div>
              </div>
            </div>

            {/* Savings Trend */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Discount Savings Trend</h3>
              <div className="flex items-end justify-between h-40 px-4">
                {['Oct', 'Nov', 'Dec'].map((month, i) => (
                  <div key={month} className="flex flex-col items-center space-y-2">
                    <div 
                      className="w-16 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg"
                      style={{ height: `${[60, 80, 100][i]}%` }}
                    ></div>
                    <span className="text-sm text-gray-600">{month}</span>
                    <span className="text-sm font-medium text-gray-800">₹{[15, 19, 23.5][i]}L</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">↑ 23%</span> increase in savings compared to last month
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
