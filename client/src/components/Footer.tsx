import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { Wallet } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-gradient-to-br from-indigo-950 via-blue-950/95 to-slate-900 text-white relative overflow-hidden backdrop-blur-xl font-inter ${className}`}>
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-80"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-700/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-700/20 rounded-full blur-[120px] animate-pulse"></div>
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Modernized top section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 pb-6 border-b border-indigo-800/30">
          <div className="flex items-center mb-8 md:mb-0 transform hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-3.5 rounded-2xl shadow-lg shadow-indigo-700/30 mr-4 backdrop-blur-xl">
              <Wallet className="text-white w-7 h-7" />
            </div>
            <h2 className="font-bold text-4xl bg-gradient-to-r from-indigo-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              PassVault
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <span className="text-gray-300 font-medium">Stay updated with PassVault</span>
            <form className="flex group">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="bg-indigo-900/40 backdrop-blur-xl border border-indigo-700/50 rounded-l-xl px-6 py-3 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all duration-300"
              />
              <button className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all px-6 py-3 rounded-r-xl font-semibold text-white text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-xl mb-4 relative inline-flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">About Us</span>
              <span className="ml-2 h-1.5 w-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></span>
            </h3>
            <p className="text-gray-300 text-base mb-4 text-center md:text-left leading-relaxed">
              Secure your digital life with our advanced pass management solution. 
              Never worry about lost digital passes again.
            </p>
            <div className="flex space-x-4 mt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-indigo-400 p-2.5 bg-indigo-900/40 rounded-lg hover:bg-indigo-800/50 transition-all duration-300"
                aria-label="GitHub"
              >
                <FaGithub size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-indigo-400 p-2.5 bg-indigo-900/40 rounded-lg hover:bg-indigo-800/50 transition-all duration-300"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-indigo-400 p-2.5 bg-indigo-900/40 rounded-lg hover:bg-indigo-800/50 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-xl mb-4 relative inline-flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">Quick Links</span>
              <span className="ml-2 h-1.5 w-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-center md:text-left">
              {['Features', 'Pricing', 'FAQ', 'Blog'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`} 
                    className="text-gray-300 hover:text-indigo-400 transition-colors flex items-center text-base group"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 mr-2 transition-all duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform inline-block">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-xl mb-4 relative inline-flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">Legal</span>
              <span className="ml-2 h-1.5 w-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-center md:text-left">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Security', path: '/security' },
                { name: 'Compliance', path: '/compliance' },
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="text-gray-300 hover:text-indigo-400 transition-colors flex items-center text-base group"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 mr-2 transition-all duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform inline-block">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-xl mb-4 relative inline-flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">Contact Us</span>
              <span className="ml-2 h-1.5 w-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></span>
            </h3>
            <div className="mb-4">
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-800 transition-all duration-300 text-white font-medium"
              >
                Contact Support
              </Link>
            </div>
            <div className="flex items-center justify-center md:justify-start mt-3 group bg-indigo-900/40 px-4 py-3 rounded-lg">
              <FaEnvelope className="mr-2 text-indigo-400 text-lg" />
              <a href="mailto:support@passvault.com" className="text-gray-300 hover:text-indigo-400 transition-colors text-base">
                support@passvault.com
              </a>
            </div>
          </div>
        </div>
        
        {/* Enhanced copyright section */}
        <div className="mt-12 pt-6 text-center relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          </div>
          <p className="flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-400 font-medium">
            <span>© {currentYear} PassVault.</span> 
            <span className="hidden sm:inline">|</span>
            <span>All rights reserved.</span>
          </p>
          <div className="mt-4 text-sm text-gray-500 font-medium">
            Crafted by the PassVault Team
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;