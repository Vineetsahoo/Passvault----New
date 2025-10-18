import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserPlus, FaCogs, FaCheckCircle, FaMobileAlt, FaShieldAlt, FaHeadset,
  FaQrcode, FaSync, FaBell, FaUserFriends, FaLock, FaVideo, FaPlay, 
  FaArrowRight, FaRegLightbulb
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// Import Navbar and Footer
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HowItWorks = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
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

  const detailedSteps = [
    {
      title: "Sign Up & Setup",
      icon: <FaUserPlus />,
      steps: [
        "Create your account with email or social login",
        "Complete profile verification",
        "Set up security preferences"
      ],
      duration: "2 minutes",
      color: "from-violet-500 to-indigo-600"
    },
    {
      title: "Customize Your Experience",
      icon: <FaCogs />,
      steps: [
        "Choose notification preferences",
        "Set up device synchronization",
        "Configure backup settings"
      ],
      duration: "3 minutes",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Start Managing Passes",
      icon: <FaCheckCircle />,
      steps: [
        "Import existing passes",
        "Create new digital passes",
        "Share with team members"
      ],
      duration: "5 minutes",
      color: "from-indigo-500 to-purple-600"
    }
  ];

  const videoTutorials = [
    { title: "Quick Start Guide", duration: "2:30", icon: <FaVideo />, thumbnail: "https://images.unsplash.com/photo-1581472723648-909f4851d4ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" },
    { title: "Security Features", duration: "3:45", icon: <FaLock />, thumbnail: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" },
    { title: "Team Collaboration", duration: "4:15", icon: <FaUserFriends />, thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" }
  ];

  const keyFeatures = [
    {
      icon: <FaQrcode />,
      title: "QR Code Scanning",
      description: "Instantly digitize physical passes with our advanced scanning technology",
      color: "from-violet-500 to-indigo-600"
    },
    {
      icon: <FaSync />,
      title: "Auto-Sync",
      description: "Real-time updates across all devices ensure your data is always current",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <FaBell />,
      title: "Smart Alerts",
      description: "Intelligent notifications remind you before passes or credentials expire",
      color: "from-indigo-500 to-purple-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-3 border-violet-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-5 rounded-full bg-white flex items-center justify-center">
              <FaCogs className="h-7 w-7 text-violet-600" />
            </div>
          </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-lg">Setting things up...</p>
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
      
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden font-source">
        {/* Modern background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(124,58,237,0.08),transparent)]" />
        
        {/* Decorative elements */}
        <div className="absolute top-40 right-0 w-96 h-96 bg-violet-100/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl -z-10" />
        
        {/* Enhanced Hero Section */}
        <section className="relative py-20 px-4">
          <motion.div
            className="text-center max-w-7xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Enhanced header section */}
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 bg-violet-100 text-violet-800 rounded-full text-sm font-medium inline-block mb-4">
                GETTING STARTED
              </span>
              <motion.h1 
                className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                How It Works
              </motion.h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get started with PassVault in three simple steps and secure your digital life
              </p>
            </div>

            {/* Enhanced Hero Image with overlay and floating elements */}
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/10 mb-20 max-w-5xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="PassVault in action"
                className="mx-auto rounded-3xl w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-indigo-900/30 to-transparent rounded-3xl"></div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute bottom-8 left-8 md:bottom-12 md:left-12 max-w-lg text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-white mb-4">Secure. Simple. Seamless.</h2>
                <p className="text-white/90 mb-6">Experience the future of password management with our intuitive platform.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-violet-700 rounded-xl font-medium hover:bg-violet-50 transition-colors flex items-center"
                  onClick={() => navigate('/download')}
                >
                  Get Started <FaArrowRight className="ml-2" />
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Enhanced Quick Steps */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            >
              {[
                { icon: <FaUserPlus />, title: "Create Account", desc: "Sign up and verify your identity", color: "from-violet-500 to-indigo-600", onClick: () => navigate('/download') },
                { icon: <FaCogs />, title: "Personalize", desc: "Customize settings to your needs", color: "from-blue-500 to-indigo-600" },
                { icon: <FaCheckCircle />, title: "Start Using", desc: "Begin securing your digital life", color: "from-indigo-500 to-purple-600" }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  variants={cardHoverVariants}
                  whileHover="hover"
                  className="backdrop-blur-sm bg-white/90 p-8 rounded-2xl shadow-lg border border-slate-100/80 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                  onClick={step.onClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className={`bg-gradient-to-br ${step.color} text-white p-4 rounded-xl inline-block mb-5 shadow-lg relative z-10`}>
                    {React.cloneElement(step.icon, { className: "text-2xl" })}
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3 text-slate-800 relative z-10">{step.title}</h2>
                  <p className="text-slate-600 relative z-10">{step.desc}</p>
                  
                  <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div 
                      className="bg-violet-100 p-2 rounded-full text-violet-600"
                      whileHover={{ rotate: 45 }}
                    >
                      <FaArrowRight />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Enhanced Detailed Steps Section with Timeline */}
        <section className="py-20 px-4 bg-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(90%_40%_at_50%_60%,rgba(124,58,237,0.05),transparent)]" />
          
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 bg-violet-100 text-violet-800 rounded-full text-sm font-medium inline-block mb-4">
                SETUP PROCESS
              </span>
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                Detailed Setup Process
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Follow these steps to get the most out of your PassVault experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {detailedSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                      delay: index * 0.2
                    }
                  }}
                  whileHover="hover"
                  variants={cardHoverVariants}
                  viewport={{ once: true, margin: "-50px" }}
                  className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg border border-slate-100/80 overflow-hidden group"
                >
                  <div className={`bg-gradient-to-r ${step.color} h-2`}></div>
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${step.color} text-white shadow-lg mr-4`}>
                        {React.cloneElement(step.icon, { className: "text-xl" })}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">{step.title}</h3>
                    </div>
                    
                    <ul className="space-y-3 mb-5 pl-4">
                      {step.steps.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600">
                          <span className="h-5 w-5 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="h-2 w-2 bg-violet-600 rounded-full"></span>
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
                      <div className="flex items-center">
                        <FaRegLightbulb className="text-violet-500 mr-2" />
                        <span className="text-sm text-violet-600 font-medium">Step {index + 1}</span>
                      </div>
                      <div className="text-sm text-slate-500">
                        Estimated time: <span className="font-medium text-slate-700">{step.duration}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Video Tutorials */}
        <section className="py-24 px-4 bg-[#f8fafc] relative">
          <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_50%,rgba(124,58,237,0.05),transparent)]" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 bg-violet-100 text-violet-800 rounded-full text-sm font-medium inline-block mb-4">
                LEARN MORE
              </span>
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                Video Tutorials
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Watch these guides to master all features of PassVault
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {videoTutorials.map((video, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover="hover"
                  variants={cardHoverVariants}
                  viewport={{ once: true, margin: "-50px" }}
                  className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg border border-slate-100/80 overflow-hidden group cursor-pointer"
                  onClick={() => setActiveVideo(index)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent"></div>
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                          <FaPlay className="text-violet-600 ml-1" />
                        </div>
                      </div>
                    </motion.div>
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center mb-2">
                      {React.cloneElement(video.icon, { className: "text-violet-600 mr-2" })}
                      <h3 className="font-bold text-slate-800">{video.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500">Learn how to use all features effectively</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Key Features Section */}
        <section className="py-24 px-4 bg-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(90%_40%_at_50%_60%,rgba(124,58,237,0.05),transparent)]" />
          
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 bg-violet-100 text-violet-800 rounded-full text-sm font-medium inline-block mb-4">
                FEATURES
              </span>
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                Key Features
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover what makes PassVault the leading choice for password management
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {keyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={{...itemVariants, ...cardHoverVariants}}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true, margin: "-50px" }}
                  className="backdrop-blur-sm bg-white/90 p-8 rounded-2xl shadow-lg border border-slate-100/80 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100/50 to-indigo-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                  
                  <div className={`relative z-10 bg-gradient-to-br ${feature.color} text-white p-4 rounded-xl inline-block mb-6 shadow-lg`}>
                    {React.cloneElement(feature.icon, { className: "text-2xl" })}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-slate-800 relative z-10">{feature.title}</h3>
                  <p className="text-slate-600 relative z-10">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Interactive Demo CTA */}
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
                <FaHeadset className="text-4xl text-white/80 mx-auto mb-6" />
                <motion.h2
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-3xl font-bold mb-4 text-white"
                >
                  Try Interactive Demo
                </motion.h2>
                <p className="text-white/80 mb-8 text-lg max-w-lg mx-auto">
                  Experience all the powerful features of PassVault without creating an account
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-violet-700 font-medium rounded-xl hover:bg-violet-50 transition-colors shadow-lg"
                >
                  Launch Interactive Demo
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
      
      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-video bg-black">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-lg">Video player would go here</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {videoTutorials[activeVideo].title}
                </h3>
                <p className="text-slate-600">
                  This video guide shows you how to effectively use PassVault.
                </p>
                <div className="flex justify-end mt-4">
                  <button 
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    onClick={() => setActiveVideo(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add Footer at the bottom */}
      <Footer />
    </>
  );
};

export default HowItWorks;