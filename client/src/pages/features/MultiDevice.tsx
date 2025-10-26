import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Laptop, Monitor, Tablet, 
  Plus, AlertCircle, Activity, SignalHigh, 
  MonitorSmartphone, Power, Trash2,
  Shield, 
  Tag, 
  Users, 
  Lock,
  Settings2,
  RefreshCw,
  LogIn,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import deviceService from '../../services/deviceService';
import syncService from '../../services/syncService';

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

interface Device {
  id: string;
  name: string;
  type: 'smartphone' | 'tablet' | 'laptop' | 'desktop';
  lastActive: Date;
  status: 'online' | 'offline' | 'idle';
  browser?: string;
  os?: string;
  isCurrentDevice: boolean;
}

interface DeviceGroup {
  id: string;
  name: string;
  devices: string[];
}

interface DevicePermission {
  canSync: boolean;
  canShare: boolean;
  canModify: boolean;
  requiresVerification: boolean;
}

const AuthPrompt = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white border border-slate-200/60 p-8 rounded-xl shadow-lg text-center backdrop-blur-sm">
      <div className="bg-indigo-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Lock className="h-10 w-10 text-indigo-600" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-3">Sign in Required</h3>
      <p className="text-slate-600 mb-6">Please sign in to manage your devices</p>
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

const MultiDevice = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [deviceLimit] = useState(5);
  const [deviceStats, setDeviceStats] = useState({
    total: 0,
    online: 0,
    offline: 0
  });
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]);
  const [devicePermissions, setDevicePermissions] = useState<Record<string, DevicePermission>>({});
  
  // New state for device registration
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Verification state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationDeviceId, setVerificationDeviceId] = useState<string | null>(null);
  const [verificationDeviceName, setVerificationDeviceName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isResendingCode, setIsResendingCode] = useState(false);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="h-5 w-5" />;
      case 'tablet': return <Tablet className="h-5 w-5" />;
      case 'laptop': return <Laptop className="h-5 w-5" />;
      case 'desktop': return <Monitor className="h-5 w-5" />;
      default: return <MonitorSmartphone className="h-5 w-5" />;
    }
  };

  useEffect(() => {
    const checkAuthAndLoadDevices = async () => {
      // Check auth status
      const token = localStorage.getItem('accessToken');
      const authStatus = !!token;
      setIsAuthenticated(authStatus);
      
      console.log('🔐 Auth Status:', authStatus);
      console.log('🎫 Token exists:', !!token);
      
      if (authStatus) {
        try {
          setDataLoading(true);
          
          console.log('📡 Fetching devices from API...');
          // Fetch devices from API
          const devicesResponse = await deviceService.getDevices();
          console.log('✅ Devices response:', devicesResponse);
          
          // Map API devices to component format
          const mappedDevices: Device[] = devicesResponse.devices.map((device: any) => ({
            id: device._id,
            name: device.deviceName,
            type: device.deviceType === 'mobile' ? 'smartphone' : device.deviceType,
            lastActive: new Date(device.lastActiveAt),
            status: device.status === 'syncing' ? 'idle' : device.status,
            browser: device.browser,
            os: device.operatingSystem,
            isCurrentDevice: device.isPrimary
          }));
          
          console.log('📱 Mapped devices:', mappedDevices);
          setDevices(mappedDevices);
          
          // Set device stats
          setDeviceStats({
            total: devicesResponse.stats.total,
            online: devicesResponse.stats.online,
            offline: devicesResponse.stats.offline
          });
          console.log('📊 Device stats:', devicesResponse.stats);
          
          // Fetch device statistics for additional info
          const stats = await deviceService.getDeviceStats();
          console.log('📈 Additional stats:', stats);
          
          // Initialize device permissions from API data
          const permissions: Record<string, DevicePermission> = {};
          devicesResponse.devices.forEach((device: any) => {
            permissions[device._id] = {
              canSync: device.syncEnabled,
              canShare: device.isTrusted,
              canModify: device.isTrusted,
              requiresVerification: !device.isVerified // Check isVerified field
            };
          });
          setDevicePermissions(permissions);
          
          setLoading(false);
          setDataLoading(false);
        } catch (err: any) {
          console.error('❌ Failed to load devices:', err);
          console.error('❌ Error details:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
          setError(err.response?.data?.message || 'Failed to load devices');
          setLoading(false);
          setDataLoading(false);
        }
      } else {
        setLoading(false);
        setDataLoading(false);
      }
    };

    checkAuthAndLoadDevices();
  }, []);

  const handleRemoveDevice = async (deviceId: string) => {
    if (!window.confirm('Are you sure you want to remove this device? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Get device name before deletion
      const device = devices.find(d => d.id === deviceId);
      const deviceName = device?.name || 'Unknown Device';
      
      // Call API to remove device
      await deviceService.deleteDevice(deviceId, deviceName);
      
      // Update local state
      setDevices(prev => prev.filter(device => device.id !== deviceId));
      setDeviceStats(prev => ({
        ...prev,
        total: prev.total - 1
      }));
      
      // Remove device permissions
      setDevicePermissions(prev => {
        const newPerms = { ...prev };
        delete newPerms[deviceId];
        return newPerms;
      });
    } catch (err: any) {
      console.error('Failed to remove device:', err);
      setError(err.response?.data?.message || 'Failed to remove device');
    }
  };

  const handleUpdateDeviceName = async (deviceId: string, newName: string) => {
    try {
      // Call API to update device name
      await deviceService.updateDevice(deviceId, {
        deviceName: newName
      });
      
      // Update local state
      setDevices(prev => prev.map(device => 
        device.id === deviceId ? { ...device, name: newName } : device
      ));
    } catch (err: any) {
      console.error('Failed to update device name:', err);
      setError(err.response?.data?.message || 'Failed to update device name');
    }
  };

  const handleUpdateDevicePermissions = async (deviceId: string, permissions: Partial<DevicePermission>) => {
    try {
      // Map permissions to API format
      const updateData: any = {};
      
      if ('canSync' in permissions) {
        updateData.syncEnabled = permissions.canSync;
      }
      if ('canShare' in permissions || 'canModify' in permissions) {
        // isTrusted affects both canShare and canModify
        updateData.isTrusted = permissions.canShare || permissions.canModify;
      }
      
      // Call API to update device
      await deviceService.updateDevice(deviceId, updateData);
      
      // Update local state
      setDevicePermissions(prev => ({
        ...prev,
        [deviceId]: { ...prev[deviceId], ...permissions }
      }));
    } catch (err: any) {
      console.error('Failed to update device permissions:', err);
      setError(err.response?.data?.message || 'Failed to update device permissions');
    }
  };

  const handleSyncDevice = async (deviceId: string) => {
    try {
      // Update device status to syncing
      setDevices(prev => prev.map(device => 
        device.id === deviceId ? { ...device, status: 'idle' } : device
      ));
      
      // Trigger sync via API
      const response = await deviceService.triggerSync(deviceId);
      
      // Update device status back to online after sync
      setTimeout(() => {
        setDevices(prev => prev.map(device => 
          device.id === deviceId ? { ...device, status: 'online', lastActive: new Date() } : device
        ));
      }, 2000);
      
    } catch (err: any) {
      console.error('Failed to sync device:', err);
      setError(err.response?.data?.message || 'Failed to sync device');
      
      // Revert status on error
      setDevices(prev => prev.map(device => 
        device.id === deviceId ? { ...device, status: 'online' } : device
      ));
    }
  };

  const handleRegisterDevice = async () => {
    if (!newDeviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    try {
      setIsRegistering(true);
      setError(null);

      // Get current device information automatically
      const deviceInfo = deviceService.getCurrentDeviceInfo();
      
      console.log('Registering device with info:', {
        deviceName: newDeviceName,
        ...deviceInfo
      });
      
      // Register the device with custom name
      const registeredDevice = await deviceService.registerDevice({
        deviceName: newDeviceName,
        deviceType: deviceInfo.deviceType!,
        operatingSystem: deviceInfo.operatingSystem!,
        browser: deviceInfo.browser!,
      });

      console.log('Device registered successfully:', registeredDevice);

      // Map the new device to component format
      const newDevice: Device = {
        id: registeredDevice._id,
        name: registeredDevice.deviceName,
        type: registeredDevice.deviceType === 'mobile' ? 'smartphone' : registeredDevice.deviceType,
        lastActive: new Date(registeredDevice.lastActiveAt),
        status: registeredDevice.status === 'syncing' ? 'idle' : registeredDevice.status,
        browser: registeredDevice.browser || deviceInfo.browser || 'Unknown',
        os: registeredDevice.operatingSystem || deviceInfo.operatingSystem || 'Unknown',
        isCurrentDevice: false
      };

      // Add device to list
      setDevices(prev => [...prev, newDevice]);
      
      // Update stats
      setDeviceStats(prev => ({
        ...prev,
        total: prev.total + 1,
        online: prev.online + 1
      }));

      // Initialize permissions for new device
      setDevicePermissions(prev => ({
        ...prev,
        [registeredDevice._id]: {
          canSync: registeredDevice.syncEnabled !== undefined ? registeredDevice.syncEnabled : true,
          canShare: registeredDevice.isTrusted !== undefined ? registeredDevice.isTrusted : false,
          canModify: registeredDevice.isTrusted !== undefined ? registeredDevice.isTrusted : false,
          requiresVerification: registeredDevice.isTrusted !== undefined ? !registeredDevice.isTrusted : true
        }
      }));

      // Show success state
      setRegistrationSuccess(true);
      setNewDeviceName('');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setShowAddDevice(false);
        setRegistrationSuccess(false);
      }, 2000);

    } catch (err: any) {
      console.error('Failed to register device:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      // Show detailed error message
      let errorMessage = 'Failed to register device';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelAddDevice = () => {
    setShowAddDevice(false);
    setNewDeviceName('');
    setRegistrationSuccess(false);
    setError(null);
  };

  const handleOpenVerificationModal = (deviceId: string, deviceName: string) => {
    setVerificationDeviceId(deviceId);
    setVerificationDeviceName(deviceName);
    setShowVerificationModal(true);
    setVerificationCode('');
    setVerificationError(null);
  };

  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
    setVerificationDeviceId(null);
    setVerificationDeviceName('');
    setVerificationCode('');
    setVerificationError(null);
  };

  const handleVerifyDevice = async () => {
    if (!verificationDeviceId || !verificationCode.trim()) {
      setVerificationError('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setVerificationError('Code must be 6 digits');
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationError(null);

      const result = await deviceService.verifyDevice(
        verificationDeviceId, 
        verificationCode,
        verificationDeviceName
      );

      if (result.success) {
        // Show success message
        setVerificationError('✓ Device verified successfully!');
        
        // Close modal and reload after 1.5 seconds
        setTimeout(() => {
          handleCloseVerificationModal();
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
      setVerificationError(
        err.response?.data?.message || 'Verification failed. Please try again.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!verificationDeviceId) return;

    try {
      setIsResendingCode(true);
      setVerificationError(null);

      await deviceService.resendVerificationCode(verificationDeviceId);
      setVerificationError('✓ New code sent! Check the backend console.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setVerificationError(null);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to resend code:', err);
      setVerificationError(
        err.response?.data?.message || 'Failed to resend code'
      );
    } finally {
      setIsResendingCode(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'idle': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'offline': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <>
      <Navbar />
      <FeatureTemplate
        title="Multi-Device Access"
        description="Access your passes from any device, anywhere."
        icon={<Smartphone className="h-8 w-8 text-slate-700" />}
      >
        {!isAuthenticated ? (
          <AuthPrompt />
        ) : dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
              <p className="text-gray-600">Loading device data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="bg-rose-100 p-2 rounded-full">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                </div>
                <span className="text-rose-600 font-medium">{error}</span>
              </div>
            )}

            {/* Redesigned Device Stats */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  Device Usage
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Smartphone className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Connected Devices</div>
                      <div className="text-2xl font-semibold text-slate-800">{devices.length} <span className="text-sm text-slate-500">of {deviceLimit}</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Remaining Slots</div>
                    <div className="text-2xl font-semibold text-slate-800">{deviceLimit - devices.length}</div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(devices.length / deviceLimit) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 text-right">{Math.round((devices.length / deviceLimit) * 100)}% used</div>
              </div>
            </div>

            {/* Redesigned Device Groups */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Device Groups
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {deviceGroups.map(group => (
                  <div key={group.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm">
                          <Users className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="font-medium">{group.name}</span>
                      </div>
                      <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                        {group.devices.length} devices
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {group.devices.map(deviceId => {
                          const device = devices.find(d => d.id === deviceId);
                          return device && (
                            <span key={deviceId} className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700">
                              {getDeviceIcon(device.type)}
                              {device.name}
                              <span className={`w-2 h-2 rounded-full ${
                                device.status === 'online' ? 'bg-emerald-500' : 
                                device.status === 'idle' ? 'bg-amber-500' : 'bg-slate-400'
                              }`}></span>
                            </span>
                          );
                        })}
                        <button className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-white border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors">
                          <Plus className="h-3 w-3" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Redesigned Device Management */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60 flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <SignalHigh className="h-5 w-5 text-indigo-600" />
                  Connected Devices
                </h3>
                {devices.length < deviceLimit && (
                  <button
                    onClick={() => setShowAddDevice(!showAddDevice)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm shadow-sm hover:shadow"
                  >
                    <Plus className="h-4 w-4" />
                    Add Device
                  </button>
                )}
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="bg-slate-50 rounded-lg p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 mb-3"></div>
                    <p className="text-slate-500">Loading devices...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {devices.map(device => (
                      <div key={device.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                        <div className={`p-4 border-b border-slate-200/60 ${
                          device.status === 'online' ? 'bg-gradient-to-r from-emerald-50/50 to-blue-50/30' :
                          device.status === 'idle' ? 'bg-gradient-to-r from-amber-50/50 to-slate-50/50' :
                          'bg-gradient-to-r from-slate-50 to-slate-100/50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-lg ${
                                device.status === 'online' ? 'bg-emerald-100/70 text-emerald-600' :
                                device.status === 'idle' ? 'bg-amber-100/70 text-amber-600' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {getDeviceIcon(device.type)}
                              </div>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {device.name}
                                  {device.isCurrentDevice && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                  {device.browser} • {device.os}
                                  <span className={`inline-block w-2 h-2 rounded-full ${
                                    device.status === 'online' ? 'bg-emerald-500' : 
                                    device.status === 'idle' ? 'bg-amber-500' : 'bg-slate-400'
                                  }`}></span>
                                  <span className="capitalize text-xs">{device.status}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!device.isCurrentDevice && (
                                <button
                                  onClick={() => handleRemoveDevice(device.id)}
                                  className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors"
                                  title="Remove Device"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                title="Device Settings"
                              >
                                <Settings2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            Last active: {device.lastActive.toLocaleString()}
                          </div>
                        </div>

                        {/* Device Settings Expansion */}
                        <div className="p-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 block">
                                Device Nickname
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={device.name}
                                  onChange={(e) => handleUpdateDeviceName(device.id, e.target.value)}
                                  className="text-sm border border-slate-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                />
                                <Tag className="h-4 w-4 text-slate-400" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 block">
                                Verification Status
                              </label>
                              {devicePermissions[device.id]?.requiresVerification ? (
                                <button
                                  onClick={() => handleOpenVerificationModal(device.id, device.name)}
                                  className="flex items-center gap-3 p-2 rounded-lg border bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors w-full group"
                                >
                                  <Shield className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                  <span className="text-sm font-medium">
                                    🔒 Click to Verify Device
                                  </span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 p-2 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800">
                                  <Shield className="h-5 w-5" />
                                  <span className="text-sm font-medium">
                                    ✓ Verified
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-slate-200 pt-5">
                            <h4 className="text-sm font-medium flex items-center gap-2 mb-3 text-slate-800">
                              <Lock className="h-4 w-4 text-slate-600" />
                              Device Permissions
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries(devicePermissions[device.id] || {})
                                .filter(([key]) => key !== 'requiresVerification')
                                .map(([key, value]) => (
                                  <label key={key} className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                    <div className={`relative w-10 h-5 transition-colors duration-300 rounded-full ${value ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                                      <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={!!value}
                                        onChange={(e) => handleUpdateDevicePermissions(
                                          device.id,
                                          { [key]: e.target.checked }
                                        )}
                                      />
                                      <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${value ? 'transform translate-x-5' : ''}`}></div>
                                    </div>
                                    <span className="text-sm capitalize">
                                      Can {key.replace('can', '')}
                                    </span>
                                  </label>
                                ))}
                            </div>
                          </div>

                          <div className="mt-5 flex justify-end gap-3">
                            <button 
                              onClick={() => handleSyncDevice(device.id)}
                              className="text-sm px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Sync Now
                            </button>
                            <button className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm">
                              <Settings2 className="h-4 w-4" />
                              Advanced Settings
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Redesigned Add Device UI */}
            {showAddDevice && (
              <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                  <h3 className="font-medium flex items-center gap-2 text-slate-800">
                    <Plus className="h-5 w-5 text-indigo-600" />
                    Register Current Device
                  </h3>
                </div>
                <div className="p-6">
                  {registrationSuccess ? (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-emerald-200 rounded-xl bg-emerald-50/30">
                      <div className="bg-emerald-100 p-4 rounded-full mb-4">
                        <svg className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-emerald-800 mb-2">Device Registered Successfully!</h4>
                      <p className="text-sm text-emerald-600">Your device has been added to your account</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Smartphone className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-900 mb-1">Auto-Detected Device Info</h4>
                              <div className="text-sm text-blue-700 space-y-1">
                                {(() => {
                                  const info = deviceService.getCurrentDeviceInfo();
                                  return (
                                    <>
                                      <p><strong>Type:</strong> {info.deviceType}</p>
                                      <p><strong>OS:</strong> {info.operatingSystem}</p>
                                      <p><strong>Browser:</strong> {info.browser}</p>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            Device Name / Nickname
                          </label>
                          <input
                            type="text"
                            value={newDeviceName}
                            onChange={(e) => setNewDeviceName(e.target.value)}
                            placeholder="e.g., My Laptop, Work PC, iPhone 13"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                            disabled={isRegistering}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !isRegistering) {
                                handleRegisterDevice();
                              }
                            }}
                          />
                          <p className="text-xs text-slate-500">
                            Give your device a memorable name to identify it easily
                          </p>
                        </div>
                      </div>

                      {error && (
                        <div className="mb-4 bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                          <span className="text-sm text-rose-600">{error}</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button 
                          onClick={handleRegisterDevice}
                          disabled={isRegistering || !newDeviceName.trim()}
                          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRegistering ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Registering...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Register This Device
                            </>
                          )}
                        </button>
                        <button 
                          onClick={handleCancelAddDevice}
                          disabled={isRegistering}
                          className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-start gap-2 text-xs text-slate-500">
                          <Shield className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <p>
                            This will register the current browser/device you're using right now. 
                            You can manage device permissions and settings after registration.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Verification Modal */}
            {showVerificationModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-6 w-6" />
                        Verify Device
                      </h3>
                      <button
                        onClick={handleCloseVerificationModal}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        disabled={isVerifying}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-indigo-100 text-sm">
                      Enter the 6-digit code from backend console
                    </p>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-blue-800 font-medium">Check backend console</p>
                            <p className="text-xs text-blue-600 mt-1">
                              The verification code for "<strong>{verificationDeviceName}</strong>" was printed in the backend terminal. Look for: 🔑 VERIFICATION CODE
                            </p>
                          </div>
                        </div>
                      </div>

                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => {
                          // Only allow numbers and max 6 digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setVerificationCode(value);
                          setVerificationError(null);
                        }}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-center text-2xl font-bold tracking-widest"
                        disabled={isVerifying}
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && verificationCode.length === 6 && !isVerifying) {
                            handleVerifyDevice();
                          }
                        }}
                      />
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Enter the 6-digit code from the terminal
                      </p>
                    </div>

                    {verificationError && (
                      <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                        verificationError.includes('✓') || verificationError.includes('successfully')
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-rose-50 border border-rose-200'
                      }`}>
                        {verificationError.includes('✓') || verificationError.includes('successfully') ? (
                          <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          verificationError.includes('✓') || verificationError.includes('successfully')
                            ? 'text-green-700'
                            : 'text-rose-600'
                        }`}>
                          {verificationError}
                        </span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <button
                        onClick={handleVerifyDevice}
                        disabled={isVerifying || verificationCode.length !== 6}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5" />
                            Verify Device
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleResendCode}
                        disabled={isResendingCode || isVerifying}
                        className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResendingCode ? 'Sending...' : 'Resend Code'}
                      </button>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 text-center">
                      Check your backend terminal for the verification code
                    </p>
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

export default MultiDevice;
