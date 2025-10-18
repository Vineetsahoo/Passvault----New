import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaWindows, FaApple, FaAndroid, FaLinux, FaDownload, 
  FaShieldAlt, FaSync, FaGlobe, FaChevronDown, FaChevronUp, 
  FaCheckCircle, FaInfoCircle, FaCloudDownloadAlt, FaStar,
  FaDesktop, FaLaptop, FaMobile, FaServer
} from 'react-icons/fa';
// Import Navbar and Footer
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DownloadNow = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const platforms = [
    {
      name: 'Windows',
      icon: FaWindows,
      version: '2.1.0',
      size: '45 MB',
      link: '#windows-download',
      color: "from-blue-500 to-cyan-500",
      deviceIcon: FaDesktop
    },
    {
      name: 'macOS',
      icon: FaApple,
      version: '2.1.0',
      size: '42 MB',
      link: '#macos-download',
      color: "from-violet-500 to-purple-500",
      deviceIcon: FaLaptop
    },
    {
      name: 'Android',
      icon: FaAndroid,
      version: '2.0.9',
      size: '25 MB',
      link: '#android-download',
      color: "from-green-500 to-emerald-500",
      deviceIcon: FaMobile
    },
    {
      name: 'Linux',
      icon: FaLinux,
      version: '2.1.0',
      size: '40 MB',
      link: '#linux-download',
      color: "from-orange-500 to-amber-500",
      deviceIcon: FaServer
    }
  ];

  const features = [
    { icon: FaShieldAlt, title: 'Secure Storage', description: 'Military-grade encryption for your passwords and sensitive data', color: "from-violet-500 to-indigo-600" },
    { icon: FaSync, title: 'Auto Sync', description: 'Seamless synchronization across all your devices in real-time', color: "from-blue-500 to-indigo-600" },
    { icon: FaGlobe, title: 'Global Access', description: 'Access your passwords securely from anywhere in the world', color: "from-indigo-500 to-purple-600" }
  ];

  const releaseNotes = {
    Windows: ['Enhanced security features', 'Performance improvements', 'Bug fixes'],
    macOS: ['Native Apple Silicon support', 'Dark mode improvements', 'Security updates'],
    Android: ['UI/UX enhancements', 'Faster sync speed', 'Battery optimization'],
    Linux: ['New package manager support', 'System tray improvements', 'Security patches']
  };

  const downloadStats = {
    totalDownloads: '1M+',
    activeUsers: '500K+',
    rating: 4.8
  };

  const handleDownload = (platform: string) => {
    setSelectedPlatform(platform);
    setDownloadStarted(true);
    setTimeout(() => {
      setDownloadStarted(false);
      setSelectedPlatform(null);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-3 border-violet-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-5 rounded-full bg-white flex items-center justify-center">
              <FaDownload className="h-7 w-7 text-violet-600" />
            </div>
          </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-lg">Preparing your download...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add Navbar at the top */}
      <Navbar />
      
      {/* Add spacing for fixed navbar */}
      <div className="h-20"></div>
      
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden font-opensans">
        {/* Modern background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(124,58,237,0.08),transparent)]" />
        
        {/* Decorative elements */}
        <div className="absolute top-40 right-0 w-96 h-96 bg-violet-100/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl -z-10" />
        
        <section className="relative py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            {/* Enhanced header section */}
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 bg-violet-100 text-violet-800 rounded-full text-sm font-medium inline-block mb-4">
                GET STARTED
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                Download PassVault
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose your platform and start securing your digital life today
              </p>
            </div>

            {/* Download Stats with Modern Card Design */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto"
            >
              {Object.entries(downloadStats).map(([key, value], index) => (
                <motion.div
                  key={key}
                  whileHover={{ y: -5 }}
                  className="backdrop-blur-sm bg-white/90 rounded-2xl overflow-hidden shadow-lg border border-slate-100/80 p-6 text-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                    className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mb-2"
                  >
                    {key === 'rating' ? `${value}` : value}
                  </motion.div>
                  <p className="text-slate-600 font-medium">
                    {key === 'rating' ? (
                      <div className="flex items-center justify-center">
                        <span>User Rating</span>
                        <FaStar className="text-yellow-400 ml-1" />
                      </div>
                    ) : key === 'totalDownloads' ? 'Downloads' : 'Active Users'}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Download Options with Enhanced Card Design */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            >
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -8 }}
                  transition={{
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10
                  }}
                  className="backdrop-blur-sm bg-white/90 rounded-2xl overflow-hidden shadow-lg border border-slate-100/80 group relative h-full"
                >
                  {/* Decorative top bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${platform.color}`}></div>
                  
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-5">
                      <div className={`bg-gradient-to-br ${platform.color} text-white p-3 rounded-xl shadow-lg`}>
                        <platform.icon className="text-xl" />
                      </div>
                      <div className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-1 rounded">
                        v{platform.version}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 text-slate-800">{platform.name}</h3>
                    <div className="text-violet-600 text-sm mb-auto">{platform.size}</div>
                    
                    <div className="text-xs text-slate-500 mb-3 flex items-center mt-3">
                      <platform.deviceIcon className="mr-1" />
                      <span>Compatible with all {platform.name} devices</span>
                    </div>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(platform.name)}
                      className={`w-full bg-gradient-to-r ${platform.color} text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg`}
                      disabled={downloadStarted}
                    >
                      {selectedPlatform === platform.name && downloadStarted ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                          <span>Downloading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <FaCloudDownloadAlt className="text-lg" />
                          <span>Download</span>
                        </div>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Features Section with Modern Card Design */}
            <div className="mb-24">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                  Key Features
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Experience the power of PassVault on any device
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.2 }}
                    whileHover={{ y: -8 }}
                    className="backdrop-blur-sm bg-white/90 p-8 rounded-2xl overflow-hidden shadow-lg border border-slate-100/80 relative group"
                  >
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100/50 to-indigo-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    
                    <div className={`bg-gradient-to-br ${feature.color} text-white p-4 rounded-xl inline-block mb-5 shadow-lg relative z-10`}>
                      <feature.icon className="text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800 relative z-10">{feature.title}</h3>
                    <p className="text-lg text-slate-700 relative z-10 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Enhanced Release Notes Toggle */}
            <div className="mb-16 max-w-4xl mx-auto backdrop-blur-sm bg-white/90 rounded-2xl overflow-hidden shadow-lg border border-slate-100/80">
              <motion.button
                whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.05)" }}
                onClick={() => setShowReleaseNotes(!showReleaseNotes)}
                className="w-full p-6 text-left flex justify-between items-center transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white p-3 rounded-xl shadow-lg">
                    <FaInfoCircle className="text-2xl" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">Release Notes</span>
                </div>
                <div className={`bg-violet-100 rounded-full p-2 transition-transform duration-300 ${showReleaseNotes ? 'rotate-180' : ''}`}>
                  <FaChevronDown className="text-violet-600 text-lg" />
                </div>
              </motion.button>

              {/* Release Notes Content */}
              {showReleaseNotes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(releaseNotes).map(([platform, notes]) => (
                      <div key={platform} className="bg-slate-50 p-5 rounded-lg">
                        <h3 className="font-bold mb-3 flex items-center text-lg">
                          {platform === 'Windows' && <FaWindows className="mr-3 text-blue-500 text-xl" />}
                          {platform === 'macOS' && <FaApple className="mr-3 text-purple-500 text-xl" />}
                          {platform === 'Android' && <FaAndroid className="mr-3 text-green-500 text-xl" />}
                          {platform === 'Linux' && <FaLinux className="mr-3 text-orange-500 text-xl" />}
                          {platform}
                        </h3>
                        <ul className="space-y-2">
                          {notes.map((note, i) => (
                            <li key={i} className="flex items-start">
                              <FaCheckCircle className="text-violet-500 mt-1 mr-3 flex-shrink-0 text-base" />
                              <span className="text-slate-700 text-base">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* System Requirements with Modern Card Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                  System Requirements
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Check if your device meets the minimum requirements
                </p>
              </div>
              
              <div className="backdrop-blur-sm bg-white/90 rounded-2xl overflow-hidden shadow-lg border border-slate-100/80 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-4">
                      <FaWindows className="text-blue-500 text-2xl" />
                      <h3 className="font-bold text-slate-800 text-xl">Windows</h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mr-3"></div>
                        Windows 10 or later
                      </li>
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mr-3"></div>
                        4GB RAM
                      </li>
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mr-3"></div>
                        100MB free space
                      </li>
                    </ul>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-4">
                      <FaApple className="text-purple-500 text-2xl" />
                      <h3 className="font-bold text-slate-800 text-xl">macOS</h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-purple-500 rounded-full mr-3"></div>
                        macOS 10.15 or later
                      </li>
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-purple-500 rounded-full mr-3"></div>
                        4GB RAM
                      </li>
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-purple-500 rounded-full mr-3"></div>
                        100MB free space
                      </li>
                    </ul>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-4">
                      <FaAndroid className="text-green-500 text-2xl" />
                      <h3 className="font-bold text-slate-800 text-xl">Android</h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                        Android 8.0 or later
                      </li>
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                        2GB RAM
                      </li>
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                        50MB free space
                      </li>
                    </ul>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-4">
                      <FaLinux className="text-orange-500 text-2xl" />
                      <h3 className="font-bold text-slate-800 text-xl">Linux</h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-orange-500 rounded-full mr-3"></div>
                        Ubuntu 20.04 or later
                      </li>
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-orange-500 rounded-full mr-3"></div>
                        4GB RAM
                      </li>
                      <li className="flex items-center text-slate-700 text-base">
                        <div className="h-2 w-2 bg-orange-500 rounded-full mr-3"></div>
                        100MB free space
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>

      {/* Add Footer at the bottom */}
      <Footer />
    </>
  );
};

export default DownloadNow;
