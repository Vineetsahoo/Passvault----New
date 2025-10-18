import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaCog, FaTachometerAlt, FaLock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn } from 'lucide-react';

interface UserData {
  name?: string;
  username?: string;
  email?: string;
}

const AuthenticatedNavbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    
    // Try all possible user data sources
    const userDataString = localStorage.getItem('userData') || 
                           localStorage.getItem('mockUser');
    if (userDataString) {
      try {
        const parsedData = JSON.parse(userDataString);
        setUserData(parsedData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear all authentication tokens for consistency
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('mockAuth');
    localStorage.removeItem('mockUser');
    localStorage.removeItem('userToken');
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    navigate('/signin', { replace: true });
  };

  const displayName = userData.name || userData.username || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PassVault
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 flex items-center">
                <FaTachometerAlt className="mr-2" /> Dashboard
              </Link>
              <Link to="/dashboard/passwords" className="text-gray-700 hover:text-indigo-600 flex items-center">
                <FaLock className="mr-2" /> Passwords
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2"
                >
                  <span className="hidden md:block text-gray-700 mr-2">{displayName}</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                    {initial}
                  </div>
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-700">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                      </div>
                      
                      <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-indigo-50">
                        <FaTachometerAlt className="mr-2" /> Dashboard
                      </Link>
                      <Link to="/dashboard/user-profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-indigo-50">
                        <FaUser className="mr-2" /> Profile
                      </Link>
                      <Link to="/dashboard/settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-indigo-50">
                        <FaCog className="mr-2" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-xl flex items-center"
                      >
                        <FaSignOutAlt className="mr-2" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  onClick={handleSignIn}
                  className="relative flex items-center gap-1.5 border-2 border-indigo-500 text-indigo-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;
