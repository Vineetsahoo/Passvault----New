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
  const [error, setError] = useState<string | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [deviceLimit] = useState(5);
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([
    { id: '1', name: 'Personal', devices: ['1', '2'] },
    { id: '2', name: 'Work', devices: ['3'] }
  ]);
  
  const [devicePermissions, setDevicePermissions] = useState<Record<string, DevicePermission>>({
    '1': { canSync: true, canShare: true, canModify: true, requiresVerification: false },
    '2': { canSync: true, canShare: false, canModify: false, requiresVerification: true },
    '3': { canSync: true, canShare: true, canModify: false, requiresVerification: true }
  });

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
      // Simulate auth check
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);
      
      if (authStatus) {
        try {
          // Only fetch devices if authenticated
          await new Promise(resolve => setTimeout(resolve, 1000));
          setDevices([
            {
              id: '1',
              name: 'iPhone 13 Pro',
              type: 'smartphone',
              lastActive: new Date(),
              status: 'online',
              browser: 'Safari',
              os: 'iOS 15',
              isCurrentDevice: true
            },
            {
              id: '2',
              name: 'MacBook Air',
              type: 'laptop',
              lastActive: new Date(Date.now() - 3600000),
              status: 'idle',
              browser: 'Chrome',
              os: 'macOS',
              isCurrentDevice: false
            },
            {
              id: '3',
              name: 'Office PC',
              type: 'desktop',
              lastActive: new Date(Date.now() - 86400000),
              status: 'offline',
              browser: 'Firefox',
              os: 'Windows 11',
              isCurrentDevice: false
            }
          ]);
          setLoading(false);
        } catch (err) {
          setError('Failed to load devices');
          setLoading(false);
        }
      }
    };

    checkAuthAndLoadDevices();
  }, []);

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setDevices(prev => prev.filter(device => device.id !== deviceId));
    } catch (err) {
      setError('Failed to remove device');
    }
  };

  const handleUpdateDeviceName = (deviceId: string, newName: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId ? { ...device, name: newName } : device
    ));
  };

  const handleUpdateDevicePermissions = (deviceId: string, permissions: Partial<DevicePermission>) => {
    setDevicePermissions(prev => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], ...permissions }
    }));
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
                              <div className={`flex items-center gap-3 p-2 rounded-lg border ${
                                devicePermissions[device.id]?.requiresVerification 
                                  ? 'bg-amber-50 border-amber-200 text-amber-800' 
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              }`}>
                                <Shield className="h-5 w-5" />
                                <span className="text-sm font-medium">
                                  {devicePermissions[device.id]?.requiresVerification 
                                    ? 'Verification Required' 
                                    : 'Verified'}
                                </span>
                              </div>
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
                            <button className="text-sm px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
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
                    Link New Device
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 mb-5">
                    <div className="bg-white p-8 rounded-xl shadow-md mb-4">
                      <div className="text-6xl font-bold tracking-widest text-indigo-700 select-all">
                        {Math.random().toString(36).substr(2, 6).toUpperCase()}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">
                      Enter this code on your new device to link it
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <RefreshCw className="h-3 w-3 text-slate-400 animate-spin-slow" />
                      Code expires in 10 minutes
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Generate New Code
                    </button>
                    <button 
                      className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                      onClick={() => setShowAddDevice(false)}
                    >
                      Cancel
                    </button>
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
