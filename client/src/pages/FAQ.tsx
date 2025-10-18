import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronDown, FaQuestionCircle, FaEnvelope, FaPhone, 
  FaSearch, FaShieldAlt, FaCreditCard, 
  FaTools, FaInfoCircle, FaGlobe, FaHeadset, FaLightbulb
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// Import Navbar and Footer
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQ = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { id: 'all', name: 'All Questions', icon: <FaGlobe className="text-lg" /> },
    { id: 'general', name: 'General', icon: <FaInfoCircle className="text-lg" /> },
    { id: 'security', name: 'Security', icon: <FaShieldAlt className="text-lg" /> },
    { id: 'billing', name: 'Billing', icon: <FaCreditCard className="text-lg" /> },
    { id: 'technical', name: 'Technical', icon: <FaTools className="text-lg" /> },
  ];

  const faqData = [
    {
      category: 'general',
      question: 'What services does Pass Vault offer?',
      answer: 'Pass Vault offers a range of digital solutions including password management, secure data storage, cloud integration, data security, mobile-friendly designs, and advanced analytics tools.',
    },
    {
      category: 'general',
      question: 'What makes Pass Vault different from other password managers?',
      answer: 'Pass Vault stands out with its military-grade encryption, user-friendly interface, cross-platform compatibility, and comprehensive security features like two-factor authentication and secure password sharing.',
    },
    {
      category: 'security',
      question: 'How secure is my data with Pass Vault?',
      answer: 'We use AES-256 bit encryption, zero-knowledge architecture, and regular security audits. Your data is encrypted locally on your device before being stored on our servers, meaning only you have access to your information.',
    },
    {
      category: 'security',
      question: 'What happens if I forget my master password?',
      answer: 'For security reasons, Pass Vault cannot recover your master password. However, we offer account recovery options through secure backup methods that you can set up in advance.',
    },
    {
      category: 'security',
      question: 'Does Pass Vault offer two-factor authentication?',
      answer: 'Yes, we support multiple 2FA methods including authenticator apps, SMS, biometric authentication, and hardware security keys for enhanced security.',
    },
    {
      category: 'billing',
      question: 'What are the payment options?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise customers. We also support cryptocurrency payments for selected plans.',
    },
    {
      category: 'billing',
      question: 'Is there a free trial available?',
      answer: 'Yes, we offer a 30-day free trial with full access to all premium features. No credit card required to start.',
    },
    {
      category: 'billing',
      question: 'Can I get a refund if I am not satisfied?',
      answer: 'Yes, we offer a 30-day money-back guarantee on all our paid plans, no questions asked.',
    },
    {
      category: 'technical',
      question: 'How do I integrate Pass Vault with my existing systems?',
      answer: 'Our API documentation provides detailed integration guides. Our support team is also available to assist with custom integrations.',
    },
    {
      category: 'technical',
      question: 'Which browsers are supported?',
      answer: 'Pass Vault supports all major browsers including Chrome, Firefox, Safari, Edge, and Opera through our browser extensions.',
    },
    {
      category: 'technical',
      question: 'Can I import passwords from other password managers?',
      answer: 'Yes, Pass Vault supports importing from most major password managers and browsers. We provide step-by-step guides for seamless migration.',
    },
    {
      category: 'general',
      question: 'Is there a limit to how many passwords I can store?',
      answer: 'No, all Pass Vault plans come with unlimited password storage. Store as many credentials as you need.',
    },
  ];

  const filteredFAQs = faqData.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const accordionVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { 
        height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
        opacity: { duration: 0.3, delay: 0.15 }
      }
    }
  };

  const searchInputVariants = {
    focus: { 
      scale: 1.02,
      boxShadow: "0 8px 30px rgba(124, 58, 237, 0.15)",
      transition: { type: "spring", stiffness: 300 }
    },
    blur: {
      scale: 1,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      transition: { type: "spring", stiffness: 300 }
    }
  };

  const categoryButtonVariants = {
    hover: { 
      scale: 1.05,
      y: -3,
      transition: { type: "spring", stiffness: 400 }
    },
    tap: { scale: 0.95 }
  };

  const faqItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }),
    hover: {
      y: -3,
      boxShadow: "0 12px 30px rgba(124, 58, 237, 0.12)",
      transition: { type: "spring", stiffness: 400 }
    }
  };

  const questionContentVariants = {
    initial: { color: "rgb(30, 41, 59)" },
    active: { color: "rgb(109, 40, 217)" }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-3 border-violet-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-5 rounded-full bg-white flex items-center justify-center">
              <FaQuestionCircle className="h-7 w-7 text-violet-600" />
            </div>
          </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-lg">Loading answers for you...</p>
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
      
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden font-roboto">
        {/* Creative Background Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(124,58,237,0.08),transparent)]" />
        
        {/* Animated Geometric Pattern Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Hexagon Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]">
            <svg width="100%" height="100%" viewBox="0 0 400 400">
              <defs>
                <pattern id="hexagons" width="60" height="60" patternUnits="userSpaceOnUse">
                  <polygon points="30,5 50,20 50,40 30,55 10,40 10,20" 
                           fill="none" 
                           stroke="rgb(124,58,237)" 
                           strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)" />
            </svg>
          </div>
          

          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(124,58,237)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Diagonal Lines Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="diagonals" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M0,30 L30,0" stroke="rgb(99,102,241)" strokeWidth="0.5" opacity="0.3"/>
                  <path d="M0,0 L30,30" stroke="rgb(124,58,237)" strokeWidth="0.5" opacity="0.2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#diagonals)" />
            </svg>
          </div>
        </div>
        

        

        

        
        <section className="relative py-20 px-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            {/* Enhanced header section */}
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 bg-violet-100 text-violet-800 rounded-full text-sm font-medium inline-block mb-4">
                SUPPORT CENTER
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about our services and solutions
              </p>
            </div>

            {/* Search Input with enhanced design */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 relative z-10"
            >
              <div className="relative max-w-xl mx-auto">
                <motion.div
                  variants={searchInputVariants}
                  animate={isSearchFocused ? "focus" : "blur"}
                  className="backdrop-blur-sm bg-white/80 rounded-2xl overflow-hidden"
                >
                  <div className="flex items-center p-1.5">
                    <div className="pl-4">
                      <FaSearch className="text-violet-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search for answers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="w-full px-3 py-4 border-none focus:outline-none bg-transparent text-slate-700"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="px-4 text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-violet-500/40 to-indigo-500/40 rounded-full blur-sm"
                />
              </div>
            </motion.div>

            {/* Categories Section with enhanced styling */}
            <div className="mb-12">
              <h2 className="text-lg font-medium text-slate-600 mb-4 text-center">Filter by category</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    whileHover="hover"
                    whileTap="tap"
                    variants={categoryButtonVariants}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                        : 'bg-white hover:bg-violet-50 hover:shadow-md border border-slate-100'
                    }`}
                  >
                    <span className="text-lg">
                      {category.icon}
                    </span>
                    <span className="font-medium">{category.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Updated FAQ Items with grid layout */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 }
                }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={faqItemVariants}
                  whileHover="hover"
                  layout
                  className={`backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 h-fit ${
                    activeIndex === index
                      ? 'bg-white/95 shadow-lg shadow-violet-500/10 border border-violet-200/50'
                      : 'bg-white/80 shadow-md border border-slate-100 hover:border-violet-200/30'
                  }`}
                >
                  <motion.button
                    onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex justify-between items-center transition-all duration-300 group"
                  >
                    <div className="flex items-start flex-1 text-left px-5 py-4">
                      <div className={`mr-3 mt-0.5 ${
                        activeIndex === index ? 'text-violet-600' : 'text-violet-400'
                      }`}>
                        <FaLightbulb className="text-base" />
                      </div>
                      <motion.h2 
                        variants={questionContentVariants}
                        animate={activeIndex === index ? 'active' : 'initial'}
                        className="text-base font-medium line-clamp-2"
                      >
                        {faq.question}
                      </motion.h2>
                    </div>
                    
                    <div className="px-3">
                      <motion.div
                        animate={{ 
                          rotate: activeIndex === index ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          activeIndex === index 
                            ? 'bg-violet-600 text-white' 
                            : 'bg-violet-100 text-violet-500'
                        }`}
                      >
                        <FaChevronDown className={activeIndex === index ? "text-xs" : "text-[0.6rem]"} />
                      </motion.div>
                    </div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        variants={accordionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="overflow-hidden"
                      >
                        <div className="px-5 py-4 pl-12 border-t border-violet-100">
                          <div className="relative">
                            {/* Decorative vertical line */}
                            <div className="absolute left-[-20px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-400 to-indigo-400"></div>
                            
                            {/* Answer content with enhanced styling */}
                            <div className="prose prose-sm prose-slate prose-p:text-slate-600 prose-headings:text-violet-900 prose-a:text-violet-600 max-w-none">
                              <p className="text-slate-600 leading-relaxed text-sm">{faq.answer}</p>
                              
                              {/* Optional tags related to the question */}
                              <div className="mt-3 flex flex-wrap gap-2">
                                {faq.category === 'security' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                                    <FaShieldAlt className="mr-1 text-[0.6rem]" /> Security
                                  </span>
                                )}
                                {faq.category === 'billing' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    <FaCreditCard className="mr-1 text-[0.6rem]" /> Billing
                                  </span>
                                )}
                                {faq.category === 'technical' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <FaTools className="mr-1 text-[0.6rem]" /> Technical
                                  </span>
                                )}
                                {faq.category === 'general' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    <FaInfoCircle className="mr-1 text-[0.6rem]" /> General
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>

            {filteredFAQs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-inner"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                  alt="No results"
                  className="w-20 h-20 mx-auto mb-4 opacity-40"
                />
                <h3 className="text-xl font-medium text-slate-800 mb-2">No matching questions found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your search terms or browse by category</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-md shadow-violet-500/20"
                >
                  Reset Filters
                </button>
              </motion.div>
            )}

            {/* Contact Support Section with modern design - adjusted margin-top */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 text-center bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-12 shadow-xl shadow-violet-500/20 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
              
              <div className="relative z-10">
                <FaHeadset className="text-4xl text-white/80 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Still need help?
                </h2>
                <p className="text-white/80 mb-8 max-w-md mx-auto">
                  Our support team is available 24/7 to answer any questions you may have
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {[
                    { name: 'Email Support', icon: <FaEnvelope />, href: "mailto:support@passvault.com" },
                    { name: 'Live Chat', icon: <FaHeadset />, href: "#" },
                    { name: 'Call Support', icon: <FaPhone />, href: "tel:+1234567890" }
                  ].map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 text-white transition-all duration-200 group"
                    >
                      <span className="text-white/70 group-hover:text-white transition-colors">
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </a>
                  ))}
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

export default FAQ;