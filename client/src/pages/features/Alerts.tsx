import React, { useState, useEffect } from 'react';
import { 
  Clock, Bell, BellOff, Calendar, Settings, AlertTriangle, History,
  Clock4, Lock, LogIn, ArrowLeft, CreditCard, Ticket, RefreshCw, Trash2, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import alertService, { Alert as AlertType } from '../../services/alertService';
import qrcodeService from '../../services/qrcodeService';

interface FeatureTemplateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FeatureTemplate: React.FC<FeatureTemplateProps> = ({ title, description, icon, children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/20 to-white min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
        {/* Go Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 text-slate-700 hover:text-indigo-600 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
        </div>

        <div className="absolute top-20 right-20 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-blue-100/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 left-10 w-24 h-24 bg-purple-100/30 rounded-full blur-2xl -z-10"></div>
        
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-purple-500/10 z-0"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-100/30 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8 border-b border-slate-200/50">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-lg flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {React.cloneElement(icon as React.ReactElement, { 
                  className: "h-12 w-12 text-indigo-600 relative z-10 transition-transform duration-300 group-hover:scale-110" 
                })}
              </div>
              
              <div className="space-y-2">
                <div className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 mb-1">
                  Feature
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 bg-clip-text text-transparent mb-3">{title}</h1>
                <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">{description}</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-12 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-indigo-50/5 to-blue-50/10 opacity-70"></div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
        
        <div className="relative h-1 mx-auto w-60 mt-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-full shadow-lg opacity-70"></div>
          <div className="absolute inset-0 bg-white rounded-full shadow blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-full opacity-90"></div>
        </div>
      </div>
    </div>
  );
};

const AuthPrompt = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white border border-slate-200/60 p-8 rounded-xl shadow-lg text-center backdrop-blur-sm">
      <div className="bg-indigo-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Lock className="h-10 w-10 text-indigo-600" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-3">Sign in Required</h3>
      <p className="text-slate-600 mb-6">Please sign in to manage your alerts</p>
      <button 
        onClick={() => navigate('/signin')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
      >
        <LogIn className="h-5 w-5" />
        Sign In
      </button>
    </div>
  );
};

const Alerts = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailEnabled: true,
    pushEnabled: true,
    advanceNotificationDays: 7
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadAlerts();
  }, []);

  const checkAuthAndLoadAlerts = async () => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const accessToken = localStorage.getItem('accessToken');
    
    // User is authenticated only if BOTH token AND auth flag exist
    const isAuthenticated = authStatus && accessToken !== null;
    
    console.log('🔐 Auth check:', {
      isAuthenticated,
      authStatus,
      hasToken: !!accessToken,
      token: accessToken ? `${accessToken.substring(0, 20)}...` : 'none'
    });
    
    setIsAuthenticated(isAuthenticated);
    
    if (isAuthenticated) {
      console.log('✅ Authenticated - loading alerts');
      await loadAlerts();
    } else {
      console.warn('❌ Not authenticated - clearing alerts');
      setAlerts([]); // Clear alerts if not authenticated
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    // Double-check authentication before making API call
    const token = localStorage.getItem('accessToken');
    const isAuthFlag = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!token || !isAuthFlag) {
      console.error('❌ Cannot load alerts - not authenticated');
      setAlerts([]);
      setError('Please sign in to view alerts');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Starting to load alerts...');

      // First, check for new expirations (this will create alerts for expiring/expired items)
      try {
        console.log('📅 Checking for expirations...');
        const checkResult = await alertService.checkExpirations();
        console.log('✅ Expiration check result:', checkResult);
      } catch (checkErr: any) {
        console.warn('⚠️ Error checking expirations:', checkErr);
        console.warn('Error details:', checkErr.response?.data);
        
        // Handle authentication errors in expiration check
        if (checkErr.response?.status === 401 || checkErr.response?.status === 403) {
          console.error('🔒 Authentication failed during expiration check');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
          setIsAuthenticated(false);
          setAlerts([]);
          setError('Session expired. Please sign in again.');
          setLoading(false);
          return;
        }
        // Continue even if check fails for other reasons
      }

      // Then fetch all unresolved alerts, focusing on card and pass expiry
      console.log('📥 Fetching alerts...');
      const response = await alertService.getAlerts({
        isResolved: false,
        sortBy: '-severity,-createdAt',
        limit: 100
      });

      console.log('📊 Alerts received:', response);
      console.log('📊 Number of alerts:', response.alerts?.length || 0);
      console.log('📊 Alerts data:', response.alerts);

      setAlerts(response.alerts || []);
    } catch (err: any) {
      console.error('❌ Error loading alerts:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error message:', err.message);
      
      // Handle authentication errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error('🔒 Authentication failed - clearing session');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setAlerts([]);
        setError('Session expired. Please sign in again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load alerts');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Check for new expirations
      await alertService.checkExpirations();
      
      // Reload alerts
      await loadAlerts();
      
    } catch (err: any) {
      console.error('Error refreshing alerts:', err);
      setError(err.response?.data?.message || 'Failed to refresh alerts');
    } finally {
      setRefreshing(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await alertService.resolveAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
    } catch (err: any) {
      console.error('Error resolving alert:', err);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await alertService.deleteAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
    } catch (err: any) {
      console.error('Error deleting alert:', err);
    }
  };

  const handleViewCard = (alert: AlertType) => {
    navigate('/features/qr-scan');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-300 bg-red-50/50';
      case 'high':
        return 'border-orange-300 bg-orange-50/50';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50/50';
      case 'low':
        return 'border-blue-300 bg-blue-50/50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-300';
    }
  };

  const getAlertIcon = (alertType: string) => {
    if (alertType === 'card_expiry') {
      return <CreditCard className="h-6 w-6" />;
    } else if (alertType === 'pass_expiry') {
      return <Ticket className="h-6 w-6" />;
    } else {
      return <Clock className="h-6 w-6" />;
    }
  };

  const getDaysRemaining = (expiryDate: Date | undefined) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter and categorize alerts for card/pass expiry
  const cardPassAlerts = alerts.filter(alert => 
    alert.alertType === 'card_expiry' || alert.alertType === 'pass_expiry'
  );

  // Separate expired and expiring items
  const expiredAlerts = cardPassAlerts.filter(alert => {
    const days = getDaysRemaining(alert.expiryDate);
    return days !== null && days <= 0;
  });

  const expiringAlerts = cardPassAlerts.filter(alert => {
    const days = getDaysRemaining(alert.expiryDate);
    return days !== null && days > 0;
  });

  const otherAlerts = alerts.filter(alert => 
    alert.alertType !== 'card_expiry' && alert.alertType !== 'pass_expiry'
  );

  return (
    <>
      <Navbar />
      <FeatureTemplate
        title="Expiration Alerts"
        description="Never miss an expiration date with smart notifications for your cards and passes."
        icon={<Clock className="h-8 w-8 text-slate-700" />}
      >
        {!isAuthenticated ? (
          <AuthPrompt />
        ) : (
          <div className="space-y-8">
            {/* Notification Preferences */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-slate-200/60">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                  <Settings className="h-5 w-5 text-indigo-600" />
                  Notification Preferences
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <label className="flex items-center gap-3 cursor-pointer w-full">
                        <div className={`relative w-12 h-6 transition-colors duration-300 rounded-full ${notificationPrefs.emailEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={notificationPrefs.emailEnabled}
                            onChange={e => setNotificationPrefs(prev => ({
                              ...prev,
                              emailEnabled: e.target.checked
                            }))}
                          />
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${notificationPrefs.emailEnabled ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <span className="text-slate-700 font-medium">Email Notifications</span>
                      </label>
                      <Bell className={`h-5 w-5 ${notificationPrefs.emailEnabled ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <label className="flex items-center gap-3 cursor-pointer w-full">
                        <div className={`relative w-12 h-6 transition-colors duration-300 rounded-full ${notificationPrefs.pushEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={notificationPrefs.pushEnabled}
                            onChange={e => setNotificationPrefs(prev => ({
                              ...prev,
                              pushEnabled: e.target.checked
                            }))}
                          />
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${notificationPrefs.pushEnabled ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <span className="text-slate-700 font-medium">Push Notifications</span>
                      </label>
                      <Bell className={`h-5 w-5 ${notificationPrefs.pushEnabled ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Notification Timing</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-700">Notify me</span>
                      <div className="relative flex-1">
                        <select
                          value={notificationPrefs.advanceNotificationDays}
                          onChange={e => setNotificationPrefs(prev => ({
                            ...prev,
                            advanceNotificationDays: Number(e.target.value)
                          }))}
                          className="appearance-none w-full bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                          {[3, 5, 7, 14, 30].map(days => (
                            <option key={days} value={days}>{days} days</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <Calendar className="h-4 w-4 text-slate-500" />
                        </div>
                      </div>
                      <span className="text-slate-700">before expiration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expired Items Section - Always Visible */}
            <div className="bg-white border-2 border-red-300 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 border-b border-red-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  🔴 Expired Cards & Passes
                  {expiredAlerts.length > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-bold bg-red-200 text-red-800 rounded-full animate-pulse">
                      {expiredAlerts.length} EXPIRED!
                    </span>
                  )}
                </h3>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium">Refresh</span>
                </button>
              </div>
              
              <div className="p-6">
                {expiredAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {expiredAlerts.map(alert => {
                      const daysRemaining = getDaysRemaining(alert.expiryDate);
                      
                      return (
                        <div
                          key={alert._id}
                          className="border-2 border-red-300 bg-red-50/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="rounded-full p-3 bg-red-100 text-red-600 animate-pulse">
                                {getAlertIcon(alert.alertType)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-lg text-red-800">{alert.title}</h4>
                                  <span className="px-2 py-0.5 text-xs font-bold bg-red-200 text-red-800 rounded uppercase">
                                    EXPIRED
                                  </span>
                                </div>
                                <p className="text-red-700 text-sm mb-2 font-medium">{alert.message}</p>
                                
                                {/* Display card details */}
                                <div className="space-y-1">
                                  {alert.metadata?.category && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                      <span className="font-medium">Category:</span>
                                      <span className="px-2 py-0.5 bg-red-100 rounded text-xs font-medium">{alert.metadata.category}</span>
                                    </div>
                                  )}
                                  {alert.metadata?.expiryFormatted && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                      <Calendar className="h-4 w-4" />
                                      <span className="font-medium">Expiry:</span>
                                      <span className="font-mono font-bold">{alert.metadata.expiryFormatted}</span>
                                      <span className="text-xs">({alert.metadata.expiryDateString || (alert.expiryDate ? new Date(alert.expiryDate).toLocaleDateString() : 'N/A')})</span>
                                    </div>
                                  )}
                                  {!alert.metadata?.expiryFormatted && alert.expiryDate && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                      <Calendar className="h-4 w-4" />
                                      <span>Expired on: {new Date(alert.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <span className="px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-1 border-2 border-red-400 bg-red-100 text-red-800">
                                <AlertTriangle className="h-4 w-4" />
                                {daysRemaining !== null && daysRemaining < 0 
                                  ? `${Math.abs(daysRemaining)} days ago` 
                                  : 'EXPIRED'}
                              </span>
                              <div className="flex items-center gap-2">
                                {alert.actionUrl && (
                                  <button
                                    onClick={() => handleViewCard(alert)}
                                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors font-medium"
                                  >
                                    View & Renew
                                  </button>
                                )}
                                <button
                                  onClick={() => handleResolveAlert(alert._id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Mark as Resolved"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAlert(alert._id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-red-50/30 border-2 border-dashed border-red-200 rounded-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-3">
                      <CheckCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-red-800 font-semibold text-lg mb-1">No Expired Items</p>
                    <p className="text-red-600 text-sm">All your cards and passes are current!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Expiring Soon Section - Always Visible */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-slate-200/60 flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                    <Bell className="h-5 w-5 text-indigo-600" />
                    ⏰ Cards & Passes Expiring Soon
                    {expiringAlerts.length > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                        {expiringAlerts.length}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">Refresh</span>
                  </button>
                </div>
                
                <div className="p-6">
                  {expiringAlerts.length > 0 ? (
                    <div className="space-y-4">
                      {expiringAlerts.map(alert => {
                      const daysRemaining = getDaysRemaining(alert.expiryDate);
                      
                      return (
                        <div
                          key={alert._id}
                          className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${getSeverityColor(alert.severity)}`}
                        >
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className={`rounded-full p-3 ${
                                alert.severity === 'high' || alert.severity === 'critical'
                                  ? 'bg-red-100 text-red-600' 
                                  : alert.severity === 'medium'
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {getAlertIcon(alert.alertType)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg text-slate-800 mb-1">{alert.title}</h4>
                                <p className="text-slate-600 text-sm mb-2">{alert.message}</p>
                                
                                {/* Display card details */}
                                <div className="space-y-1">
                                  {alert.metadata?.category && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                      <span className="font-medium">Category:</span>
                                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">{alert.metadata.category}</span>
                                    </div>
                                  )}
                                  {alert.metadata?.expiryFormatted && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                      <Calendar className="h-4 w-4" />
                                      <span className="font-medium">Expiry:</span>
                                      <span className="font-mono font-bold">{alert.metadata.expiryFormatted}</span>
                                      <span className="text-xs">({alert.metadata.expiryDateString || (alert.expiryDate ? new Date(alert.expiryDate).toLocaleDateString() : 'N/A')})</span>
                                    </div>
                                  )}
                                  {!alert.metadata?.expiryFormatted && alert.expiryDate && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                      <Calendar className="h-4 w-4" />
                                      <span>Expires: {new Date(alert.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              {daysRemaining !== null && (
                                <span className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1 border ${getSeverityBadgeColor(alert.severity)}`}>
                                  <Clock4 className="h-4 w-4" />
                                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                                </span>
                              )}
                              <div className="flex items-center gap-2">
                                {alert.actionUrl && (
                                  <button
                                    onClick={() => handleViewCard(alert)}
                                    className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                                  >
                                    View Card
                                  </button>
                                )}
                                <button
                                  onClick={() => handleResolveAlert(alert._id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Resolve"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAlert(alert._id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-indigo-50/30 border-2 border-dashed border-indigo-200 rounded-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-3">
                      <CheckCircle className="h-8 w-8 text-indigo-600" />
                    </div>
                    <p className="text-indigo-800 font-semibold text-lg mb-1">Nothing Expiring Soon</p>
                    <p className="text-indigo-600 text-sm">Your cards and passes are valid for a while!</p>
                  </div>
                )}
              </div>
            </div>

            {/* No Alerts State - Only show when NO card/pass alerts at all */}
            {cardPassAlerts.length === 0 && !loading && (
              <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-slate-200/60 flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                    <Bell className="h-5 w-5 text-indigo-600" />
                    Card & Pass Expiration Alerts
                  </h3>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">Refresh</span>
                  </button>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="bg-slate-50 rounded-lg p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 mb-3"></div>
                      <p className="text-slate-500">Loading alerts...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-rose-500" />
                      <div>
                        <p className="text-rose-600 font-medium">{error}</p>
                        <button
                          onClick={handleRefresh}
                          className="text-sm text-rose-700 hover:text-rose-800 underline mt-1"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-8 text-center">
                      <BellOff className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">No expiration alerts</p>
                      <p className="text-slate-500 text-sm mt-1">Your cards and passes are all up to date!</p>
                      <button
                        onClick={handleRefresh}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Check for Updates
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other Alerts Section */}
            {otherAlerts.length > 0 && (
              <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 border-b border-slate-200/60">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                    <History className="h-5 w-5 text-slate-600" />
                    Other Alerts
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                      {otherAlerts.length}
                    </span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {otherAlerts.map(alert => (
                      <div
                        key={alert._id}
                        className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-100 p-2 rounded-full">
                              <Clock className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-slate-800">{alert.title}</h5>
                              <p className="text-sm text-slate-600">{alert.message}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResolveAlert(alert._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Resolve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAlert(alert._id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </FeatureTemplate>
      <Footer />
    </>
  );
};

export default Alerts;
