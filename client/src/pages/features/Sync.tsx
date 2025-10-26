import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Smartphone, Laptop, Computer, AlertCircle, Check, Settings, 
  Clock, Database, Lock, LogIn, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import syncService from '../../services/syncService';
import deviceService from '../../services/deviceService';

interface SyncDevice {
  id: string;
  name: string;
  type: 'mobile' | 'laptop' | 'desktop';
  lastSynced: Date;
  status: 'synced' | 'syncing' | 'error';
}

interface SyncStats {
  totalSyncs: number;
  lastWeekSyncs: number;
  dataTransferred: string;
  syncSuccess: number;
}

interface SyncHistory {
  id: string;
  timestamp: Date;
  status: 'success' | 'failed';
  details: string;
}

interface FeatureTemplateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FeatureTemplate: React.FC<FeatureTemplateProps> = ({ title, description, icon, children }) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/20 to-white min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
        {/* Enhanced decorative elements */}
        <div className="absolute top-20 right-20 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-blue-100/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 left-10 w-24 h-24 bg-purple-100/30 rounded-full blur-2xl -z-10"></div>
        
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
          {/* Redesigned header section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-purple-500/10 z-0"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-100/30 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8 border-b border-slate-200/50">
              {/* Enhanced icon container */}
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
          
          {/* Improved content section */}
          <div className="p-8 md:p-12 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-indigo-50/5 to-blue-50/10 opacity-70"></div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
        
        {/* Redesigned bottom accent */}
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
      <p className="text-slate-600 mb-6">Please sign in to manage your device sync settings</p>
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

const Sync = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<SyncDevice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalSyncs: 0,
    lastWeekSyncs: 0,
    dataTransferred: '0 B',
    syncSuccess: 0
  });
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      case 'laptop': return <Laptop className="h-5 w-5" />;
      case 'desktop': return <Computer className="h-5 w-5" />;
      default: return null;
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setError(null);
    
    try {
      // Get all devices and trigger sync for each
      const devicesResponse = await deviceService.getDevices();
      
      if (devicesResponse.devices.length === 0) {
        setError('No devices found to sync');
        setIsSyncing(false);
        return;
      }
      
      // Use the first device or current device for sync
      const primaryDevice = devicesResponse.devices.find((d: any) => d.isPrimary) || devicesResponse.devices[0];
      
      // Initiate sync
      const syncResponse = await syncService.initiateSync({
        deviceId: primaryDevice._id,
        syncType: 'manual',
        dataTypes: ['passwords', 'documents', 'settings', 'notes', 'qrcodes']
      });
      
      // Update devices to syncing status
      setDevices(prev => 
        prev.map(device => ({ ...device, status: 'syncing' }))
      );
      
      // Poll for sync completion
      const syncLogId = syncResponse.syncLog.id;
      let pollCount = 0;
      const maxPolls = 30; // Max 30 seconds
      
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await syncService.getSyncStatus(syncLogId);
          
          if (statusResponse.syncStatus === 'completed') {
            clearInterval(pollInterval);
            setLastSync(new Date(statusResponse.completedAt!));
            
            // Send notification
            await syncService.notifySyncCompleted(statusResponse);
            
            // Update all devices to synced
            setDevices(prev => 
              prev.map(device => ({ ...device, status: 'synced', lastSynced: new Date() }))
            );
            
            // Refresh sync stats
            const stats = await syncService.getSyncStats();
            const successRate = stats.totalSyncs > 0 
              ? Math.round((stats.completedSyncs / stats.totalSyncs) * 100)
              : 0;
            
            setSyncStats(prev => ({
              ...prev,
              totalSyncs: stats.totalSyncs,
              dataTransferred: syncService.formatDataSize(stats.totalDataSynced || 0),
              syncSuccess: successRate
            }));
            
            // Refresh sync history
            const recentSyncs = await syncService.getRecentSyncs(5);
            const mappedHistory: SyncHistory[] = recentSyncs.map((sync: any) => ({
              id: sync._id,
              timestamp: new Date(sync.completedAt || sync.startedAt),
              status: sync.syncStatus === 'completed' ? 'success' : 'failed',
              details: sync.syncStatus === 'completed' 
                ? `Synced ${sync.totalItems || 0} items (${syncService.formatDataSize(sync.dataSynced || 0)})`
                : sync.error?.message || 'Sync failed'
            }));
            setSyncHistory(mappedHistory);
            
            setIsSyncing(false);
          } else if (statusResponse.syncStatus === 'failed') {
            clearInterval(pollInterval);
            const errorMsg = statusResponse.error?.message || 'Sync failed. Please try again.';
            setError(errorMsg);
            
            // Send failure notification
            await syncService.notifySyncFailed(errorMsg);
            
            setDevices(prev => 
              prev.map(device => ({ ...device, status: 'error' }))
            );
            setIsSyncing(false);
          }
          
          pollCount++;
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setError('Sync timed out. Please try again.');
            setIsSyncing(false);
          }
        } catch (pollErr) {
          console.error('Error polling sync status:', pollErr);
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('Failed to initiate sync:', err);
      setError(err.response?.data?.message || 'Sync failed. Please try again.');
      setIsSyncing(false);
      
      // Revert devices to previous status
      setDevices(prev => 
        prev.map(device => ({ ...device, status: 'synced' }))
      );
    }
  };

  useEffect(() => {
    const checkAuthAndLoadDevices = async () => {
      // Check auth status
      const token = localStorage.getItem('accessToken');
      const authStatus = !!token;
      setIsAuthenticated(authStatus);
      
      if (authStatus) {
        try {
          setDataLoading(true);
          
          // Fetch devices from API
          const devicesResponse = await deviceService.getDevices();
          
          // Map devices to sync format
          const mappedDevices: SyncDevice[] = devicesResponse.devices.map((device: any) => ({
            id: device._id,
            name: device.deviceName,
            type: device.deviceType === 'smartphone' ? 'mobile' : (device.deviceType === 'desktop' || device.deviceType === 'laptop' ? device.deviceType : 'desktop'),
            lastSynced: device.lastSyncedAt ? new Date(device.lastSyncedAt) : new Date(),
            status: device.status === 'syncing' ? 'syncing' : (device.lastSyncedAt ? 'synced' : 'error')
          }));
          
          setDevices(mappedDevices);
          
          // Fetch sync statistics
          const stats = await syncService.getSyncStats();
          
          // Calculate success rate
          const successRate = stats.totalSyncs > 0 
            ? Math.round((stats.completedSyncs / stats.totalSyncs) * 100)
            : 0;
          
          // Get recent syncs for last week calculation
          const now = new Date();
          const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const lastWeekSyncs = stats.recentSyncs?.filter((sync: any) => 
            new Date(sync.startedAt) >= lastWeek
          ).length || 0;
          
          setSyncStats({
            totalSyncs: stats.totalSyncs,
            lastWeekSyncs: lastWeekSyncs,
            dataTransferred: syncService.formatDataSize(stats.totalDataSynced || 0),
            syncSuccess: successRate
          });
          
          // Set last sync time from most recent sync
          if (stats.recentSyncs && stats.recentSyncs.length > 0) {
            const mostRecent = stats.recentSyncs[0];
            setLastSync(new Date(mostRecent.completedAt || mostRecent.startedAt));
          }
          
          // Fetch recent sync history
          const recentSyncs = await syncService.getRecentSyncs(5);
          const mappedHistory: SyncHistory[] = recentSyncs.map((sync: any) => ({
            id: sync._id,
            timestamp: new Date(sync.completedAt || sync.startedAt),
            status: sync.syncStatus === 'completed' ? 'success' : 'failed',
            details: sync.syncStatus === 'completed' 
              ? `Synced ${sync.totalItems || 0} items (${syncService.formatDataSize(sync.dataSynced || 0)})`
              : sync.error?.message || 'Sync failed'
          }));
          setSyncHistory(mappedHistory);
          
          setDataLoading(false);
        } catch (err: any) {
          console.error('Failed to load sync data:', err);
          setError(err.response?.data?.message || 'Failed to load sync data');
          setDataLoading(false);
        }
      } else {
        setDataLoading(false);
      }
    };

    checkAuthAndLoadDevices();
  }, []);

  return (
    <>
      <Navbar />
      <FeatureTemplate
        title="Auto-Sync"
        description="Changes sync automatically across all your devices. Experience seamless synchronization with real-time updates."
        icon={<RefreshCw className="h-8 w-8 text-slate-700" />}
      >
        {/* Go Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>

        {!isAuthenticated ? (
          <AuthPrompt />
        ) : dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
              <p className="text-gray-600">Loading sync data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                </div>
                <span className="text-rose-600 font-medium">{error}</span>
              </div>
            )}

            {/* Sync Status Bar */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <RefreshCw className={`h-8 w-8 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">Sync Status</h3>
                  <p className="text-indigo-600 font-medium">
                    {isSyncing ? 'Synchronizing data across devices...' : 'All devices up to date'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-colors shadow-sm ${
                    isSyncing ? 'animate-pulse' : ''
                  }`}
                >
                  <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
                
                {lastSync && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/60 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    Last synced: {lastSync.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Stats and Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enhanced Sync Statistics */}
              <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                  <h3 className="font-medium flex items-center gap-2 text-slate-800">
                    <Database className="h-5 w-5 text-indigo-600" />
                    Sync Statistics
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                      <div className="text-xs text-slate-500 mb-1">Total Syncs</div>
                      <div className="text-2xl font-semibold text-slate-800">{syncStats.totalSyncs}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                      <div className="text-xs text-slate-500 mb-1">Last 7 Days</div>
                      <div className="text-2xl font-semibold text-slate-800">{syncStats.lastWeekSyncs}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                      <div className="text-xs text-slate-500 mb-1">Data Transferred</div>
                      <div className="text-2xl font-semibold text-slate-800">{syncStats.dataTransferred}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                      <div className="text-xs text-slate-500 mb-1">Success Rate</div>
                      <div className="text-2xl font-semibold text-emerald-600">{syncStats.syncSuccess}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Sync Settings */}
              <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60 flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2 text-slate-800">
                    <Settings className="h-5 w-5 text-indigo-600" />
                    Sync Settings
                  </h3>
                  <button 
                    className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-200 transition-colors"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    Configure
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <label className="flex items-center gap-3 cursor-pointer w-full">
                      <div className={`relative w-12 h-6 transition-colors duration-300 rounded-full bg-indigo-500`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          defaultChecked
                        />
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 transform translate-x-6`}></div>
                      </div>
                      <span className="text-slate-700 font-medium">Auto-sync enabled</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <label className="flex items-center gap-3 cursor-pointer w-full">
                      <div className={`relative w-12 h-6 transition-colors duration-300 rounded-full bg-indigo-500`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          defaultChecked
                        />
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 transform translate-x-6`}></div>
                      </div>
                      <span className="text-slate-700 font-medium">Sync on Wi-Fi only</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <label className="flex items-center gap-3 cursor-pointer w-full">
                      <div className={`relative w-12 h-6 transition-colors duration-300 rounded-full bg-indigo-500`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          defaultChecked
                        />
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 transform translate-x-6`}></div>
                      </div>
                      <span className="text-slate-700 font-medium">Background sync</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Connected Devices */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <Smartphone className="h-5 w-5 text-indigo-600" />
                  Connected Devices
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {devices.map(device => (
                    <div 
                      key={device.id} 
                      className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
                        device.status === 'synced' 
                          ? 'border-emerald-200' 
                          : device.status === 'syncing' 
                            ? 'border-blue-200' 
                            : 'border-rose-200'
                      }`}
                    >
                      <div className={`p-4 ${
                        device.status === 'synced' 
                          ? 'bg-emerald-50' 
                          : device.status === 'syncing' 
                            ? 'bg-blue-50' 
                            : 'bg-rose-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              {getDeviceIcon(device.type)}
                            </div>
                            <span className="font-medium text-slate-800">{device.name}</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            device.status === 'synced' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : device.status === 'syncing' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-rose-100 text-rose-700'
                          }`}>
                            {device.status}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          Last synced: {device.lastSynced.toLocaleString()}
                        </div>
                        {device.status === 'synced' && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
                            <Check className="h-4 w-4" />
                            All data synchronized
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Sync Activity */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Recent Sync Activity
                </h3>
              </div>
              <div className="divide-y divide-slate-200">
                {syncHistory.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="bg-slate-50 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">No sync activity yet</p>
                    <p className="text-slate-400 text-xs mt-1">Sync history will appear here</p>
                  </div>
                ) : (
                  syncHistory.map(activity => (
                    <div key={activity.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            activity.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {activity.status === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{activity.details}</div>
                            <div className="text-xs text-slate-500">
                              {activity.timestamp.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'success' 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </FeatureTemplate>
      <Footer />
    </>
  );
};

export default Sync;
