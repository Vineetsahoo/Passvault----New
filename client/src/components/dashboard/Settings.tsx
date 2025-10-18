import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, FaBell, FaSync, FaKey, FaFingerprint, 
  FaPassport, FaCreditCard, FaIdCard, FaLock, FaHistory,
  FaDownload, FaEye, FaCog, FaExclamationTriangle,
  FaUserShield, FaQrcode, FaUserLock, FaSave, FaCheck,
  FaDatabase, FaFileExport, FaFileImport, FaUserClock,
  FaGlobe, FaBiohazard, FaUserSecret, FaCloudDownloadAlt,
  FaChevronRight, FaChevronDown, FaTimes, FaToggleOn, FaSlidersH,
  FaChartLine, FaBars, FaInfoCircle, FaDesktop, FaCheckCircle
} from 'react-icons/fa';
import { IoShieldCheckmark } from "react-icons/io5";
import { HiCog, HiCog6Tooth, HiSparkles } from "react-icons/hi2";

// Enhanced interfaces
interface SecuritySettings {
  twoFactor: boolean;
  masterPasswordExpiry: number;
  biometricUnlock: boolean;
  autoLock: number;
  passwordStrengthMinimum: 'medium' | 'strong';
  passwordComplexity: {
    minLength: number;
    requireNumbers: boolean;
    requireSymbols: boolean;
    requireMixedCase: boolean;
  };
  failedAttempts: {
    maxAttempts: number;
    lockoutDuration: number; // minutes
  };
  session: {
    timeout: number; // minutes
    requireReauthFor: string[];
  };
}

interface PassSettings {
  security: {
    twoFactor: boolean;
    masterPasswordExpiry: number; // days
    biometricUnlock: boolean;
    autoLock: number; // minutes
    passwordStrengthMinimum: 'medium' | 'strong';
  };
  passes: {
    autoExpirePasswords: number; // days
    warnBeforeExpiry: number; // days
    requireSecurityQuestions: boolean;
    allowEmergencyAccess: boolean;
    defaultPassValidityPeriod: number; // days
  };
  notifications: {
    securityAlerts: boolean;
    passExpiry: boolean;
    unauthorizedAccess: boolean;
    passwordBreaches: boolean;
    syncNotifications: boolean;
  };
  sync: {
    autoSync: boolean;
    syncFrequency: number; // minutes
    syncOnWifiOnly: boolean;
    backupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

interface AdvancedSettings {
  dataManagement: {
    autoDelete: {
      enabled: boolean;
      oldPasswords: number; // days
      loginHistory: number; // days
    };
    export: {
      format: 'json' | 'csv' | 'encrypted';
      includeMetadata: boolean;
    };
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    animationsReduced: boolean;
  };
}

// Add SettingsChangeEvent interface
interface SettingsChangeEvent {
  category: string;
  key: string;
  value: any;
  timestamp: string;
}

// Enhanced reusable components
const SettingCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  children: React.ReactNode;
}> = ({ icon, title, description, color, children }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <div className="relative overflow-hidden border-b border-gray-50">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" 
           style={{ background: color.replace('bg-', '').replace('-50', '-400') }}></div>
      
      <div className="p-6 relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className={`p-3.5 ${color} rounded-xl shadow-sm flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    
    <div className="p-6 space-y-6">
      {children}
    </div>
  </motion.div>
);

// Toggle switch component redesigned
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between py-2.5 group hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
    <div className="pr-4">
      <span className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors">{label}</span>
      {description && <p className="text-sm text-gray-500 mt-0.5 group-hover:text-gray-600 transition-colors">{description}</p>}
    </div>
    <div className="flex-shrink-0">
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-100 
                      peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] 
                      after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full 
                      after:h-6 after:w-6 after:shadow-md after:transition-all"></div>
      </label>
    </div>
  </div>
);

// Setting section component redesigned
const SettingSection: React.FC<{
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, children, icon }) => (
  <div className="space-y-3">
    <h4 className="font-medium text-gray-900 flex items-center gap-2">
      {icon || <div className="w-1.5 h-5 bg-indigo-500 rounded-full"></div>}
      {title}
    </h4>
    <div className="space-y-3 pl-3 border-l-2 border-gray-100">
      {children}
    </div>
  </div>
);

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<PassSettings>({
    security: {
      twoFactor: false,
      masterPasswordExpiry: 90,
      biometricUnlock: true,
      autoLock: 5,
      passwordStrengthMinimum: 'strong'
    },
    passes: {
      autoExpirePasswords: 180,
      warnBeforeExpiry: 14,
      requireSecurityQuestions: true,
      allowEmergencyAccess: false,
      defaultPassValidityPeriod: 365
    },
    notifications: {
      securityAlerts: true,
      passExpiry: true,
      unauthorizedAccess: true,
      passwordBreaches: true,
      syncNotifications: true
    },
    sync: {
      autoSync: true,
      syncFrequency: 15,
      syncOnWifiOnly: true,
      backupEnabled: true,
      backupFrequency: 'weekly'
    }
  });

  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    dataManagement: {
      autoDelete: {
        enabled: false,
        oldPasswords: 365,
        loginHistory: 90
      },
      export: {
        format: 'encrypted',
        includeMetadata: true
      }
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      animationsReduced: false
    }
  });

  const [showVerification, setShowVerification] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'advanced'>('general');
  const [isSaved, setIsSaved] = useState(true);
  const [settingsHistory, setSettingsHistory] = useState<SettingsChangeEvent[]>([]);
  const [showChangesHistory, setShowChangesHistory] = useState(false);

  const handleSensitiveAction = (action: string) => {
    setCurrentAction(action);
    setShowVerification(true);
  };

  const updateSettings = (category: keyof PassSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSettingsChange = (category: keyof PassSettings, key: string, value: any) => {
    updateSettings(category, key, value);
    setSettingsHistory(prev => [{
      category,
      key,
      value,
      timestamp: new Date().toISOString()
    }, ...prev]);
    setIsSaved(false); // Mark as unsaved when changes are made
  };

  return (
    <div className="space-y-6 -mt-4">
      {/* Redesigned header with sophisticated gradient and visual elements */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-indigo-300 opacity-10 rounded-full translate-y-1/3"></div>
        
        <div className="relative z-10 p-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-3 mb-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <HiSparkles className="text-indigo-200" />
                <span className="text-xs font-medium text-blue-50">Personalize Your Experience</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white flex flex-wrap items-center gap-3">
                <HiCog6Tooth className="h-8 w-8" /> 
                <span>PassVault Settings</span>
              </h2>
              
              <p className="text-indigo-100 mt-1.5 max-w-lg">
                Configure security preferences and customize your vault experience
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-start">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowChangesHistory(!showChangesHistory)}
                className={`px-4 py-2.5 font-medium rounded-lg shadow-lg flex items-center gap-2 
                  ${showChangesHistory 
                    ? 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50' 
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                  } transition-all`}
              >
                <FaHistory className={showChangesHistory ? "text-indigo-600" : "text-indigo-200"} /> 
                {showChangesHistory ? 'Hide Changes' : 'View Changes'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsSaved(true);
                }}
                className={`px-4 py-2.5 font-medium rounded-lg shadow-lg flex items-center gap-2 
                  ${isSaved 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-white text-indigo-600 hover:bg-opacity-90'
                  } transition-all`}
              >
                {isSaved ? <FaCheck /> : <FaSave />}
                {isSaved ? 'Saved' : 'Save Changes'}
              </motion.button>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <FaDesktop className="text-blue-200" size={12} />
              <span className="text-xs text-blue-50">Last updated today</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <FaInfoCircle className="text-blue-200" size={12} />
              <span className="text-xs text-blue-50">Settings synced across devices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned tab navigation */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="flex overflow-x-auto px-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`relative px-6 py-4 font-medium flex items-center gap-2 transition-colors
              ${activeTab === 'general' 
                ? 'text-indigo-600' 
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <FaCog />
            General
            {activeTab === 'general' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
              ></motion.div>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className={`relative px-6 py-4 font-medium flex items-center gap-2 transition-colors
              ${activeTab === 'security' 
                ? 'text-indigo-600' 
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <FaShieldAlt />
            Security
            {activeTab === 'security' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
              ></motion.div>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('advanced')}
            className={`relative px-6 py-4 font-medium flex items-center gap-2 transition-colors
              ${activeTab === 'advanced' 
                ? 'text-indigo-600' 
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <FaSlidersH />
            Advanced
            {activeTab === 'advanced' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
              ></motion.div>
            )}
          </button>
          
          <div className="ml-auto flex items-center pr-4">
            <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors">
              <FaBars />
            </button>
          </div>
        </div>
      </div>

      {/* Settings content with variants for animation */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid gap-6"
        >
          {activeTab === 'security' && (
            <>
              <SettingCard
                icon={<IoShieldCheckmark className="text-indigo-600 w-6 h-6" />}
                title="Authentication & Access"
                description="Configure login, access control, and session management"
                color="bg-indigo-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SettingSection 
                    title="Two-Factor Authentication"
                    icon={<FaCheckCircle className="text-indigo-500" />}
                  >
                    <div className="bg-indigo-50 p-4 rounded-lg mb-4 flex items-start gap-3">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <FaQrcode className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm text-indigo-700">
                          Two-factor authentication adds an extra layer of security to your account.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSensitiveAction('2fa')}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm"
                        >
                          Set Up 2FA
                          <FaChevronRight size={10} />
                        </motion.button>
                      </div>
                    </div>
                    
                    <ToggleSwitch 
                      checked={settings.security.biometricUnlock}
                      onChange={(checked) => handleSettingsChange('security', 'biometricUnlock', checked)}
                      label="Biometric Authentication"
                      description="Use fingerprint or face recognition to unlock"
                    />
                  </SettingSection>
                  
                  <SettingSection 
                    title="Session Security"
                    icon={<FaUserLock className="text-indigo-500" />}
                  >
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-indigo-100 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Auto-lock after inactivity
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range"
                            min="1"
                            max="60"
                            value={settings.security.autoLock}
                            onChange={(e) => handleSettingsChange('security', 'autoLock', Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <span className="w-12 px-2 py-1 text-center bg-indigo-100 text-indigo-800 rounded font-medium text-sm">
                            {settings.security.autoLock}m
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-indigo-100 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Master Password Expiry
                        </label>
                        <select 
                          value={settings.security.masterPasswordExpiry}
                          onChange={(e) => handleSettingsChange('security', 'masterPasswordExpiry', Number(e.target.value))}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                          <option value={30}>30 days</option>
                          <option value={60}>60 days</option>
                          <option value={90}>90 days</option>
                          <option value={180}>180 days</option>
                          <option value={365}>1 year</option>
                        </select>
                      </div>
                    </div>
                  </SettingSection>
                </div>
                
                <div className="pt-6 mt-4 border-t border-gray-100">
                  <SettingSection 
                    title="Password Requirements"
                    icon={<FaKey className="text-indigo-500" />}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-indigo-100 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Password Strength
                        </label>
                        <div className="flex rounded-lg overflow-hidden border border-gray-200 p-0.5 bg-gray-50">
                          <button 
                            onClick={() => handleSettingsChange('security', 'passwordStrengthMinimum', 'medium')}
                            className={`flex-1 py-2.5 rounded-md transition-colors flex items-center justify-center gap-1
                              ${settings.security.passwordStrengthMinimum === 'medium' 
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-transparent text-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                            Medium
                          </button>
                          <button 
                            onClick={() => handleSettingsChange('security', 'passwordStrengthMinimum', 'strong')}
                            className={`flex-1 py-2.5 rounded-md transition-colors flex items-center justify-center gap-1
                              ${settings.security.passwordStrengthMinimum === 'strong' 
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-transparent text-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            Strong
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-indigo-50 p-4 rounded-lg flex items-center gap-3">
                        <FaInfoCircle className="text-indigo-500 flex-shrink-0" />
                        <p className="text-sm text-indigo-700">
                          Strong passwords protect your sensitive information from unauthorized access.
                        </p>
                      </div>
                    </div>
                  </SettingSection>
                </div>
              </SettingCard>
            </>
          )}
          
          {activeTab === 'general' && (
            <>
              <SettingCard
                icon={<FaPassport className="text-green-600 w-6 h-6" />}
                title="Pass Management"
                description="Configure pass handling and validity periods"
                color="bg-green-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SettingSection 
                    title="Pass Validity"
                    icon={<FaUserClock className="text-green-500" />}
                  >
                    <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-green-100 transition-colors">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Pass Validity Period
                      </label>
                      <select 
                        value={settings.passes.defaultPassValidityPeriod}
                        onChange={(e) => handleSettingsChange('passes', 'defaultPassValidityPeriod', Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      >
                        <option value={180}>6 months</option>
                        <option value={365}>1 year</option>
                        <option value={730}>2 years</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        All new passes will be valid for this period by default
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-green-100 transition-colors">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Warning Period
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range"
                          min="1"
                          max="90"
                          value={settings.passes.warnBeforeExpiry}
                          onChange={(e) => handleSettingsChange('passes', 'warnBeforeExpiry', Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <span className="w-12 px-2 py-1 text-center bg-green-100 text-green-800 rounded font-medium text-sm">
                          {settings.passes.warnBeforeExpiry}d
                        </span>
                      </div>
                    </div>
                  </SettingSection>
                  
                  <SettingSection 
                    title="Security Features"
                    icon={<FaUserShield className="text-green-500" />}
                  >
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                        <FaShieldAlt className="text-green-600" /> Enhanced Protection
                      </h5>
                      <p className="text-sm text-green-700 mb-3">
                        Enable additional security features to protect your most sensitive passes.
                      </p>
                    </div>
                    
                    <ToggleSwitch 
                      checked={settings.passes.requireSecurityQuestions}
                      onChange={(checked) => handleSettingsChange('passes', 'requireSecurityQuestions', checked)}
                      label="Security Questions"
                      description="Require security questions for sensitive passes"
                    />
                    
                    <ToggleSwitch 
                      checked={settings.passes.allowEmergencyAccess}
                      onChange={(checked) => handleSettingsChange('passes', 'allowEmergencyAccess', checked)}
                      label="Emergency Access"
                      description="Allow trusted contacts to request emergency access"
                    />
                  </SettingSection>
                </div>
              </SettingCard>
              
              <SettingCard
                icon={<FaBell className="text-amber-600 w-6 h-6" />}
                title="Notifications"
                description="Configure alerts and notification preferences"
                color="bg-amber-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SettingSection 
                    title="Security Alerts"
                    icon={<FaExclamationTriangle className="text-amber-500" />}
                  >
                    <ToggleSwitch 
                      checked={settings.notifications.securityAlerts}
                      onChange={(checked) => handleSettingsChange('notifications', 'securityAlerts', checked)}
                      label="Security Alerts"
                      description="Receive alerts about security events"
                    />
                    
                    <ToggleSwitch 
                      checked={settings.notifications.unauthorizedAccess}
                      onChange={(checked) => handleSettingsChange('notifications', 'unauthorizedAccess', checked)}
                      label="Unauthorized Access Attempts"
                      description="Get notified of suspicious login attempts"
                    />
                    
                    <ToggleSwitch 
                      checked={settings.notifications.passwordBreaches}
                      onChange={(checked) => handleSettingsChange('notifications', 'passwordBreaches', checked)}
                      label="Password Breach Alerts"
                      description="Get alerts if your data appears in a breach"
                    />
                  </SettingSection>
                  
                  <SettingSection 
                    title="Pass Notifications"
                    icon={<FaPassport className="text-amber-500" />}
                  >
                    <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-amber-100 transition-colors mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium text-gray-800">Notification Channels</h6>
                          <p className="text-xs text-gray-500">How would you like to be notified?</p>
                        </div>
                        <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                          Configure
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                          Email
                        </span>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                          Push notifications
                        </span>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                          SMS
                        </span>
                      </div>
                    </div>
                    
                    <ToggleSwitch 
                      checked={settings.notifications.passExpiry}
                      onChange={(checked) => handleSettingsChange('notifications', 'passExpiry', checked)}
                      label="Pass Expiry Reminders"
                      description="Get reminded when passes are about to expire"
                    />
                    
                    <ToggleSwitch 
                      checked={settings.notifications.syncNotifications}
                      onChange={(checked) => handleSettingsChange('notifications', 'syncNotifications', checked)}
                      label="Sync Notifications"
                      description="Get notified about sync status and events"
                    />
                  </SettingSection>
                </div>
              </SettingCard>
            </>
          )}
          
          {activeTab === 'advanced' && (
            <>
              <SettingCard
                icon={<FaDatabase className="text-purple-600 w-6 h-6" />}
                title="Data Management"
                description="Configure data retention and export settings"
                color="bg-purple-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SettingSection 
                    title="Auto-Cleanup"
                    icon={<FaChartLine className="text-purple-500" />}
                  >
                    <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-purple-100 transition-colors">
                      <ToggleSwitch 
                        checked={advancedSettings.dataManagement.autoDelete.enabled}
                        onChange={(checked) => {
                          setAdvancedSettings(prev => ({
                            ...prev,
                            dataManagement: {
                              ...prev.dataManagement,
                              autoDelete: {
                                ...prev.dataManagement.autoDelete,
                                enabled: checked
                              }
                            }
                          }));
                        }}
                        label="Auto-delete old data"
                        description="Automatically remove outdated information"
                      />
                    </div>
                    
                    <AnimatePresence>
                      {advancedSettings.dataManagement.autoDelete.enabled && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 pl-4 mt-2">
                            <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-purple-100 transition-colors">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Old passwords retention
                              </label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  min="30"
                                  value={advancedSettings.dataManagement.autoDelete.oldPasswords}
                                  onChange={(e) => {
                                    setAdvancedSettings(prev => ({
                                      ...prev,
                                      dataManagement: {
                                        ...prev.dataManagement,
                                        autoDelete: {
                                          ...prev.dataManagement.autoDelete,
                                          oldPasswords: Number(e.target.value)
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                />
                                <span className="text-sm text-gray-500">days</span>
                              </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-purple-100 transition-colors">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Login history retention
                              </label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  min="7"
                                  value={advancedSettings.dataManagement.autoDelete.loginHistory}
                                  onChange={(e) => {
                                    setAdvancedSettings(prev => ({
                                      ...prev,
                                      dataManagement: {
                                        ...prev.dataManagement,
                                        autoDelete: {
                                          ...prev.dataManagement.autoDelete,
                                          loginHistory: Number(e.target.value)
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                />
                                <span className="text-sm text-gray-500">days</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </SettingSection>
                  
                  <SettingSection 
                    title="Data Export"
                    icon={<FaFileExport className="text-purple-500" />}
                  >
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-purple-100 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Export Format
                        </label>
                        <div className="flex rounded-lg overflow-hidden border border-gray-200 p-0.5 bg-gray-50">
                          <button 
                            onClick={() => {
                              setAdvancedSettings(prev => ({
                                ...prev,
                                dataManagement: {
                                  ...prev.dataManagement,
                                  export: {
                                    ...prev.dataManagement.export,
                                    format: 'json'
                                  }
                                }
                              }));
                            }}
                            className={`flex-1 py-2 transition-colors
                              ${advancedSettings.dataManagement.export.format === 'json' 
                                ? 'bg-purple-600 text-white rounded-md shadow-sm'
                                : 'bg-transparent text-gray-600 hover:bg-gray-100 rounded-md'
                              }`}
                          >
                            JSON
                          </button>
                          <button 
                            onClick={() => {
                              setAdvancedSettings(prev => ({
                                ...prev,
                                dataManagement: {
                                  ...prev.dataManagement,
                                  export: {
                                    ...prev.dataManagement.export,
                                    format: 'csv'
                                  }
                                }
                              }));
                            }}
                            className={`flex-1 py-2 transition-colors
                              ${advancedSettings.dataManagement.export.format === 'csv' 
                                ? 'bg-purple-600 text-white rounded-md shadow-sm'
                                : 'bg-transparent text-gray-600 hover:bg-gray-100 rounded-md'
                              }`}
                          >
                            CSV
                          </button>
                          <button 
                            onClick={() => {
                              setAdvancedSettings(prev => ({
                                ...prev,
                                dataManagement: {
                                  ...prev.dataManagement,
                                  export: {
                                    ...prev.dataManagement.export,
                                    format: 'encrypted'
                                  }
                                }
                              }));
                            }}
                            className={`flex-1 py-2 transition-colors
                              ${advancedSettings.dataManagement.export.format === 'encrypted' 
                                ? 'bg-purple-600 text-white rounded-md shadow-sm'                                : 'bg-transparent text-gray-600 hover:bg-gray-100 rounded-md'
                              }`}
                          >
                            Encrypted
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Encrypted format provides the highest level of security for your data
                        </p>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSensitiveAction('export')}
                        className="w-full px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 shadow-sm"
                      >
                        <FaFileExport /> Export All Data
                      </motion.button>
                    </div>
                  </SettingSection>
                </div>
              </SettingCard>
              
              <SettingCard
                icon={<FaUserShield className="text-red-600 w-6 h-6" />}
                title="Emergency Access"
                description="Configure trusted contacts and recovery options"
                color="bg-red-50"
              >
                <div className="space-y-6">
                  <div className="p-5 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-full shadow-sm">
                        <FaExclamationTriangle className="text-red-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-red-800 text-lg mb-2">Emergency Access Controls</h4>
                        <p className="text-sm text-red-700">
                          Emergency access allows designated contacts to request access to your vault in case of emergency.
                          This is a sensitive security feature that should be configured carefully.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSensitiveAction('contacts')}
                            className="px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 shadow-sm flex items-center gap-2"
                          >
                            <FaUserShield /> Manage Trusted Contacts
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSensitiveAction('recovery')}
                            className="px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 shadow-sm flex items-center gap-2"
                          >
                            <FaKey /> Recovery Options
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SettingCard>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Recent settings changes section */}
      {showChangesHistory && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FaHistory className="text-indigo-500" />
                  Recent Settings Changes
                </h3>
                <p className="text-gray-600 mt-1">Track modifications to your settings and preferences</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {settingsHistory.length} change{settingsHistory.length !== 1 ? 's' : ''}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowChangesHistory(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes />
                </motion.button>
              </div>
            </div>
          </div>
          
          {settingsHistory.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaHistory className="text-gray-400 text-xl" />
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">No Changes Yet</h4>
              <p className="text-gray-500">
                When you modify settings, they'll appear here for easy tracking.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Setting
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        New Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {settingsHistory.slice(0, 10).map((change, idx) => (
                      <motion.tr 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col">
                            <span>{new Date(change.timestamp).toLocaleDateString()}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(change.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            change.category === 'security' ? 'bg-red-100 text-red-800' :
                            change.category === 'notifications' ? 'bg-yellow-100 text-yellow-800' :
                            change.category === 'passes' ? 'bg-green-100 text-green-800' :
                            change.category === 'sync' ? 'bg-blue-100 text-blue-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {change.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {change.key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {typeof change.value === 'boolean' ? (
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              change.value 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {change.value ? (
                                <>
                                  <FaCheckCircle className="mr-1" />
                                  Enabled
                                </>
                              ) : (
                                <>
                                  <FaTimes className="mr-1" />
                                  Disabled
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {change.value.toString()}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {settingsHistory.length > 10 && (
                <div className="py-3 px-6 bg-gray-50 text-center border-t border-gray-200">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View all {settingsHistory.length} changes
                  </motion.button>
                </div>
              )}
              
              {settingsHistory.length > 0 && (
                <div className="py-3 px-6 bg-indigo-50 border-t border-indigo-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-700">
                      Changes are automatically tracked and synced across your devices
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSettingsHistory([])}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Clear History
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Verification modal with enhanced design */}
      <AnimatePresence>
        {showVerification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FaLock />
                  Security Verification
                </h3>
                <button 
                  onClick={() => setShowVerification(false)}
                  className="text-white bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6 flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                    <FaUserShield size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-1">Verify Your Identity</h4>
                    <p className="text-gray-600">
                      For your security, please verify your identity to make changes to {currentAction}.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Master Password
                    </label>
                    <div className="relative">
                      <input 
                        type="password"
                        className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="Enter your master password"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <FaLock className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowVerification(false)}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
                    >
                      Verify & Continue
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
