import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, Check, CheckCheck, Trash2, FileText, CreditCard, Shield,
  AlertCircle, DollarSign, Clock, Loader2, ChevronRight
} from 'lucide-react';
import { notificationService } from '../services/api';

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
    <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
      <Icon size={18} className={config.color} />
    </div>
  );
};

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll({ limit: 10 });
      setNotifications(response.data?.notifications || response.data || []);
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
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
      setLoading(true);
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
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
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id, { stopPropagation: () => {} });
    }

    // Navigate based on notification type
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
      case 'KYC_APPROVED':
      case 'KYC_REJECTED':
        navigate('/account');
        break;
      default:
        break;
    }
    setIsOpen(false);
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCheck size={14} />
                )}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No notifications</p>
                <p className="text-sm text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <NotificationIcon type={notification.type} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Mark as read"
                        >
                          <Check size={14} className="text-gray-500" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(notification.id, e)}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-1"
              >
                <span>View all notifications</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
