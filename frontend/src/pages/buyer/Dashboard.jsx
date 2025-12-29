import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, Plus, FileText, TrendingUp, Clock, CreditCard, Users, AlertCircle,
  ChevronRight, Download, Building2, IndianRupee, CheckCircle, BarChart3
} from 'lucide-react';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  
  const kpis = {
    activeInvoices: 77,
    totalUpcoming: 7.77,
    discountsCaptured: 23.5,
    pendingActions: 12
  };

  const pendingActions = [
    { id: 1, type: 'acceptance', seller: 'Kumar Textiles', amount: 2.5, days: 2, urgent: true, invoiceId: 'INV-2024-0077' },
    { id: 2, type: 'bid_review', seller: 'Steel Corp', amount: 5.0, bids: 4, expires: '2h', invoiceId: 'INV-2024-0076' },
    { id: 3, type: 'payment', seller: 'Auto Parts Ltd', amount: 1.2, status: 'ready', invoiceId: 'INV-2024-0075' },
    { id: 4, type: 'acceptance', seller: 'Fabric House', amount: 3.1, days: 5, urgent: false, invoiceId: 'INV-2024-0074' },
  ];

  const recentPayments = [
    { id: 1, seller: 'Kumar Textiles', amount: 77, date: 'Dec 31, 2024', type: 'Self-Funded' },
    { id: 2, seller: 'Steel Corp', amount: 125, date: 'Dec 30, 2024', type: 'Financier' },
    { id: 3, seller: 'Auto Parts Ltd', amount: 45, date: 'Dec 28, 2024', type: 'Self-Funded' },
    { id: 4, seller: 'Fabric House', amount: 89, date: 'Dec 27, 2024', type: 'Financier' },
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
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CI</span>
            </div>
            <span className="text-xl font-bold text-gray-800">CRED<span className="text-red-600">INVOICE</span></span>
          </Link>
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
            <Link to="/" className="flex items-center space-x-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
              <TrendingUp size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <FileText size={20} />
              <span>Invoices</span>
            </Link>
            <Link to="/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <CreditCard size={20} />
              <span>Discount Offers</span>
              <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">5</span>
            </Link>
            <Link to="/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Clock size={20} />
              <span>Bidding</span>
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">4</span>
            </Link>
            <Link to="/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Users size={20} />
              <span>My Vendors</span>
            </Link>
            <Link to="/analytics" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <BarChart3 size={20} />
              <span>Analytics</span>
            </Link>
            <Link to="/invoices" className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Building2 size={20} />
              <span>Reports</span>
            </Link>
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
            <button 
              onClick={() => navigate('/invoices/create')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
            >
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
                  <button 
                    onClick={() => navigate('/invoices')}
                    className={`ml-auto text-sm font-medium ${alert.type === 'warning' ? 'text-amber-700 hover:text-amber-900' : 'text-blue-700 hover:text-blue-900'}`}
                  >
                    View →
                  </button>
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

            <div 
              onClick={() => navigate('/invoices')}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative cursor-pointer hover:border-red-300 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm font-medium">Pending Actions</span>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle size={16} className="text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-600">{kpis.pendingActions}</p>
              <p className="text-red-500 text-sm mt-1">Require your attention</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button 
              onClick={() => navigate('/invoices/create')}
              className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-sm"
            >
              <Plus size={20} />
              <span className="font-medium">Start Dynamic Discounting</span>
            </button>
            <button 
              onClick={() => navigate('/invoices/INV-2024-0076/bids')}
              className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <Clock size={20} />
              <span className="font-medium">View Active Bids</span>
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">4</span>
            </button>
            <button 
              onClick={() => navigate('/invoices')}
              className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <CreditCard size={20} />
              <span className="font-medium">Pending Approvals</span>
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">5</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Pending Actions */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Pending Actions</h2>
                <Link to="/invoices" className="text-blue-600 text-sm font-medium hover:text-blue-700">View All →</Link>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingActions.map(action => (
                  <div 
                    key={action.id} 
                    onClick={() => {
                      if (action.type === 'bid_review') {
                        navigate(`/invoices/${action.invoiceId}/bids`);
                      } else {
                        navigate(`/invoices/${action.invoiceId}`);
                      }
                    }}
                    className="p-4 hover:bg-gray-50 transition cursor-pointer"
                  >
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
                        <ChevronRight size={20} className="text-gray-400" />
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
                <Link to="/invoices" className="text-blue-600 text-sm font-medium hover:text-blue-700">View All →</Link>
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
        </main>
      </div>
    </div>
  );
}
