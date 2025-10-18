import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, QrCode, Clock, RefreshCw, Users, ArrowRight, Check, Star, ChevronRight, Lock, Zap } from 'lucide-react';
// Add imports for Navbar and Footer
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Pattern from '../components/ui/Pattern';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure Storage',
      description: 'Your passes are encrypted and stored securely in our vault.',
      link: '/features/secure-storage'
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: 'Multi-Device Access',
      description: 'Access your passes from any device, anywhere.',
      link: '/features/multi-device'
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: 'QR Code Scanning',
      description: 'Quickly scan and store passes using your device camera.',
      link: '/features/qr-scan'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Expiration Alerts',
      description: 'Never miss an expiration date with smart notifications.',
      link: '/features/alerts'
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: 'Auto-Sync',
      description: 'Changes sync automatically across all your devices.',
      link: '/features/sync'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Pass Sharing',
      description: 'Share passes securely with family and friends.',
      link: '/features/sharing'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-3 border-violet-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-5 rounded-full bg-white flex items-center justify-center">
              <Shield className="h-7 w-7 text-indigo-600" />
            </div>
          </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-lg">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafbff] overflow-hidden font-inter">
      {/* Add Navbar */}
      <Navbar />
      
      {/* Modern Hero Section with Consistent Theme */}
      <section className="relative min-h-[100vh] flex items-center bg-gradient-to-br from-violet-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Modern geometric patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border-2 border-violet-400 rotate-45"></div>
            <div className="absolute top-40 right-32 w-24 h-24 border border-indigo-300 rounded-full"></div>
            <div className="absolute bottom-32 left-1/3 w-40 h-40 border border-purple-200 rotate-12"></div>
            <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-violet-400 rotate-45"></div>
          </div>
          
          {/* Elegant gradient orbs matching theme */}
          <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-transparent blur-[150px] -top-40 -right-20"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-purple-600/20 via-indigo-600/10 to-transparent blur-[120px] top-60 -left-20"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
          
          {/* Modern column elements */}
          <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-violet-400/30 to-transparent"></div>
          <div className="absolute right-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-400/30 to-transparent"></div>
          
          {/* Floating modern elements */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-2 h-16 bg-gradient-to-b from-violet-400/40 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/3 w-2 h-12 bg-gradient-to-b from-indigo-400/40 to-transparent"
            animate={{ opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          
          {/* Animated particles */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-violet-300/40"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  scale: Math.random() * 1 + 0.5,
                  opacity: Math.random() * 0.5 + 0.3
                }}
                animate={{
                  y: [null, Math.random() * -100],
                  opacity: [null, 0]
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: Math.random() * 10 + 10,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
        </div>

        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2,
              }
            }
          }}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 md:pt-10"
        >
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-1/2 text-center lg:text-left">
              
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                }}
                className="mb-6"
              >
                <div className="inline-block px-3 py-1.5 bg-violet-400/10 border border-violet-400/20 rounded-full text-violet-300 text-sm font-medium mb-4 backdrop-blur-sm">
                  PREMIUM DIGITAL VAULT
                </div>
              </motion.div>
              
              <motion.h1 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                }}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-8"
              >
                <span className="text-white">
                  Master Your{' '}
                  <span className="text-violet-300">
                    Digital
                  </span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-indigo-300">
                    Universe
                  </span>
                </span>
              </motion.h1>
              
              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                }}
                className="text-xl text-violet-100/90 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              >
                Experience the pinnacle of digital pass management. Where modern elegance meets cutting-edge security in perfect harmony.
              </motion.p>
              
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                }}
                className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
              >
                <Link
                  to="/download"
                  className="group bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-10 py-5 rounded-xl font-semibold hover:from-violet-400 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 flex items-center justify-center"
                >
                  <Shield className="h-5 w-5 mr-3" />
                  <span>Begin Your Journey</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="inline-flex items-center"
                  >
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </motion.div>
                </Link>
                <Link
                  to="/how-it-works"
                  className="bg-white/10 backdrop-blur-md text-white border border-violet-400/30 px-10 py-5 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  <span>Explore Features</span>
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
            
            {/* Modern App Showcase */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    delay: 0.5,
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100
                  }
                }
              }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 perspective">
                {/* Main showcase with modern frame */}
                <motion.div 
                  className="relative rounded-2xl shadow-2xl shadow-violet-900/50 border-4 border-violet-400/20 backdrop-blur-lg overflow-hidden"
                  animate={{ 
                    rotateY: [2, -2, 2], 
                    rotateX: [1, -1, 1],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 12,
                    ease: "easeInOut"
                  }}
                >
                  {/* Classical frame overlay */}
                  <div className="absolute inset-0 border-8 border-violet-400/10 rounded-2xl pointer-events-none">
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-violet-400/40"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-violet-400/40"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-violet-400/40"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-violet-400/40"></div>
                  </div>
                  
                  <img 
                    src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80" 
                    alt="PassVault Classical Interface" 
                    className="w-full rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/20 via-transparent to-indigo-900/10 rounded-lg"></div>
                </motion.div>
                 
                {/* Floating modern elements */}
                <motion.div
                  initial={{ x: 40, y: -60 }}
                  animate={{ x: 60, y: -80 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 6
                  }}
                  className="absolute right-0 top-1/4 hidden md:block"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-violet-400/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-violet-400/20 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-violet-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Military-Grade Security</p>
                        <div className="flex mt-1">
                          <div className="h-1.5 w-6 rounded-full bg-violet-400"></div>
                          <div className="h-1.5 w-4 rounded-full bg-violet-300 ml-0.5"></div>
                          <div className="h-1.5 w-2 rounded-full bg-violet-200 ml-0.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ x: -30, y: 60 }}
                  animate={{ x: -50, y: 80 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 6,
                    delay: 0.5
                  }}
                  className="absolute left-0 bottom-1/3 hidden md:block"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-indigo-400/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-400/20 flex items-center justify-center">
                        <Check className="h-5 w-5 text-indigo-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Auto-Synchronized</p>
                        <p className="text-xs text-violet-200">Across all devices</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Modern decorative elements */}
                <motion.div
                  animate={{ y: [-10, 0, -10] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -top-8 left-8 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full p-3 z-20 shadow-lg"
                >
                  <Shield className="h-6 w-6 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [8, -8, 8] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute -bottom-8 right-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-3 z-20 shadow-lg"
                >
                  <Star className="h-6 w-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Elegant wave separator */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path
              fill="#fafbff"
              fillOpacity="1"
              d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,149.3C840,139,960,149,1080,165.3C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section with Modern Card Design */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafbff] via-violet-50/30 to-[#fafbff]"></div>
        <div className="absolute inset-y-0 left-1/4 w-px bg-gradient-to-b from-transparent via-violet-200/50 to-transparent"></div>
        <div className="absolute inset-y-0 right-1/4 w-px bg-gradient-to-b from-transparent via-indigo-200/50 to-transparent"></div>
        
        {/* Add creative floating shapes */}
        <div className="absolute left-10 top-40 w-32 h-32 rounded-full border border-violet-200/50 animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute right-10 bottom-40 w-40 h-40 rounded-3xl border border-indigo-200/30 animate-[spin_30s_linear_infinite]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
              POWERFUL FEATURES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 px-6">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover why thousands of users trust PassVault for their digital pass management
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl overflow-hidden h-[340px] perspective"
              >
                {/* Card background with gradient and pattern */}
                <div className="absolute inset-0 bg-white rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500 border border-slate-100">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-blue-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative h-full flex flex-col p-8">
                  {/* Icon with 3D effect */}
                  <div className="mb-6 relative">
                    <div className="absolute -inset-1.5 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-xl blur-sm"></div>
                    <div className="relative bg-gradient-to-br from-violet-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
                      {React.cloneElement(feature.icon, { className: "h-8 w-8" })}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-violet-700 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-8 group-hover:text-gray-900 transition-colors flex-grow">
                    {feature.description}
                  </p>
                  
                  <Link 
                    to={feature.link} 
                    className="inline-flex items-center text-indigo-600 font-medium group/link transition-all"
                  >
                    <span className="border-b border-transparent group-hover/link:border-indigo-600 transition-all">
                      Learn more
                    </span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="inline-flex items-center"
                    >
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </motion.div>
                  </Link>
                  
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-100/50 via-indigo-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Card number */}
                  <div className="absolute bottom-6 right-6 font-bold text-5xl text-slate-100/30 group-hover:text-indigo-100/40 transition-colors">
                    {index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Testimonials Section with Enhanced Design */}
      <section className="py-24 relative overflow-hidden">
        {/* Animated Pattern Background */}
        <div className="absolute inset-0">
          <Pattern />
        </div>
        
        {/* Dynamic gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-violet-50/50 to-indigo-50/70"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute -left-40 top-20 w-96 h-96 rounded-full bg-gradient-to-br from-violet-200/30 to-purple-200/20 blur-[120px]"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, 50, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -right-40 bottom-20 w-80 h-80 rounded-full bg-gradient-to-tl from-indigo-200/30 to-blue-200/20 blur-[120px]"
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 5
            }}
          />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]"></div>
          
          {/* Floating geometric shapes */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-6 h-6 border-2 border-violet-300/40 rounded"
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-3/4 right-1/3 w-4 h-4 bg-indigo-200/30 rounded-full"
            animate={{ 
              y: [0, -20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Enhanced Header Section */}
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="block">What Our</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
                Amazing Users
              </span>
              <span className="block">Are Saying</span>
            </h2>
            
            {/* Rating display with animation */}
            <motion.div 
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                  >
                    <Star fill="currentColor" className="h-7 w-7 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.9</div>
                <div className="text-sm text-gray-600">out of 5</div>
              </div>
            </motion.div>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied users who have revolutionized their digital pass management experience
            </p>
          </motion.div>
          
          {/* Enhanced Testimonials Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: 'Priya Sharma',
                role: 'Business Owner',
                company: 'Digital Solutions Inc.',
                image: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=150&h=150&fit=crop&crop=face',
                quote: 'PassVault has completely transformed how I manage digital passes for my business. The intuitive interface and rock-solid security give me complete peace of mind.',
                rating: 5,
                featured: true
              },
              {
                name: 'Rahul Verma',
                role: 'Tech Enthusiast',
                company: 'Software Developer',
                image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150&h=150&fit=crop&crop=face',
                quote: 'The auto-sync feature is absolutely revolutionary. I can access my passes seamlessly across all devices. The UI is clean and the performance is outstanding.',
                rating: 5,
                featured: false
              },
              {
                name: 'Ananya Patel',
                role: 'Student',
                company: 'University College',
                image: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?w=150&h=150&fit=crop&crop=face',
                quote: 'As a student juggling multiple passes and cards, PassVault has been a lifesaver. Everything is organized and easily accessible. Highly recommend!',
                rating: 5,
                featured: false
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.7 }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className={`group relative rounded-3xl overflow-hidden backdrop-blur-sm transition-all duration-500 ${
                  testimonial.featured 
                    ? 'bg-gradient-to-br from-white via-violet-50/50 to-indigo-50/30 border-2 border-violet-200/50 shadow-xl shadow-violet-100/50' 
                    : 'bg-white/80 border border-gray-200/50 shadow-lg'
                } hover:shadow-2xl hover:shadow-violet-100/50`}
              >
                {/* Featured badge */}
                {testimonial.featured && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-12">
                      ⭐ Featured
                    </div>
                  </div>
                )}
                
                {/* Gradient accent line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500"></div>
                
                <div className="p-8">
                  {/* Quote with modern styling */}
                  <div className="relative mb-8">
                    {/* Large decorative quote mark */}
                    <div className="absolute -top-4 -left-2 text-6xl font-bold text-violet-100 leading-none select-none">
                      "
                    </div>
                    <blockquote className="relative text-gray-700 text-lg leading-relaxed italic font-medium">
                      {testimonial.quote}
                    </blockquote>
                    <div className="absolute -bottom-2 right-0 text-6xl font-bold text-violet-100 leading-none select-none rotate-180">
                      "
                    </div>
                  </div>
                  
                  {/* Star rating */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 + index * 0.15 + i * 0.05, duration: 0.2 }}
                      >
                        <Star fill="currentColor" className="h-5 w-5 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* User info with enhanced styling */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {/* Animated border */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                      <motion.img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="relative h-14 w-14 rounded-full object-cover border-3 border-white shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      />
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 group-hover:text-violet-700 transition-colors">
                        {testimonial.name}
                      </h4>
                      <p className="text-violet-600 font-medium text-sm">{testimonial.role}</p>
                      <p className="text-gray-500 text-xs">{testimonial.company}</p>
                    </div>
                    
                    {/* Verification badge */}
                    <div className="flex-shrink-0">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Check className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-violet-100/30 to-indigo-100/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-200/50 to-transparent"></div>
              </motion.div>
            ))}
          </div>
          
          {/* Enhanced CTA Section */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-violet-200/50 shadow-lg">
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Ready to join them?</h3>
                <p className="text-gray-600">Start your free trial today</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/testimonials"
                  className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                  <span>View All Testimonials</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="inline-flex items-center"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Modern CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Dynamic background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          {/* Animated shapes */}
          <motion.div 
            className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-purple-500/20 blur-[100px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.2, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/20 blur-[100px]"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
          />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/40"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * 500,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0.7, 0]
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: Math.random() * 10 + 10,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 md:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Ready to <span className="relative inline-block">
                    Simplify
                    <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"></span>
                  </span> Your Digital Life?
                </h2>
                
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                  Join <span className="font-semibold text-yellow-300">thousands of satisfied users</span> and start managing your passes smarter today with our secure, cloud-based solution.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-5 mb-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/download"
                      className="group bg-gradient-to-br from-white to-gray-100 text-violet-800 px-8 py-4 rounded-xl font-semibold shadow-lg shadow-violet-900/30 hover:shadow-xl hover:shadow-violet-900/40 transition-all flex items-center justify-center"
                    >
                      <Zap className="h-5 w-5 mr-2 text-yellow-500 group-hover:text-yellow-600 transition-colors" />
                      <span>Get Started Free</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="inline-flex items-center"
                      >
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:text-violet-900 transition-colors" />
                      </motion.div>
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/pricing"
                      className="bg-violet-800/50 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-violet-800/70 transition-all flex items-center justify-center"
                    >
                      <span>View Pricing</span>
                      <div className="ml-2 h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </Link>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="flex flex-wrap justify-center gap-x-6 gap-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {[
                    { icon: <Check className="h-5 w-5" />, text: "No credit card required" },
                    { icon: <Star className="h-5 w-5" />, text: "Free plan available" },
                    { icon: <Lock className="h-5 w-5" />, text: "End-to-end encryption" },
                    { icon: <RefreshCw className="h-5 w-5" />, text: "Cancel anytime" }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ y: -3 }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm"
                    >
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Add Footer */}
      <Footer />
    </div>
  );
};

export default Home;