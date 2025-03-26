import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

// Define notification types
export type NotificationType = 'message' | 'connection' | 'interest' | 'system';

// Define notification structure
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: {
    senderId?: string;
    senderName?: string;
    entityId?: string; // Challenge ID, Connection ID, etc.
    entityType?: string; // 'challenge', 'connection', etc.
    [key: string]: any; // For any additional data
  };
}

// Context interface
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

// Create the context with default values
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  addNotification: () => {},
});

// Custom hook for using the notification context
export const useNotifications = () => useContext(NotificationContext);

// Provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Function to fetch notifications from API
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      
      if (response.data && response.data.data) {
        const formattedNotifications = response.data.data.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
        }));
        
        setNotifications(formattedNotifications);
        updateUnreadCount(formattedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Set up polling for new notifications (every 30 seconds)
      const interval = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id]);

  // Update unread count whenever notifications change
  const updateUnreadCount = (notifs = notifications) => {
    const count = notifs.filter(n => !n.isRead).length;
    setUnreadCount(count);
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // Make API call to mark as read
      await api.patch(`/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      
      // Update unread count
      updateUnreadCount(
        notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Make API call to mark all as read
      await api.patch('/notifications/read-all');
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Add a new notification (client-side, before server sync)
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    updateUnreadCount([newNotification, ...notifications]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 