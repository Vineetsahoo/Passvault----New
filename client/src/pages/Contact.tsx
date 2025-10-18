import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheck, FaComments, FaClock, FaGlobe, FaHeadset, FaRocket, FaQuestionCircle, FaArrowRight } from 'react-icons/fa';
// Import Navbar and Footer
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    subject: '',
    message: '' 
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!emailRegex.test(formData.email)) errors.email = 'Valid email is required';
    if (formData.phone && !phoneRegex.test(formData.phone)) errors.phone = 'Valid phone number is required';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) errors.message = 'Message is required';

    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormSubmitted(true);
    // Add your form submission logic here
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-3 border-violet-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-5 rounded-full bg-white flex items-center justify-center">
              <FaEnvelope className="h-7 w-7 text-violet-600" />
            </div>
          </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-lg">Connecting you with us...</p>
        </div>
      </div>
    );
  }

  const contactInfo = [
    { 
      icon: <FaEnvelope className="w-5 h-5" />, 
      title: 'Email Us', 
      info: 'support@passvault.com', 
      detail: 'We reply within 24 hours', 
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      hoverColor: "hover:from-blue-600 hover:to-cyan-600"
    },
    { 
      icon: <FaPhone className="w-5 h-5" />, 
      title: 'Call Us', 
      info: '+91 (891) 234-5678', 
      detail: 'Mon-Fri: 9AM - 6PM IST', 
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      hoverColor: "hover:from-violet-600 hover:to-purple-600"
    },
    { 
      icon: <FaMapMarkerAlt className="w-5 h-5" />, 
      title: 'Visit Us', 
      info: 'Chennai, Tamil Nadu', 
      detail: 'SRM University Campus', 
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      hoverColor: "hover:from-pink-600 hover:to-rose-600"
    },
  ];

  return (
    <>
      {/* Add Navbar at the top */}
      <Navbar />
      
      {/* Add spacing for fixed navbar */}
      <div className="h-20"></div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden font-lato">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            {/* Hero Header */}
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-200 rounded-full text-sm font-medium text-violet-700 mb-6"
              >
                <span>24/7 Customer Support Available</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"
              >
                Let's Connect
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              >
                Have a question or feedback? We're here to help and would love to hear from you.
              </motion.p>
            </div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 max-w-5xl mx-auto"
            >
              {[
                { icon: <FaClock />, stat: '< 24h', label: 'Response Time' },
                { icon: <FaGlobe />, stat: '50+', label: 'Countries' },
                { icon: <FaHeadset />, stat: '24/7', label: 'Support' },
                { icon: <FaRocket />, stat: '99.9%', label: 'Satisfaction' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-lg text-center"
                >
                  <div className="text-3xl text-violet-600 mb-3 flex justify-center">{item.icon}</div>
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mb-1">
                    {item.stat}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{item.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Contact Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-20">
              {/* Contact Info Cards - Left Side */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-2 space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>
                
                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ x: 8, scale: 1.02 }}
                      className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} ${item.hoverColor} text-white shadow-md group-hover:shadow-lg transition-all duration-300`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-violet-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-lg font-semibold text-violet-600 mb-1">{item.info}</p>
                          <p className="text-sm text-gray-500">{item.detail}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Map */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                >
                  <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="w-5 h-5" />
                      <h3 className="font-semibold text-lg">Find Us Here</h3>
                    </div>
                    <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors">
                      Get Directions
                    </button>
                  </div>
                  <div className="h-72">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.040704806372!2d80.0421958!3d12.8230831!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52f712b57a2b37%3A0xaa225c163e3aa750!2sSRM%20Institute%20of%20Science%20and%20Technology!5e0!3m2!1sen!2sin!4v1679900000000!5m2!1sen!2sin"
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                </motion.div>
              </motion.div>

              {/* Contact Form - Right Side */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-3"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-100 relative overflow-hidden">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-100/40 to-indigo-100/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-cyan-100/40 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                  
                  <div className="relative z-10">
                    {/* Form Header */}
                    <div className="mb-8">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg">
                          <FaComments className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Send a Message</h2>
                      </div>
                      <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name and Email Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={`w-full px-5 py-4 rounded-xl border-2 ${
                              formErrors.name ? 'border-red-500' : 'border-gray-200'
                            } focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white transition-all outline-none text-gray-800 placeholder:text-gray-400`}
                          />
                          {formErrors.name && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-2 flex items-center gap-1"
                            >
                              <FaQuestionCircle className="w-3 h-3" />
                              {formErrors.name}
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className={`w-full px-5 py-4 rounded-xl border-2 ${
                              formErrors.email ? 'border-red-500' : 'border-gray-200'
                            } focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white transition-all outline-none text-gray-800 placeholder:text-gray-400`}
                          />
                          {formErrors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-2 flex items-center gap-1"
                            >
                              <FaQuestionCircle className="w-3 h-3" />
                              {formErrors.email}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      {/* Phone and Subject Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className={`w-full px-5 py-4 rounded-xl border-2 ${
                              formErrors.phone ? 'border-red-500' : 'border-gray-200'
                            } focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white transition-all outline-none text-gray-800 placeholder:text-gray-400`}
                          />
                          {formErrors.phone && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-2 flex items-center gap-1"
                            >
                              <FaQuestionCircle className="w-3 h-3" />
                              {formErrors.phone}
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                            Subject <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="How can we help?"
                            className={`w-full px-5 py-4 rounded-xl border-2 ${
                              formErrors.subject ? 'border-red-500' : 'border-gray-200'
                            } focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white transition-all outline-none text-gray-800 placeholder:text-gray-400`}
                          />
                          {formErrors.subject && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-2 flex items-center gap-1"
                            >
                              <FaQuestionCircle className="w-3 h-3" />
                              {formErrors.subject}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          placeholder="Tell us more about your inquiry..."
                          className={`w-full px-5 py-4 rounded-xl border-2 ${
                            formErrors.message ? 'border-red-500' : 'border-gray-200'
                          } focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white transition-all outline-none text-gray-800 placeholder:text-gray-400 resize-none`}
                        ></textarea>
                        {formErrors.message && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-2 flex items-center gap-1"
                          >
                            <FaQuestionCircle className="w-3 h-3" />
                            {formErrors.message}
                          </motion.p>
                        )}
                      </div>

                      {/* Submit Button or Success Message */}
                      <AnimatePresence mode="wait">
                        {formSubmitted ? (
                          <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl"
                          >
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1, rotate: 360 }}
                                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                >
                                  <FaCheck className="w-6 h-6 text-white" />
                                </motion.div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-green-700 mb-1">Message Sent Successfully!</h3>
                                <p className="text-green-600">
                                  Thank you for reaching out. Our team will get back to you within 24 hours.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="submit"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <FaPaperPlane className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            <span className="relative z-10">Send Message</span>
                            <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </motion.button>
                        )}
                      </AnimatePresence>

                      <p className="text-sm text-gray-500 text-center">
                        By submitting this form, you agree to our{' '}
                        <a href="#" className="text-violet-600 hover:underline font-medium">Privacy Policy</a>
                        {' '}and{' '}
                        <a href="#" className="text-violet-600 hover:underline font-medium">Terms of Service</a>
                      </p>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mt-24"
            >
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 rounded-full text-sm font-medium text-blue-700 mb-6"
                >
                  <FaQuestionCircle className="w-4 h-4" />
                  <span>Frequently Asked Questions</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
                  Common Questions
                </h2>
                
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Find quick answers to the most frequently asked questions about our services.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    question: "How quickly will I receive a response?",
                    answer: "We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly and our team will assist you immediately."
                  },
                  {
                    question: "What support channels are available?",
                    answer: "We offer multiple support channels including email, phone, and live chat. Our 24/7 support team is always ready to help you with any questions or concerns."
                  },
                  {
                    question: "Can I schedule a demo or consultation?",
                    answer: "Absolutely! Simply fill out the contact form with your requirements and preferred time, and our team will reach out to schedule a personalized demo or consultation."
                  },
                  {
                    question: "Do you provide technical support?",
                    answer: "Yes, we provide comprehensive technical support for all our products and services. Our expert team is available to help you resolve any technical issues quickly."
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-100/50 to-indigo-100/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg shadow-md">
                          <FaQuestionCircle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 flex-1">{faq.question}</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed pl-14">{faq.answer}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mt-24"
            >
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 90, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 20,
                      ease: "linear"
                    }}
                    className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, -90, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 15,
                      ease: "linear"
                    }}
                    className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full"
                  />
                </div>

                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      Still Have Questions?
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                      Our dedicated team is here to help you find the perfect solution for your needs.
                      Get in touch with us today!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-white text-violet-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group"
                      >
                        <FaPhone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Call Us Now</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-3 group"
                      >
                        <FaEnvelope className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Email Us</span>
                      </motion.button>
                    </div>
                  </motion.div>
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

export default Contact;