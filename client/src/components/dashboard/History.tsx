import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPassport, FaIdCard, FaCreditCard, FaFingerprint, 
  FaFileAlt, FaShieldAlt, FaUserShield, 
  FaFilter, FaSort, FaSearch, FaHistory,
  FaCalendarAlt, FaDesktop, FaGlobe, FaCheckCircle,
  FaExclamationCircle, FaChevronDown, FaEye,
  FaClock, FaLock, FaAngleRight, FaInfoCircle,
  FaTimes, FaBell, FaKey, FaShieldVirus, FaSave,
  FaToggleOn, FaToggleOff, FaExclamation, FaSpinner
} from 'react-icons/fa';
import { historyAPI } from '../../services/api';

interface HistoryEvent {
  id: string;
  date: string;
  eventType: 'password' | 'document' | 'qrcode' | 'backup' | 'login' | 'settings';
  description: string;
  target: string;
  action: string;
  metadata?: any;
  ipAddress?: string;
  deviceInfo?: string;
  location?: string;
  success: boolean;
}

const History: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState<boolean>(false);
  
  // API State
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
  });
  const [page, setPage] = useState(1);
  const limit = 20;
  
  // Security Settings States
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    dataExportNotification: false,
    sessionTimeout: '30',
    passwordChangeReminder: true,
    breachMonitoring: true,
    deviceTracking: true,
    locationBasedAccess: false,
    biometricAuth: true
  });
  
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Fetch history data from API
  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, [page, filter, sortBy]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await historyAPI.getHistory({
        page,
        limit,
        type: filter !== 'all' ? filter : undefined,
        sortBy: sortBy === 'newest' ? '-createdAt' : 'createdAt'
      });

      if (response.data.success) {
        const formattedEvents = response.data.data.history.map((item: any) => ({
          id: item._id,
          date: item.timestamp || item.createdAt,
          eventType: item.type,
          description: item.description || `${item.action} ${item.type}`,
          target: item.target || item.title || 'Unknown',
          action: item.action,
          metadata: item.metadata,
          ipAddress: item.ipAddress,
          success: true
        }));
        
        setHistoryEvents(formattedEvents);
        setPagination(response.data.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      setError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await historyAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSettingToggle = (setting: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: typeof prev[setting] === 'boolean' ? !prev[setting] : prev[setting]
    }));
    setSettingsChanged(true);
  };

  const handleSessionTimeoutChange = (value: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      sessionTimeout: value
    }));
    setSettingsChanged(true);
  };

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    console.log('Saving security settings:', securitySettings);
    setSettingsChanged(false);
    // Show success notification
    alert('Security settings saved successfully!');
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'password': 
        return <div className="p-2.5 bg-blue-100 rounded-full">
          <FaKey className="text-blue-600 w-5 h-5" />
        </div>;
      case 'document': 
        return <div className="p-2.5 bg-orange-100 rounded-full">
          <FaFileAlt className="text-orange-600 w-5 h-5" />
        </div>;
      case 'qrcode': 
        return <div className="p-2.5 bg-purple-100 rounded-full">
          <FaCreditCard className="text-purple-600 w-5 h-5" />
        </div>;
      case 'backup': 
        return <div className="p-2.5 bg-green-100 rounded-full">
          <FaShieldAlt className="text-green-600 w-5 h-5" />
        </div>;
      case 'login': 
        return <div className="p-2.5 bg-indigo-100 rounded-full">
          <FaPassport className="text-indigo-600 w-5 h-5" />
        </div>;
      default: 
        return <div className="p-2.5 bg-gray-100 rounded-full">
          <FaFingerprint className="text-gray-600 w-5 h-5" />
        </div>;
    }
  };

  const getSeverityColor = (action: string) => {
    switch (action) {
      case 'deleted': return 'text-red-600 bg-red-50 border border-red-100';
      case 'updated': return 'text-yellow-600 bg-yellow-50 border border-yellow-100';
      case 'created': return 'text-green-600 bg-green-50 border border-green-100';
      default: return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
        <FaCheckCircle size={12} />
        Success
      </span>
    ) : (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
        <FaExclamationCircle size={12} />
        Failed
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const eventTypes = [
    { id: 'all', label: 'All Activities', icon: FaShieldAlt },
    { id: 'password', label: 'Passwords', icon: FaKey },
    { id: 'document', label: 'Documents', icon: FaFileAlt },
    { id: 'qrcode', label: 'QR Codes', icon: FaCreditCard },
    { id: 'backup', label: 'Backups', icon: FaShieldVirus },
    { id: 'login', label: 'Logins', icon: FaUserShield }
  ];

  const filteredEvents = historyEvents.filter(event => {
    if (searchTerm && !event.description.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !event.target.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15
      } 
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-6 -mt-4">
      {/* Redesigned header with more sophisticated gradient and visual elements */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-300 opacity-10 rounded-full translate-y-1/3"></div>
        
        <div className="relative z-10 p-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-3 mb-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <FaClock className="text-blue-200" />
                <span className="text-xs font-medium text-blue-50">Activity Log</span>
              </div>
              <h2 className="text-3xl font-bold text-white flex flex-wrap items-center gap-3">
                <FaHistory className="text-blue-200" /> 
                <span>Security Timeline</span>
              </h2>
              <p className="text-blue-100 mt-1.5 max-w-lg">
                Monitor and track access patterns to keep your sensitive information secure
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-start">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowSecuritySettings(true)}
                className="px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium rounded-lg transition-all flex items-center gap-2 border border-white/20"
              >
                <FaLock className="text-blue-200" /> Security Settings
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 bg-white text-indigo-700 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <FaEye /> View Full Logs
              </motion.button>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <FaCalendarAlt className="text-blue-200" size={12} />
              <span className="text-xs text-blue-50">Last 30 days</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <FaInfoCircle className="text-blue-200" size={12} />
              <span className="text-xs text-blue-50">{pagination.totalItems} events recorded</span>
            </div>
            {stats && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <FaShieldAlt className="text-blue-200" size={12} />
                <span className="text-xs text-blue-50">{stats.totalActivities} total activities</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Redesigned search and filter section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search security events by description, target or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3 self-end">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <FaSort className="text-gray-500" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                  className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 font-medium"
                >
                  <option value="newest">Sort: Newest first</option>
                  <option value="oldest">Sort: Oldest first</option>
                </select>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3.5 rounded-xl transition-all flex items-center gap-2 ${
                  showFilters ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <FaFilter className={showFilters ? 'text-indigo-600' : 'text-gray-600'} />
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-indigo-600 text-white text-xs font-bold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Filter options would go here */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Type</label>
                      <div className="mt-2 space-y-2">
                        {eventTypes.map(type => (
                          <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                            />
                            <span className="text-sm text-gray-700">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</label>
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                          />
                          <span className="text-sm text-gray-700">High</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                          />
                          <span className="text-sm text-gray-700">Medium</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                          />
                          <span className="text-sm text-gray-700">Low</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                          />
                          <span className="text-sm text-gray-700">Success</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                          />
                          <span className="text-sm text-gray-700">Failed</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                      Reset Filters
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Redesigned category selector */}
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3">
          <div className="flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-1">
            {eventTypes.map(type => (
              <motion.button
                key={type.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(type.id)}
                className={`px-4 py-2.5 rounded-full flex items-center gap-2 whitespace-nowrap transition-all ${
                  filter === type.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                }`}
              >
                <type.icon className={filter === type.id ? 'text-indigo-200' : 'text-indigo-600'} />
                <span className="font-medium">{type.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaSpinner className="animate-spin text-indigo-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading history...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading History</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchHistory()}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-12 text-center"
        >
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-50"></div>
            <div className="relative bg-indigo-50 rounded-full w-full h-full flex items-center justify-center">
              <FaHistory className="text-indigo-400 text-2xl" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No matching activity found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Try adjusting your search terms or filters to view more results. Security events will appear here when they occur.
          </p>
          <button onClick={() => {setFilter('all'); setSearchTerm('');}} className="mt-6 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Reset filters
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredEvents.map(event => (
            <motion.div
              key={event.id}
              variants={cardVariants}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              layout
            >
              <div className="flex">
                <div className={`w-1 ${
                  event.action === 'deleted' ? 'bg-red-500' : 
                  event.action === 'updated' ? 'bg-amber-500' :
                  event.eventType === 'password' ? 'bg-blue-500' : 
                  event.eventType === 'document' ? 'bg-orange-500' :
                  event.eventType === 'qrcode' ? 'bg-purple-500' :
                  'bg-green-500'
                }`}></div>
                
                <div className="flex-1">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getEventIcon(event.eventType)}
                        </div>
                        
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                              {formatDate(event.date)}
                            </span>
                            
                            {event.action && (
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getSeverityColor(event.action)}`}>
                                {event.action.charAt(0).toUpperCase() + event.action.slice(1)}
                              </span>
                            )}
                            
                            {getStatusBadge(event.success)}
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 text-lg">{event.description}</h3>
                          <p className="text-gray-600 mt-1">{event.target}</p>
                          
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            {event.metadata?.device && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">
                                <FaDesktop className="text-gray-400" size={12} />
                                {event.metadata.device}
                              </div>
                            )}
                            
                            {event.ipAddress && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">
                                <FaGlobe className="text-gray-400" size={12} />
                                {event.ipAddress}
                              </div>
                            )}
                            
                            {event.metadata?.location && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">
                                <FaCalendarAlt className="text-gray-400" size={12} />
                                {event.metadata.location}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                              Type: {event.eventType}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setShowDetailId(showDetailId === event.id ? null : event.id)}
                        className={`self-start flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-colors ${
                          showDetailId === event.id ? 
                          'bg-indigo-100 text-indigo-700 border border-indigo-200' : 
                          'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {showDetailId === event.id ? 'Hide details' : 'View details'}
                        <FaChevronDown className={`transition-transform ${showDetailId === event.id ? 'rotate-180' : ''}`} size={10} />
                      </motion.button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {showDetailId === event.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-100 bg-gray-50 px-5 py-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <FaShieldAlt className="text-indigo-500" />
                              Event Details
                            </h4>
                            <dl className="grid grid-cols-2 gap-y-2 text-sm">
                              <dt className="text-gray-500 font-medium">Event ID:</dt>
                              <dd className="font-mono bg-gray-50 px-2 py-0.5 rounded text-gray-800">{event.id}</dd>
                              <dt className="text-gray-500 font-medium">Event Type:</dt>
                              <dd className="capitalize">{event.eventType}</dd>
                              <dt className="text-gray-500 font-medium">Action:</dt>
                              <dd className="capitalize">{event.action}</dd>
                              <dt className="text-gray-500 font-medium">Date & Time:</dt>
                              <dd>{event.date}</dd>
                            </dl>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <FaUserShield className="text-indigo-500" />
                              Access Information
                            </h4>
                            <dl className="grid grid-cols-2 gap-y-2 text-sm">
                              {event.metadata?.device && (
                                <React.Fragment key="device">
                                  <dt className="text-gray-500 font-medium">Device:</dt>
                                  <dd>{event.metadata.device}</dd>
                                </React.Fragment>
                              )}
                              {event.ipAddress && (
                                <React.Fragment key="ip">
                                  <dt className="text-gray-500 font-medium">IP Address:</dt>
                                  <dd className="font-mono bg-gray-50 px-2 py-0.5 rounded">{event.ipAddress}</dd>
                                </React.Fragment>
                              )}
                              {event.metadata?.location && (
                                <React.Fragment key="location">
                                  <dt className="text-gray-500 font-medium">Location:</dt>
                                  <dd>{event.metadata.location}</dd>
                                </React.Fragment>
                              )}
                              <dt className="text-gray-500 font-medium">Status:</dt>
                              <dd className={event.success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {event.success ? 'Successful' : 'Failed'} action
                              </dd>
                            </dl>
                          </div>

                          <div className="md:col-span-2 flex justify-end">
                            <button className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                              View complete details
                              <FaAngleRight size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredEvents.length > 0 && pagination.hasNextPage && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="text-gray-400 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FaHistory className="text-gray-400" />
                    Load more activity
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Security Settings Modal */}
      <AnimatePresence>
        {showSecuritySettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSecuritySettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FaShieldAlt className="text-indigo-200" />
                    Security Settings
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1">Configure your security preferences and access controls</p>
                </div>
                <button 
                  onClick={() => setShowSecuritySettings(false)}
                  className="text-white bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  {/* Authentication Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaKey className="text-indigo-600" />
                      Authentication & Access
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Two-Factor Authentication */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-gray-800">Two-Factor Authentication</h5>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Recommended
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Add an extra layer of security with 2FA</p>
                        </div>
                        <button
                          onClick={() => handleSettingToggle('twoFactorAuth')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            securitySettings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {securitySettings.twoFactorAuth ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Biometric Authentication */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Biometric Authentication</h5>
                          <p className="text-sm text-gray-600">Use fingerprint or face recognition to sign in</p>
                        </div>
                        <button
                          onClick={() => handleSettingToggle('biometricAuth')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            securitySettings.biometricAuth ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {securitySettings.biometricAuth ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Session Timeout */}
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-800 mb-3">Session Timeout</h5>
                        <p className="text-sm text-gray-600 mb-3">Auto logout after period of inactivity</p>
                        <select
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => handleSessionTimeoutChange(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                          <option value="never">Never</option>
                        </select>
                      </div>

                      {/* Location-Based Access */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Location-Based Access</h5>
                          <p className="text-sm text-gray-600">Restrict access from specific geographic locations</p>
                        </div>
                        <button
                          onClick={() => handleSettingToggle('locationBasedAccess')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            securitySettings.locationBasedAccess ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {securitySettings.locationBasedAccess ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notifications Section */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaBell className="text-orange-600" />
                      Alerts & Notifications
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Login Notifications */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Login Notifications</h5>
                          <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                        </div>
                        <button
                          onClick={() => handleSettingToggle('loginNotifications')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            securitySettings.loginNotifications ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {securitySettings.loginNotifications ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Suspicious Activity Alerts */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-gray-800">Suspicious Activity Alerts</h5>
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                              Important
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Receive alerts for unusual account activity</p>
                        </div>
                        <button
                          onClick={() => handleSettingToggle('suspiciousActivityAlerts')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            securitySettings.suspiciousActivityAlerts ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {securitySettings.suspiciousActivityAlerts ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Data Export Notification */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Data Export Notification</h5>
                          <p className="text-sm text-gray-600">Alert when your data is exported or downloaded</p>
                        </div>
                        <button
                          onClick={() => handleSettingToggle('dataExportNotification')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            securitySettings.dataExportNotification ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {securitySettings.dataExportNotification ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Password Change Reminder */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Password Change Reminder</h5>
                          <p className="text-sm text-gray-600">Remind to update passwords periodically</p>
                        </div>
                        <button
                          onClick={() => handleSettingToggle('passwordChangeReminder')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            securitySettings.passwordChangeReminder ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {securitySettings.passwordChangeReminder ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Monitoring Section */}
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaShieldVirus className="text-red-600" />
                      Security Monitoring
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Breach Monitoring */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-gray-800">Breach Monitoring</h5>
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              Critical
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Monitor for data breaches and compromised credentials</p>
                        </div>
                        <button
                          onClick={() => handleSettingToggle('breachMonitoring')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            securitySettings.breachMonitoring ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {securitySettings.breachMonitoring ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Device Tracking */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Device Tracking</h5>
                          <p className="text-sm text-gray-600">Track and manage devices that access your account</p>
                        </div>
                        <button
                          onClick={() => handleSettingToggle('deviceTracking')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            securitySettings.deviceTracking ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {securitySettings.deviceTracking ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  {settingsChanged && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3"
                    >
                      <FaExclamation className="text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-amber-800 mb-1">Unsaved Changes</h5>
                        <p className="text-sm text-amber-700">You have unsaved changes. Click "Save Settings" to apply them.</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-between items-center">
                <button
                  onClick={() => setShowSecuritySettings(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveSettings}
                  disabled={!settingsChanged}
                  className={`px-6 py-3 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 ${
                    settingsChanged
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaSave />
                  Save Settings
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;