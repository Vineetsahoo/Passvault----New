import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, FaCheckCircle, FaExclamationTriangle, FaShieldAlt,
  FaFingerprint, FaKey, FaLock, FaSync, FaTrash, FaEye,
  FaFilter, FaSort, FaClock, FaBellSlash, FaRegBell, 
  FaChevronRight, FaTimes, FaDotCircle, FaRegCircle, FaCreditCard
} from 'react-icons/fa';
import { HiBell, HiBellAlert } from 'react-icons/hi2';
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import axios from 'axios';
import alertService, { Alert } from '../../services/alertService';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'alert' | 'security' | 'sync' | 'info';
  category: 'password' | 'security' | 'sync' | 'system' | 'billing' | 'profile' | 'document' | 'alerts';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  action?: {
    type: 'internal' | 'external';
    label: string;
    link?: string;
  };
  metadata?: {
    resourceType?: string;
    resourceId?: string;
    oldValue?: string;
    newValue?: string;
    category?: string;
    expiryFormatted?: string;
    expiryDateString?: string;
    daysUntilExpiry?: number;
  };
  isAlertType?: boolean; // Flag to identify converted alerts
}

const API_URL = 'http://localhost:5000/api';

const Notifications = () => {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priority'>('newest');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from backend
  useEffect(() => {
    fetchNotifications();
  }, [filter, sortBy]);

  const convertAlertToNotification = (alert: Alert): Notification => {
    // Map alert severity to notification priority
    const priorityMap: Record<string, 'high' | 'medium' | 'low'> = {
      critical: 'high',
      high: 'high',
      medium: 'medium',
      low: 'low'
    };

    // Map alert type to notification type
    let notificationType: 'success' | 'warning' | 'alert' | 'security' | 'sync' | 'info' = 'alert';
    if (alert.severity === 'critical' || alert.severity === 'high') {
      notificationType = 'alert';
    } else if (alert.severity === 'medium') {
      notificationType = 'warning';
    } else {
      notificationType = 'info';
    }

    // Determine category - for card/pass expiry, use 'alerts' category
    let category: Notification['category'] = 'alerts';
    if (alert.alertType.includes('password')) {
      category = 'password';
    } else if (alert.alertType.includes('security') || alert.alertType.includes('breach') || alert.alertType.includes('login')) {
      category = 'security';
    } else if (alert.alertType.includes('sync')) {
      category = 'sync';
    } else if (alert.alertType.includes('document') || alert.alertType.includes('card') || alert.alertType.includes('pass')) {
      category = 'alerts';
    }

    return {
      _id: alert._id,
      title: alert.title,
      message: alert.message,
      type: notificationType,
      category,
      priority: priorityMap[alert.severity] || 'medium',
      isRead: alert.isRead,
      createdAt: new Date(alert.createdAt).toISOString(),
      readAt: alert.readAt ? new Date(alert.readAt).toISOString() : undefined,
      action: alert.actionRequired && alert.actionUrl ? {
        type: 'internal' as const,
        label: alert.actionLabel || 'View Details',
        link: alert.actionUrl
      } : undefined,
      metadata: alert.metadata,
      isAlertType: true // Mark as converted from Alert
    };
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!token || !isAuthenticated) {
        setError('Authentication required');
        setNotifications([]);
        return;
      }

      // Fetch both notifications and alerts in parallel
      const [notificationsResponse, alertsResponse] = await Promise.all([
        axios.get(`${API_URL}/user/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            category: filter === 'all' || filter === 'alerts' ? undefined : filter,
            sortBy: sortBy === 'priority' ? 'priority' : 'date'
          }
        }).catch(err => {
          console.error('Error fetching notifications:', err);
          return { data: { success: false, data: { notifications: [] } } };
        }),
        
        alertService.getAlerts({
          isResolved: false,
          limit: 100
        }).catch(err => {
          console.error('Error fetching alerts:', err);
          return { alerts: [], pagination: { current: 1, pages: 0, total: 0 } };
        })
      ]);

      console.log('📥 Fetched notifications:', notificationsResponse.data);
      console.log('📥 Fetched alerts:', alertsResponse);

      let allNotifications: Notification[] = [];

      // Add regular notifications
      if (notificationsResponse.data.success) {
        allNotifications = [...notificationsResponse.data.data.notifications];
        console.log('✅ Added', allNotifications.length, 'regular notifications');
      }

      // Convert and add alerts - alertsResponse has { alerts: [], pagination: {} } structure
      if (alertsResponse && alertsResponse.alerts && Array.isArray(alertsResponse.alerts) && alertsResponse.alerts.length > 0) {
        console.log('🔄 Converting', alertsResponse.alerts.length, 'alerts to notifications');
        const convertedAlerts = alertsResponse.alerts.map(alert => convertAlertToNotification(alert));
        console.log('✅ Converted alerts:', convertedAlerts);
        allNotifications = [...allNotifications, ...convertedAlerts];
      } else {
        console.log('ℹ️ No alerts to convert');
      }

      // Filter by category if not 'all'
      if (filter !== 'all') {
        allNotifications = allNotifications.filter(n => n.category === filter);
      }

      // Sort notifications
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        allNotifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      } else {
        allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      setNotifications(allNotifications);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: FaBell },
    { id: 'alerts', label: 'Alerts', icon: HiBellAlert },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'password', label: 'Passwords', icon: FaKey },
    { id: 'sync', label: 'Sync', icon: FaSync },
    { id: 'billing', label: 'Billing', icon: FaKey },
    { id: 'document', label: 'Documents', icon: FaSync }
  ];

  const filteredNotifications = notifications;

  const markAsRead = async (id: string) => {
    try {
      const notification = notifications.find(n => n._id === id);
      
      if (notification?.isAlertType) {
        // This is an alert - use alert service
        // Note: Alert service doesn't have a mark as read endpoint yet
        // For now, just update local state
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
        );
      } else {
        // Regular notification - use notification API
        const token = localStorage.getItem('accessToken');
        await axios.put(
          `${API_URL}/user/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const notification = notifications.find(n => n._id === id);
      
      if (notification?.isAlertType) {
        // This is an alert - use alert service
        await alertService.deleteAlert(id);
      } else {
        // Regular notification - use notification API
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_URL}/user/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleAction = (notification: Notification) => {
    console.log(`Executing action: ${notification.action?.type} for notification ${notification._id}`);
    
    // Navigate to the action link if it exists
    if (notification.action?.link) {
      if (notification.action.type === 'internal') {
        window.location.href = notification.action.link;
      } else {
        window.open(notification.action.link, '_blank');
      }
    }
    
    markAsRead(notification._id);
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>;
      case 'medium': return <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>;
      default: return <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="p-2.5 bg-green-100 rounded-full">
          <IoCheckmarkDoneCircle className="text-green-600 w-5 h-5" />
        </div>;
      case 'warning':
        return <div className="p-2.5 bg-yellow-100 rounded-full">
          <FaExclamationTriangle className="text-yellow-600 w-5 h-5" />
        </div>;
      case 'alert':
        return <div className="p-2.5 bg-red-100 rounded-full">
          <HiBellAlert className="text-red-600 w-5 h-5" />
        </div>;
      case 'security':
        return <div className="p-2.5 bg-purple-100 rounded-full">
          <FaShieldAlt className="text-purple-600 w-5 h-5" />
        </div>;
      case 'sync':
        return <div className="p-2.5 bg-blue-100 rounded-full">
          <FaSync className="text-blue-600 w-5 h-5" />
        </div>;
      default:
        return <div className="p-2.5 bg-indigo-100 rounded-full">
          <HiBell className="text-indigo-600 w-5 h-5" />
        </div>;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Separate alerts from regular notifications
      const regularNotifications = notifications.filter(n => !n.isAlertType && !n.isRead);
      const alertNotifications = notifications.filter(n => n.isAlertType && !n.isRead);
      
      // Mark all regular notifications as read (if any exist)
      if (regularNotifications.length > 0) {
        await axios.put(
          `${API_URL}/user/notifications/mark-all-read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => {
          console.error('Error marking regular notifications as read:', err);
          throw err; // Re-throw to prevent local state update on failure
        });
      }
      
      // Mark all alerts as read (if any exist)
      if (alertNotifications.length > 0) {
        await axios.put(
          `${API_URL}/alerts/mark-all-read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => {
          console.error('Error marking alerts as read:', err);
          throw err; // Re-throw to prevent local state update on failure
        });
      }
      
      // Update local state only after successful backend updates
      setNotifications(prev => prev.map(n => ({...n, isRead: true, readAt: new Date().toISOString()})));
      
      console.log('✅ All notifications marked as read successfully');
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      alert(err.response?.data?.message || 'Failed to mark all as read. Please try again.');
    }
  };

  const clearAllNotifications = async () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      try {
        const token = localStorage.getItem('accessToken');
        
        // Separate alerts from regular notifications
        const regularNotifications = notifications.filter(n => !n.isAlertType);
        const alertNotifications = notifications.filter(n => n.isAlertType);
        
        // Delete regular notifications
        if (regularNotifications.length > 0) {
          await axios.delete(`${API_URL}/user/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => console.error('Error clearing regular notifications:', err));
        }
        
        // Delete alerts one by one (if there's no bulk delete endpoint)
        if (alertNotifications.length > 0) {
          await Promise.all(
            alertNotifications.map(alert => 
              alertService.deleteAlert(alert._id).catch(err => 
                console.error(`Error deleting alert ${alert._id}:`, err)
              )
            )
          );
        }
        
        setNotifications([]);
      } catch (err) {
        console.error('Error clearing notifications:', err);
      }
    }
  };

  return (
    <div className="space-y-8 -mt-4"> {/* Increased spacing between sections */}
      {/* Enhanced header with decorative elements */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-purple-300 opacity-10 rounded-full translate-y-1/3"></div>
        
        <div className="relative z-10 p-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-3 mb-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {unreadCount > 0 ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                ) : (
                  <span className="h-3 w-3 rounded-full bg-green-400"></span>
                )}
                <span className="text-xs font-medium text-blue-50">
                  {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
                </span>
              </div>
              
              <h2 className="text-3xl font-bold text-white flex flex-wrap items-center gap-3">
                <HiBell className="text-blue-200" /> 
                <span>Notifications & Alerts</span>
              </h2>
              
              <p className="text-indigo-100 mt-1.5 max-w-lg">
                Stay informed about important security updates and account events
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-end">
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={markAllAsRead}
                  className="px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium rounded-lg transition-all flex items-center gap-2 border border-white/20"
                >
                  <IoCheckmarkDoneCircle className="text-blue-200" /> Mark All Read
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={clearAllNotifications}
                className="px-4 py-2.5 bg-white text-indigo-700 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <FaTrash /> Clear All
              </motion.button>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <div className="mt-6 flex items-center gap-2">
              <div className="relative flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unreadCount / notifications.length) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-400 to-red-500"
                ></motion.div>
              </div>
              <span className="text-sm font-medium text-white">
                {unreadCount}/{notifications.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced filter and sort controls */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <FaFilter className="text-indigo-400" />
              <span>Filter by category:</span>
            </div>
            
            <div className="flex items-center gap-3 self-end">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <FaSort className="text-gray-500" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'priority')}
                  className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 font-medium"
                >
                  <option value="newest">Sort by date</option>
                  <option value="priority">Sort by priority</option>
                </select>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={clearAllNotifications}
                className="p-3 rounded-xl transition-all hover:bg-red-50 border border-gray-200 text-red-500 hover:border-red-200"
              >
                <FaTrash />
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Category tabs */}
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3">
          <div className="flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-1">
            {categories.map(category => (
              <motion.button
                key={category.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(category.id)}
                className={`px-4 py-2.5 rounded-full flex items-center gap-2 whitespace-nowrap transition-all ${
                  filter === category.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                }`}
              >
                <category.icon className={filter === category.id ? 'text-indigo-200' : 'text-indigo-600'} />
                <span className="font-medium">{category.label}</span>
                {category.id === 'all' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 mb-2">
            <FaExclamationTriangle className="inline-block text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-1">Error Loading Notifications</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-12 text-center"
        >
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-50"></div>
            <div className="relative bg-indigo-50 rounded-full w-full h-full flex items-center justify-center">
              <FaBellSlash className="text-indigo-400 text-2xl" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications to display</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {filter !== 'all' 
              ? `No ${filter} notifications are available. Try selecting a different category.`
              : "You're all caught up! No new notifications at the moment."}
          </p>
          {filter !== 'all' && (
            <button 
              onClick={() => setFilter('all')} 
              className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View all notifications
            </button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="space-y-4"
          >
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.05)" }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 ${
                  !notification.isRead ? 'border-l-4 border-l-indigo-500' : ''
                }`}
              >
              <div className="p-5 flex">
                <div className="mr-4 flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${notification.isRead ? 'text-gray-800' : 'text-indigo-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="inline-flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1.5 pr-4 text-sm">
                        {notification.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority} priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <FaClock />
                        <span>{getRelativeTime(notification.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {getPriorityDot(notification.category)}
                        <span className="capitalize">{notification.category}</span>
                      </div>
                      
                      {notification.isRead ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <IoCheckmarkDoneCircle />
                          <span>Read</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-indigo-600">
                          <FaRegBell />
                          <span>Unread</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {notification.action && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAction(notification)}
                          className="px-3.5 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                        >
                          {notification.action.label}
                          <FaChevronRight size={10} />
                        </motion.button>
                      )}
                      
                      <div className="flex items-center">
                        {!notification.isRead && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => markAsRead(notification._id)}
                            className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600"
                            title="Mark as read"
                          >
                            <FaEye className="w-4 h-4" />
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteNotification(notification._id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500 ml-1"
                          title="Delete notification"
                        >
                          <FaTrash className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredNotifications.length > 0 && filteredNotifications.length < notifications.length && (
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => setFilter('all')}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2"
              >
                <FaBell className="text-indigo-500" /> View all notifications
              </button>
            </div>
          )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Notifications;
