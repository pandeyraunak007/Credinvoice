import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, Check, CheckCheck, Trash2, FileText, CreditCard, Shield,
  AlertCircle, DollarSign, Clock, Loader2, Filter, Search, X
} from 'lucide-react';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationIcon = ({ type }) => {
  const iconMap = {
    INVOICE_UPLOADED: { icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
    INVOICE_ACCEPTED: { icon: Check, bg: 'bg-green-100', color: 'text-green-600' },
    INVOICE_REJECTED: { icon: X, bg: 'bg-red-100', color: 'text-red-600' },
    DISCOUNT_OFFER_RECEIVED: { icon: CreditCard, bg: 'bg-purple-100', color: 'text-purple-600' },
    DISCOUNT_OFFER_ACCEPTED: { icon: Check, bg: 'bg-green-100', color: 'text-green-600' },
    DISCOUNT_OFFER_REJECTED: { icon: X, bg: 'bg-red-100', color: 'text-red-600' },
    BID_RECEIVED: { icon: CreditCard, bg: 'bg-blue-100', color: 'text-blue-600' },
    BID_ACCEPTED: { icon: Check, bg: 'bg-green-100', color: 'text-green-600' },
    BID_REJECTED: { icon: X, bg: 'bg-red-100', color: 'text-red-600' },
    FUNDS_DISBURSED: { icon: DollarSign, bg: 'bg-green-100', color: 'text-green-600' },
    REPAYMENT_DUE: { icon: Clock, bg: 'bg-orange-100', color: 'text-orange-600' },
    KYC_APPROVED: { icon: Shield, bg: 'bg-green-100', color: 'text-green-600' },
    KYC_REJECTED: { icon: Shield, bg: 'bg-red-100', color: 'text-red-600' },
    SYSTEM: { icon: AlertCircle, bg: 'bg-gray-100', color: 'text-gray-600' },
  };

  const config = iconMap[type] || iconMap.SYSTEM;
  const Icon = config.icon;

  return (
    <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={config.color} />
    </div>
  );
};

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filter === 'unread') params.unreadOnly = true;

      const response = await notificationService.getAll(params);
      const data = response.data;
      setNotifications(data?.notifications || data || []);
      setUnreadCount(data?.unreadCount || 0);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.delete(notificationId);
      const deleted = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    const data = notification.data || {};
    switch (notification.type) {
      case 'INVOICE_UPLOADED':
      case 'INVOICE_ACCEPTED':
      case 'INVOICE_REJECTED':
        if (data.invoiceId) navigate(`/invoices/${data.invoiceId}`);
        break;
      case 'DISCOUNT_OFFER_RECEIVED':
        navigate('/seller/discounts');
        break;
      case 'BID_RECEIVED':
        if (data.invoiceId) navigate(`/invoices/${data.invoiceId}/bids`);
        break;
      default:
        break;
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getBackLink = () => {
    switch (user?.userType) {
      case 'BUYER': return '/';
      case 'SELLER': return '/seller';
      case 'FINANCIER': return '/financier';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(getBackLink())} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CI</span>
              </div>
              <span className="text-xl font-bold text-gray-800">CRED<span className="text-red-600">INVOICE</span></span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-500 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
            >
              <CheckCheck size={18} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => { setFilter('all'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setFilter('unread'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 p-5 hover:bg-gray-50 transition cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationIcon type={notification.type} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-base ${!notification.isRead ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                        className="p-2 hover:bg-gray-200 rounded-lg"
                        title="Mark as read"
                      >
                        <Check size={16} className="text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                      className="p-2 hover:bg-red-100 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 p-4 border-t border-gray-100">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
