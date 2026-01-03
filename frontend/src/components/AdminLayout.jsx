import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Shield, Users, FileText, CreditCard, ScrollText,
  Bell, LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import { adminService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingKycCount, setPendingKycCount] = useState(0);

  useEffect(() => {
    // Fetch pending KYC count for badge
    const fetchPendingCount = async () => {
      try {
        const response = await adminService.getKycApplications({ status: 'SUBMITTED' });
        setPendingKycCount(response.data?.length || 0);
      } catch (err) {
        console.error('Failed to fetch pending KYC count:', err);
      }
    };
    fetchPendingCount();
  }, []);

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/kyc', label: 'KYC Review', icon: Shield, badge: pendingKycCount },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/invoices', label: 'Invoices', icon: FileText },
    { path: '/admin/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CI</span>
              </div>
              <span className="text-xl font-bold text-gray-800">CRED<span className="text-red-600">INVOICE</span></span>
              <span className="ml-2 px-2 py-0.5 bg-gray-800 text-white text-xs rounded-full font-medium">Admin</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              {pendingKycCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingKycCount}
                </span>
              )}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AD</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0 lg:w-64'} bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] fixed lg:sticky top-14 transition-all duration-300 overflow-hidden z-40`}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-0 min-h-[calc(100vh-56px)]">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-bold text-gray-800">{title}</h1>}
              {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
