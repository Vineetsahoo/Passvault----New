import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Lock, User, Mail, Shield } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Weak', color: 'red' });
  const navigate = useNavigate();
  
  // Add effect to simulate initial page loading
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Password strength checker
  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, text: 'Weak', color: 'red' });
    }
  }, [formData.password]);

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let text = 'Weak';
    let color = 'red';

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score >= 5) {
      text = 'Very Strong';
      color = 'green';
    } else if (score >= 4) {
      text = 'Strong';
      color = 'blue';
    } else if (score >= 3) {
      text = 'Medium';
      color = 'yellow';
    } else if (score >= 2) {
      text = 'Fair';
      color = 'orange';
    }

    return { score, text, color };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (response.data.success && response.data.data) {
        // Store authentication data
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
        
        // Dispatch storage event for other components
        window.dispatchEvent(new Event('storage'));
        
        // Show success message
        alert('Account created successfully! Redirecting to dashboard...');
        
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error responses
      if (error.response?.data?.message) {
        setErrors({ email: error.response.data.message });
      } else if (error.response?.status === 409) {
        setErrors({ email: 'An account with this email already exists' });
      } else if (error.response?.status === 400) {
        setErrors({ email: 'Invalid registration data. Please check your inputs.' });
      } else {
        setErrors({ email: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const navigateToSignIn = () => {
    navigate('/signin');
  };

  // Page loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-3 border-violet-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-5 rounded-full bg-white flex items-center justify-center">
              <User className="h-7 w-7 text-violet-600" />
            </div>
          </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-lg">Preparing registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-hidden">
      <Navbar />
      
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

        {/* Main container */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl relative z-10 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-xl">
            {/* Left column */}
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

              {/* Content */}
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
                      <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </motion.div>
                    
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-3xl lg:text-4xl font-bold mb-3"
                    >
                      Join PassVault
                    </motion.h2>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-xl text-white/90 font-light"
                    >
                      Secure your digital life today
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-6"
                  >
                    <p className="text-white/90 text-base lg:text-lg">
                      Create your account and start protecting your passwords with military-grade encryption.
                    </p>
                    
                    <div className="flex justify-center gap-4">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                      ))}
                    </div>
                    
                    <div className="pt-3">
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <p className="italic text-white/80 text-sm lg:text-base">
                          "PassVault gives me peace of mind knowing my passwords are secure and accessible anywhere."
                        </p>
                        <p className="mt-3 font-medium text-white/90 text-sm">— Sarah K., Security Professional</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
            
            {/* Right column with form */}
            <div className="lg:w-1/2 backdrop-blur-sm bg-white/90 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <div className="w-full mx-auto">
                {/* Mobile logo */}
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
                    Create Account
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-600 mt-3 text-lg"
                  >
                    Start securing your passwords today
                  </motion.p>
                </div>

                <AnimatePresence>
                  {Object.keys(errors).length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className="mb-5 p-4 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 rounded-lg text-base"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          {Object.values(errors).map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSignUp} className="space-y-5">
                  {/* Name field */}
                  <div>
                    <label htmlFor="name" className="block text-slate-700 font-medium mb-2 text-sm tracking-wide">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white/50 hover:bg-white shadow-sm text-base ${
                          errors.name 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-slate-200 focus:ring-violet-500'
                        }`}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div>
                    <label htmlFor="email" className="block text-slate-700 font-medium mb-2 text-sm tracking-wide">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white/50 hover:bg-white shadow-sm text-base ${
                          errors.email 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-slate-200 focus:ring-violet-500'
                        }`}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div>
                    <label htmlFor="password" className="block text-slate-700 font-medium mb-2 text-sm tracking-wide">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white/50 hover:bg-white shadow-sm text-base ${
                          errors.password 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-slate-200 focus:ring-violet-500'
                        }`}
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
                    
                    {/* Password strength indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Password strength:</span>
                          <span className={`font-medium text-${passwordStrength.color}-600`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-slate-700 font-medium mb-2 text-sm tracking-wide">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white/50 hover:bg-white shadow-sm text-base ${
                          errors.confirmPassword 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-slate-200 focus:ring-violet-500'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <div 
                        className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer" 
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        <svg 
                          className="h-5 w-5 text-slate-400 hover:text-violet-500 transition-colors" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          {showConfirmPassword ? (
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          ) : (
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          )}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Terms acceptance */}
                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-3 text-sm text-slate-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-violet-600 hover:text-violet-500 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-violet-600 hover:text-violet-500 underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Sign up button */}
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
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* Sign in option */}
                <div className="mt-6 text-center">
                  <p className="text-slate-600 mb-3 text-base">
                    Already have an account?{' '}
                  </p>
                  <motion.button
                    onClick={navigateToSignIn}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 px-4 rounded-xl text-slate-800 font-medium border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all bg-white/80 text-base"
                  >
                    Sign In
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Security badge */}
          <div className="mt-2 flex justify-center">
            <div className="flex items-center text-xs text-slate-500 gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure registration with encryption</span>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer className="mt-auto" />
    </div>
  );
};

export default SignUp;