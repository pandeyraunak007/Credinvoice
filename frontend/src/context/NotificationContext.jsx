import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X, Zap, DollarSign, FileText } from 'lucide-react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Notification types with their styling
const NOTIFICATION_TYPES = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
  },
  discount: {
    icon: Zap,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-800',
  },
  payment: {
    icon: DollarSign,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-800',
  },
  invoice: {
    icon: FileText,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-800',
  },
};

// Toast Notification Component
const ToastNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
  const Icon = typeConfig.icon;

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    const timer = setTimeout(() => {
      handleClose();
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`max-w-sm w-full ${typeConfig.bgColor} border ${typeConfig.borderColor} rounded-xl shadow-lg overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${typeConfig.bgColor} flex items-center justify-center`}>
              <Icon size={20} className={typeConfig.iconColor} />
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-semibold ${typeConfig.titleColor}`}>
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>
              {notification.action && (
                <button
                  onClick={() => {
                    notification.action.onClick();
                    handleClose();
                  }}
                  className={`mt-2 text-sm font-medium ${typeConfig.iconColor} hover:underline`}
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-2 p-1 hover:bg-gray-200 rounded-full transition"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
        {/* Progress bar for auto-dismiss */}
        <div className="h-1 bg-gray-200">
          <div
            className={`h-full ${typeConfig.iconColor.replace('text-', 'bg-')} transition-all ease-linear`}
            style={{
              animation: `shrink ${notification.duration || 5000}ms linear forwards`,
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Notification Container Component
const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

// Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationIdRef = useRef(0);
  const { user } = useAuth();

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = ++notificationIdRef.current;
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Play sound if enabled
    if (notification.playSound !== false) {
      try {
        // Simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        // Audio not supported, ignore
      }
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Shorthand methods
  const notify = {
    success: (title, message, options = {}) =>
      addNotification({ type: 'success', title, message, ...options }),
    error: (title, message, options = {}) =>
      addNotification({ type: 'error', title, message, ...options }),
    info: (title, message, options = {}) =>
      addNotification({ type: 'info', title, message, ...options }),
    discount: (title, message, options = {}) =>
      addNotification({ type: 'discount', title, message, ...options }),
    payment: (title, message, options = {}) =>
      addNotification({ type: 'payment', title, message, ...options }),
    invoice: (title, message, options = {}) =>
      addNotification({ type: 'invoice', title, message, ...options }),
  };

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    notify,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
