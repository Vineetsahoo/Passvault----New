import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaBolt, FaCloud, FaLock, FaChartLine, FaUsers, FaMobileAlt,
  FaShieldAlt, FaSync, FaQrcode, FaBell, FaRegClock, FaUsersCog,
  FaArrowRight
} from 'react-icons/fa';
// Import Navbar and Footer
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Features = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const mainFeatures = [
    { 
      title: "Secure Storage", 
      icon: <FaShieldAlt />, 
      description: "Military-grade encryption for all your passwords and sensitive data",
      benefits: ["256-bit AES encryption", "Secure cloud backup", "Biometric authentication"],
      color: "from-violet-500 to-indigo-600"
    },
    { 
      title: "Multi-Device Sync", 
      icon: <FaSync />, 
      description: "Seamless synchronization across all your devices in real-time",
      benefits: ["Real-time updates", "Offline access", "Conflict resolution"],
      color: "from-blue-500 to-indigo-600"
    },
    { 
      title: "QR Code Scanning", 
      icon: <FaQrcode />, 
      description: "Quick and accurate password scanning with advanced recognition",
      benefits: ["Batch scanning", "Auto-detection", "History tracking"],
      color: "from-indigo-500 to-purple-600"
    },
    { 
      title: "Smart Alerts", 
      icon: <FaBell />, 
      description: "Never miss important expiration dates with customizable notifications",
      benefits: ["Custom notifications", "Priority alerts", "Reminder scheduling"],
      color: "from-purple-500 to-fuchsia-600"
    },
    { 
      title: "Secure Sharing", 
      icon: <FaUsersCog />, 
      description: "Share passwords securely with family, friends, or team members",
      benefits: ["Granular permissions", "Time-limited access", "Activity tracking"],
      color: "from-fuchsia-500 to-pink-600"
    },
    { 
      title: "Expiration Tracking", 
      icon: <FaRegClock />, 
      description: "Automated expiration management for all your credentials",
      benefits: ["Auto-renewal reminders", "Batch updates", "Timeline view"],
      color: "from-pink-500 to-rose-600"
    }
  ];

  const featureCategories = [
    { 
      title: "Security Features", 
      icon: <FaLock className="text-xl" />,
      items: ["End-to-end encryption", "Two-factor authentication", "Biometric verification", "Security dashboard"],
      color: "from-indigo-500 to-violet-500"
    },
    { 
      title: "Collaboration Tools", 
      icon: <FaUsers className="text-xl" />,
      items: ["Secure sharing", "Team management", "Permission controls", "Access logs"],
      color: "from-violet-500 to-purple-500" 
    },
    { 
      title: "Management Tools", 
      icon: <FaChartLine className="text-xl" />,
      items: ["Custom categories", "Smart search", "Advanced filters", "Password health"],
      color: "from-purple-500 to-indigo-500" 
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.5
      }
    }
  };

  const cardHoverVariants = {
    hover: { 
      y: -8,
      boxShadow: "0 20px 40px rgba(79, 70, 229, 0.15)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-3 border-violet-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-5 rounded-full bg-white flex items-center justify-center">
              <FaBolt className="h-7 w-7 text-violet-600" />
            </div>
          </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-lg">Loading powerful features...</p>
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
      
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden font-poppins">
        {/* Modern background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(124,58,237,0.08),transparent)]" />
        
        {/* Decorative elements */}
        <div className="absolute top-40 right-0 w-96 h-96 bg-violet-100/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl -z-10" />
        
        {/* Hero Section with enhanced design */}
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')`
            }}
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/40 via-indigo-50/30 to-blue-50/35" />
          
          {/* Additional tech pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%236366f1" fill-opacity="0.4"><rect width="11" height="11" rx="1" transform="translate(10,10)"/><rect width="11" height="11" rx="1" transform="translate(40,40)"/><rect width="7" height="7" rx="1" transform="translate(20,30)"/><rect width="7" height="7" rx="1" transform="translate(35,15)"/></g></svg>')`,
              backgroundSize: '60px 60px'
            }}
          />
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-7xl mx-auto relative z-10"
          >
            {/* Enhanced header section */}
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 bg-violet-100 text-violet-800 rounded-full text-sm font-medium inline-block mb-4">
                FEATURES OVERVIEW
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                Powerful Features
              </h1>
              <p className="text-xl max-w-2xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-white">
                Experience the next generation of password management with our comprehensive suite of features
              </p>
            </div>

            {/* Feature Grid with enhanced card design */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto px-2"
            >
              {mainFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={{...itemVariants, ...cardHoverVariants}}
                  whileHover="hover"
                  className="backdrop-blur-sm bg-white/90 rounded-2xl overflow-hidden shadow-lg border border-slate-100/80 transition-all duration-500 group relative"
                >
                  {/* Decorative top bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${feature.color}`}></div>
                  
                  <div className="p-8">
                    <div className="flex items-center mb-5">
                      <div className={`bg-gradient-to-br ${feature.color} text-white p-3 rounded-xl shadow-lg mr-4`}>
                        {React.cloneElement(feature.icon, { className: "text-xl" })}
                      </div>
                      <h2 className="text-xl font-bold text-slate-800">{feature.title}</h2>
                    </div>
                    
                    <p className="text-slate-600 mb-6">{feature.description}</p>
                    
                    <ul className="space-y-3 mb-5">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-600">
                          <span className="h-5 w-5 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="h-2 w-2 bg-violet-600 rounded-full"></span>
                          </span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-violet-100 p-2 rounded-full text-violet-600">
                        <FaArrowRight />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Categories with redesigned card layout */}
        <section className="py-24 px-4 bg-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(90%_40%_at_50%_60%,rgba(124,58,237,0.05),transparent)]" />
          
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 bg-violet-100 text-violet-800 rounded-full text-sm font-medium inline-block mb-4">
                FEATURE CATEGORIES
              </span>
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                Comprehensive Features
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage your passwords securely and efficiently
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {featureCategories.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                      delay: idx * 0.2
                    }
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="relative"
                >
                  {/* Category header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${category.color} text-white shadow-lg`}>
                      {category.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">{category.title}</h3>
                  </div>
                  
                  {/* Features list with new design */}
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                    {category.items.map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.05)" }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 flex items-center gap-4 ${i !== 0 ? 'border-t border-slate-100' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color}`}></div>
                        <span className="text-slate-700 font-medium">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -z-10 top-6 right-0 opacity-10">
                    {React.cloneElement(category.icon, { className: "text-6xl text-violet-600" })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 px-4 bg-[#f8fafc] relative">
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(124,58,237,0.08),transparent)]" />
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto relative"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 p-12 rounded-3xl shadow-xl shadow-violet-500/20 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
              
              <div className="relative z-10 text-center">
                <FaLock className="text-4xl text-white/80 mx-auto mb-6" />
                <motion.h2
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-3xl font-bold mb-4 text-white"
                >
                  Ready to Secure Your Digital Life?
                </motion.h2>
                <p className="text-white/80 mb-8 text-lg max-w-lg mx-auto">
                  Join thousands of users who trust PassVault to manage their passwords and sensitive information
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-violet-700 font-medium rounded-xl hover:bg-violet-50 transition-colors shadow-lg"
                    onClick={() => navigate('/download')}
                  >
                    Try PassVault Free
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                    onClick={() => navigate('/pricing')}
                  >
                    View Pricing
                  </motion.button>
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

export default Features;