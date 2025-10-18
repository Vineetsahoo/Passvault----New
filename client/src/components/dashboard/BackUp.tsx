import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCloud, FaCheck, FaExclamationTriangle, 
  FaLaptop, FaMobile, FaTablet, FaDesktop,
  FaHistory, FaCog, FaTrash, FaEdit, FaShieldAlt, 
  FaCloudDownloadAlt, FaCloudUploadAlt, FaUndo,
  FaCalendarAlt, FaDatabase, FaEllipsisV,
  FaTimes, FaLock, FaPlus, FaServer,
  FaSyncAlt, FaCheckCircle, FaExclamationCircle, FaClock,
  FaSave, FaChevronRight
} from 'react-icons/fa';
import { HiCloud, HiOutlineDownload, HiOutlineUpload } from "react-icons/hi";
import { IoCloudDone, IoCloudOffline } from "react-icons/io5";

interface SyncStatus {
  lastSync: string;
  status: 'success' | 'pending' | 'error';
  items: number;
}

interface SyncDevice {
  id: string;
  name: string;
  type: 'laptop' | 'mobile' | 'tablet' | 'desktop';
  lastSync: string;
  status: 'online' | 'offline';
}

interface SyncHistory {
  id: string;
  date: string;
  status: 'success' | 'error';
  details: string;
}

interface SyncProgress {
  total: number;
  current: number;
  uploading: boolean;
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 
                     peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                     after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                     after:border after:rounded-full after:h-6 after:w-6 after:shadow-md after:transition-all 
                     peer-checked:bg-blue-600 rounded-full"></div>
      {label && <span className="ml-3 text-sm font-medium text-gray-900">{label}</span>}
    </label>
  );
};

interface BackupVersion {
  id: string;
  timestamp: string;
  size: string;
  type: 'auto' | 'manual';
  restorable: boolean;
}

interface RecoveryStatus {
  inProgress: boolean;
  progress: number;
  currentFile: string;
  estimatedTime: string;
}

interface BackupSettings {
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number;
  encryption: boolean;
  compression: boolean;
  location: 'cloud' | 'local';
}

const BackUp: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: '2023-12-04 14:30',
    status: 'success',
    items: 156
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({ total: 0, current: 0, uploading: false });
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncMode, setSyncMode] = useState<'auto' | 'manual'>('auto');
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const [devices] = useState<SyncDevice[]>([
    { id: '1', name: 'MacBook Pro', type: 'laptop', lastSync: '2023-12-04 14:30', status: 'online' },
    { id: '2', name: 'iPhone 13', type: 'mobile', lastSync: '2023-12-04 13:15', status: 'online' },
    { id: '3', name: 'Office PC', type: 'desktop', lastSync: '2023-12-03 18:45', status: 'offline' }
  ]);

  const [syncHistory] = useState<SyncHistory[]>([
    { id: '1', date: '2023-12-04 14:30', status: 'success', details: 'All items synced successfully' },
    { id: '2', date: '2023-12-03 18:45', status: 'error', details: 'Network connection failed' },
    { id: '3', date: '2023-12-03 12:30', status: 'success', details: 'Manual sync completed' }
  ]);

  const [backupVersions, setBackupVersions] = useState<BackupVersion[]>([
    {
      id: 'v1',
      timestamp: '2023-12-04 14:30',
      size: '256 MB',
      type: 'auto',
      restorable: true
    },
    {
      id: 'v2',
      timestamp: '2023-12-03 12:00',
      size: '254 MB',
      type: 'manual',
      restorable: true
    }
  ]);

  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>({
    inProgress: false,
    progress: 0,
    currentFile: '',
    estimatedTime: ''
  });

  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    frequency: 'daily',
    retention: 30,
    encryption: true,
    compression: true,
    location: 'cloud'
  });

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setSyncProgress(prev => ({
          ...prev,
          current: Math.min(prev.current + 10, prev.total),
          uploading: !prev.uploading
        }));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'laptop': return <FaLaptop />;
      case 'mobile': return <FaMobile />;
      case 'tablet': return <FaTablet />;
      default: return <FaDesktop />;
    }
  };

  const getStatusBadge = (status: 'success' | 'pending' | 'error') => {
    switch (status) {
      case 'success':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <FaCheckCircle size={12} /> Success
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <FaClock size={12} /> Pending
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <FaExclamationCircle size={12} /> Error
          </span>
        );
      default:
        return null;
    }
  };

  const handleSync = async () => {
    try {
      setError(null);
      setShowBackupModal(true);
      setIsLoading(true);
      setSyncProgress({ total: 100, current: 0, uploading: true });
      setSyncStatus(prev => ({ ...prev, status: 'pending' }));
      
      setTimeout(() => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setSyncProgress(prev => ({
            ...prev,
            current: progress
          }));
          
          if (progress >= 100) {
            clearInterval(interval);
            
            const newBackup = {
              id: `v${backupVersions.length + 1}`,
              timestamp: new Date().toLocaleString(),
              size: `${Math.floor(Math.random() * 10 + 250)} MB`,
              type: 'manual' as const,
              restorable: true
            };
            
            setBackupVersions(prev => [newBackup, ...prev]);
            
            setSyncStatus({
              lastSync: new Date().toLocaleString(),
              status: 'success',
              items: syncStatus.items + Math.floor(Math.random() * 10)
            });
            
            setIsLoading(false);
            setSyncProgress({ total: 0, current: 0, uploading: false });
            
            // Auto close modal after 2 seconds on success
            setTimeout(() => {
              setShowBackupModal(false);
            }, 2000);
          }
        }, 200);
      }, 1000);
    } catch (err) {
      setError('An error occurred during backup');
      setSyncStatus(prev => ({ ...prev, status: 'error' }));
      setIsLoading(false);
      setSyncProgress({ total: 0, current: 0, uploading: false });
    }
  };

  const handleDeviceAction = (deviceId: string, action: 'edit' | 'remove') => {
    setSelectedDevice(deviceId);
  };

  const handleRestore = async (versionId: string) => {
    try {
      setRecoveryStatus({
        inProgress: true,
        progress: 0,
        currentFile: 'Initializing recovery...',
        estimatedTime: 'Calculating...'
      });
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setRecoveryStatus(prev => ({
          ...prev,
          progress,
          currentFile: `Recovering file ${progress}/100`,
          estimatedTime: `${Math.ceil((100 - progress) / 10)} seconds remaining`
        }));
        
        if (progress >= 100) {
          clearInterval(interval);
          setRecoveryStatus(prev => ({
            ...prev,
            progress: 100,
            currentFile: 'Recovery complete',
            estimatedTime: 'Done'
          }));
          
          setTimeout(() => {
            setRecoveryStatus(prev => ({ ...prev, inProgress: false }));
          }, 2000);
        }
      }, 500);
    } catch (error) {
      setError('Failed to restore backup');
      setRecoveryStatus(prev => ({ ...prev, inProgress: false }));
    }
  };

  const handleDeleteBackup = async (versionId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this backup?')) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      setTimeout(() => {
        setBackupVersions(prev => prev.filter(backup => backup.id !== versionId));
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to delete backup');
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      setTimeout(() => {
        setBackupSettings(prev => ({
          ...prev,
          frequency: syncMode === 'auto' ? 'daily' : 'weekly',
          encryption: encryptionEnabled
        }));
        
        setShowSettings(false);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to update settings');
      setIsLoading(false);
    }
  };

  const BackupHeader = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-2xl shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-300 opacity-10 rounded-full translate-y-1/3"></div>
      
      <div className="relative z-10 p-7">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-3 mb-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <FaDatabase className="text-blue-200" />
              <span className="text-xs font-medium text-blue-50">Data Protection</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white flex flex-wrap items-center gap-3">
              <HiCloud className="h-8 w-8 text-blue-200" /> 
              <span>Backup & Sync</span>
            </h2>
            
            <p className="text-blue-100 mt-1.5 max-w-lg">
              Keep your sensitive information safely backed up and synchronized across devices
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSettings(!showSettings)}
              className={`px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium rounded-lg transition-all flex items-center gap-2 border border-white/20 ${
                showSettings ? 'bg-white/20' : ''
              }`}
            >
              <FaCog className="text-blue-200" /> {showSettings ? 'Hide Settings' : 'Settings'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSync}
              disabled={isLoading}
              className="px-4 py-2.5 bg-white text-blue-700 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <FaSyncAlt className={isLoading ? 'animate-spin' : ''} /> 
              {isLoading ? 'Backing Up...' : 'Backup Now'}
            </motion.button>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <FaCloudUploadAlt className="text-blue-200" size={12} />
            <span className="text-xs text-blue-50">{syncStatus.items} items secured</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <FaCalendarAlt className="text-blue-200" size={12} />
            <span className="text-xs text-blue-50">Last backup: {formatDate(syncStatus.lastSync)}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {syncMode === 'auto' ? (
              <>
                <FaClock className="text-blue-200" size={12} />
                <span className="text-xs text-blue-50">Auto backup enabled</span>
              </>
            ) : (
              <>
                <FaExclamationTriangle className="text-yellow-300" size={12} />
                <span className="text-xs text-blue-50">Auto backup disabled</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const BackupSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.05)" }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Backup Status</h3>
            <div className="p-3 rounded-xl bg-white shadow-sm flex items-center justify-center">
              {syncStatus.status === 'success' ? 
                <IoCloudDone className="text-blue-600 h-5 w-5" /> : 
                syncStatus.status === 'pending' ?
                <FaClock className="text-amber-500 h-5 w-5" /> :
                <IoCloudOffline className="text-red-500 h-5 w-5" />
              }
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Last Successful Backup</p>
            {getStatusBadge(syncStatus.status)}
          </div>
          <p className="text-xl font-semibold text-gray-800">{formatDate(syncStatus.lastSync)}</p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
            <span className="text-gray-600">{syncStatus.items} items backed up</span>
            <span className="text-blue-600 font-medium hover:underline cursor-pointer">View Details</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.05)" }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-100 p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Backup Size</h3>
            <div className="p-3 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <FaDatabase className="text-indigo-600 h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-indigo-600">{syncStatus.items * 0.5} MB</p>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
              {syncStatus.items} files
            </span>
          </div>
          <div className="mt-2.5">
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ width: `${Math.min((syncStatus.items * 0.5) / 100, 100)}%` }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>0 MB</span>
              <span>Max 100 MB</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
            <span className="text-gray-600">{backupVersions.length} versions</span>
            <span className={`${syncMode === 'auto' ? 'text-green-600' : 'text-amber-600'} font-medium`}>
              {syncMode === 'auto' ? 'Auto' : 'Manual'} backup
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.05)" }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-purple-50 via-fuchsia-50 to-violet-100 p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Next Backup</h3>
            <div className="p-3 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <FaCalendarAlt className="text-purple-600 h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="p-5">
          {syncMode === 'auto' ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                </div>
                <p className="text-xl font-semibold text-gray-800">Today, 18:00</p>
              </div>
              <p className="text-sm text-gray-600">Automatic daily backup scheduled</p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-semibold text-gray-800 mb-3">Not scheduled</p>
              <p className="text-sm text-gray-600">Auto backup is disabled</p>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Auto Backup
            </div>
            <Switch 
              checked={syncMode === 'auto'}
              onChange={(checked) => setSyncMode(checked ? 'auto' : 'manual')}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
  
  const SyncProgress = () => (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white mb-6 rounded-xl shadow-md border border-indigo-100 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
                  {syncProgress.uploading ? 
                    <HiOutlineUpload className="text-blue-600 h-6 w-6" /> : 
                    <HiOutlineDownload className="text-blue-600 h-6 w-6" />
                  }
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-900">
                    {syncProgress.uploading ? 'Uploading Backup' : 'Processing Backup'}
                  </h3>
                  <p className="text-gray-600">
                    Please keep the application open
                  </p>
                </div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2 text-center">
                <p className="text-sm text-gray-700">Estimated time remaining</p>
                <p className="font-bold text-indigo-700">{Math.round((100 - syncProgress.current) / 10)} seconds</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-800">{syncProgress.current}% complete</span>
                <span className="text-gray-600">{syncProgress.current < 50 ? 'Preparing data...' : 'Encrypting and uploading...'}</span>
              </div>
              
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-600 to-blue-500"
                  style={{ width: `${syncProgress.current}%` }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${syncProgress.current}%` }}
                  transition={{ type: "spring", damping: 20 }}
                />
              </div>
              
              <div className="flex gap-1 mt-3">
                <div className={`h-1.5 w-1/4 rounded-full ${syncProgress.current >= 25 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className={`h-1.5 w-1/4 rounded-full ${syncProgress.current >= 50 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className={`h-1.5 w-1/4 rounded-full ${syncProgress.current >= 75 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className={`h-1.5 w-1/4 rounded-full ${syncProgress.current >= 100 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  const ErrorDisplay = () => (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-5 mb-6 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-full">
              <FaExclamationCircle className="text-red-600 h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg text-red-800">Backup Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <div className="mt-3 flex gap-3">
                <button 
                  onClick={() => setError(null)}
                  className="px-4 py-2 bg-white text-red-700 rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  Dismiss
                </button>
                <button 
                  onClick={handleSync}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <FaSyncAlt /> Retry Backup
                </button>
              </div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="p-1.5 hover:bg-red-200/50 rounded-full text-red-700"
            >
              <FaTimes />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  const RecoveryPanel = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-gray-50 p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <FaUndo className="text-blue-600 h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Previous Backups</h3>
              <p className="text-sm text-gray-500">Restore your data to a previous state</p>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
            View All Versions
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {backupVersions.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-50"></div>
                <div className="relative bg-blue-50 rounded-full w-full h-full flex items-center justify-center">
                  <FaDatabase className="text-blue-400 text-2xl" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No backups available yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Create your first backup to ensure your data is protected against loss or corruption
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSync}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 mx-auto"
              >
                <FaSyncAlt /> Create First Backup
              </motion.button>
            </div>
          ) : (
            backupVersions.map((version) => (
              <motion.div 
                key={version.id}
                whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
                className="p-5 rounded-xl border border-gray-100 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      version.type === 'auto' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {version.type === 'auto' ? 
                        <FaClock /> : 
                        <FaDatabase />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{formatDate(version.timestamp)}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          version.type === 'auto' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {version.type === 'auto' ? 'Automatic' : 'Manual'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <FaDatabase className="text-gray-400" size={12} />
                          {version.size}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>ID: {version.id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRestore(version.id)}
                      disabled={isLoading || !version.restorable}
                      className={`p-2 rounded-lg ${
                        isLoading || !version.restorable 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Restore this backup"
                    >
                      <FaUndo />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteBackup(version.id)}
                      disabled={isLoading}
                      className={`p-2 rounded-lg ${
                        isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete this backup"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          
          {backupVersions.length > 0 && (
            <div className="text-center pt-3">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Load more backups
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RecoveryProgress = () => (
    <AnimatePresence>
      {recoveryStatus.inProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl shadow-sm">
                  <FaCloudDownloadAlt className="text-green-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Recovery in Progress</h3>
                  <p className="text-sm text-gray-500">Restoring your data to a previous state</p>
                </div>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-green-600">
                {recoveryStatus.progress}% complete
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-800">Recovery Progress</span>
                  <span className="text-gray-600">{recoveryStatus.estimatedTime}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                    style={{ width: `${recoveryStatus.progress}%` }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${recoveryStatus.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Current Operation</div>
                <div className="flex items-center gap-3">
                  <div className="animate-pulse p-2 bg-green-100 rounded-lg">
                    <FaDatabase className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{recoveryStatus.currentFile}</div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 inline-flex items-center gap-2 text-sm text-yellow-700">
                  <FaExclamationTriangle className="text-yellow-600" />
                  Do not close the application during recovery
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  const DeviceManagement = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-gray-50 via-indigo-50 to-gray-50 p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-xl shadow-sm">
              <FaLaptop className="text-indigo-600 h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Connected Devices</h3>
              <p className="text-sm text-gray-500">Manage device synchronization</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <FaPlus size={12} /> Add New Device
          </motion.button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {devices.map(device => (
            <motion.div 
              key={device.id}
              whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
              className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    device.status === 'online' ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{device.name}</h4>
                      {device.status === 'online' && (
                        <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Online
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <FaClock className="text-gray-400" size={12} />
                        Last sync: {formatDate(device.lastSync)}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="capitalize">{device.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {device.status === 'online' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSync}
                      className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Sync now"
                    >
                      <FaSyncAlt />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeviceAction(device.id, 'edit')}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeviceAction(device.id, 'remove')}
                    className="p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
          
          <button className="w-full p-3 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2">
            <FaPlus /> Add another device
          </button>
        </div>
      </div>
    </div>
  );
  
  const SyncHistoryPanel = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-gray-50 via-purple-50 to-gray-50 p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl shadow-sm">
              <FaHistory className="text-purple-600 h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Activity Log</h3>
              <p className="text-sm text-gray-500">Track backup and sync operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="text-sm border-gray-200 rounded-lg focus:ring-purple-300 focus:border-purple-300">
              <option>All activities</option>
              <option>Backups only</option>
              <option>Restore operations</option>
            </select>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {syncHistory.map((entry, index) => (
            <div key={entry.id} className="relative pl-6">
              <div className={`absolute left-0 top-0 w-3.5 h-3.5 rounded-full ${
                entry.status === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              
              {index !== syncHistory.length - 1 && (
                <div className="absolute left-1.5 top-3 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-transparent"></div>
              )}
              
              <div className="pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {formatDate(entry.date)}
                    {entry.status === 'success' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                        <FaCheckCircle size={10} /> Success
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                        <FaExclamationCircle size={10} /> Failed
                      </span>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full">
                    <FaEllipsisV size={12} />
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-700">{entry.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const SettingsPanel = () => (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl shadow-sm">
                <FaCog className="text-indigo-600 h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Backup Settings</h3>
                <p className="text-sm text-gray-500">Configure your backup preferences</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="p-2 rounded-full hover:bg-white/50 text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h4 className="font-medium text-gray-900 flex items-center gap-1.5 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  Backup Options
                </h4>
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="font-medium text-gray-800">Auto-Backup</label>
                      <p className="text-sm text-gray-600">Automatically backup your data</p>
                    </div>
                    <Switch 
                      checked={syncMode === 'auto'}
                      onChange={(checked) => setSyncMode(checked ? 'auto' : 'manual')}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {syncMode === 'auto' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Backup Frequency
                          </label>
                          <select 
                            value={backupSettings.frequency}
                            onChange={(e) => setBackupSettings(prev => ({
                              ...prev,
                              frequency: e.target.value as any
                            }))}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Location
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setBackupSettings(prev => ({ ...prev, location: 'cloud' }))}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border ${
                        backupSettings.location === 'cloud'
                          ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-200 ring-opacity-50'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <FaCloud size={24} className={backupSettings.location === 'cloud' ? 'text-blue-600' : 'text-gray-400'} />
                      <span className={`text-sm font-medium ${backupSettings.location === 'cloud' ? 'text-blue-700' : 'text-gray-700'}`}>
                        Cloud Storage
                      </span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setBackupSettings(prev => ({ ...prev, location: 'local' }))}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border ${
                        backupSettings.location === 'local'
                          ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-200 ring-opacity-50'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <FaServer size={24} className={backupSettings.location === 'local' ? 'text-blue-600' : 'text-gray-400'} />
                      <span className={`text-sm font-medium ${backupSettings.location === 'local' ? 'text-blue-700' : 'text-gray-700'}`}>
                        Local Storage
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <h4 className="font-medium text-gray-900 flex items-center gap-1.5 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                  Security & Data
                </h4>
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-white border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="font-medium text-gray-800">End-to-End Encryption</label>
                      <p className="text-sm text-gray-600">Securely encrypt all your data</p>
                    </div>
                    <Switch 
                      checked={encryptionEnabled}
                      onChange={setEncryptionEnabled}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {encryptionEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-gray-100">
                          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start gap-3">
                            <FaExclamationTriangle className="text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              <p className="font-medium">Important Security Note</p>
                              <p className="mt-1">Encrypted backups cannot be recovered if you forget your master password.</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Retention Period
                  </label>
                  <div className="relative">
                    <select 
                      value={backupSettings.retention}
                      onChange={(e) => setBackupSettings(prev => ({
                        ...prev,
                        retention: parseInt(e.target.value)
                      }))}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pl-10"
                    >
                      <option value={7}>Keep for 7 days</option>
                      <option value={14}>Keep for 14 days</option>
                      <option value={30}>Keep for 30 days</option>
                      <option value={90}>Keep for 90 days</option>
                      <option value={365}>Keep for 1 year</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaClock className="text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Older backups will be automatically deleted to save space
                  </p>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-white border border-gray-100">
                  <div>
                    <label className="font-medium text-gray-800">Data Compression</label>
                    <p className="text-sm text-gray-600">Reduce backup size</p>
                  </div>
                  <Switch 
                    checked={backupSettings.compression}
                    onChange={(checked) => setBackupSettings(prev => ({
                      ...prev,
                      compression: checked
                    }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowSettings(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpdateSettings}
                disabled={isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm font-medium flex items-center gap-2"
              >
                <FaSave /> Save Settings
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const AuthPrompt = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md mx-auto my-20">
      <div className="text-center">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-50"></div>
          <div className="relative bg-gradient-to-br from-red-50 to-red-100 rounded-full w-full h-full flex items-center justify-center">
            <FaLock className="text-red-600 text-xl" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-3 text-gray-800">Authentication Required</h3>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          {error || "You need to be logged in to access and manage backups. Please sign in to continue."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.a 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="/signin" 
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            Sign In
          </motion.a>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setError(null);
              setIsAuthenticated(true);
            }}
            className="px-6 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <AuthPrompt />;
  }

  return (
    <div className="space-y-8 -mt-4"> {/* Increased spacing between sections and brought content up */}
      <BackupHeader />
      <BackupSummary />
      <SyncProgress />
      <ErrorDisplay />
      <RecoveryProgress />
      <SettingsPanel />
      <RecoveryPanel />
      <DeviceManagement />
      <SyncHistoryPanel />
      
      {/* Backup Progress Modal */}
      <AnimatePresence>
        {showBackupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isLoading && setShowBackupModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FaCloudUploadAlt className="text-white" />
                  {syncProgress.current >= 100 ? 'Backup Complete' : 'Backing Up Data'}
                </h3>
                <button 
                  onClick={() => !isLoading && setShowBackupModal(false)}
                  className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4"
                      >
                        <FaCloudUploadAlt className="text-3xl text-blue-600" />
                      </motion.div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Backing Up Your Data...</h4>
                      <p className="text-gray-600">Please wait while we securely backup your information.</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">Progress</span>
                        <span className="text-blue-600 font-semibold">{Math.round(syncProgress.current)}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${syncProgress.current}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Live Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <FaDatabase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{Math.floor(syncProgress.current * 1.56)}</div>
                        <div className="text-xs text-gray-600 mt-1">Items Backed Up</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-4 text-center">
                        <FaCloudUploadAlt className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{Math.floor(syncProgress.current * 2.5)} MB</div>
                        <div className="text-xs text-gray-600 mt-1">Data Uploaded</div>
                      </div>
                    </div>

                    {/* Backup Activity */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-green-500"
                        ></motion.div>
                        <span className="text-sm font-medium text-gray-700">Current Activity</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex items-center gap-2"
                        >
                          <FaChevronRight className="text-blue-600" size={10} />
                          <span>
                            {syncProgress.current < 30 ? 'Collecting your data...' :
                             syncProgress.current < 60 ? 'Encrypting files...' :
                             syncProgress.current < 90 ? 'Uploading to cloud...' :
                             'Finalizing backup...'}
                          </span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
                      <FaLock className="text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium">Secure Backup in Progress</p>
                        <p className="mt-1">Your data is being encrypted with AES-256 encryption.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Success State */}
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                      >
                        <FaCheckCircle className="text-3xl text-green-600" />
                      </motion.div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Backup Successful!</h4>
                      <p className="text-gray-600">Your data has been securely backed up to the cloud.</p>
                    </div>

                    {/* Final Results */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
                        <FaDatabase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{syncStatus.items}</div>
                        <div className="text-xs text-gray-600 mt-1">Items Secured</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-4 text-center border-2 border-indigo-200">
                        <FaCloudUploadAlt className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{Math.floor(syncStatus.items * 0.5)} MB</div>
                        <div className="text-xs text-gray-600 mt-1">Total Size</div>
                      </div>
                    </div>

                    {/* Backup Info */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FaShieldAlt className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Backup Details</h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <FaCheckCircle className="text-green-600" size={14} />
                              <span>End-to-end encrypted</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCheckCircle className="text-green-600" size={14} />
                              <span>Stored securely in the cloud</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCheckCircle className="text-green-600" size={14} />
                              <span>Backup ID: v{backupVersions.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowBackupModal(false)}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                      >
                        Done
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackUp;