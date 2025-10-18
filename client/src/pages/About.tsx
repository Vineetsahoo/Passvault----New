import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  FaUserTie, FaUserSecret, FaUser, FaLinkedin, 
  FaTwitter, FaAward, FaUsers, FaGlobe, 
  FaHandshake, FaChartLine, FaGithub, FaCode,
  FaLightbulb, FaShieldAlt, FaPuzzlePiece, FaRocket
} from 'react-icons/fa';
import { MdWorkOutline, MdTimeline } from 'react-icons/md';
// Import Navbar and Footer
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Add interface for team member type
interface TeamMember {
  name: string;
  role: string;
  specialty: string;
  image: string;
  linkedin: string;
  twitter: string;
  github: string;
  skills: string[];
  quote: string;
  highlights?: string[];
  color?: string;
  achievements: {
    projects: string;
    hackathons?: string;
    courses?: string;
  };
}

const About = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const teamMembers: TeamMember[] = [
    { 
      name: "Vineet Sahoo", 
      role: "Frontend Developer",
      specialty: "Frontend Architecture", 
      image: "https://avatars.githubusercontent.com/u/98162361?v=4",
      linkedin: "https://www.linkedin.com/in/vineet-sahoo-81b022311/",
      twitter: "https://x.com/VineetSaho63046",
      github: "https://github.com/Vineetsahoo",
      skills: ["React", "Node.js", "AWS", "TypeScript"],
      quote: "Coding between classes, building tomorrow's web today",
      highlights: ["UI/UX Specialist", "Performance Optimization", "Responsive Design"],
      color: "from-blue-600 to-indigo-600",
      achievements: {
        projects: "5+",
        hackathons: "4+",
        courses: "12+"
      }
    },
    { 
      name: "Saumye Singh", 
      role: "Full Stack Developer",
      specialty: "Backend Systems", 
      image: "https://avatars.githubusercontent.com/u/98162362?v=4",
      linkedin: "https://www.linkedin.com/in/saumye-singh-29135a307/",
      twitter: "https://x.com/SSingh89342323",
      github: "https://github.com/Saumye0106",
      skills: ["Python", "Node.js", "MongoDB", "Docker"],
      quote: "From dorm room debugging to campus hackathon champion",
      highlights: ["API Architecture", "Database Design", "System Scaling"],
      color: "from-emerald-600 to-teal-600",
      achievements: {
        projects: "5+",
        hackathons: "5+",
        courses: "15+"
      }
    }
  ];

  const values = [
    {
      title: "Innovation",
      description: "Constantly pushing boundaries to create cutting-edge solutions",
      icon: FaLightbulb,
      color: "from-amber-500 to-orange-600"
    },
    {
      title: "Security",
      description: "Unwavering commitment to protecting user data and privacy",
      icon: FaShieldAlt,
      color: "from-blue-600 to-indigo-700"
    },
    {
      title: "Collaboration",
      description: "Working together to deliver exceptional results for our clients",
      icon: FaUsers,
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Excellence",
      description: "Striving for the highest quality in everything we do",
      icon: FaAward,
      color: "from-purple-600 to-pink-600"
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-3 border-indigo-600 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-sm opacity-70 animate-pulse"></div>
            <div className="absolute inset-5 rounded-full bg-white flex items-center justify-center">
              <FaUsers className="h-7 w-7 text-indigo-600" />
            </div>
          </div>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 font-medium text-lg">Loading our story...</p>
        </div>
      </div>
    );
  }

  const TeamSection = () => {
    return (
      <motion.section 
        className="py-24 px-4 bg-gradient-to-br from-slate-50 via-white to-slate-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-4 inline-block">
              OUR EXPERTS
            </span>
            <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-slate-800">
              Meet The Team
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Meet the brilliant minds shaping the future of digital innovation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
                onClick={() => setSelectedMember(selectedMember === index ? null : index)}
              >
                <div className="relative bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200/50 
                               hover:border-indigo-200 transition-all duration-300
                               hover:shadow-2xl hover:shadow-indigo-200/20 cursor-pointer overflow-hidden">
                  {/* Decorative Elements */}
                  <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${member.color || 'from-indigo-600 to-purple-600'} 
                                rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-all duration-700 group-hover:scale-150`}></div>
                  
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <pattern id="doodlePattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#doodlePattern)" />
                    </svg>
                  </div>
                  
                  {/* Profile Header */}
                  <div className="relative z-10 flex items-center gap-6 mb-6">
                    <motion.div 
                      className="relative w-24 h-24"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${member.color || 'from-indigo-600 to-purple-600'} rounded-2xl 
                                    rotate-6 opacity-20 group-hover:rotate-12 transition-all duration-300`}></div>
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full rounded-2xl object-cover border-2 border-white shadow-lg relative z-10"
                      />
                      <motion.div
                        className={`absolute -bottom-2 -right-2 bg-gradient-to-r ${member.color || 'from-indigo-600 to-purple-600'} 
                                 text-white p-2 rounded-full shadow-lg`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <FaCode className="w-3 h-3" />
                      </motion.div>
                    </motion.div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-800">{member.name}</h3>
                      <p className={`bg-clip-text text-transparent bg-gradient-to-r ${member.color || 'from-indigo-600 to-purple-600'} font-medium`}>
                        {member.role}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{member.specialty}</p>
                    </div>
                  </div>

                  <div className="mb-4 relative z-10">
                    <p className="text-slate-600 italic mb-4 pl-3 border-l-2 border-indigo-300">"{member.quote}"</p>
                    
                    {/* Achievement Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {member.achievements.projects && (
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            {member.achievements.projects}
                          </p>
                          <p className="text-xs text-gray-500">Projects</p>
                        </div>
                      )}
                      {member.achievements.hackathons && (
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            {member.achievements.hackathons}
                          </p>
                          <p className="text-xs text-gray-500">Hackathons</p>
                        </div>
                      )}
                      {member.achievements.courses && (
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            {member.achievements.courses}
                          </p>
                          <p className="text-xs text-gray-500">Courses</p>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    {/* Expertise Highlights */}
                    {member.highlights && (
                      <AnimatePresence>
                        {selectedMember === index && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 overflow-hidden"
                          >
                            <p className="font-medium text-sm text-slate-700 mb-2">Expertise:</p>
                            <ul className="space-y-1">
                              {member.highlights.map((highlight, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-end gap-3 relative z-10">
                    {[
                      { platform: 'linkedin', icon: FaLinkedin, url: member.linkedin },
                      { platform: 'twitter', icon: FaTwitter, url: member.twitter },
                      { platform: 'github', icon: FaGithub, url: member.github }
                    ].map(({ platform, icon: Icon, url }) => (
                      <motion.a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm border border-slate-100"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  };

  return (
    <>
      {/* Add Navbar at the top */}
      <Navbar />
      
      {/* Add spacing for fixed navbar */}
      <div className="h-20"></div>
      
      {/* Modern Professional Theme */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-playfair">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="absolute inset-0 bg-indigo-50 opacity-5 z-0">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <motion.div 
            className="max-w-7xl mx-auto text-center relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6">
              <span className="px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                WHO WE ARE
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-slate-900">
              About Us
            </h1>
            <motion.p 
              className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto"
              {...fadeIn}
            >
              Discover our mission to revolutionize the way people manage their digital life.
            </motion.p>
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/50 mb-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 z-10"></div>
              <img
                src="https://a.storyblok.com/f/99519/1100x620/0aa998eef4/blog-hero-image-3.png/m/680x350/filters:format(png)"
                alt="Our Team"
                className="w-full object-cover rounded-3xl shadow-inner"
                style={{ minHeight: "400px" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent rounded-3xl"></div>
              <div className="absolute bottom-0 left-0 p-8 z-20">
                <h2 className="text-3xl font-bold text-white mb-2">Our journey started in 2021</h2>
                <p className="text-slate-200">Building digital solutions that transform businesses</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Company Values */}
        <motion.section 
          className="py-20 px-4 bg-gradient-to-br from-slate-50 via-white to-slate-50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="px-4 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-medium mb-4 inline-block">
                OUR FOUNDATION
              </span>
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-teal-600">
                Our Values
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                These principles guide every decision we make and product we build
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  className="p-8 rounded-3xl bg-white shadow-xl border border-slate-100 relative overflow-hidden group"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${value.color}`}></div>
                  <div className={`absolute -right-12 -top-12 w-24 h-24 rounded-full bg-gradient-to-br ${value.color} opacity-10 blur-xl group-hover:scale-150 transition-all duration-700`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} text-white mb-6 shadow-lg`}>
                      <value.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">{value.title}</h3>
                    <p className="text-slate-600 text-lg">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Timeline Section */}
        <motion.section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4 inline-block">
                OUR HISTORY
              </span>
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-slate-800">
                Our Journey
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
                From our humble beginnings to where we are today
              </p>
            </div>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 transform md:translate-x-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-indigo-200 rounded-full"></div>
              
              <div className="space-y-12">
                {[
                  { 
                    year: "2023", 
                    title: "Global Expansion", 
                    description: "Reached users in 25+ countries", 
                    icon: FaGlobe,
                    color: "from-indigo-500 to-blue-600"
                  },
                  { 
                    year: "2022", 
                    title: "Enterprise Launch", 
                    description: "Introduced enterprise solutions for large businesses", 
                    icon: FaChartLine,
                    color: "from-emerald-500 to-teal-600"
                  },
                  { 
                    year: "2021", 
                    title: "Platform Launch", 
                    description: "Official launch of our flagship platform with innovative features", 
                    icon: FaRocket,
                    color: "from-orange-500 to-amber-600"
                  }
                ].map((milestone, index) => (
                  <motion.div
                    key={index}
                    className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    {/* Timeline Node */}
                    <div className="flex-none w-16 h-16 relative z-10">
                      <div className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br ${milestone.color} text-white shadow-lg border-4 border-white`}>
                        <milestone.icon className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/40">
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-4">
                          {milestone.year}
                        </span>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">{milestone.title}</h3>
                        <p className="text-lg text-slate-600">{milestone.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Vision Section */}
        <motion.section 
          className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div className="backdrop-blur-sm bg-white/90 p-16 rounded-3xl shadow-2xl border border-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full opacity-10 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full opacity-10 blur-3xl"></div>
              
              <div className="relative z-10 text-center">
                <span className="px-4 py-1 bg-gradient-to-r from-rose-100 to-teal-100 text-rose-800 rounded-full text-sm font-medium mb-6 inline-block">
                  OUR AMBITION
                </span>
                <h2 className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-teal-600">
                  Our Vision
                </h2>
                <p className="text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
                  To be the leading provider of digital solutions that empower individuals and businesses to thrive in the digital age.
                </p>
                <div className="mt-12 flex justify-center">
                  <motion.button
                    className="px-8 py-3 bg-gradient-to-r from-rose-600 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/services')}
                  >
                    Explore Our Services
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <TeamSection />

        {/* Contact CTA */}
        <motion.section 
          className="py-24 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 p-16 rounded-3xl shadow-2xl">
              <div className="absolute inset-0 w-full h-full opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1.5" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-6 text-white">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-indigo-100 mb-12 max-w-lg mx-auto">
                  Join thousands of satisfied users who trust our platform for their digital needs
                </p>
                <motion.button 
                  onClick={() => navigate('/Contact')} 
                  className="px-8 py-4 bg-white text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Contact Our Team
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
      
      {/* Add Footer at the bottom */}
      <Footer />
    </>
  );
};

export default About;