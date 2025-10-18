import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
// Import components that are still needed
import Navbar from './Navbar';
import Footer from './Footer';
import Passwords from './dashboard/Passwords'; // Import actual Passwords component
import History from './dashboard/History'; // Import actual History component
import Notifications from './dashboard/Notifications'; // Import actual Notifications component
import Settings from './dashboard/Settings'; // Import actual Settings component
import BackUp from './dashboard/BackUp'; // Import actual BackUp component
import Transactions from './dashboard/Transactions'; // Import actual Transactions component
import UserProfile from './dashboard/UserProfile'; // Import actual UserProfile component
import Monitoring from './dashboard/Monitoring'; // Import Monitoring component
import { 
  FaHome, FaBell, FaCog, FaChartBar, FaBookmark, 
  FaQuestionCircle, FaSignOutAlt, FaBars, FaTimes, FaUser,
  FaLock, FaHistory, FaSync, FaSearch, FaShieldAlt, FaChartLine, FaKey, FaExclamationCircle,
  FaExclamation, FaCheckCircle, FaDatabase, FaUserCircle,
  FaFingerprint, FaShieldVirus, FaUserSecret, FaPassport,
  FaIdBadge, FaFileContract, FaUnlock, FaLockOpen, FaPlus, FaDice, FaFileImport, FaCheck,
  FaExclamationTriangle, FaChevronRight, FaChevronDown, FaQrcode, FaArrowRight, FaBolt,
  FaSave, FaPalette, FaEyeSlash, FaEye, FaToggleOn, FaToggleOff, FaInfoCircle
} from 'react-icons/fa';
import { FaSquarePollHorizontal, FaEllipsis } from 'react-icons/fa6';

// Mock Dashboard Service
interface LogActivityData {
  eventType: string;
  description: string;
  passType: string;
  severity: 'low' | 'medium' | 'high';
}

interface MockDashboardServiceType {
  logActivity: (activityData: LogActivityData) => Promise<{ success: boolean }>;
  getDashboardStats: () => Promise<DashboardStats>;
}

const MockDashboardService: MockDashboardServiceType = {
  logActivity: async (activityData: LogActivityData): Promise<{ success: boolean }> => {
    console.log('Mock activity logged:', activityData);
    return { success: true };
  },
  
  getDashboardStats: async (): Promise<DashboardStats> => {
    return {
      totalPasswords: 156,
      strongPasswords: 120,
      weakPasswords: 26,
      reusedPasswords: 10,
      securityScore: 85,
      breachedAccounts: 2,
      lastBackup: '2023-12-04 10:30 AM',
      profileCompletion: 75,
      passwordsExpiringSoon: 5,
      lastPasswordChange: '2023-12-03',
      securityIncidents: 2,
      masterPasswordStrength: 92,
      twoFactorEnabled: true,
      credentialsShared: 8
    };
  }
};

interface SubMenuItem {
  label: string;
  icon: React.ElementType;
  action: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  notification?: number;
  component: React.ReactNode;
  subMenu?: SubMenuItem[];
  description?: string;
}

interface DashboardStats {
  totalPasswords: number;
  strongPasswords: number;
  weakPasswords: number;
  reusedPasswords: number;
  securityScore: number;
  breachedAccounts: number;
  lastBackup: string;
  profileCompletion: number;
  passwordsExpiringSoon: number;
  lastPasswordChange: string;
  securityIncidents: number;
  masterPasswordStrength: number;
  twoFactorEnabled: boolean;
  credentialsShared: number;
}

interface RecentActivity {
  id: string;
  type: 'login' | 'password_change' | 'sync' | 'security_alert';
  description: string;
  timestamp: string;
}

interface SecurityAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  date: string;
}

interface PasswordActivity {
  id: string;
  type: 'creation' | 'modification' | 'access' | 'sharing' | 'breach';
  credential: string;
  action: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

interface ActivityItem {
  id: string;
  type: 'password_change' | 'login' | 'security_alert' | 'sync' | 'share' | 'backup' | 'export';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ElementType;
  severity?: 'low' | 'medium' | 'high';
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

// Modernized SidebarItem component with enhanced visual effects
const SidebarItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  notification?: number;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, notification, onClick }) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 group relative ${
      isActive 
        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium shadow-md shadow-indigo-200'
        : 'text-gray-700 hover:bg-indigo-50'
    }`}
  >
    <div className={`flex items-center justify-center w-9 h-9 rounded-xl mr-3 ${
      isActive 
        ? 'bg-white/20' 
        : 'bg-indigo-100/70 text-indigo-700 group-hover:bg-indigo-200 group-hover:text-indigo-800'
    }`}>
      <Icon className={`text-xl ${isActive ? 'text-white' : ''}`} />
    </div>
    <span className="text-sm font-medium">{label}</span>
    {notification && (
      <div className={`ml-auto flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full text-xs ${
        isActive ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
      }`}>
        {notification}
      </div>
    )}
    
    {isActive && (
      <motion.div 
        layoutId="sidebar-active-indicator"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full bg-white"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </motion.button>
);

// Modern Profile Section for Sidebar
const SidebarProfile: React.FC<{
  profile: UserProfile;
  onClick: () => void;
  isActive: boolean;
  onLogout: () => void;
}> = ({ profile, onClick, isActive, onLogout }) => (
  <div className="mt-auto pt-4 space-y-3">
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 shadow-sm"
    >
      <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 p-3 ${
          isActive ? 'bg-indigo-50' : 'hover:bg-indigo-50/50'
        } transition-colors`}
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold overflow-hidden shadow-inner">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-gray-900 truncate">{profile.name}</div>
          <div className="text-xs text-gray-500 truncate">{profile.email}</div>
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-24' : 'max-h-0'}`}>
        <div className="p-3 pt-0 space-y-2">
          <button className="w-full text-left text-xs text-indigo-700 hover:text-indigo-800 font-medium p-2 rounded hover:bg-indigo-50 flex items-center">
            <FaUserCircle className="mr-2" /> View Profile
          </button>
          <button className="w-full text-left text-xs text-indigo-700 hover:text-indigo-800 font-medium p-2 rounded hover:bg-indigo-50 flex items-center">
            <FaCog className="mr-2" /> Account Settings
          </button>
        </div>
      </div>
    </motion.div>
    
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onLogout}
      className="flex items-center w-full p-3 rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-sm transition-all duration-200"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 mr-3">
        <FaSignOutAlt className="text-xl" />
      </div>
      <span className="text-sm font-medium">Logout</span>
    </motion.button>
  </div>
);

// QuickActionButton Component
const QuickActionButton: React.FC<{
  icon: React.ElementType;
  label: string;
  color: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, color, onClick }) => {
  const colorStyles = {
    blue: "from-blue-100 to-blue-50 text-blue-600 hover:bg-blue-100",
    green: "from-green-100 to-green-50 text-green-600 hover:bg-green-100",
    purple: "from-purple-100 to-purple-50 text-purple-600 hover:bg-purple-100",
    amber: "from-amber-100 to-amber-50 text-amber-600 hover:bg-amber-100",
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colorStyles[color as keyof typeof colorStyles]} 
        shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="p-3 rounded-xl bg-white/80 mb-3">
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </motion.button>
  );
};

// StatsCard Component
const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
  trend?: number;
  color?: string;
  alert?: boolean;
}> = ({ title, value, icon: Icon, description, trend, color = 'indigo', alert = false }) => {
  const colorStyles = {
    blue: "from-blue-50 to-blue-100/30 border-blue-100",
    green: "from-green-50 to-green-100/30 border-green-100",
    indigo: "from-indigo-50 to-indigo-100/30 border-indigo-100",
    red: "from-red-50 to-red-100/30 border-red-100",
  };
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colorStyles[color as keyof typeof colorStyles]} 
        shadow-sm border backdrop-blur`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${alert ? 'bg-red-100 text-red-600' : `bg-${color}-100 text-${color}-600`}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className={`text-xs font-medium px-2 py-1 rounded-lg 
            ${trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {trend > 0 ? `+${trend}` : trend}
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-bold text-gray-800">{value}</h3>
        <p className="text-sm text-gray-500">{title}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </motion.div>
  );
};

// ActivityItem Component
const ActivityItem: React.FC<{
  activity: ActivityItem;
}> = ({ activity }) => {
  const getSeverityStyles = (severity?: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-orange-100 text-orange-600';
      case 'low': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${activity.severity ? getSeverityStyles(activity.severity) : 'bg-indigo-100 text-indigo-600'}`}>
          <activity.icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{activity.title}</h4>
              <p className="text-sm text-gray-600">{activity.description}</p>
            </div>
            <span className="text-xs text-gray-400">{activity.timestamp}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Modern Sidebar Toggle Button
const SidebarToggle: React.FC<{
  isExpanded: boolean;
  onClick: () => void;
}> = ({ isExpanded, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-indigo-100"
  >
    <div className="w-8 h-8 flex flex-col items-center justify-center space-y-1.5 relative">
      <motion.div 
        animate={isExpanded ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        className="w-6 h-0.5 bg-indigo-600 rounded-full origin-center" 
      />
      <motion.div 
        animate={isExpanded ? { opacity: 0 } : { opacity: 1 }}
        className="w-6 h-0.5 bg-indigo-600 rounded-full" 
      />
      <motion.div 
        animate={isExpanded ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        className="w-6 h-0.5 bg-indigo-600 rounded-full origin-center" 
      />
    </div>
  </motion.button>
);

const DashboardHome: React.FC<{
  dashboardStats: DashboardStats;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentActivities: ActivityItem[];
  onNavigate: (path: string) => void;
}> = ({ dashboardStats, searchQuery, setSearchQuery, recentActivities, onNavigate }) => {
  const navigate = useNavigate();
  
  // Customization states
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customizationSettings, setCustomizationSettings] = useState({
    showQuickActions: true,
    showPasswordStats: true,
    showSecurityAlerts: true,
    showProfileCompletion: true,
    showRecentActivity: true,
    compactMode: false,
    darkModePreview: false,
    animationsEnabled: true,
    quickActionsLayout: 'grid' as 'grid' | 'list',
    theme: 'default' as 'default' | 'minimal' | 'vibrant'
  });
  const [settingsChanged, setSettingsChanged] = useState(false);

  const handleCustomizationToggle = (setting: keyof typeof customizationSettings) => {
    setCustomizationSettings(prev => ({
      ...prev,
      [setting]: typeof prev[setting] === 'boolean' ? !prev[setting] : prev[setting]
    }));
    setSettingsChanged(true);
  };

  const handleLayoutChange = (layout: 'grid' | 'list') => {
    setCustomizationSettings(prev => ({
      ...prev,
      quickActionsLayout: layout
    }));
    setSettingsChanged(true);
  };

  const handleThemeChange = (theme: 'default' | 'minimal' | 'vibrant') => {
    setCustomizationSettings(prev => ({
      ...prev,
      theme: theme
    }));
    setSettingsChanged(true);
  };

  const handleSaveCustomization = () => {
    // Save to localStorage or backend
    localStorage.setItem('dashboardCustomization', JSON.stringify(customizationSettings));
    setSettingsChanged(false);
    alert('Dashboard customization saved successfully!');
    setShowCustomizeModal(false);
  };

  const handleResetCustomization = () => {
    setCustomizationSettings({
      showQuickActions: true,
      showPasswordStats: true,
      showSecurityAlerts: true,
      showProfileCompletion: true,
      showRecentActivity: true,
      compactMode: false,
      darkModePreview: false,
      animationsEnabled: true,
      quickActionsLayout: 'grid',
      theme: 'default'
    });
    setSettingsChanged(true);
  };
  
  const handleBackupNowClick = () => {
    onNavigate('backup');
  };
  
  return (
    <div className="space-y-8 -mt-4"> {/* Increased spacing between sections */}
      {/* Enhanced Hero Section with Search */}
      <section className="relative">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-purple-300 opacity-10 rounded-full translate-y-1/3"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-3 mb-3 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-50">Secured & Encrypted</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome to your Secure Dashboard</h1>
            <p className="text-indigo-100 mb-6 text-lg">Manage and monitor all your digital credentials in one place</p>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search passwords, notes, or cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-14 rounded-xl bg-white/20 backdrop-blur border border-white/30 
                  focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-indigo-200
                  shadow-lg shadow-indigo-800/10"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <FaSearch className="text-white/70" />
              </div>
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-white/70">
                <span>Press</span>
                <kbd className="bg-white/20 rounded px-2 py-1 font-mono">Ctrl + K</kbd>
              </div>
            </div>
          </div>
          
          <div className="absolute right-8 bottom-0 translate-y-1/2">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl p-5 shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg shadow-inner">
                  <FaShieldVirus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    Security Score
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      dashboardStats.securityScore > 80 ? 'bg-emerald-300 text-emerald-900' : 
                      dashboardStats.securityScore > 60 ? 'bg-amber-300 text-amber-900' : 
                      'bg-red-300 text-red-900'
                    }`}>
                      {dashboardStats.securityScore > 80 ? 'Good' : 
                       dashboardStats.securityScore > 60 ? 'Fair' : 'Poor'}
                    </span>
                  </h3>
                  <div className="flex items-center mt-2">
                    <div className="w-36 h-3 bg-black/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${dashboardStats.securityScore}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-3 rounded-full ${
                          dashboardStats.securityScore > 80 ? 'bg-gradient-to-r from-emerald-200 to-white' : 
                          dashboardStats.securityScore > 60 ? 'bg-gradient-to-r from-amber-200 to-white' : 
                          'bg-gradient-to-r from-red-200 to-white'
                        }`}
                      />
                    </div>
                    <span className="ml-3 font-bold text-white text-lg">{dashboardStats.securityScore}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Redesigned Quick Actions Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10">
          <div>
            <div className="mb-3">
              <h2 className="text-3xl font-bold text-gray-800">Quick Actions</h2>
              <p className="text-gray-500 text-lg">Essential tools to boost your productivity</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-sm text-emerald-700 font-medium">All systems operational</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCustomizeModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all font-medium text-gray-700 group"
            >
              <FaCog className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span>Customize</span>
            </motion.button>
          </div>
        </div>
        
        {/* Redesigned Quick Actions Bento Grid with Hover-Expanding Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 gap-6 mb-8">
          {/* QR Scan - Large Feature Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/features/qr-scan')}
            className="col-span-1 md:col-span-3 lg:col-span-4 row-span-2 relative block bg-gradient-to-b from-cyan-100 to-blue-200 rounded-xl p-8 cursor-pointer overflow-hidden z-0 hover-card-large group"
            style={{ minHeight: '300px' }}
          >
            {/* Expanding circle effect */}
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-gray-800 transform scale-100 origin-center transition-transform duration-500 ease-out group-hover:scale-[28] z-[-1]"></div>
            
            {/* Corner arrow */}
            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 overflow-hidden" style={{ borderRadius: '0 12px 0 32px' }}>
              <FaArrowRight className="text-white text-sm -mt-1 -mr-1" />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="mb-4">
                <FaQrcode className="w-10 h-10 text-cyan-600 group-hover:text-cyan-200 transition-colors duration-500 mb-4" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-white transition-colors duration-500 mb-3">
                QR Scanner
              </h3>
              
              <p className="text-gray-700 group-hover:text-white/80 transition-colors duration-500 text-sm leading-relaxed flex-1">
                Instantly scan QR codes to access websites, Wi-Fi networks, and secure login credentials. Advanced camera technology with real-time processing for quick and accurate scanning.
              </p>
              
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-cyan-600 group-hover:text-cyan-200 font-bold text-lg transition-colors duration-500">∞</div>
                  <div className="text-xs text-gray-600 group-hover:text-white/70 transition-colors duration-500">Scans</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-green-600 group-hover:text-green-200 font-bold text-lg transition-colors duration-500">✓</div>
                  <div className="text-xs text-gray-600 group-hover:text-white/70 transition-colors duration-500">Secure</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-blue-600 group-hover:text-blue-200 font-bold text-lg transition-colors duration-500">⚡</div>
                  <div className="text-xs text-gray-600 group-hover:text-white/70 transition-colors duration-500">Fast</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Scan */}
          <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/features/secure-storage')}
            className="col-span-1 md:col-span-2 lg:col-span-2 relative block bg-gradient-to-b from-red-100 to-rose-200 rounded-xl p-6 cursor-pointer overflow-hidden z-0 hover-card group"
            style={{ height: '200px' }}
          >
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-800 transform scale-100 origin-center transition-transform duration-500 ease-out group-hover:scale-[28] z-[-1]"></div>
            
            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 overflow-hidden" style={{ borderRadius: '0 12px 0 32px' }}>
              <FaArrowRight className="text-white text-sm -mt-1 -mr-1" />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <FaShieldAlt className="w-8 h-8 text-red-600 group-hover:text-red-200 transition-colors duration-500 mb-3" />
              
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-white transition-colors duration-500 mb-2">
                Security Scan
              </h3>
              
              <p className="text-gray-700 group-hover:text-white/80 transition-colors duration-500 text-sm leading-relaxed flex-1">
                Advanced threat detection and vulnerability assessment with real-time monitoring capabilities.
              </p>
              
              <div className="mt-auto flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-600 group-hover:text-red-200 font-semibold transition-colors duration-500">SCANNING</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Sync */}
          <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/features/sync')}
            className="col-span-1 md:col-span-2 lg:col-span-2 relative block bg-gradient-to-b from-emerald-100 to-teal-200 rounded-xl p-6 cursor-pointer overflow-hidden z-0 hover-card group"
            style={{ height: '200px' }}
          >
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 transform scale-100 origin-center transition-transform duration-500 ease-out group-hover:scale-[28] z-[-1]"></div>
            
            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 overflow-hidden" style={{ borderRadius: '0 12px 0 32px' }}>
              <FaArrowRight className="text-white text-sm -mt-1 -mr-1" />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <FaSync className="w-8 h-8 text-emerald-600 group-hover:text-emerald-200 transition-colors duration-500 mb-3" />
              
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-white transition-colors duration-500 mb-2">
                Quick Sync
              </h3>
              
              <p className="text-gray-700 group-hover:text-white/80 transition-colors duration-500 text-sm leading-relaxed flex-1">
                Seamless data synchronization across all your devices with end-to-end encryption.
              </p>
              
              <div className="mt-auto space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-600 group-hover:text-emerald-200 transition-colors duration-500">Last sync:</span>
                  <span className="text-gray-700 group-hover:text-white font-semibold transition-colors duration-500">2m ago</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Import/Export - Wide Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('backup')}
            className="col-span-1 md:col-span-3 lg:col-span-4 relative block bg-gradient-to-b from-amber-100 to-orange-200 rounded-xl p-6 cursor-pointer overflow-hidden z-0 hover-card-wide group"
            style={{ height: '160px' }}
          >
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-800 transform scale-100 origin-center transition-transform duration-500 ease-out group-hover:scale-[28] z-[-1]"></div>
            
            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 overflow-hidden" style={{ borderRadius: '0 12px 0 32px' }}>
              <FaArrowRight className="text-white text-sm -mt-1 -mr-1" />
            </div>

            <div className="relative z-10 h-full flex items-center gap-6">
              <FaFileImport className="w-10 h-10 text-amber-600 group-hover:text-amber-200 transition-colors duration-500" />
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-white transition-colors duration-500 mb-2">
                  Import/Export Hub
                </h3>
                <p className="text-gray-700 group-hover:text-white/80 transition-colors duration-500 text-sm leading-relaxed">
                  Comprehensive data management suite with advanced backup solutions and migration tools for seamless data transfer.
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-amber-600 group-hover:text-amber-200 transition-colors duration-500">156</div>
                <div className="text-xs text-gray-600 group-hover:text-white/70 transition-colors duration-500">Items ready</div>
              </div>
            </div>
          </motion.div>

          {/* Add Password */}
          <motion.div
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('passwords')}
            className="col-span-1 md:col-span-1 lg:col-span-2 relative block bg-gradient-to-b from-indigo-100 to-blue-200 rounded-xl p-5 cursor-pointer overflow-hidden z-0 hover-card group"
            style={{ height: '180px' }}
          >
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-800 transform scale-100 origin-center transition-transform duration-500 ease-out group-hover:scale-[28] z-[-1]"></div>
            
            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 overflow-hidden" style={{ borderRadius: '0 12px 0 32px' }}>
              <FaArrowRight className="text-white text-sm -mt-1 -mr-1" />
            </div>

            <div className="relative z-10 h-full flex flex-col text-center">
              <FaPlus className="w-8 h-8 text-indigo-600 group-hover:text-indigo-200 transition-colors duration-500 mb-3 mx-auto" />
              
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors duration-500 mb-2">
                Add Password
              </h3>
              
              <p className="text-gray-700 group-hover:text-white/80 transition-colors duration-500 text-sm leading-relaxed flex-1">
                Create secure credentials with our advanced password generator and encryption technology.
              </p>
              
              <div className="mt-auto">
                <span className="text-xs text-indigo-600 group-hover:text-indigo-200 font-semibold transition-colors duration-500">QUICK CREATE</span>
              </div>
            </div>
          </motion.div>

          {/* Multiple Device Access */}
          <motion.div
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/features/multi-device')}
            className="col-span-1 md:col-span-1 lg:col-span-2 relative block bg-gradient-to-b from-purple-100 to-violet-200 rounded-xl p-5 cursor-pointer overflow-hidden z-0 hover-card group"
            style={{ height: '180px' }}
          >
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-violet-800 transform scale-100 origin-center transition-transform duration-500 ease-out group-hover:scale-[28] z-[-1]"></div>
            
            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 overflow-hidden" style={{ borderRadius: '0 12px 0 32px' }}>
              <FaArrowRight className="text-white text-sm -mt-1 -mr-1" />
            </div>

            <div className="relative z-10 h-full flex flex-col text-center">
              <FaSync className="w-8 h-8 text-purple-600 group-hover:text-purple-200 transition-colors duration-500 mb-3 mx-auto" />
              
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors duration-500 mb-2">
                Multi Device
              </h3>
              
              <p className="text-gray-700 group-hover:text-white/80 transition-colors duration-500 text-sm leading-relaxed flex-1">
                Access your vault anywhere, anytime, on any device with seamless synchronization.
              </p>
              
              <div className="mt-auto">
                <span className="text-xs text-purple-600 group-hover:text-purple-200 font-semibold transition-colors duration-500">5 DEVICES CONNECTED</span>
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/features/alerts')}
            className="col-span-1 md:col-span-1 lg:col-span-2 relative block bg-gradient-to-b from-orange-100 to-red-200 rounded-xl p-5 cursor-pointer overflow-hidden z-0 hover-card group"
            style={{ height: '180px' }}
          >
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-red-800 transform scale-100 origin-center transition-transform duration-500 ease-out group-hover:scale-[28] z-[-1]"></div>
            
            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 overflow-hidden" style={{ borderRadius: '0 12px 0 32px' }}>
              <FaArrowRight className="text-white text-sm -mt-1 -mr-1" />
            </div>

            <div className="relative z-10 h-full flex flex-col text-center">
              <div className="relative mx-auto">
                <FaBell className="w-8 h-8 text-orange-600 group-hover:text-orange-200 transition-colors duration-500 mb-3" />
                {dashboardStats.securityIncidents > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{dashboardStats.securityIncidents}</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors duration-500 mb-2">
                Alerts
              </h3>
              
              <p className="text-gray-700 group-hover:text-white/80 transition-colors duration-500 text-xs leading-relaxed flex-1 px-1">
                Security notifications and breach alerts for data protection
              </p>
              
              <div className="mt-auto">
                <span className="text-xs text-orange-600 group-hover:text-orange-200 font-semibold transition-colors duration-500">
                  {dashboardStats.securityIncidents} ACTIVE ALERTS
                </span>
              </div>
            </div>
          </motion.div>

          {/* Pass Sharing */}
          <motion.div
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/features/sharing')}
            className="col-span-1 md:col-span-1 lg:col-span-2 relative block bg-gradient-to-b from-teal-100 to-cyan-200 rounded-xl p-5 cursor-pointer overflow-hidden z-0 hover-card group"
            style={{ height: '180px' }}
          >
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-cyan-800 transform scale-100 origin-center transition-transform duration-500 ease-out group-hover:scale-[28] z-[-1]"></div>
            
            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 overflow-hidden" style={{ borderRadius: '0 12px 0 32px' }}>
              <FaArrowRight className="text-white text-sm -mt-1 -mr-1" />
            </div>

            <div className="relative z-10 h-full flex flex-col text-center">
              <FaFileContract className="w-8 h-8 text-teal-600 group-hover:text-teal-200 transition-colors duration-500 mb-3 mx-auto" />
              
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors duration-500 mb-2">
                Pass Sharing
              </h3>
              
              <p className="text-gray-700 group-hover:text-white/80 transition-colors duration-500 text-sm leading-relaxed flex-1">
                Securely share credentials with team members and family using advanced encryption.
              </p>
              
              <div className="mt-auto">
                <span className="text-xs text-teal-600 group-hover:text-teal-200 font-semibold transition-colors duration-500">
                  {dashboardStats.credentialsShared} ITEMS SHARED
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Stats Overview */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Password Status</h2>
            <p className="text-gray-500">Overview of your credential security</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
            onClick={() => onNavigate('passwords')}
          >
            Manage All
            <FaChevronRight size={12} />
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="relative p-6 rounded-2xl bg-white shadow-md border border-blue-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                  <FaKey className="w-6 h-6" />
                </div>
                {dashboardStats.totalPasswords > 150 && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">High volume</span>
                )}
              </div>
              
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-gray-800">{dashboardStats.totalPasswords}</h3>
                <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium flex items-center">
                  +5 <FaChevronRight size={8} className="ml-0.5" />
                </div>
              </div>
              
              <p className="text-gray-500 mt-1">Total Passwords</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">5 categories</span>
                  <span className="text-blue-600 font-medium">{Math.round((dashboardStats.strongPasswords / dashboardStats.totalPasswords) * 100)}% strong</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="relative p-6 rounded-2xl bg-white shadow-md border border-green-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-green-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-xl bg-green-100 text-green-600">
                  <FaShieldAlt className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-gray-800">{dashboardStats.strongPasswords}</h3>
              </div>
              
              <p className="text-gray-500 mt-1">Strong Passwords</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Secure and robust</span>
                  <span className="text-green-600 font-medium">✓ Excellent</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="relative p-6 rounded-2xl bg-white shadow-md border border-red-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-red-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-xl bg-red-100 text-red-600">
                  <FaExclamationTriangle className="w-6 h-6" />
                </div>
                <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">Action needed</span>
              </div>
              
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-gray-800">{dashboardStats.weakPasswords}</h3>
                <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium flex items-center">
                  -2 <FaChevronRight size={8} className="ml-0.5" />
                </div>
              </div>
              
              <p className="text-gray-500 mt-1">Weak Passwords</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Need attention</span>
                  <span className="text-red-600 font-medium hover:underline cursor-pointer">Fix now</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="relative p-6 rounded-2xl bg-white shadow-md border border-amber-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-amber-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                  <FaSync className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-gray-800">{dashboardStats.reusedPasswords}</h3>
                <div className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded font-medium flex items-center">
                  +2 <FaChevronRight size={8} className="ml-0.5" />
                </div>
              </div>
              
              <p className="text-gray-500 mt-1">Reused Passwords</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Multiple accounts</span>
                  <span className="text-amber-600 font-medium hover:underline cursor-pointer">Update</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Security Status Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.05)" }}
          transition={{ duration: 0.2 }}
          className="relative p-7 rounded-2xl bg-white shadow-md border border-amber-100 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/3 opacity-70"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shadow-sm">
                <FaExclamationCircle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">Security Alerts</h3>
                  {dashboardStats.securityIncidents > 0 && (
                    <span className="animate-pulse flex h-3 w-3">
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">Risk assessment & potential threats</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-4xl font-bold text-amber-600">{dashboardStats.securityIncidents}</span>
                <span className="text-lg font-medium text-gray-600 ml-2">incidents</span>
              </div>
              <span className="text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm border border-amber-200
                flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700">
                {dashboardStats.securityIncidents > 0 
                  ? <FaExclamationCircle className="text-amber-600" /> 
                  : <FaCheckCircle className="text-green-600" />}
                {dashboardStats.securityIncidents > 0 ? 'Action needed' : 'All clear'}
              </span>
            </div>
            
            <div className="space-y-3">
              {dashboardStats.breachedAccounts > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-1.5 bg-amber-100 rounded-lg mr-3">
                      <FaExclamation className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-amber-800">Data Breach Alert</div>
                      <p className="text-amber-700 text-sm">
                        {dashboardStats.breachedAccounts} {dashboardStats.breachedAccounts === 1 ? 'account' : 'accounts'} found in data breaches
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1">
                      Review
                      <FaChevronRight size={10} />
                    </button>
                  </div>
                </div>
              )}
              
              {dashboardStats.securityIncidents === 0 && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-1.5 bg-green-100 rounded-lg mr-3">
                      <FaCheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-green-800">All Secure</div>
                      <p className="text-green-700 text-sm">
                        No security incidents detected in the last 30 days
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.05)" }}
          transition={{ duration: 0.2 }}
          className="relative p-7 rounded-2xl bg-white shadow-md border border-teal-100 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -translate-y-1/2 translate-x-1/3 opacity-70"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-xl bg-teal-100 text-teal-600 shadow-sm">
                <FaDatabase className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Latest Backup</h3>
                <p className="text-gray-500 text-sm">Automatic cloud data protection</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <div className="text-lg text-teal-600 font-medium">
                  {dashboardStats.lastBackup}
                </div>
                <span className="text-xs text-gray-500">Next backup scheduled in 22 hours</span>
              </div>
              
              <span className="text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm border border-teal-200
                flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700">
                <FaCheckCircle className="text-teal-600" />
                Auto-backup enabled
              </span>
            </div>
            
            <div className="p-5 bg-gradient-to-r from-teal-50 to-teal-100/30 rounded-xl border border-teal-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h4 className="font-medium text-teal-800">Backup protection</h4>
                  <p className="text-sm text-teal-700 mt-1">
                    Your data is encrypted with AES-256 and stored securely in the cloud.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBackupNowClick}
                  className="px-4 py-2.5 bg-white text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 
                    shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FaSync className="text-teal-600" />
                  Backup Now
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Enhanced Profile Completion */}
      <motion.section 
        whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.05)" }}
        transition={{ duration: 0.2 }}
        className="relative p-7 rounded-2xl bg-white shadow-md border border-violet-100 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full -translate-y-1/2 translate-x-1/3 opacity-70"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-violet-100 text-violet-600 shadow-sm">
                <FaUserCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Profile Completion</h3>
                <p className="text-gray-500 text-sm">Enhance your account security</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="inline-flex items-center justify-center">
                  <svg className="w-16 h-16" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="3"
                      strokeDasharray={`${dashboardStats.profileCompletion}, 100`}
                      className="animate-dasharray"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold text-violet-700">{dashboardStats.profileCompletion}%</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-800">Account Status:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
                  </span>
                  Premium Active
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${
              dashboardStats.twoFactorEnabled ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'
            }`}>
              <div className="flex items-start">
                <div className={`p-2 rounded-lg mr-3 ${
                  dashboardStats.twoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {dashboardStats.twoFactorEnabled
                    ? <FaCheckCircle className="w-5 h-5" />
                    : <FaExclamationCircle className="w-5 h-5" />
                  }
                </div>
                <div>
                  <div className="font-medium text-gray-800">Two-Factor Authentication</div>
                  <p className={`text-sm ${dashboardStats.twoFactorEnabled ? 'text-green-700' : 'text-amber-700'}`}>
                    {dashboardStats.twoFactorEnabled
                      ? 'Enabled and active'
                      : 'Not enabled - recommended'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
              <div className="flex items-start">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3">
                  <FaCheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Recovery Email</div>
                  <p className="text-sm text-green-700">
                    Verified and active
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
              <div className="flex items-start">
                <div className="p-2 bg-violet-100 text-violet-600 rounded-lg mr-3">
                  <FaKey className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Master Password</div>
                  <div className="flex items-center mt-1">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-violet-600 rounded-full"
                        style={{ width: `${dashboardStats.masterPasswordStrength}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-violet-700 font-medium">
                      {dashboardStats.masterPasswordStrength}% strong
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('user-profile')}
              className="px-4 py-2 text-sm bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 
                transition-colors flex items-center gap-1.5"
            >
              Complete Profile
              <FaChevronRight size={10} />
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Recent Activity */}
      <motion.section 
        whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.05)" }}
        className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden"
      >
        <div className="p-7 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
                <FaHistory className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                <p className="text-gray-500 text-sm">Track and monitor account activity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg
                  focus:outline-none focus:bg-white focus:border-indigo-300 text-sm font-medium">
                  <option value="all">All Activity</option>
                  <option value="login">Logins</option>
                  <option value="security">Security</option>
                  <option value="changes">Changes</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FaChevronDown size={12} />
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 
                  transition-colors flex items-center gap-1.5 font-medium"
                onClick={() => onNavigate('history')}
              >
                View All
                <FaChevronRight size={10} />
              </motion.button>
            </div>
          </div>
        </div>
        
        <div>
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="divide-y divide-gray-100"
          >
            {recentActivities.slice(0, 4).map((activity) => (
              <motion.div
                key={activity.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                className="hover:bg-gray-50 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${
                      activity.severity === 'high' ? 'bg-red-100 text-red-600' : 
                      activity.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 
                      activity.type === 'login' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'password_change' ? 'bg-green-100 text-green-600' :
                      activity.type === 'security_alert' ? 'bg-red-100 text-red-600' :
                      activity.type === 'sync' ? 'bg-purple-100 text-purple-600' :
                      'bg-indigo-100 text-indigo-600'
                    } shadow-sm`}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                            {activity.severity === 'high' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <FaExclamationCircle className="mr-1" size={10} />
                                High Priority
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 whitespace-nowrap">{activity.timestamp}</span>
                          <button className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                            <FaEllipsis size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="p-5 bg-gray-50 border-t border-gray-100 text-center">
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto">
              View all activity
              <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Customization Modal */}
      <AnimatePresence>
        {showCustomizeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCustomizeModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FaPalette className="text-indigo-200" />
                    Customize Dashboard
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1">Personalize your dashboard experience</p>
                </div>
                <button 
                  onClick={() => setShowCustomizeModal(false)}
                  className="text-white bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  {/* Layout Sections */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaEye className="text-indigo-600" />
                      Visible Sections
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Show Quick Actions */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Quick Actions</h5>
                          <p className="text-sm text-gray-600">Show quick action buttons</p>
                        </div>
                        <button
                          onClick={() => handleCustomizationToggle('showQuickActions')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            customizationSettings.showQuickActions ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {customizationSettings.showQuickActions ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Show Password Stats */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Password Statistics</h5>
                          <p className="text-sm text-gray-600">Display password stats cards</p>
                        </div>
                        <button
                          onClick={() => handleCustomizationToggle('showPasswordStats')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            customizationSettings.showPasswordStats ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {customizationSettings.showPasswordStats ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Show Security Alerts */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Security Alerts</h5>
                          <p className="text-sm text-gray-600">Show security status cards</p>
                        </div>
                        <button
                          onClick={() => handleCustomizationToggle('showSecurityAlerts')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            customizationSettings.showSecurityAlerts ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {customizationSettings.showSecurityAlerts ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Show Profile Completion */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Profile Completion</h5>
                          <p className="text-sm text-gray-600">Display profile status widget</p>
                        </div>
                        <button
                          onClick={() => handleCustomizationToggle('showProfileCompletion')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            customizationSettings.showProfileCompletion ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {customizationSettings.showProfileCompletion ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Show Recent Activity */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Recent Activity</h5>
                          <p className="text-sm text-gray-600">Show activity timeline</p>
                        </div>
                        <button
                          onClick={() => handleCustomizationToggle('showRecentActivity')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            customizationSettings.showRecentActivity ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {customizationSettings.showRecentActivity ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Appearance Settings */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaPalette className="text-purple-600" />
                      Appearance & Layout
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Quick Actions Layout */}
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-800 mb-3">Quick Actions Layout</h5>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleLayoutChange('grid')}
                            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                              customizationSettings.quickActionsLayout === 'grid'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="grid grid-cols-2 gap-1 mb-2">
                              <div className="h-8 bg-gray-300 rounded"></div>
                              <div className="h-8 bg-gray-300 rounded"></div>
                              <div className="h-8 bg-gray-300 rounded"></div>
                              <div className="h-8 bg-gray-300 rounded"></div>
                            </div>
                            <span className="text-sm font-medium">Grid View</span>
                          </button>
                          
                          <button
                            onClick={() => handleLayoutChange('list')}
                            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                              customizationSettings.quickActionsLayout === 'list'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="space-y-1 mb-2">
                              <div className="h-3 bg-gray-300 rounded"></div>
                              <div className="h-3 bg-gray-300 rounded"></div>
                              <div className="h-3 bg-gray-300 rounded"></div>
                              <div className="h-3 bg-gray-300 rounded"></div>
                            </div>
                            <span className="text-sm font-medium">List View</span>
                          </button>
                        </div>
                      </div>

                      {/* Theme Selection */}
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-800 mb-3">Color Theme</h5>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => handleThemeChange('default')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              customizationSettings.theme === 'default'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex gap-1 mb-2">
                              <div className="w-4 h-8 bg-indigo-500 rounded"></div>
                              <div className="w-4 h-8 bg-purple-500 rounded"></div>
                              <div className="w-4 h-8 bg-blue-500 rounded"></div>
                            </div>
                            <span className="text-sm font-medium">Default</span>
                          </button>
                          
                          <button
                            onClick={() => handleThemeChange('minimal')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              customizationSettings.theme === 'minimal'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex gap-1 mb-2">
                              <div className="w-4 h-8 bg-gray-400 rounded"></div>
                              <div className="w-4 h-8 bg-gray-500 rounded"></div>
                              <div className="w-4 h-8 bg-gray-600 rounded"></div>
                            </div>
                            <span className="text-sm font-medium">Minimal</span>
                          </button>
                          
                          <button
                            onClick={() => handleThemeChange('vibrant')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              customizationSettings.theme === 'vibrant'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex gap-1 mb-2">
                              <div className="w-4 h-8 bg-pink-500 rounded"></div>
                              <div className="w-4 h-8 bg-yellow-500 rounded"></div>
                              <div className="w-4 h-8 bg-green-500 rounded"></div>
                            </div>
                            <span className="text-sm font-medium">Vibrant</span>
                          </button>
                        </div>
                      </div>

                      {/* Compact Mode */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Compact Mode</h5>
                          <p className="text-sm text-gray-600">Reduce spacing for more content</p>
                        </div>
                        <button
                          onClick={() => handleCustomizationToggle('compactMode')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            customizationSettings.compactMode ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {customizationSettings.compactMode ? (
                            <FaToggleOn className="text-white text-3xl" />
                          ) : (
                            <FaToggleOff className="text-gray-600 text-3xl" />
                          )}
                        </button>
                      </div>

                      {/* Animations */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Animations</h5>
                          <p className="text-sm text-gray-600">Enable smooth transitions and effects</p>
                        </div>
                        <button
                          onClick={() => handleCustomizationToggle('animationsEnabled')}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            customizationSettings.animationsEnabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          {customizationSettings.animationsEnabled ? (
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
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
                    >
                      <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-blue-800 mb-1">Unsaved Changes</h5>
                        <p className="text-sm text-blue-700">You have unsaved customization changes. Click "Save Customization" to apply them.</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-between items-center">
                <button
                  onClick={handleResetCustomization}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                >
                  Reset to Default
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCustomizeModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveCustomization}
                    disabled={!settingsChanged}
                    className={`px-6 py-3 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 ${
                      settingsChanged
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FaSave />
                    Save Customization
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mockAuth') === 'true';
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({
    id: '',
    name: 'User',
    email: '',
    role: 'Free User',
    avatar: 'https://via.placeholder.com/150',
    lastLogin: new Date().toISOString()
  });
  
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPasswords: 156,
    strongPasswords: 120,
    weakPasswords: 26,
    reusedPasswords: 10,
    securityScore: 85,
    breachedAccounts: 2,
    lastBackup: '2023-12-04 10:30 AM',
    profileCompletion: 75,
    passwordsExpiringSoon: 5,
    lastPasswordChange: '2023-12-03',
    securityIncidents: 2,
    masterPasswordStrength: 92,
    twoFactorEnabled: true,
    credentialsShared: 8
  });
  const [recentActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'login',
      title: 'New Login Detected',
      description: 'New login from Chrome on Windows 11',
      timestamp: '2 minutes ago',
      icon: FaUserSecret
    },
    {
      id: '2',
      type: 'password_change',
      title: 'Password Updated',
      description: 'Password for "Netflix Account" was changed',
      timestamp: '1 hour ago',
      icon: FaKey
    },
    {
      id: '3',
      type: 'security_alert',
      title: 'Security Alert',
      description: 'Potential data breach detected for your GitHub account',
      timestamp: '3 hours ago',
      icon: FaExclamationTriangle,
      severity: 'high'
    },
    {
      id: '4',
      type: 'sync',
      title: 'Sync Completed',
      description: 'Successfully synced 156 passwords across devices',
      timestamp: '5 hours ago',
      icon: FaSync
    },
    {
      id: '5',
      type: 'share',
      title: 'Credential Shared',
      description: 'Wi-Fi password shared with "Home Group"',
      timestamp: '1 day ago',
      icon: FaFileContract
    },
    {
      id: '6',
      type: 'backup',
      title: 'Backup Created',
      description: 'Automatic backup completed successfully',
      timestamp: '1 day ago',
      icon: FaDatabase
    }
  ]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsExpanded(!isExpanded);
  };

  const sidebarItems: NavItem[] = [
    { 
      icon: FaHome,
      label: 'Dashboard',
      path: 'dashboard',
      description: 'Overview and quick actions',
      component: <div className="p-6">Dashboard Component</div>,
    },
    { 
      icon: FaLock, 
      label: 'Passwords', 
      path: 'passwords',
      description: 'Manage your stored passwords',
      component: <Passwords />,
    },
    { 
      icon: FaBell, 
      label: 'Notifications', 
      path: 'notifications',
      description: 'View alerts and updates',
      notification: 3, 
      component: <Notifications />,
    },
    { 
      icon: FaShieldVirus, 
      label: 'Monitoring', 
      path: 'monitoring',
      description: 'Real-time breach monitoring',
      component: <Monitoring />,
    },
    { icon: FaHistory, label: 'History', path: 'history', component: <History /> },
    { icon: FaCog, label: 'Settings', path: 'settings', component: <Settings /> },
    { 
      icon: FaFileImport, 
      label: 'Transcation', 
      path: 'transcation',
      description: 'View your transactions',
      component: <Transactions />
    },
    { 
      icon: FaDatabase, 
      label: 'Backup', 
      path: 'backup',
      description: 'Manage your data backups',
      component: <BackUp />,
    }
  ];

  const handleNavigation = (path: string) => {
    setCurrentFeature(path);
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    setCurrentFeature('user-profile');
    getCurrentComponent();
    if (window.innerWidth <= 1024) {
      setIsExpanded(false);
    }
  };

  const getCurrentComponent = () => {
    if (currentFeature === 'user-profile') {
      return <UserProfile />;
    }
    const item = sidebarItems.find(item => item.path === currentFeature);
    return item?.component || <div className="p-6">Dashboard Component</div>;
  };

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    email: '',
    role: 'Free User'
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setUserProfile({
          name: parsedData.name || 'User',
          email: parsedData.email || '',
          role: parsedData.subscription?.plan === 'premium' ? 'Premium User' : 
                parsedData.subscription?.plan === 'enterprise' ? 'Enterprise User' : 'Free User'
        });
        setUser(prev => ({
          ...prev,
          id: parsedData.id || parsedData._id || '',
          name: parsedData.name || 'User',
          email: parsedData.email || '',
          role: parsedData.subscription?.plan === 'premium' ? 'Premium User' : 
                parsedData.subscription?.plan === 'enterprise' ? 'Enterprise User' : 'Free User'
        }));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const initializeDashboard = useCallback(async () => {
    try {
      // Check all possible authentication keys that might be set
      const mockAuth = localStorage.getItem('mockAuth') === 'true';
      const isAuthenticatedToken = localStorage.getItem('isAuthenticated') === 'true';
      const userToken = localStorage.getItem('userToken');
      const token = localStorage.getItem('token'); // Added to match AuthenticatedNavbar
      
      const authStatus = mockAuth || isAuthenticatedToken || !!userToken || !!token;
      setIsAuthenticated(authStatus);
      
      if (!authStatus) {
        navigate('/signin', { replace: true });
        return;
      }

      setError(null);

      // Try all possible user data sources
      const mockUser = localStorage.getItem('mockUser');
      const userData = localStorage.getItem('userData');
      
      if (mockUser || userData) {
        try {
          const parsedUser = JSON.parse(mockUser || userData || '{}');
          setUserProfile({
            name: parsedUser.name || parsedUser.username || 'Rahul Singh',
            email: parsedUser.email || 'RahulSingh05@gmail.com',
            role: parsedUser.role || 'Premium User'
          });
          
          // Update user state as well
          setUser(prev => ({
            ...prev,
            name: parsedUser.name || parsedUser.username || 'Rahul Singh',
            email: parsedUser.email || 'RahulSingh05@gmail.com',
          }));
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }

      try {
        const dashboardData = await MockDashboardService.getDashboardStats();
        setDashboardStats(prev => ({
          ...prev,
          ...dashboardData
        }));
      } catch (dashboardError) {
        console.error('Failed to fetch dashboard data:', dashboardError);
      }

      setCurrentFeature('dashboard');
      
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      setError('Error loading dashboard. Please try again later.');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check all possible auth keys
    const mockAuth = localStorage.getItem('mockAuth') === 'true';
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userToken = localStorage.getItem('userToken');
    const token = localStorage.getItem('token');
    
    if (!mockAuth && !isAuthenticated && !userToken && !token) {
      navigate('/signin', { replace: true });
      return;
    }
    
    initializeDashboard();
  }, [initializeDashboard, navigate]);

  useEffect(() => {
    // Check authentication status on mount and when it changes
    initializeDashboard();
    
    // Listen for changes in authentication status
    const handleStorageChange = () => {
      const authStatus = localStorage.getItem('mockAuth') === 'true';
      setIsAuthenticated(authStatus);
      if (!authStatus) {
        navigate('/signin', { replace: true });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeDashboard, navigate]);

  const handleLogout = () => {
    // Clear all possible authentication keys
    localStorage.removeItem('mockAuth');
    localStorage.removeItem('mockUser');
    localStorage.removeItem('userToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    localStorage.removeItem('token'); // Added to match AuthenticatedNavbar
    setIsAuthenticated(false);
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    navigate('/signin', { replace: true });
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-indigo-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <Navbar />
      
      <div className="h-20"></div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 right-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 z-50 shadow-lg max-w-md backdrop-blur-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <FaExclamationCircle size={20} />
            </div>
            <span className="font-medium">{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="absolute top-2 right-2 p-1 rounded-full text-red-400 hover:text-red-700 hover:bg-red-100"
          >
            <FaTimes size={16} />
          </button>
        </motion.div>
      )}
    
      <div className="fixed top-24 left-4 z-50">
        <SidebarToggle isExpanded={isExpanded} onClick={toggleSidebar} />
      </div>

      <motion.nav
        initial={false}
        animate={{
          width: isExpanded ? '280px' : '0px',
          opacity: isExpanded ? 1 : 0,
          transition: { duration: 0.3 }
        }}
        className="fixed left-0 top-20 h-[calc(100%-5rem)] bg-white/90 backdrop-blur-xl border-r border-indigo-100 shadow-2xl z-40 overflow-hidden"
      >
        <div className="p-6 h-full flex flex-col w-[280px]">
          <div className="mb-8">
            <div className="h-12 flex items-center">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-200/50">
                  <FaSquarePollHorizontal className="text-white text-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent hover:scrollbar-thumb-indigo-300">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-3 mb-2">Main Menu</div>
            
            {sidebarItems.slice(0, 3).map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                isActive={currentFeature === item.path}
                notification={item.notification}
                onClick={() => handleNavigation(item.path)}
              />
            ))}

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-3 mb-2 mt-6">Management</div>
            
            {sidebarItems.slice(3).map((item, index) => (
              <SidebarItem
                key={index + 3}
                icon={item.icon}
                label={item.label}
                isActive={currentFeature === item.path}
                notification={item.notification}
                onClick={() => handleNavigation(item.path)}
              />
            ))}
          </div>

          <SidebarProfile 
            profile={userProfile} 
            onClick={handleProfileClick} 
            isActive={currentFeature === 'user-profile'}
            onLogout={handleLogout}
          />
        </div>
      </motion.nav>

      <main className={`flex-1 transition-all duration-300 pt-4 px-6 md:px-10 pb-8 ${isExpanded ? 'lg:pl-[300px]' : 'pl-6'} mt-16`}>
        <div className="max-w-7xl mx-auto">
          <div className="h-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentFeature === 'dashboard' 
                  ? <DashboardHome 
                      dashboardStats={dashboardStats} 
                      searchQuery={searchQuery} 
                      setSearchQuery={setSearchQuery}
                      recentActivities={recentActivities}
                      onNavigate={handleNavigation}
                    />
                  : getCurrentComponent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <div className={`mt-auto transition-all duration-300 ${isExpanded ? 'lg:ml-[280px]' : 'ml-0'}`}>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
