import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaKey, FaEye, FaEyeSlash, FaCopy, FaEdit, FaTrash, FaPlus, 
  FaSearch, FaFilter, FaSort, FaShieldAlt, FaDice, FaFolder, FaCreditCard, FaIdCard, FaAddressCard, FaFileAlt,
  FaExclamationTriangle, FaCheckCircle, FaChevronRight, FaTimes, FaLock,FaGlobe,FaRocket,
  FaFingerprint, FaUserShield, FaDigitalTachograph, FaRegCopy, FaRegCheckCircle,
  FaClipboard, FaClipboardCheck, FaDatabase, FaAngleRight, FaInfoCircle, FaCog
} from 'react-icons/fa';

interface Password {
  id: number;
  title: string;
  username: string;
  password: string;
  lastUpdated: string;
  category: string;
  strength: 'weak' | 'medium' | 'strong';
  notes?: string;
  passType: 'account' | 'payment' | 'identity' | 'license' | 'document';
  expiryDate?: string;
  issuer?: string;
}

const Passwords = () => {
  const [passwords, setPasswords] = useState([
    { 
      id: 1, 
      title: 'Online Banking Pass',
      username: 'john.doe',
      password: '********',
      lastUpdated: '2 days ago',
      category: 'finance',
      strength: 'strong',
      passType: 'account',
      issuer: 'Chase Bank',
      notes: 'Main banking account credentials'
    },
    { 
      id: 2, 
      title: 'Passport Credentials',
      username: 'PASS123456',
      password: '********',
      lastUpdated: '1 month ago',
      category: 'identity',
      strength: 'strong',
      passType: 'document',
      expiryDate: '2028-12-31',
      issuer: 'Department of State'
    },
    { 
      id: 3, 
      title: 'Driver License',
      username: 'DL98765432',
      password: '********',
      lastUpdated: '3 months ago',
      category: 'identity',
      strength: 'medium',
      passType: 'license',
      expiryDate: '2025-06-30',
      issuer: 'DMV'
    },
    { 
      id: 4, 
      title: 'Credit Card PIN',
      username: '**** **** **** 1234',
      password: '****',
      lastUpdated: '1 week ago',
      category: 'payment',
      strength: 'strong',
      passType: 'payment',
      expiryDate: '2026-05',
      issuer: 'Visa'
    },
    {
      id: 5,
      title: 'SSN Information',
      username: '***-**-1234',
      password: '********',
      lastUpdated: '6 months ago',
      category: 'identity',
      strength: 'strong',
      passType: 'document',
      issuer: 'Social Security Administration'
    }
  ]);

  const [showPassword, setShowPassword] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'lastUpdated'>('title');
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null);

  const categories = ['all', 'identity', 'payment', 'finance', 'license', 'document'];

  const [passwordOptions, setPasswordOptions] = useState({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [platformSpecificPassword, setPlatformSpecificPassword] = useState('');

  const generatePassword = () => {
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let chars = '';
    if (passwordOptions.includeUppercase) chars += charset.uppercase;
    if (passwordOptions.includeLowercase) chars += charset.lowercase;
    if (passwordOptions.includeNumbers) chars += charset.numbers;
    if (passwordOptions.includeSymbols) chars += charset.symbols;

    let password = '';
    for (let i = 0; i < passwordOptions.length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
  };

  const generatePlatformSpecificPassword = () => {
    if (!websiteUrl.trim()) {
      setPlatformSpecificPassword('');
      return;
    }

    // Extract domain from URL
    let domain = '';
    try {
      const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
      domain = url.hostname.replace('www.', '');
    } catch {
      domain = websiteUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }

    // Platform-specific password rules
    const platformRules: { [key: string]: { length: number; symbols: boolean; numbers: boolean; uppercase: boolean } } = {
      'facebook.com': { length: 16, symbols: true, numbers: true, uppercase: true },
      'instagram.com': { length: 14, symbols: true, numbers: true, uppercase: true },
      'twitter.com': { length: 15, symbols: true, numbers: true, uppercase: true },
      'x.com': { length: 15, symbols: true, numbers: true, uppercase: true },
      'linkedin.com': { length: 16, symbols: true, numbers: true, uppercase: true },
      'google.com': { length: 20, symbols: true, numbers: true, uppercase: true },
      'gmail.com': { length: 20, symbols: true, numbers: true, uppercase: true },
      'yahoo.com': { length: 18, symbols: true, numbers: true, uppercase: true },
      'outlook.com': { length: 18, symbols: true, numbers: true, uppercase: true },
      'github.com': { length: 16, symbols: true, numbers: true, uppercase: true },
      'stackoverflow.com': { length: 16, symbols: true, numbers: true, uppercase: true },
      'reddit.com': { length: 15, symbols: true, numbers: true, uppercase: true },
      'youtube.com': { length: 16, symbols: true, numbers: true, uppercase: true },
      'netflix.com': { length: 14, symbols: true, numbers: true, uppercase: true },
      'amazon.com': { length: 16, symbols: true, numbers: true, uppercase: true },
      'paypal.com': { length: 20, symbols: true, numbers: true, uppercase: true },
      'apple.com': { length: 18, symbols: true, numbers: true, uppercase: true },
      'microsoft.com': { length: 18, symbols: true, numbers: true, uppercase: true },
      'dropbox.com': { length: 16, symbols: true, numbers: true, uppercase: true },
      'twitch.tv': { length: 15, symbols: true, numbers: true, uppercase: true },
      'discord.com': { length: 16, symbols: true, numbers: true, uppercase: true },
      'slack.com': { length: 16, symbols: true, numbers: true, uppercase: true },
      'zoom.us': { length: 16, symbols: true, numbers: true, uppercase: true },
      'default': { length: 14, symbols: true, numbers: true, uppercase: true }
    };

    const rules = platformRules[domain] || platformRules['default'];
    
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let chars = charset.lowercase; // Always include lowercase
    if (rules.uppercase) chars += charset.uppercase;
    if (rules.numbers) chars += charset.numbers;
    if (rules.symbols) chars += charset.symbols;

    let password = '';
    
    // Ensure at least one character from each required type
    if (rules.uppercase) password += charset.uppercase.charAt(Math.floor(Math.random() * charset.uppercase.length));
    if (rules.numbers) password += charset.numbers.charAt(Math.floor(Math.random() * charset.numbers.length));
    if (rules.symbols) password += charset.symbols.charAt(Math.floor(Math.random() * charset.symbols.length));
    password += charset.lowercase.charAt(Math.floor(Math.random() * charset.lowercase.length));

    // Fill the rest randomly
    for (let i = password.length; i < rules.length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setPlatformSpecificPassword(password);
  };

  const getPlatformInfo = (url: string) => {
    if (!url) return null;
    
    let domain = '';
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = urlObj.hostname.replace('www.', '');
    } catch {
      domain = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }

    const platformInfo: { [key: string]: { name: string; color: string; icon: string } } = {
      'facebook.com': { name: 'Facebook', color: 'bg-blue-600', icon: '📘' },
      'instagram.com': { name: 'Instagram', color: 'bg-gradient-to-r from-purple-400 to-pink-400', icon: '📷' },
      'twitter.com': { name: 'Twitter/X', color: 'bg-black', icon: '🐦' },
      'x.com': { name: 'X (Twitter)', color: 'bg-black', icon: '❌' },
      'linkedin.com': { name: 'LinkedIn', color: 'bg-blue-700', icon: '💼' },
      'google.com': { name: 'Google', color: 'bg-red-500', icon: '🔍' },
      'gmail.com': { name: 'Gmail', color: 'bg-red-500', icon: '📧' },
      'github.com': { name: 'GitHub', color: 'bg-gray-800', icon: '💻' },
      'youtube.com': { name: 'YouTube', color: 'bg-red-600', icon: '📹' },
      'netflix.com': { name: 'Netflix', color: 'bg-red-600', icon: '🎬' },
      'amazon.com': { name: 'Amazon', color: 'bg-orange-500', icon: '🛒' },
      'paypal.com': { name: 'PayPal', color: 'bg-blue-500', icon: '💳' },
      'apple.com': { name: 'Apple', color: 'bg-gray-900', icon: '🍎' },
      'microsoft.com': { name: 'Microsoft', color: 'bg-blue-600', icon: '🏢' },
      'dropbox.com': { name: 'Dropbox', color: 'bg-blue-500', icon: '📦' },
      'discord.com': { name: 'Discord', color: 'bg-indigo-600', icon: '🎮' },
      'slack.com': { name: 'Slack', color: 'bg-purple-600', icon: '💬' },
      'zoom.us': { name: 'Zoom', color: 'bg-blue-500', icon: '📹' }
    };

    return platformInfo[domain] || { name: domain, color: 'bg-gray-500', icon: '🌐' };
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPasswordStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'weak': 
        return <span className="flex items-center text-red-500 text-xs font-medium">
          <FaExclamationTriangle className="mr-1" /> Weak
        </span>;
      case 'medium': 
        return <span className="flex items-center text-yellow-500 text-xs font-medium">
          <FaShieldAlt className="mr-1" /> Medium
        </span>;
      case 'strong': 
        return <span className="flex items-center text-green-500 text-xs font-medium">
          <FaCheckCircle className="mr-1" /> Strong
        </span>;
      default: return null;
    }
  };

  const filteredPasswords = useMemo(() => {
    return passwords
      .filter(p => 
        (selectedCategory === 'all' || p.category === selectedCategory) &&
        (p.title.toLowerCase().includes(search.toLowerCase()) ||
         p.username.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
  }, [passwords, search, selectedCategory, sortBy]);

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const enhancedCopyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(identifier);
    
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  const getPassTypeIcon = (passType: string) => {
    switch (passType) {
      case 'payment': return <FaCreditCard className="text-green-600" />;
      case 'identity': return <FaIdCard className="text-blue-600" />;
      case 'license': return <FaAddressCard className="text-purple-600" />;
      case 'document': return <FaFileAlt className="text-orange-600" />;
      default: return <FaKey className="text-indigo-600" />;
    }
  };

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
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
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
    <div className="space-y-8 -mt-4"> {/* Increased spacing between sections */}
      {/* Enhanced header section with more visual appeal */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-purple-300 opacity-10 rounded-full translate-y-1/3"></div>
        
        <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-3 mb-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <FaFingerprint className="text-blue-200" />
              <span className="text-xs font-medium text-blue-50">End-to-End Encrypted</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaLock className="text-blue-200" /> 
              <span>Secured Vault</span>
            </h2>
            
            <p className="text-indigo-100 mt-1.5 max-w-lg">
              Safely store and manage all your sensitive credentials
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
              className="px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium rounded-lg transition-all flex items-center gap-2 border border-white/20"
            >
              <FaDice className="text-blue-200" /> Generate Password
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedPassword(null);
                setShowAddEditModal(true);
              }}
              className="px-4 py-2.5 bg-white text-indigo-700 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <FaPlus /> Add New Item
            </motion.button>
          </div>
        </div>
      </div>

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
                placeholder="Search by title, username, or issuer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3 self-end">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <FaSort className="text-gray-500" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'title' | 'lastUpdated')}
                  className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 font-medium"
                >
                  <option value="title">Sort by name</option>
                  <option value="lastUpdated">Sort by last updated</option>
                </select>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="p-3.5 rounded-xl transition-all hover:bg-gray-100 border border-gray-200"
              >
                <FaFilter className="text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Categories selector with pill design */}
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
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                }`}
              >
                {{
                  'all': <FaDatabase className={selectedCategory === category ? 'text-indigo-200' : 'text-indigo-600'} />,
                  'identity': <FaIdCard className={selectedCategory === category ? 'text-indigo-200' : 'text-blue-600'} />,
                  'payment': <FaCreditCard className={selectedCategory === category ? 'text-indigo-200' : 'text-green-600'} />,
                  'finance': <FaFolder className={selectedCategory === category ? 'text-indigo-200' : 'text-amber-600'} />,
                  'license': <FaAddressCard className={selectedCategory === category ? 'text-indigo-200' : 'text-purple-600'} />,
                  'document': <FaFileAlt className={selectedCategory === category ? 'text-indigo-200' : 'text-orange-600'} />
                }[category] || <FaDatabase className={selectedCategory === category ? 'text-indigo-200' : 'text-indigo-600'} />}
                <span className="font-medium">{category === 'all' ? 'All Items' : category}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced password generator */}
      <AnimatePresence>
        {showPasswordGenerator && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 border-b border-indigo-100 flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center text-indigo-800">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <FaLock className="text-indigo-600" />
                </div>
                Password Generator
              </h3>
              <button 
                onClick={() => setShowPasswordGenerator(false)}
                className="p-2 hover:bg-white/50 rounded-full text-indigo-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Website URL Input for Platform-Specific Generation */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Website URL (Optional - for platform-specific passwords)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value);
                      setPlatformSpecificPassword('');
                    }}
                    placeholder="e.g., facebook.com, github.com, netflix.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <FaGlobe className="text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Leave empty for generic password or enter a website to generate platform-optimized password
                </p>
              </div>

              {/* Platform Recognition */}
              {websiteUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg ${getPlatformInfo(websiteUrl)?.color || 'bg-gray-500'}`}>
                      {getPlatformInfo(websiteUrl)?.icon || '🌐'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-indigo-800">
                        {getPlatformInfo(websiteUrl)?.name || 'Custom Platform'}
                      </h4>
                      <p className="text-sm text-indigo-600">
                        Platform recognized • Optimized password rules applied
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 flex items-center">
                <input 
                  type="text" 
                  readOnly 
                  value={websiteUrl ? platformSpecificPassword : generatedPassword}
                  placeholder={websiteUrl ? "Platform-specific password will appear here" : "Your secure password will appear here"}
                  className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-lg"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => enhancedCopyToClipboard(websiteUrl ? platformSpecificPassword : generatedPassword, 'generated')}
                  className="p-2.5 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-gray-700 font-medium"
                  title="Copy to clipboard"
                >
                  {copiedText === 'generated' ? (
                    <>
                      <FaClipboardCheck className="text-green-600" /> 
                      <span className="text-sm text-green-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FaClipboard /> 
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </motion.button>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-medium text-gray-800">Password Length</label>
                  <span className="text-sm font-mono bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded">
                    {passwordOptions.length} chars
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={passwordOptions.length}
                  onChange={(e) => setPasswordOptions({
                    ...passwordOptions,
                    length: parseInt(e.target.value)
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>8</span>
                  <span>20</span>
                  <span>32</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.label 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={passwordOptions.includeUppercase}
                    onChange={() => setPasswordOptions({
                      ...passwordOptions,
                      includeUppercase: !passwordOptions.includeUppercase
                    })}
                    className="rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Uppercase Letters</div>
                    <div className="text-xs text-gray-500">A-Z</div>
                  </div>
                </motion.label>
                
                <motion.label 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={passwordOptions.includeLowercase}
                    onChange={() => setPasswordOptions({
                      ...passwordOptions,
                      includeLowercase: !passwordOptions.includeLowercase
                    })}
                    className="rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Lowercase Letters</div>
                    <div className="text-xs text-gray-500">a-z</div>
                  </div>
                </motion.label>
                
                <motion.label 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={passwordOptions.includeNumbers}
                    onChange={() => setPasswordOptions({
                      ...passwordOptions,
                      includeNumbers: !passwordOptions.includeNumbers
                    })}
                    className="rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Numbers</div>
                    <div className="text-xs text-gray-500">0-9</div>
                  </div>
                </motion.label>
                
                <motion.label 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={passwordOptions.includeSymbols}
                    onChange={() => setPasswordOptions({
                      ...passwordOptions,
                      includeSymbols: !passwordOptions.includeSymbols
                    })}
                    className="rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Special Characters</div>
                    <div className="text-xs text-gray-500">!@#$%^&*</div>
                  </div>
                </motion.label>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-700 mr-3">
                  <FaInfoCircle />
                </div>
                <p className="text-sm text-blue-700">
                  Strong passwords should be at least 12 characters and include a mix of letters, numbers, and symbols.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={websiteUrl ? generatePlatformSpecificPassword : generatePassword}
                  className="flex-1 px-5 py-3.5 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                  <FaDice /> {websiteUrl ? 'Generate Platform Password' : 'Generate Strong Password'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const currentPassword = websiteUrl ? platformSpecificPassword : generatedPassword;
                    if (currentPassword && selectedPassword) {
                      // Logic to use the generated password
                      setShowPasswordGenerator(false);
                    }
                  }}
                  disabled={!(websiteUrl ? platformSpecificPassword : generatedPassword) || !selectedPassword}
                  className={`px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 font-medium ${
                    (websiteUrl ? platformSpecificPassword : generatedPassword) && selectedPassword 
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaCheckCircle /> Use This Password
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {filteredPasswords.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-12 text-center"
        >
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-50"></div>
            <div className="relative bg-indigo-50 rounded-full w-full h-full flex items-center justify-center">
              <FaSearch className="text-indigo-400 text-2xl" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No credentials found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No items match your current search or filters. Try adjusting your criteria or add a new item to your vault.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => {setSelectedCategory('all'); setSearch('');}} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Clear filters
            </button>
            <button 
              onClick={() => {
                setSelectedPassword(null);
                setShowAddEditModal(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FaPlus size={12} /> Add New Item
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredPasswords.map(password => (
            <motion.div
              key={password.id}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:border-indigo-200 transition-colors"
            >
              <div className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  password.strength === 'strong' ? 'bg-green-500' :
                  password.strength === 'medium' ? 'bg-amber-500' :
                  'bg-red-500'
                }`}></div>
                
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      password.passType === 'payment' ? 'bg-green-50 text-green-600' :
                      password.passType === 'identity' ? 'bg-blue-50 text-blue-600' :
                      password.passType === 'license' ? 'bg-purple-50 text-purple-600' : 
                      password.passType === 'document' ? 'bg-orange-50 text-orange-600' : 
                      'bg-indigo-50 text-indigo-600'
                    }`}>
                      {getPassTypeIcon(password.passType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{password.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{password.issuer}</span>
                        {password.expiryDate && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                            Expires {new Date(password.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors"
                      onClick={() => {
                        setSelectedPassword(password as Password);
                        setShowAddEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this item?")) {
                          setPasswords(passwords.filter(p => p.id !== password.id));
                        }
                      }}
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Username</div>
                        <div className="font-medium">{password.username}</div>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => enhancedCopyToClipboard(password.username, `user-${password.id}`)}
                        className={`p-2 rounded-lg transition-colors ${
                          copiedText === `user-${password.id}` 
                            ? 'bg-green-100 text-green-600' 
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {copiedText === `user-${password.id}` ? <FaRegCheckCircle /> : <FaRegCopy />}
                      </motion.button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Password</div>
                        <div className="font-medium font-mono">
                          {showPassword === password.id ? password.password : '••••••••'}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowPassword(showPassword === password.id ? null : password.id)}
                          className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                        >
                          {showPassword === password.id ? <FaEyeSlash /> : <FaEye />}
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => enhancedCopyToClipboard(password.password, `pass-${password.id}`)}
                          className={`p-2 rounded-lg transition-colors ${
                            copiedText === `pass-${password.id}` 
                              ? 'bg-green-100 text-green-600' 
                              : 'hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          {copiedText === `pass-${password.id}` ? <FaRegCheckCircle /> : <FaRegCopy />}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <span className="text-xs text-gray-500">Last updated {password.lastUpdated}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5
                      ${password.strength === 'strong' ? 'bg-green-50 text-green-700' : 
                        password.strength === 'medium' ? 'bg-amber-50 text-amber-700' : 
                        'bg-red-50 text-red-700'
                      }`}
                    >
                      {password.strength === 'strong' ? <FaCheckCircle size={10} /> : 
                       password.strength === 'medium' ? <FaShieldAlt size={10} /> : 
                       <FaExclamationTriangle size={10} />}
                      {password.strength.charAt(0).toUpperCase() + password.strength.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Enhanced Add/Edit Modal */}
      <AnimatePresence>
        {showAddEditModal && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  {selectedPassword ? (
                    <>
                      <FaEdit /> Edit Credential
                    </>
                  ) : (
                    <>
                      <FaPlus /> Add New Credential
                    </>
                  )}
                </h3>
                <button 
                  onClick={() => setShowAddEditModal(false)}
                  className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                <form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input 
                      type="text" 
                      defaultValue={selectedPassword?.title}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 py-3" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select 
                        defaultValue={selectedPassword?.category}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="finance">Finance</option>
                        <option value="identity">Identity</option>
                        <option value="payment">Payment</option>
                        <option value="license">License</option>
                        <option value="document">Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Credential Type</label>
                      <select 
                        defaultValue={selectedPassword?.passType}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="account">Account</option>
                        <option value="payment">Payment</option>
                        <option value="identity">Identity</option>
                        <option value="license">License</option>
                        <option value="document">Document</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issuer/Organization</label>
                    <input 
                      type="text" 
                      defaultValue={selectedPassword?.issuer}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 py-3" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username/ID</label>
                    <input 
                      type="text" 
                      defaultValue={selectedPassword?.username}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 py-3" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        defaultValue={selectedPassword?.password}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 py-3 pr-10" 
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
                          <FaEye />
                        </button>
                        <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
                          <FaDice className="ml-1" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1.5 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${
                            selectedPassword?.strength === 'strong' ? 'bg-green-500 w-full' : 
                            selectedPassword?.strength === 'medium' ? 'bg-amber-500 w-2/3' : 
                            'bg-red-500 w-1/3'
                          }`}></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {selectedPassword?.strength === 'strong' ? 'Strong password' : 
                          selectedPassword?.strength === 'medium' ? 'Medium strength' : 
                          'Weak password'}
                        </span>
                      </div>
                      <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                        Generate
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input 
                      type="date" 
                      defaultValue={selectedPassword?.expiryDate}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea 
                      defaultValue={selectedPassword?.notes}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50" 
                      rows={3}
                    ></textarea>
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowAddEditModal(false)}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
                    >
                      {selectedPassword ? 'Update' : 'Save'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Passwords;
