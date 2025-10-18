import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wallet, ChevronRight, LogIn } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const navigation = [
    { name: 'Features', href: '/features' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path: string): void => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 font-inter ${
        scrolled
          ? 'bg-white shadow-lg border-b border-gray-200/20'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
          >
            <div onClick={() => navigate('/')} className="flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-violet-500/30 blur-sm rounded-xl"></div>
                <motion.div
                  whileHover={{ 
                    rotateY: 180,
                    transition: { duration: 0.6, ease: [0.6, 0.01, -0.05, 0.95] }
                  }}
                  className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-2.5 rounded-xl shadow-lg"
                >
                  <Wallet className="h-7 w-7 text-white drop-shadow-md" />
                </motion.div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-700">
                  PassVault
                </span>
                <span className="text-[0.65rem] uppercase tracking-wider font-medium text-slate-500">Secure • Reliable • Fast</span>
              </div>
            </div>
          </motion.div>

          <div className="hidden md:flex md:items-center md:space-x-1.5">
            {navigation.map((item) => (
              <motion.div
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="cursor-pointer"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  className={`relative px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    location.pathname === item.href
                      ? 'text-indigo-600 bg-indigo-50/80'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                  }`}
                >
                  {item.name}
                  {location.pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full"
                      initial={false}
                    />
                  )}
                </div>
              </motion.div>
            ))}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-6"
            >
              <div
                onClick={() => handleNavClick('/download')}
                className="group bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer flex items-center gap-1"
              >
                <span>Download</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>
            {isAuthenticated ? (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-2"
              >
                <div
                  onClick={() => handleNavClick('/dashboard')}
                  className="relative border-2 border-indigo-500 text-indigo-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-2"
              >
                <div
                  onClick={() => handleNavClick('/signin')}
                  className="relative flex items-center gap-1.5 border-2 border-indigo-500 text-indigo-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
              </motion.div>
            )}
          </div>

          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
            whileTap={{ scale: 0.92 }}
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-lg border-b border-gray-200/20 shadow-lg"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08, delayChildren: 0.01 }
                }
              }}
              initial="hidden"
              animate="show"
              className="px-4 pt-3 pb-5 space-y-2.5"
            >
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 }
                  }}
                  custom={index}
                >
                  <div
                    onClick={() => handleNavClick(item.href)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all cursor-pointer ${
                      location.pathname === item.href
                        ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {location.pathname === item.href && (
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="pt-2 space-y-2.5">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 }
                  }}
                >
                  <div
                    onClick={() => handleNavClick('/download')}
                    className="block w-full text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3.5 rounded-xl text-base font-medium shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Download Now</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 }
                  }}
                  className="mt-2"
                >
                  {isAuthenticated ? (
                    <div
                      onClick={() => handleNavClick('/dashboard')}
                      className="block w-full text-center border-2 border-indigo-600 text-indigo-600 px-4 py-3.5 rounded-xl text-base font-medium hover:bg-indigo-50 transition-all duration-300 cursor-pointer"
                    >
                      Dashboard
                    </div>
                  ) : (
                    <div
                      onClick={() => handleNavClick('/signin')}
                      className="block w-full text-center border-2 border-indigo-600 text-indigo-600 px-4 py-3.5 rounded-xl text-base font-medium hover:bg-indigo-50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;