import React, { useRef, useEffect } from 'react';
import { Bell, X, MessageSquare, UserPlus, Zap, Info, Check } from 'lucide-react';
import { useNotifications, Notification, NotificationType } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, setIsOpen }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Handle clicking on a notification
  const handleNotificationClick = (notification: Notification) => {
    // Mark the notification as read
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'message' && notification.data?.senderId) {
      navigate(`/profile?tab=messages&userId=${notification.data.senderId}`);
    } else if (notification.type === 'connection' && notification.data?.entityType === 'request') {
      navigate('/profile?tab=connection-requests');
    } else if (notification.type === 'interest' && notification.data?.entityId) {
      navigate(`/collaborations/${notification.data.entityId}`);
    }
    
    // Close the dropdown
    setIsOpen(false);
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'connection':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'interest':
        return <Zap className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format time display
  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div ref={dropdownRef} className="relative h-full flex items-center">
      {/* Bell icon with notification badge */}
      <button 
        className="relative text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer h-full flex items-center transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification dropdown with animation */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[32rem] overflow-y-auto border border-gray-100 transform origin-top-right transition-all duration-200 scale-100 opacity-100">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors duration-200"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-1">No notifications yet</p>
              <p className="text-xs text-gray-400">When you receive notifications, they'll appear here</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                    !notification.isRead ? 'bg-indigo-50/70' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-4 flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className={`rounded-full p-2 ${
                        notification.type === 'message' ? 'bg-blue-100' :
                        notification.type === 'connection' ? 'bg-green-100' :
                        notification.type === 'interest' ? 'bg-amber-100' : 'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}; 