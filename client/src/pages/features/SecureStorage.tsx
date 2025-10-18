import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, HardDrive, Key, AlertTriangle, CheckCircle2, FileCheck, 
  Settings, History, Download, CloudOff, KeyRound, Eye, EyeOff, LogIn, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar'; // Import Navbar
import Footer from '../../components/Footer'; // Import Footer

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

interface StorageMetrics {
  totalStorage: string;
  usedStorage: string;
  encryptedFiles: number;
  lastBackup: Date;
}

interface SecurityStatus {
  status: 'secure' | 'warning' | 'critical';
  lastScan: Date;
  encryptionType: string;
  twoFactorEnabled: boolean;
}

interface SecurityAudit {
  id: string;
  timestamp: Date;
  action: string;
  ipAddress: string;
  location: string;
  status: 'success' | 'failed';
}

interface BackupStatus {
  lastBackup: Date;
  nextScheduled: Date;
  backupSize: string;
  location: string;
}

const AuthPrompt = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white border border-slate-200/60 p-8 rounded-xl shadow-lg text-center backdrop-blur-sm">
      <div className="bg-indigo-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Lock className="h-10 w-10 text-indigo-600" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-3">Sign in Required</h3>
      <p className="text-slate-600 mb-6">Please sign in to view your secure storage details</p>
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

const SecureStorage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [metrics, setMetrics] = useState<StorageMetrics>({
    totalStorage: '10 GB',
    usedStorage: '2.5 GB',
    encryptedFiles: 156,
    lastBackup: new Date()
  });

  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    status: 'secure',
    lastScan: new Date(),
    encryptionType: 'AES-256',
    twoFactorEnabled: true
  });

  const [loading, setLoading] = useState(true);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLog, setAuditLog] = useState<SecurityAudit[]>([]);
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    lastBackup: new Date(),
    nextScheduled: new Date(Date.now() + 86400000),
    backupSize: '1.8 GB',
    location: 'Cloud Storage'
  });
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const recoveryKey = 'XXXX-YYYY-ZZZZ-AAAA';

  useEffect(() => {
    // Simulate checking authentication status
    const checkAuth = async () => {
      // Replace this with your actual auth check
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);
      if (authStatus) {
        // Only fetch security status if authenticated
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setLoading(false);
        } catch (err) {
          console.error('Failed to fetch security status:', err);
        }
      }
    };

    checkAuth();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'warning': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'critical': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <>
      <Navbar />
      <FeatureTemplate
        title="Secure Storage"
        description="Your passes are encrypted and stored securely in the cloud."
        icon={<Shield className="h-8 w-8 text-slate-700" />}
      >
        {!isAuthenticated ? (
          <AuthPrompt />
        ) : loading ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200/60 shadow-lg text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 mb-3"></div>
            <p className="text-slate-600">Loading security status...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Security Status Overview - Enhanced */}
            <div className={`p-6 rounded-xl border shadow-md ${getStatusColor(securityStatus.status)} transition-all duration-300`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/60 backdrop-blur-sm p-3 rounded-full shadow-sm">
                    {securityStatus.status === 'secure' && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                    {securityStatus.status === 'warning' && <AlertTriangle className="h-6 w-6 text-amber-500" />}
                    {securityStatus.status === 'critical' && <AlertTriangle className="h-6 w-6 text-rose-500" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Security Status</h3>
                    <p className="text-sm font-semibold uppercase tracking-wider">
                      {securityStatus.status}
                    </p>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm py-1.5 px-3 rounded-lg shadow-sm border border-white/50 text-sm">
                  Last Scan: {securityStatus.lastScan.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Storage Metrics - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                  <h3 className="font-medium flex items-center gap-2 text-slate-800">
                    <HardDrive className="h-5 w-5 text-indigo-600" />
                    Storage Usage
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Used Storage</div>
                      <div className="text-2xl font-semibold text-slate-800">{metrics.usedStorage} <span className="text-sm text-slate-500">of {metrics.totalStorage}</span></div>
                    </div>
                    <div className="bg-indigo-50 text-indigo-700 p-1.5 rounded-lg text-sm font-medium">
                      75% free
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Storage Usage</span>
                      <span>{metrics.usedStorage} / {metrics.totalStorage}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: '25%' }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100/50">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Lock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">Encrypted Files</div>
                      <div className="text-2xl font-semibold text-indigo-700">{metrics.encryptedFiles}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                  <h3 className="font-medium flex items-center gap-2 text-slate-800">
                    <Lock className="h-5 w-5 text-indigo-600" />
                    Security Settings
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200/60">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Key className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Encryption Type</div>
                      <div className="text-lg font-semibold text-slate-800">{securityStatus.encryptionType}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm">
                          <Shield className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Two-Factor Authentication</div>
                          <div className="text-xs text-slate-500">Adds an extra layer of security</div>
                        </div>
                      </div>
                      <div className={`relative w-12 h-6 transition-colors duration-300 rounded-full ${securityStatus.twoFactorEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                        <input
                          type="checkbox" 
                          className="sr-only"
                          checked={securityStatus.twoFactorEnabled}
                          onChange={() => setSecurityStatus(prev => ({
                            ...prev,
                            twoFactorEnabled: !prev.twoFactorEnabled
                          }))}
                        />
                        <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${securityStatus.twoFactorEnabled ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Backup Controls - Enhanced */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <Download className="h-5 w-5 text-indigo-600" />
                  Backup & Recovery
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-lg border border-slate-200/60 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Download className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-lg font-medium text-slate-800">Backup Status</div>
                      <div className="text-sm text-slate-500">Your data is securely backed up</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200/60">
                      <div className="text-xs text-slate-500 mb-1">Last Backup</div>
                      <div className="text-sm font-medium text-slate-800">{backupStatus.lastBackup.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200/60">
                      <div className="text-xs text-slate-500 mb-1">Next Scheduled</div>
                      <div className="text-sm font-medium text-slate-800">{backupStatus.nextScheduled.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200/60">
                      <div className="text-xs text-slate-500 mb-1">Backup Size</div>
                      <div className="text-sm font-medium text-slate-800">{backupStatus.backupSize}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200/60">
                      <div className="text-xs text-slate-500 mb-1">Location</div>
                      <div className="text-sm font-medium text-slate-800">{backupStatus.location}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Download className="h-5 w-5" />
                    Backup Now
                  </button>
                  <button className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <CloudOff className="h-5 w-5" />
                    Export Offline Backup
                  </button>
                </div>
              </div>
            </div>

            {/* Recovery Key - Enhanced */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <KeyRound className="h-5 w-5 text-indigo-600" />
                  Recovery Key
                </h3>
              </div>
              <div className="p-6">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3 mb-4">
                  <div className="p-1.5 bg-amber-100 rounded-full text-amber-600 mt-0.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">Important Security Notice</p>
                    <p className="text-sm text-amber-600">
                      Store this key safely. You'll need it to recover your data if you lose access to your account.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex-1 w-full">
                    <code className="block w-full bg-white px-4 py-3 rounded-lg font-mono text-slate-800 border border-slate-200 text-center tracking-wider text-lg">
                      {showRecoveryKey ? recoveryKey : '••••-••••-••••-••••'}
                    </code>
                  </div>
                  <button
                    onClick={() => setShowRecoveryKey(!showRecoveryKey)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                    aria-label={showRecoveryKey ? "Hide Recovery Key" : "Show Recovery Key"}
                  >
                    {showRecoveryKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showRecoveryKey ? "Hide Key" : "Show Key"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Security Recommendations - Enhanced */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <AlertTriangle className="h-5 w-5 text-indigo-600" />
                  Security Recommendations
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <FileCheck className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">Regular backups are enabled and up to date</p>
                      <p className="text-sm text-slate-500 mt-1">Last backup was completed successfully</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <Settings className="h-5 w-5 text-indigo-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">Consider enabling biometric authentication</p>
                      <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account</p>
                      <button className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200 transition-colors">
                        Enable Now
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Security Audit Log - Enhanced */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60 flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <History className="h-5 w-5 text-indigo-600" />
                  Security Audit Log
                </h3>
                <button
                  onClick={() => setShowAuditLog(!showAuditLog)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    showAuditLog 
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {showAuditLog ? 'Hide' : 'Show'} Log
                </button>
              </div>
              {showAuditLog && (
                <div className="p-6">
                  <div className="max-h-72 overflow-y-auto space-y-3">
                    {[
                      { timestamp: new Date(), action: 'Security scan completed', ipAddress: '192.168.1.1', location: 'New York, US', status: 'success' },
                      { timestamp: new Date(Date.now() - 3600000), action: 'Backup created', ipAddress: '192.168.1.1', location: 'New York, US', status: 'success' },
                      { timestamp: new Date(Date.now() - 7200000), action: 'Failed login attempt', ipAddress: '10.0.0.1', location: 'London, UK', status: 'failed' }
                    ].map((log, index) => (
                      <div key={index} className={`bg-white rounded-lg p-4 shadow-sm border ${
                        log.status === 'success' ? 'border-emerald-200' : 'border-rose-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-full ${
                            log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {log.status === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-slate-800">{log.action}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {log.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
                              <span>{log.timestamp.toLocaleString()}</span>
                              <span>{log.ipAddress} ({log.location})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </FeatureTemplate>
      <Footer />
    </>
  );
};

export default SecureStorage;
