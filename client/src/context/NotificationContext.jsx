// Toast Alert and Notification Drawer Context
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('verdant_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist notifications to local storage
  React.useEffect(() => {
    try {
      localStorage.setItem('verdant_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to persist notifications', e);
    }
  }, [notifications]);

  function addToast(message, type = 'info') {
    const id = 'toast-' + Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }

  function addNotification({ title, message, category = 'Garden Update', type = 'info' }) {
    const id = 'notif-' + Date.now();
    const newNotif = {
      id,
      title,
      message,
      category,
      time: 'Just now',
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  }

  function markAsRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  function clearAll() {
    setNotifications([]);
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      toasts,
      addToast,
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      clearAll
    }}>
      {children}

      {/* Global Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast" style={{
            backgroundColor: toast.type === 'success' ? '#1b4332' : toast.type === 'error' ? '#991b1b' : '#2d6a4f'
          }}>
            <span>{toast.type === 'success' ? '🌱' : toast.type === 'error' ? '⚠️' : '🌿'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
