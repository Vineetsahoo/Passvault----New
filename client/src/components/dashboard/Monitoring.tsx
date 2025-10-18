import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaEye, FaEyeSlash,
  FaGlobe, FaServer, FaDatabase, FaWifi, FaClock, FaChartLine,
  FaBell, FaDownload, FaShare, FaFilter, FaSync, FaPlay, FaPause,
  FaFireAlt, FaUserSecret, FaLock, FaUnlock, FaKey, FaExclamationCircle,
  FaTimesCircle, FaInfoCircle, FaChevronRight, FaChevronDown, FaSearch,
  FaRocket, FaBug, FaFileAlt, FaHistory, FaMapMarkerAlt, FaFingerprint,
  FaRadiation, FaSkull, FaCrosshairs, FaFlag, FaBullseye, FaTimes,
  FaSort, FaPlus, FaCog, FaRegCheckCircle, FaRegCopy, FaDice, FaExpand,
  FaNetworkWired, FaRegDotCircle, FaCircle, FaWaveSquare, FaArrowUp
} from 'react-icons/fa';
import { FaShieldVirus, FaBinoculars, FaSignal } from 'react-icons/fa6';

// New interfaces for real-time data visualization
interface RealTimeMetric {
  timestamp: number;
  value: number;
  label: string;
}

interface NetworkActivityData {
  timestamp: number;
  inbound: number;
  outbound: number;
  blocked: number;
}

interface SecurityScore {
  timestamp: number;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

// Types for breach monitoring
interface BreachAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'data-breach' | 'suspicious-login' | 'password-compromise' | 'dark-web' | 'phishing' | 'malware';
  title: string;
  description: string;
  affectedAccounts: string[];
  source: string;
  detectedAt: string;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  risk_score: number;
  location?: string;
  ipAddress?: string;
  userAgent?: string;
  recommendations: string[];
}

interface MonitoringStats {
  total_alerts: number;
  critical_alerts: number;
  monitored_accounts: number;
  dark_web_mentions: number;
  security_score: number;
  last_scan: string;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  scanned_databases: number;
  active_threats: number;
  resolved_threats: number;
}

interface ThreatIntelligence {
  id: string;
  threat_type: 'botnet' | 'malware' | 'phishing' | 'data_broker' | 'leak';
  description: string;
  confidence: number;
  first_seen: string;
  last_seen: string;
  indicators: string[];
  ttps: string[]; // Tactics, Techniques, and Procedures
}

interface DarkWebMention {
  id: string;
  site: string;
  content_snippet: string;
  credential_type: string;
  confidence: number;
  discovered_at: string;
  hash: string;
}

const Monitoring: React.FC = () => {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'risk_score'>('timestamp');
  const [showThreatDetails, setShowThreatDetails] = useState<string | null>(null);
  const [showFullScanModal, setShowFullScanModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<{
    scannedItems: number;
    threatsFound: number;
    vulnerabilities: number;
    status: 'idle' | 'scanning' | 'completed';
  }>({
    scannedItems: 0,
    threatsFound: 0,
    vulnerabilities: 0,
    status: 'idle'
  });
  
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats>({
    total_alerts: 23,
    critical_alerts: 3,
    monitored_accounts: 156,
    dark_web_mentions: 7,
    security_score: 87,
    last_scan: '2 minutes ago',
    threat_level: 'medium',
    scanned_databases: 15420,
    active_threats: 8,
    resolved_threats: 145
  });

  // Real-time data visualization states
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([]);
  const [networkActivity, setNetworkActivity] = useState<NetworkActivityData[]>([]);
  const [securityScore, setSecurityScore] = useState<SecurityScore>({
    timestamp: Date.now(),
    score: 92,
    trend: 'up'
  });
  const [liveMetrics, setLiveMetrics] = useState({
    threatsBlocked: 0,
    scanningRate: 0,
    networkTraffic: 0,
    cpuUsage: 0
  });

  const [breachAlerts, setBreachAlerts] = useState<BreachAlert[]>([
    {
      id: 'br-001',
      severity: 'critical',
      type: 'data-breach',
      title: 'Major Social Media Platform Breach',
      description: 'Your email address was found in a recent data breach affecting 50M+ users from a popular social media platform. Immediate action required.',
      affectedAccounts: ['user@example.com'],
      source: 'HaveIBeenPwned API',
      detectedAt: '5 minutes ago',
      status: 'active',
      risk_score: 95,
      location: 'Russia',
      recommendations: [
        'Change password immediately for all associated accounts',
        'Enable two-factor authentication if not already active',
        'Monitor account for suspicious activity for the next 30 days',
        'Consider freezing credit reports as a precaution'
      ]
    },
    {
      id: 'br-002',
      severity: 'high',
      type: 'dark-web',
      title: 'Credentials Found on Dark Web Marketplace',
      description: 'Your Netflix credentials were discovered being sold on a dark web marketplace. The credentials appear to be from a recent breach.',
      affectedAccounts: ['netflix.account@example.com'],
      source: 'Dark Web Scanner',
      detectedAt: '2 hours ago',
      status: 'investigating',
      risk_score: 78,
      recommendations: [
        'Update Netflix password immediately',
        'Check viewing history for unauthorized activity',
        'Review all connected devices and remove unknown ones',
        'Enable account notifications for login attempts'
      ]
    },
    {
      id: 'br-003',
      severity: 'medium',
      type: 'suspicious-login',
      title: 'Unusual Login Location Detected',
      description: 'A login to your work email was detected from Tokyo, Japan - an unusual location for your account activity.',
      affectedAccounts: ['work@company.com'],
      source: 'Login Monitoring',
      detectedAt: '6 hours ago',
      status: 'resolved',
      risk_score: 45,
      location: 'Tokyo, Japan',
      ipAddress: '203.0.113.0',
      userAgent: 'Chrome/119.0.0.0 (Windows NT 10.0)',
      recommendations: [
        'Verify if this login was legitimate',
        'Enable location-based security alerts',
        'Review recent account activity for any unauthorized changes'
      ]
    },
    {
      id: 'br-004',
      severity: 'low',
      type: 'phishing',
      title: 'Phishing Email Attempt Blocked',
      description: 'A sophisticated phishing email targeting your banking credentials was automatically blocked by our security systems.',
      affectedAccounts: ['personal@example.com'],
      source: 'Email Security Filter',
      detectedAt: '1 day ago',
      status: 'resolved',
      risk_score: 25,
      recommendations: [
        'Be cautious of similar emails in the future',
        'Always verify sender authenticity before clicking links',
        'Report suspicious emails to your email provider'
      ]
    },
    {
      id: 'br-005',
      severity: 'high',
      type: 'malware',
      title: 'Password Stealer Malware Detected',
      description: 'Malware capable of stealing saved passwords was detected on a device that accessed your accounts.',
      affectedAccounts: ['admin@company.com', 'personal@example.com'],
      source: 'Endpoint Security',
      detectedAt: '3 hours ago',
      status: 'active',
      risk_score: 82,
      recommendations: [
        'Run full antivirus scan on all devices',
        'Change passwords for all critical accounts',
        'Enable additional security monitoring',
        'Consider using hardware security keys'
      ]
    }
  ]);

  const categories = ['all', 'data-breach', 'dark-web', 'suspicious-login', 'phishing', 'malware'];

  // Full scan handler
  const handleFullScan = () => {
    setShowFullScanModal(true);
    setIsScanning(true);
    setScanProgress(0);
    setScanResults({
      scannedItems: 0,
      threatsFound: 0,
      vulnerabilities: 0,
      status: 'scanning'
    });

    // Simulate scanning process
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(scanInterval);
          setIsScanning(false);
          setScanResults(prev => ({
            ...prev,
            status: 'completed'
          }));
          return 100;
        }
        return newProgress;
      });

      setScanResults(prev => ({
        ...prev,
        scannedItems: prev.scannedItems + Math.floor(Math.random() * 50 + 10),
        threatsFound: prev.threatsFound + (Math.random() < 0.3 ? 1 : 0),
        vulnerabilities: prev.vulnerabilities + (Math.random() < 0.2 ? 1 : 0)
      }));
    }, 500);
  };

  // Real-time monitoring simulation
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.08) { // 8% chance every 10 seconds
        const severities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
        const types: Array<'data-breach' | 'suspicious-login' | 'dark-web' | 'phishing' | 'malware'> = ['data-breach', 'suspicious-login', 'dark-web', 'phishing', 'malware'];
        
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        const newAlert: BreachAlert = {
          id: `br-${Date.now()}`,
          severity: randomSeverity,
          type: randomType,
          title: `New ${randomType.replace('-', ' ')} Event Detected`,
          description: `Real-time monitoring has detected a new ${randomType.replace('-', ' ')} event that requires your attention.`,
          affectedAccounts: ['monitored@example.com'],
          source: 'Real-time Scanner',
          detectedAt: 'Just now',
          status: 'active',
          risk_score: Math.floor(Math.random() * 100),
          recommendations: ['Investigate immediately', 'Take preventive action', 'Monitor for additional threats']
        };

        setBreachAlerts(prev => [newAlert, ...prev].slice(0, 10));
        setMonitoringStats(prev => ({
          ...prev,
          total_alerts: prev.total_alerts + 1,
          critical_alerts: randomSeverity === 'critical' ? prev.critical_alerts + 1 : prev.critical_alerts,
          last_scan: 'Just now'
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled]);

  // Real-time data visualization effects
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    // Generate initial data
    const initialMetrics: RealTimeMetric[] = [];
    const initialNetwork: NetworkActivityData[] = [];
    const now = Date.now();
    
    for (let i = 29; i >= 0; i--) {
      const timestamp = now - (i * 2000); // 2-second intervals
      initialMetrics.push({
        timestamp,
        value: Math.random() * 100,
        label: `Metric ${i}`
      });
      initialNetwork.push({
        timestamp,
        inbound: Math.random() * 50 + 10,
        outbound: Math.random() * 30 + 5,
        blocked: Math.random() * 10
      });
    }
    
    setRealTimeMetrics(initialMetrics);
    setNetworkActivity(initialNetwork);

    // Update live metrics every 2 seconds
    const metricsInterval = setInterval(() => {
      setLiveMetrics(prev => ({
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 3),
        scanningRate: 80 + Math.random() * 40,
        networkTraffic: 30 + Math.random() * 70,
        cpuUsage: 20 + Math.random() * 60
      }));

      // Update real-time metrics
      setRealTimeMetrics(prev => {
        const newMetric = {
          timestamp: Date.now(),
          value: Math.random() * 100,
          label: `Metric ${prev.length}`
        };
        return [...prev.slice(1), newMetric];
      });

      // Update network activity
      setNetworkActivity(prev => {
        const newActivity = {
          timestamp: Date.now(),
          inbound: Math.random() * 50 + 10,
          outbound: Math.random() * 30 + 5,
          blocked: Math.random() * 10
        };
        return [...prev.slice(1), newActivity];
      });

      // Occasionally update security score
      if (Math.random() < 0.1) {
        setSecurityScore(prev => {
          const change = (Math.random() - 0.5) * 4;
          const newScore = Math.max(0, Math.min(100, prev.score + change));
          return {
            timestamp: Date.now(),
            score: newScore,
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
          };
        });
      }
    }, 2000);

    return () => clearInterval(metricsInterval);
  }, [isRealTimeEnabled]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return FaRadiation;
      case 'high': return FaFireAlt;
      case 'medium': return FaExclamationTriangle;
      case 'low': return FaInfoCircle;
      default: return FaInfoCircle;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'data-breach': return FaDatabase;
      case 'suspicious-login': return FaUserSecret;
      case 'dark-web': return FaSkull;
      case 'phishing': return FaBug;
      case 'malware': return FaRadiation;
      default: return FaExclamationCircle;
    }
  };

  const filteredAlerts = useMemo(() => {
    return breachAlerts
      .filter(alert => {
        const matchesCategory = selectedCategory === 'all' || alert.type === selectedCategory;
        const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
        const matchesSearch = searchQuery === '' || 
          alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.affectedAccounts.some(account => account.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesCategory && matchesSeverity && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        if (sortBy === 'risk_score') {
          return b.risk_score - a.risk_score;
        }
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      });
  }, [breachAlerts, selectedCategory, selectedSeverity, searchQuery, sortBy]);

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
    hover: {
      y: -4,
      boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-8 -mt-4">
      {/* Enhanced header section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-orange-300 opacity-10 rounded-full translate-y-1/3"></div>
        
        <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-3 mb-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isRealTimeEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs font-medium text-orange-50">
                {isRealTimeEnabled ? 'Real-time Active' : 'Monitoring Paused'}
              </span>
            </div>
            
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaShieldVirus className="text-orange-200" /> 
              <span>Security Monitoring</span>
            </h2>
            
            <p className="text-orange-100 mt-1.5 max-w-lg">
              Real-time threat detection and breach monitoring for your digital identity
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
              className={`px-4 py-2.5 backdrop-blur-sm font-medium rounded-lg transition-all flex items-center gap-2 border border-white/20 ${
                isRealTimeEnabled 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
              }`}
            >
              {isRealTimeEnabled ? <FaPause className="text-orange-200" /> : <FaPlay className="text-gray-300" />}
              {isRealTimeEnabled ? 'Pause Monitoring' : 'Resume Monitoring'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleFullScan}
              className="px-4 py-2.5 bg-white text-red-700 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <FaSync /> Run Full Scan
            </motion.button>
          </div>
        </div>
      </div>

      {/* Real-time Data Visualization Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* Live Security Score */}
        <motion.div 
          className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <FaShieldVirus className="text-2xl text-blue-200" />
              <div className={`w-2 h-2 rounded-full animate-pulse ${securityScore.trend === 'up' ? 'bg-green-400' : securityScore.trend === 'down' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
            </div>
            <h3 className="text-sm font-medium text-blue-200 mb-2">Security Score</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{Math.round(securityScore.score)}</span>
              <span className="text-lg text-blue-200">/100</span>
              <motion.div
                animate={{ rotate: securityScore.trend === 'up' ? 0 : securityScore.trend === 'down' ? 180 : 90 }}
                className={`ml-auto ${securityScore.trend === 'up' ? 'text-green-400' : securityScore.trend === 'down' ? 'text-red-400' : 'text-yellow-400'}`}
              >
                <FaArrowUp size={16} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Live Threat Counter */}
        <motion.div 
          className="lg:col-span-1 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <FaRadiation className="text-2xl text-red-200" />
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
            </div>
            <h3 className="text-sm font-medium text-red-200 mb-2">Threats Blocked</h3>
            <motion.span 
              key={liveMetrics.threatsBlocked}
              initial={{ scale: 1.2, color: '#fbbf24' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold"
            >
              {liveMetrics.threatsBlocked.toLocaleString()}
            </motion.span>
            <span className="text-sm text-red-200 ml-2">today</span>
          </div>
        </motion.div>

        {/* Network Activity Graph */}
        <motion.div 
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaNetworkWired className="text-xl text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Network Activity</h3>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Inbound</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Outbound</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Blocked</span>
              </div>
            </div>
          </div>
          
          {/* Simple SVG Line Chart */}
          <div className="relative h-32 w-full bg-gray-50 rounded-lg overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 400 100">
              {/* Grid lines */}
              {[20, 40, 60, 80].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e5e7eb" strokeWidth="1" opacity="0.5" />
              ))}
              
              {/* Network activity lines */}
              {networkActivity.length > 1 && (
                <>
                  {/* Inbound line */}
                  <motion.polyline
                    points={networkActivity.map((point, index) => 
                      `${(index / (networkActivity.length - 1)) * 400},${100 - (point.inbound / 60) * 80}`
                    ).join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                  />
                  
                  {/* Outbound line */}
                  <motion.polyline
                    points={networkActivity.map((point, index) => 
                      `${(index / (networkActivity.length - 1)) * 400},${100 - (point.outbound / 35) * 80}`
                    ).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                  
                  {/* Blocked line */}
                  <motion.polyline
                    points={networkActivity.map((point, index) => 
                      `${(index / (networkActivity.length - 1)) * 400},${100 - (point.blocked / 10) * 80}`
                    ).join(' ')}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </>
              )}
            </svg>
            
            {/* Live data indicators */}
            {networkActivity.length > 0 && (
              <div className="absolute top-2 right-2 space-y-1">
                <motion.div 
                  className="flex items-center gap-2 text-xs"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaCircle className="text-green-500 text-[6px]" />
                  <span className="text-gray-600">{Math.round(networkActivity[networkActivity.length - 1]?.inbound || 0)} MB/s</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 text-xs"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <FaCircle className="text-blue-500 text-[6px]" />
                  <span className="text-gray-600">{Math.round(networkActivity[networkActivity.length - 1]?.outbound || 0)} MB/s</span>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Real-time System Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Scanning Rate', value: `${Math.round(liveMetrics.scanningRate)}`, unit: 'files/sec', icon: FaBinoculars, color: 'from-cyan-600 to-blue-600' },
          { label: 'Network Traffic', value: `${Math.round(liveMetrics.networkTraffic)}`, unit: 'MB/s', icon: FaSignal, color: 'from-green-600 to-emerald-600' },
          { label: 'CPU Usage', value: `${Math.round(liveMetrics.cpuUsage)}`, unit: '%', icon: FaChartLine, color: 'from-amber-600 to-orange-600' },
          { label: 'Active Scans', value: `${monitoringStats.scanned_databases}`, unit: 'DBs', icon: FaDatabase, color: 'from-purple-600 to-violet-600' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            className={`bg-gradient-to-br ${metric.color} rounded-xl p-4 text-white relative overflow-hidden`}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="text-lg opacity-80" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-white opacity-60"
                ></motion.div>
              </div>
              <h4 className="text-xs font-medium opacity-90 mb-1">{metric.label}</h4>
              <div className="flex items-end gap-1">
                <motion.span 
                  key={metric.value}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl font-bold"
                >
                  {metric.value}
                </motion.span>
                <span className="text-xs opacity-75">{metric.unit}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced search and filter section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search alerts by title, description, or affected accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3 self-end">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <FaSort className="text-gray-500" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'severity' | 'risk_score')}
                  className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 font-medium"
                >
                  <option value="timestamp">Sort by time</option>
                  <option value="severity">Sort by severity</option>
                  <option value="risk_score">Sort by risk score</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <FaFilter className="text-gray-500" />
                <select 
                  value={selectedSeverity} 
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 font-medium"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Categories selector */}
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3">
          <div className="flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-1">
            {categories.map(category => (
              <motion.button
                key={category}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2.5 rounded-full flex items-center gap-2 whitespace-nowrap transition-all capitalize ${
                  selectedCategory === category 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                }`}
              >
                {{
                  'all': <FaShieldAlt className={selectedCategory === category ? 'text-red-200' : 'text-red-600'} />,
                  'data-breach': <FaDatabase className={selectedCategory === category ? 'text-red-200' : 'text-blue-600'} />,
                  'dark-web': <FaSkull className={selectedCategory === category ? 'text-red-200' : 'text-gray-800'} />,
                  'suspicious-login': <FaUserSecret className={selectedCategory === category ? 'text-red-200' : 'text-purple-600'} />,
                  'phishing': <FaBug className={selectedCategory === category ? 'text-red-200' : 'text-orange-600'} />,
                  'malware': <FaRadiation className={selectedCategory === category ? 'text-red-200' : 'text-red-600'} />
                }[category] || <FaShieldAlt className={selectedCategory === category ? 'text-red-200' : 'text-red-600'} />}
                <span className="font-medium">
                  {category === 'all' ? 'All Threats' : category.replace('-', ' ')}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Security Alerts Section */}
      {filteredAlerts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-12 text-center"
        >
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-50"></div>
            <div className="relative bg-green-50 rounded-full w-full h-full flex items-center justify-center">
              <FaCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">All Clear! No Active Threats</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No security alerts match your current filters. Your accounts are being monitored continuously for any threats.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => {setSelectedCategory('all'); setSelectedSeverity('all'); setSearchQuery('');}} 
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Clear all filters
            </button>
            <button className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
              <FaSync size={12} /> Run Security Scan
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredAlerts.map(alert => {
            const SeverityIcon = getSeverityIcon(alert.severity);
            const TypeIcon = getTypeIcon(alert.type);

            return (
              <motion.div
                key={alert.id}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:border-red-200 transition-colors"
              >
                <div className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'high' ? 'bg-orange-500' :
                    alert.severity === 'medium' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}></div>
                  
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        alert.severity === 'critical' ? 'bg-red-50 text-red-600' :
                        alert.severity === 'high' ? 'bg-orange-50 text-orange-600' :
                        alert.severity === 'medium' ? 'bg-amber-50 text-amber-600' : 
                        'bg-blue-50 text-blue-600'
                      }`}>
                        <SeverityIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{alert.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <TypeIcon className="w-3 h-3" />
                          <span className="capitalize">{alert.type.replace('-', ' ')}</span>
                          <span>•</span>
                          <span>{alert.detectedAt}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-500">Risk: {alert.risk_score}</span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{alert.description}</p>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Affected Accounts</div>
                        <div className="space-y-1">
                          {alert.affectedAccounts.slice(0, 2).map((account, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="font-mono text-xs text-gray-700 truncate flex-1 mr-2">{account}</span>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigator.clipboard.writeText(account)}
                                className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                <FaRegCopy className="w-3 h-3" />
                              </motion.button>
                            </div>
                          ))}
                          {alert.affectedAccounts.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{alert.affectedAccounts.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          alert.status === 'active' ? 'bg-red-500' :
                          alert.status === 'investigating' ? 'bg-amber-500' :
                          alert.status === 'resolved' ? 'bg-green-500' :
                          'bg-gray-400'
                        }`}></div>
                        <span className="text-xs text-gray-500 capitalize">{alert.status}</span>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowThreatDetails(showThreatDetails === alert.id ? null : alert.id)}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <FaChevronRight size={10} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Enhanced Threat Details Modal */}
      <AnimatePresence>
        {showThreatDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            >
              {(() => {
                const alert = breachAlerts.find(a => a.id === showThreatDetails);
                if (!alert) return null;
                const SeverityIcon = getSeverityIcon(alert.severity);
                
                return (
                  <>
                    <div className={`bg-gradient-to-r p-5 flex justify-between items-center ${
                      alert.severity === 'critical' ? 'from-red-600 to-red-700' :
                      alert.severity === 'high' ? 'from-orange-600 to-orange-700' :
                      alert.severity === 'medium' ? 'from-amber-600 to-amber-700' :
                      'from-blue-600 to-blue-700'
                    }`}>
                      <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                        <SeverityIcon className="text-white" />
                        Threat Details
                      </h3>
                      <button 
                        onClick={() => setShowThreatDetails(null)}
                        className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">{alert.title}</h4>
                          <p className="text-gray-600">{alert.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-1">Severity Level</div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium capitalize ${
                              alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                              alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              <SeverityIcon className="w-4 h-4" />
                              {alert.severity}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-1">Risk Score</div>
                            <div className="text-2xl font-bold text-gray-800">{alert.risk_score}/100</div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-800 mb-3">Affected Accounts</h5>
                          <div className="space-y-2">
                            {alert.affectedAccounts.map((account, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-mono text-gray-700">{account}</span>
                                <motion.button 
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => navigator.clipboard.writeText(account)}
                                  className="p-2 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                  <FaRegCopy />
                                </motion.button>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-800 mb-3">Recommended Actions</h5>
                          <div className="space-y-3">
                            {alert.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <div className="p-1.5 bg-blue-100 rounded-full text-blue-600 mt-0.5">
                                  <FaBullseye className="w-3 h-3" />
                                </div>
                                <span className="text-sm text-gray-700 flex-1">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setShowThreatDetails(null)}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                          >
                            Close
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm"
                          >
                            Mark as Resolved
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Scan Modal */}
      <AnimatePresence>
        {showFullScanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-5 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <FaShieldAlt className="text-white" />
                  {scanResults.status === 'completed' ? 'Scan Complete' : 'Full Security Scan'}
                </h3>
                <button 
                  onClick={() => setShowFullScanModal(false)}
                  className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                  disabled={isScanning}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6">
                {isScanning ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4"
                      >
                        <FaSync className="text-3xl text-red-600" />
                      </motion.div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Scanning in Progress...</h4>
                      <p className="text-gray-600">Please wait while we scan your accounts and data for security threats.</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">Progress</span>
                        <span className="text-red-600 font-semibold">{Math.round(scanProgress)}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${scanProgress}%` }}
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Live Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <FaDatabase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{scanResults.scannedItems.toLocaleString()}</div>
                        <div className="text-xs text-gray-600 mt-1">Items Scanned</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <FaExclamationTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{scanResults.threatsFound}</div>
                        <div className="text-xs text-gray-600 mt-1">Threats Found</div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4 text-center">
                        <FaBug className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{scanResults.vulnerabilities}</div>
                        <div className="text-xs text-gray-600 mt-1">Vulnerabilities</div>
                      </div>
                    </div>

                    {/* Scanning Activity */}
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
                          <FaChevronRight className="text-red-600" size={10} />
                          <span>Scanning dark web databases...</span>
                        </motion.div>
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          className="flex items-center gap-2"
                        >
                          <FaChevronRight className="text-red-600" size={10} />
                          <span>Checking for data breaches...</span>
                        </motion.div>
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                          className="flex items-center gap-2"
                        >
                          <FaChevronRight className="text-red-600" size={10} />
                          <span>Analyzing password security...</span>
                        </motion.div>
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
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Security Scan Complete!</h4>
                      <p className="text-gray-600">We've completed a comprehensive security scan of your accounts.</p>
                    </div>

                    {/* Final Results */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
                        <FaDatabase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{scanResults.scannedItems.toLocaleString()}</div>
                        <div className="text-xs text-gray-600 mt-1">Items Scanned</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center border-2 border-red-200">
                        <FaExclamationTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{scanResults.threatsFound}</div>
                        <div className="text-xs text-gray-600 mt-1">Threats Found</div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4 text-center border-2 border-amber-200">
                        <FaBug className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{scanResults.vulnerabilities}</div>
                        <div className="text-xs text-gray-600 mt-1">Vulnerabilities</div>
                      </div>
                    </div>

                    {/* Scan Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FaShieldAlt className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">Scan Summary</h5>
                          <p className="text-sm text-gray-600">
                            {scanResults.threatsFound > 0 
                              ? `We found ${scanResults.threatsFound} potential threat${scanResults.threatsFound > 1 ? 's' : ''} and ${scanResults.vulnerabilities} vulnerabilit${scanResults.vulnerabilities !== 1 ? 'ies' : 'y'}. Review the alerts above for details.`
                              : 'Great news! No new threats or vulnerabilities were detected during this scan.'}
                          </p>
                          {scanResults.threatsFound > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <FaCheckCircle className="text-green-600" size={14} />
                                <span className="text-gray-700">All detected threats have been logged</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <FaCheckCircle className="text-green-600" size={14} />
                                <span className="text-gray-700">Security recommendations generated</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowFullScanModal(false)}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Close
                      </motion.button>
                      {scanResults.threatsFound > 0 && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowFullScanModal(false);
                            setSelectedCategory('all');
                            setSelectedSeverity('all');
                          }}
                          className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm flex items-center gap-2"
                        >
                          <FaEye /> View All Threats
                        </motion.button>
                      )}
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

export default Monitoring;
