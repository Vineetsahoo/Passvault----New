import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Lock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();
  
  // Add effect to simulate initial page loading
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!email.trim()) {
        throw new Error('Email is required');
      }
      
      if (!password) {
        throw new Error('Password is required');
      }
      
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Call backend API
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: email.trim().toLowerCase(),
          password,
          rememberMe: false
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data && response.data.success) {
        const { user, accessToken } = response.data.data;
        
        // Store auth data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(user));
        
        // Also set legacy keys for compatibility
        localStorage.setItem('mockAuth', 'true');
        localStorage.setItem('userToken', accessToken);
        localStorage.setItem('mockUser', JSON.stringify(user));
        
        // Dispatch storage event
        window.dispatchEvent(new Event('storage'));
        
        // Success animation before redirect
        await new Promise(resolve => setTimeout(resolve, 500));
        
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response) {
        // Server responded with an error
        const message = err.response.data?.message || 'Invalid email or password';
        setError(message);
      } else if (err.request) {
        // Request was made but no response
        setError('Cannot connect to server. Please make sure the backend is running.');
      } else {
        // Other errors
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigateToSignUp = () => {
    navigate('/signup');
  };

  // Add page loading state at the beginning
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-3 border-violet-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-5 rounded-full bg-white flex items-center justify-center">
              <Lock className="h-7 w-7 text-violet-600" />
            </div>
          </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-lg">Preparing secure login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-hidden">
      <Navbar />
      
      {/* Further increased spacing above the layout for better positioning */}
      <div className="flex-grow flex items-center justify-center relative pt-20 lg:pt-24 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background pattern and gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(124,58,237,0.08),transparent)]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl"></div>
        
        {/* Grid pattern background */}
        <div className="absolute inset-0 -z-10 opacity-[0.02]">
          <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V0H40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        {/* Horizontal layout with two columns - larger size */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl relative z-10 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-xl">
            {/* Left column - increased text sizes */}
            <div className="lg:w-1/2 relative bg-gradient-to-b from-indigo-700 via-violet-700 to-purple-700 hidden lg:block">
              {/* Abstract pattern background */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="wave-pattern" patternUnits="userSpaceOnUse" width="100" height="10" patternTransform="rotate(0 50 50)">
                      <path d="M0,5 C30,15 70,-5 100,5 L100,0 L0,0 Z" fill="rgba(255,255,255,0.3)" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#wave-pattern)" />
                </svg>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              </div>

              {/* Content - increased sizes */}
              <div className="relative flex flex-col items-center justify-center p-8 lg:p-10 h-full text-white">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-md text-center"
                >
                  <div className="mb-8">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20,
                        delay: 0.4
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6"
                    >
                      <Wallet className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </motion.div>
                    
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-3xl lg:text-4xl font-bold mb-3"
                    >
                      Welcome to Passvault
                    </motion.h2>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-xl text-white/90 font-light"
                    >
                      Your gateway to the digital future
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-6"
                  >
                    <p className="text-white/90 text-base lg:text-lg">
                      Sign in to experience the next generation of innovation.
                    </p>
                    
                    <div className="flex justify-center gap-4">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                      ))}
                    </div>
                    
                    <div className="pt-3">
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <p className="italic text-white/80 text-sm lg:text-base">
                          "The possibilities are limitless with Passvault. It has transformed the way we approach our digital tasks."
                        </p>
                        <p className="mt-3 font-medium text-white/90 text-sm">— Tech Innovator Magazine</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
            
            {/* Right column with form - increased sizes */}
            <div className="lg:w-1/2 backdrop-blur-sm bg-white/90 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <div className="w-full mx-auto">
                {/* Mobile logo - shown on small screens only */}
                <div className="flex justify-center mb-6 lg:hidden">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20,
                      delay: 0.1 
                    }}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20"
                  >
                    <Wallet className="h-8 w-8 text-white" />
                  </motion.div>
                </div>

                <div className="text-center mb-8">
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 tracking-tight"
                  >
                    Welcome Back
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-600 mt-3 text-lg"
                  >
                    Sign in to continue your journey
                  </motion.p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className="mb-5 p-4 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 rounded-lg text-base"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form - increased text sizes */}
                <form onSubmit={handleSignIn} className="space-y-5">
                  {/* Email field with larger text */}
                  <div>
                    <label htmlFor="email" className="block text-slate-700 font-medium mb-2 text-sm tracking-wide">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white/50 hover:bg-white shadow-sm text-base"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field with larger text */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label htmlFor="password" className="block text-slate-700 font-medium text-sm tracking-wide">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-sm text-violet-600 hover:text-violet-500 font-medium transition-colors hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white/50 hover:bg-white shadow-sm text-base"
                        placeholder="••••••••"
                        required
                      />
                      <div 
                        className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer" 
                        onClick={togglePasswordVisibility}
                      >
                        <svg 
                          className="h-5 w-5 text-slate-400 hover:text-violet-500 transition-colors" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          {showPassword ? (
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          ) : (
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          )}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Sign in button - larger size */}
                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.01 }}
                      whileTap={{ scale: isLoading ? 1 : 0.99 }}
                      className={`w-full py-3.5 px-4 rounded-xl text-white font-medium transition-all text-base ${
                        isLoading 
                          ? 'bg-violet-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-violet-600/30'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* Sign up option - increase size */}
                <div className="mt-6 text-center">
                  <p className="text-slate-600 mb-3 text-base">
                    Don't have an account?{' '}
                  </p>
                  <motion.button
                    onClick={navigateToSignUp}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 px-4 rounded-xl text-slate-800 font-medium border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all bg-white/80 text-base"
                  >
                    Create Account
                  </motion.button>
                </div>

              </div>
            </div>
          </div>
          
          {/* Security badge - slightly larger */}
          <div className="mt-2 flex justify-center">
            <div className="flex items-center text-xs text-slate-500 gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure authentication</span>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer className="mt-auto" />
    </div>
  );
};

export default SignIn;
function setAuthData(data: any) {
  throw new Error('Function not implemented.');
}

