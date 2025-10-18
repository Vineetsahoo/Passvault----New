import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { 
  FaCalendar, FaUser, FaArrowLeft, FaArrowRight, 
  FaTags, FaSearch, FaBookmark, FaEye, FaArrowUp,
  FaFilter, FaChevronDown
} from 'react-icons/fa';
// Import Navbar and Footer
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

// Define blog post interface for better type safety
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  tags: string[];
  category: string;
  featured?: boolean;
  readTime?: string;
}

const Blog = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const blogSectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Remove or modify the scroll tracking for animations to prevent blur
  // Instead of reducing opacity when scrolling, we'll keep it constant
  const { scrollY } = useScroll();

  // Check scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Getting Started with PassVault",
      excerpt: "Learn how to maximize your digital security with our comprehensive guide.",
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&q=80",
      author: "Rahul Sharma",
      date: "2024-01-15",
      tags: ["Security", "Guide"],
      category: "guides",
      featured: true,
      readTime: "5 min"
    },
    {
      id: 2,
      title: "Best Practices for Password Management",
      excerpt: "Discover the essential practices for maintaining secure passwords across all your accounts.",
      image: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=500&q=80",
      author: "Priya Patel",
      date: "2024-01-18",
      tags: ["Security", "Tips"],
      category: "security",
      readTime: "4 min"
    },
    {
      id: 3,
      title: "Understanding Two-Factor Authentication",
      excerpt: "Everything you need to know about 2FA and why it's crucial for your security.",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&q=80",
      author: "Vikram Singh",
      date: "2024-01-20",
      tags: ["2FA", "Security"],
      category: "security",
      readTime: "6 min"
    },
    {
      id: 4,
      title: "PassVault 2.0: What's New",
      excerpt: "Explore the latest features and improvements in our newest release.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
      author: "Meera Kapoor",
      date: "2024-01-22",
      tags: ["Updates", "Features"],
      category: "updates",
      featured: true,
      readTime: "3 min"
    },
    {
      id: 5,
      title: "Securing Your Digital Identity",
      excerpt: "Essential tips for protecting your online presence in today's digital world.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80",
      author: "Arjun Mehta",
      date: "2024-01-25",
      tags: ["Security", "Identity"],
      category: "security",
      readTime: "7 min"
    },
    {
      id: 6,
      title: "Password Manager for Teams",
      excerpt: "How PassVault helps businesses manage secure access across teams.",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=80",
      author: "Neha Gupta",
      date: "2024-01-28",
      tags: ["Teams", "Enterprise"],
      category: "guides",
      readTime: "5 min"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Posts', icon: <FaTags /> },
    { id: 'security', name: 'Security', icon: <FaTags /> },
    { id: 'guides', name: 'Guides', icon: <FaTags /> },
    { id: 'updates', name: 'Updates', icon: <FaTags /> }
  ];

  const filteredPosts = blogPosts
    .filter(post => 
      (selectedCategory === 'all' || post.category === selectedCategory) &&
      (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const featuredPosts = blogPosts.filter(post => post.featured);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 10px 15px -5px rgba(0, 0, 0, 0.08)",
      transition: { type: "spring", stiffness: 300 }
    }
  };

  const blogCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    hover: {
      y: -10,
      transition: {
        type: "spring",
        stiffness: 400
      }
    }
  };

  const imageHoverVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
              <FaBookmark className="h-7 w-7 text-violet-600" />
            </div>
          </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-lg">Loading amazing content...</p>
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

      {/* Blog content */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-crimson">
        {/* Hero Section - Remove opacity effect */}
        <motion.section 
          className="relative py-20 px-4 overflow-hidden"
        >
          <div className="absolute inset-0 z-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="4" cy="4" r="1" fill="currentColor" className="text-purple-500" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto relative z-10"
          >
            <div className="text-center mb-12">
              <span className="px-4 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4 inline-block">
                OUR INSIGHTS
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-purple-600 to-indigo-600">
                PassVault Blog
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Insights, updates, and stories from the PassVault team to help you stay secure in the digital world
              </p>
            </div>

            {/* Featured Post Section */}
            {featuredPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Featured Posts</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredPosts.slice(0, 2).map((post) => (
                    <motion.div
                      key={`featured-${post.id}`}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      className="group relative h-[28rem] overflow-hidden rounded-3xl shadow-xl cursor-pointer bg-gradient-to-t from-purple-900 to-blue-900 border border-white/10"
                      onClick={() => navigate(`/blog/${post.id}`)}
                    >
                      {/* New Modern Card Design */}
                      
                      {/* Glass morphism top bar */}
                      <div className="absolute top-0 left-0 right-0 h-16 bg-white/10 backdrop-blur-md z-20 flex items-center justify-between px-6">
                        <div className="flex items-center space-x-2">
                          <span className="bg-purple-600/90 px-3 py-1 rounded-full text-white text-sm font-medium">Featured</span>
                          <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                          <span className="text-white/80 text-sm">{post.category.charAt(0).toUpperCase() + post.category.slice(1)}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center text-white/80 text-sm">
                            <FaEye className="mr-1 text-xs" /> {post.readTime}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/30"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaBookmark className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Background Image with improved gradient overlay */}
                      <motion.div
                        variants={imageHoverVariants}
                        className="absolute inset-0 w-full h-full"
                      >
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 mix-blend-multiply"></div>
                      </motion.div>
                      
                      {/* Content with improved layout */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                        <div className="flex items-center space-x-2 text-white/80 text-sm mb-4">
                          <span className="flex items-center">
                            <FaCalendar className="mr-1.5 text-xs text-purple-300" /> 
                            {new Date(post.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors duration-300">
                          {post.title}
                        </h3>
                        
                        <p className="text-white/80 mb-6 line-clamp-2 text-lg">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/20">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/30">
                              <img 
                                src={`https://i.pravatar.cc/150?u=${post.author}`} 
                                alt={post.author}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-white text-sm font-medium">{post.author}</span>
                          </div>
                          
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white flex items-center group-hover:bg-purple-600/80 transition-all duration-300"
                          >
                            Read Article <FaArrowRight className="ml-2" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Search and Filter Section */}
            <div className="mb-12 rounded-2xl bg-white/70 backdrop-blur-md p-6 shadow-lg border border-white/50">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:shadow-md"
                  />
                </div>
                
                <div className="hidden md:flex gap-2 flex-wrap justify-center">
                  {categories.map(category => (
                    <motion.button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-5 py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-white text-gray-600 hover:bg-purple-50 hover:shadow-md'
                      }`}
                      whileHover={{ y: -3 }}
                      whileTap={{ y: 0 }}
                    >
                      {category.icon}
                      {category.name}
                    </motion.button>
                  ))}
                </div>
                
                {/* Mobile filter dropdown */}
                <div className="md:hidden w-full">
                  <motion.button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white text-gray-700 border border-gray-200 shadow-sm"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      <FaFilter />
                      <span>Filter: {categories.find(c => c.id === selectedCategory)?.name}</span>
                    </div>
                    <FaChevronDown className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white mt-2 rounded-xl shadow-lg overflow-hidden border border-gray-200"
                      >
                        {categories.map(category => (
                          <motion.button
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full px-5 py-3 flex items-center gap-2 ${
                              selectedCategory === category.id
                                ? 'bg-purple-50 text-purple-700'
                                : 'hover:bg-gray-50'
                            }`}
                            whileHover={{ backgroundColor: '#f5f3ff' }}
                          >
                            {category.icon}
                            {category.name}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Blog Posts Grid */}
            <motion.div
              ref={blogSectionRef}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    variants={blogCardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    layoutId={`post-${post.id}`}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-purple-200/30 transition-all duration-500 relative flex flex-col"
                    onClick={() => navigate(`/blog/${post.id}`)}
                  >
                    <motion.div 
                      className="relative w-full h-56 overflow-hidden"
                      whileHover="hover"
                    >
                      {/* Enhanced image effects */}
                      <motion.div
                        variants={imageHoverVariants}
                        className="w-full h-full"
                      >
                        <img
                          src={post.image}
                          alt={`Blog Post ${post.id}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Modern Category Tag */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-purple-700 rounded-full text-xs font-medium shadow-sm border border-purple-100">
                          {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                        </span>
                      </div>
                      
                      {/* Save Button with hover effect */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-purple-600 shadow-sm border border-white/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaBookmark className="w-3.5 h-3.5" />
                      </motion.button>
                      
                      {/* Read Time with enhanced styling */}
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs flex items-center gap-1 border border-white/10">
                        <FaEye className="w-3 h-3" />
                        {post.readTime} read
                      </div>
                    </motion.div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <FaCalendar className="text-purple-500" /> 
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-purple-200">
                            <img 
                              src={`https://i.pravatar.cc/150?u=${post.author}`} 
                              alt={post.author}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{post.author}</span>
                        </div>
                      </div>
                      
                      <motion.h2 
                        className="text-xl font-bold mb-3 text-gray-800 group-hover:text-purple-700 transition-colors duration-300"
                      >
                        {post.title}
                      </motion.h2>
                      
                      <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="mt-auto">
                        <div className="flex items-center flex-wrap gap-2 mb-4">
                          {post.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="text-purple-700 font-medium hover:text-purple-800 transition-colors inline-flex items-center"
                        >
                          Read Article <FaArrowRight className="ml-2" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredPosts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-inner"
              >
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" 
                  alt="No results"
                  className="w-24 h-24 mx-auto mb-4 opacity-50"
                />
                <h3 className="text-xl text-gray-600 mb-2">No posts found matching your criteria</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Reset Filters
                </button>
              </motion.div>
            )}

            {/* Pagination */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 flex justify-between items-center"
            >
              <button
                className="flex items-center px-6 py-3 rounded-xl bg-white shadow-md border border-gray-100 text-gray-700 hover:bg-purple-50 transition-all duration-300"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                <FaArrowLeft className="mr-2" /> Previous
              </button>
              
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(page => (
                  <motion.button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      currentPage === page 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-300/30'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {page}
                  </motion.button>
                ))}
              </div>
              
              <button
                className="flex items-center px-6 py-3 rounded-xl bg-white shadow-md border border-gray-100 text-gray-700 hover:bg-purple-50 transition-all duration-300"
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next <FaArrowRight className="ml-2" />
              </button>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors z-50"
            onClick={scrollToTop}
          >
            <FaArrowUp />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Add Footer at the bottom */}
      <Footer />
    </>
  );
};

export default Blog;
