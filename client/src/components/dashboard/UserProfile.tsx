import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaShieldAlt, FaCreditCard, FaBell, FaKey, FaUserCog, 
  FaHistory, FaCrown, FaFingerprint, FaCamera, FaEnvelope,
  FaLanguage, FaMoon, FaLock, FaTrash, FaDownload, FaArrowLeft,
  FaBriefcase, FaMapMarkerAlt, FaPhoneAlt, FaGlobe, 
  FaLinkedin, FaGithub, FaTwitter, FaCalendarAlt,
  FaGraduationCap, FaIdCard, FaBirthdayCake, FaPassport,
  FaUserTie, FaBuilding, FaAddressCard,
  FaUser, FaCheckCircle, FaFileInvoiceDollar, FaReceipt, FaFilePdf,
  FaCcVisa, FaCcMastercard, FaFileSignature, FaFileContract,
  FaFileAlt, FaFileMedical, FaQrcode, FaListAlt, FaEdit,
  FaUserSecret, FaUsers, FaShieldVirus, FaFileExport, FaEllipsisH, 
  FaExclamationTriangle, FaChevronRight, FaCog, FaSave, FaSpinner, FaUpload, FaTimes
} from 'react-icons/fa';
import { HiOutlineUserCircle } from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Country to phone code mapping
const COUNTRY_PHONE_CODES: Record<string, string> = {
  'india': '+91',
  'united states': '+1',
  'usa': '+1',
  'united kingdom': '+44',
  'uk': '+44',
  'canada': '+1',
  'australia': '+61',
  'germany': '+49',
  'france': '+33',
  'japan': '+81',
  'china': '+86',
  'brazil': '+55',
  'russia': '+7',
  'south korea': '+82',
  'spain': '+34',
  'italy': '+39',
  'mexico': '+52',
  'indonesia': '+62',
  'netherlands': '+31',
  'saudi arabia': '+966',
  'turkey': '+90',
  'switzerland': '+41',
  'poland': '+48',
  'belgium': '+32',
  'sweden': '+46',
  'norway': '+47',
  'austria': '+43',
  'denmark': '+45',
  'finland': '+358',
  'singapore': '+65',
  'malaysia': '+60',
  'thailand': '+66',
  'philippines': '+63',
  'vietnam': '+84',
  'pakistan': '+92',
  'bangladesh': '+880',
  'egypt': '+20',
  'nigeria': '+234',
  'south africa': '+27',
  'argentina': '+54',
  'colombia': '+57',
  'chile': '+56',
  'peru': '+51',
  'uae': '+971',
  'united arab emirates': '+971',
  'israel': '+972',
  'greece': '+30',
  'portugal': '+351',
  'new zealand': '+64',
  'ireland': '+353',
  'czech republic': '+420',
  'romania': '+40',
  'hungary': '+36',
};

interface IUserProfile {
  name: string;
  email: string;
  role: string;
  preferences: {
    theme: string;
    notifications: boolean;
    language: string;
  };
  avatar: string;
  memberSince: string;
  lastLogin: string;
  securityScore: number;
  twoFactorEnabled: boolean;
  totalDevices: number;
  activeSubscription: string;
  nextBilling: string;
  personalInfo: {
    dateOfBirth: string;
    phoneNumber: string;
    nationality: string;
    maritalStatus: string;
    gender: string;
  };
  professionalInfo: {
    occupation: string;
    company: string;
    department: string;
    employeeId: string;
    experience: string;
    education: {
      degree: string;
      institution: string;
      year: string;
    }[];
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  socialProfiles: {
    linkedin: string;
    github: string;
    twitter: string;
    website: string;
  };
  identityDocuments: {
    type: string;
    number: string;
    expiryDate: string;
  }[];
  bankingInfo: {
    accountHolder: string;
    accountType: string;
    lastFourDigits: string;
  };
  security: {
    lastPasswordChange: string;
    loginAttempts: number;
    securityQuestions: number;
    activeDevices: number;
    loginHistory: Array<{
      device: string;
      browser?: string;
      location: string;
      timestamp?: string;
      time?: string;
      status: 'success' | 'failed';
    }>;
    recoveryEmail?: string;
    backupCodes: number;
  };
  documents: {
    identity: Array<{
      id?: string;
      type: string;
      number?: string;
      expiryDate?: string;
      status?: 'active' | 'expired';
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      uploadedAt?: string;
    }>;
    financial: Array<{
      id?: string;
      type: string;
      institution?: string;
      lastUpdated?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      uploadedAt?: string;
    }>;
  };
  billing: {
    paymentMethods: Array<{
      id?: string;
      type: 'credit' | 'debit';
      provider: string;
      lastFour: string;
      expiryDate: string;
      isDefault: boolean;
      cardHolderName?: string;
      addedAt?: string;
    }>;
    invoices: Array<{
      id: string;
      invoiceId?: string;
      date: string;
      amount: number;
      status: 'paid' | 'pending';
      description?: string;
      downloadUrl: string;
    }>;
    subscriptionHistory: Array<{
      id?: string;
      plan: string;
      startDate: string;
      endDate: string;
      amount: number;
      status: 'active' | 'expired';
    }>;
  };
}

const UserProfileHeader: React.FC<{ 
  profile: IUserProfile; 
  onEditClick: () => void;
}> = ({ profile, onEditClick }) => (
  <div className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r from-indigo-600 to-purple-700 mb-8">
    <div className="absolute inset-0 bg-pattern opacity-10"></div>
    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-10 -translate-y-20"></div>
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-10 translate-y-20"></div>
    
    <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
      <div className="relative group">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onEditClick}
          className="absolute bottom-0 right-0 p-2 bg-white text-indigo-600 rounded-full shadow-lg hover:bg-indigo-50 transition-all"
        >
          <FaCamera className="w-4 h-4" />
        </motion.button>
      </div>
      
      <div className="text-center md:text-left text-white">
        <h1 className="text-2xl sm:text-3xl font-bold">{profile.name}</h1>
        <p className="text-indigo-100">{profile.email}</p>
        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
          <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
            {profile.role}
          </span>
          {profile.twoFactorEnabled && (
            <span className="px-4 py-1.5 bg-green-600/30 backdrop-blur-sm border border-green-300/30 rounded-full text-white text-sm font-medium flex items-center gap-1.5">
              <FaShieldAlt className="text-green-100" size={12} /> 2FA Enabled
            </span>
          )}
        </div>
      </div>
      
      <div className="ml-auto hidden lg:flex items-center gap-6 text-white/80">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white">{profile.securityScore}%</span>
          <span className="text-xs">Security Score</span>
        </div>
        <div className="h-12 w-0.5 bg-white/20"></div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white">{profile.totalDevices}</span>
          <span className="text-xs">Devices</span>
        </div>
        <div className="h-12 w-0.5 bg-white/20"></div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white">{profile.memberSince}</span>
          <span className="text-xs">Member Since</span>
        </div>
      </div>
    </div>
    
    <div className="bg-indigo-800/30 backdrop-blur-sm flex items-center justify-between px-6 sm:px-8 py-3 border-t border-white/10">
      <div className="text-white/70 text-sm flex items-center gap-2">
        <FaHistory size={12} /> Last login: {profile.lastLogin}
      </div>
      <div className="flex items-center">
        <motion.button
          whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          onClick={onEditClick}
          className="p-2 rounded-full text-white/80 hover:text-white"
          title="Edit Profile"
        >
          <FaEdit className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  </div>
);

const ProfileSection: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
  >
    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

const InfoCard: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    transition={{ type: "spring", stiffness: 400 }}
    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all"
  >
    <div className="flex items-center gap-3">
      {icon && <div className="text-indigo-500">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  </motion.div>
);

// Validation Error Component
const ValidationError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-600 text-sm mt-1 flex items-center gap-1"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </motion.p>
  );
};

const PersonalInfoCard: React.FC<{ info: IUserProfile['personalInfo'] }> = ({ info }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <InfoCard 
      label="Date of Birth" 
      value={info.dateOfBirth}
      icon={<FaBirthdayCake />}
    />
    <InfoCard 
      label="Phone Number" 
      value={info.phoneNumber}
      icon={<FaPhoneAlt />}
    />
    <InfoCard 
      label="Nationality" 
      value={info.nationality}
      icon={<FaPassport />}
    />
    <InfoCard 
      label="Marital Status" 
      value={info.maritalStatus}
      icon={<FaUsers />}
    />
    <InfoCard 
      label="Gender" 
      value={info.gender}
      icon={<FaUserSecret />}
    />
  </div>
);

const AddressCard: React.FC<{ address: IUserProfile['address'] }> = ({ address }) => (
  <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
    <div className="flex items-start gap-4">
      <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
        <FaMapMarkerAlt className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-medium text-lg text-gray-900 mb-1">{address.street}</h3>
        <p className="text-gray-600">{`${address.city}, ${address.state}`}</p>
        <p className="text-gray-600">{`${address.country} - ${address.postalCode}`}</p>
      </div>
      <div className="ml-auto">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full hover:bg-gray-200 text-gray-500"
        >
          <FaEdit />
        </motion.button>
      </div>
    </div>
  </div>
);

const ProfessionalInfoCard: React.FC<{ info: IUserProfile['professionalInfo'] }> = ({ info }) => (
  <div className="space-y-6">
    <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-white shadow-sm rounded-xl text-indigo-600">
          <FaBriefcase className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-medium text-lg text-gray-900">{info.occupation}</h3>
          <p className="text-indigo-600">{`${info.company}`}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg">
          <p className="text-gray-500 mb-1">Department</p>
          <p className="font-medium">{info.department}</p>
        </div>
        <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg">
          <p className="text-gray-500 mb-1">Employee ID</p>
          <p className="font-medium">{info.employeeId}</p>
        </div>
        <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg">
          <p className="text-gray-500 mb-1">Experience</p>
          <p className="font-medium">{info.experience}</p>
        </div>
      </div>
    </div>
    
    <h3 className="font-medium text-gray-800 mt-6 mb-3 flex items-center gap-2">
      <FaGraduationCap />
      Education
    </h3>
    
    <div className="space-y-4">
      {info.education.map((edu, index) => (
        <motion.div 
          key={index} 
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-4 bg-white shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-12 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
            <div>
              <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
              <p className="text-gray-600">{edu.institution}</p>
              <p className="text-sm text-indigo-600 mt-1">{edu.year}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const SocialProfilesCard: React.FC<{ profiles: IUserProfile['socialProfiles'] }> = ({ profiles }) => (
  <div className="grid grid-cols-2 gap-4">
    {Object.entries(profiles).map(([platform, url]) => (
      <motion.a
        key={platform}
        whileHover={{ y: -3, backgroundColor: "#fff" }}
        transition={{ type: "spring", stiffness: 300 }}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all"
      >
        <div className="p-2.5 rounded-lg" style={{ 
          backgroundColor: 
            platform === 'linkedin' ? '#E8F0FE' : 
            platform === 'github' ? '#F6F8FA' : 
            platform === 'twitter' ? '#E8F5FE' : 
            '#E6F5EB'
        }}>
          {platform === 'linkedin' && <FaLinkedin className="text-blue-600 w-6 h-6" />}
          {platform === 'github' && <FaGithub className="text-gray-900 w-6 h-6" />}
          {platform === 'twitter' && <FaTwitter className="text-blue-400 w-6 h-6" />}
          {platform === 'website' && <FaGlobe className="text-green-600 w-6 h-6" />}
        </div>
        <div>
          <span className="font-medium capitalize block">{platform}</span>
          <span className="text-sm text-gray-500 block truncate max-w-[120px]">{url.replace(/^https?:\/\//, '')}</span>
        </div>
      </motion.a>
    ))}
  </div>
);

const SecuritySection: React.FC<{ 
  security: IUserProfile['security'];
  onUpdateRecoveryEmail: (email: string) => Promise<boolean>;
  onGenerateBackupCodes: () => Promise<boolean>;
}> = ({ security, onUpdateRecoveryEmail, onGenerateBackupCodes }) => {
  const [showRecoveryEmail, setShowRecoveryEmail] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState(security.recoveryEmail || '');

  const handleUpdateEmail = async () => {
    if (!recoveryEmail || !recoveryEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    const success = await onUpdateRecoveryEmail(recoveryEmail);
    if (success) {
      setShowRecoveryEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <FaLock className="w-5 h-5" />, label: 'Last Password Change', value: security.lastPasswordChange, color: 'bg-blue-100 text-blue-600' },
          { icon: <FaQrcode className="w-5 h-5" />, label: 'Backup Codes', value: `${security.backupCodes} remaining`, color: 'bg-green-100 text-green-600' },
          { icon: <FaCheckCircle className="w-5 h-5" />, label: 'Security Questions', value: `${security.securityQuestions} set`, color: 'bg-yellow-100 text-yellow-600' },
          { icon: <FaUserCog className="w-5 h-5" />, label: 'Active Devices', value: security.activeDevices.toString(), color: 'bg-purple-100 text-purple-600' }
        ].map((item, index) => (
          <motion.div 
            key={index} 
            whileHover={{ y: -3 }}
            className="p-4 bg-white shadow-sm rounded-xl border border-gray-100 flex flex-col items-center text-center"
          >
            <div className={`p-3 rounded-full mb-3 ${item.color.split(' ')[0]}`}>
              <div className={item.color.split(' ')[1]}>{item.icon}</div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{item.label}</p>
              <p className="font-semibold">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recovery Email Section */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <FaEnvelope className="text-yellow-600" /> Recovery Email
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {security.recoveryEmail || 'No recovery email set'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRecoveryEmail(!showRecoveryEmail)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            <FaEdit className="inline mr-2" />
            Update
          </motion.button>
        </div>

        {showRecoveryEmail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 flex gap-2"
          >
            <input
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              placeholder="recovery@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
            <button
              onClick={handleUpdateEmail}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowRecoveryEmail(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </div>

      {/* Backup Codes Section */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <FaQrcode className="text-green-600" /> Backup Codes
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            You have {security.backupCodes} backup codes remaining
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGenerateBackupCodes}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          Generate New
        </motion.button>
      </div>

      <div className="mt-6">
        <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
          <FaHistory className="text-indigo-600" /> Recent Login Activity
        </h3>
        <div className="space-y-3">
          {security.loginHistory && security.loginHistory.length > 0 ? (
            security.loginHistory.map((login, index) => (
              <motion.div 
                key={index}
                whileHover={{ x: 3 }}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  login.status === 'success' 
                    ? 'border-green-100 bg-green-50' 
                    : 'border-red-100 bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    login.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <div className={login.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                      {login.status === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{login.device}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <FaMapMarkerAlt size={10} />
                      <span>{login.location}</span>
                      <span className="block w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{login.time || new Date(login.timestamp || '').toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${login.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {login.status}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No login history available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DocumentsSection: React.FC<{ 
  documents: IUserProfile['documents'];
  onDocumentUpload: (category: 'identity' | 'financial', formData: FormData) => Promise<void>;
  onDocumentDelete: (category: 'identity' | 'financial', documentId: string) => Promise<void>;
  onDocumentDownload: (category: 'identity' | 'financial', documentId: string, fileName: string) => void;
}> = ({ documents, onDocumentUpload, onDocumentDelete, onDocumentDownload }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'identity' | 'financial'>('identity');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    documentType: '',
    number: '',
    expiryDate: '',
    status: 'active',
    institution: '',
    lastUpdated: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', uploadFile);
      formData.append('category', uploadCategory);
      formData.append('documentType', uploadFormData.documentType);
      
      if (uploadCategory === 'identity') {
        formData.append('number', uploadFormData.number);
        formData.append('expiryDate', uploadFormData.expiryDate);
        formData.append('status', uploadFormData.status);
      } else {
        formData.append('institution', uploadFormData.institution);
        formData.append('lastUpdated', uploadFormData.lastUpdated || new Date().toLocaleDateString());
      }

      await onDocumentUpload(uploadCategory, formData);
      
      // Reset form
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadFormData({
        documentType: '',
        number: '',
        expiryDate: '',
        status: 'active',
        institution: '',
        lastUpdated: ''
      });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Identity Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <FaIdCard className="text-indigo-600" /> Identity Documents
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setUploadCategory('identity');
              setShowUploadModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
          >
            <FaUpload className="w-4 h-4" />
            Upload
          </motion.button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {documents.identity.map((doc: any, index) => (
            <motion.div 
              key={doc.id || index} 
              whileHover={{ y: -3 }}
              className="flex items-center p-4 bg-white shadow-sm rounded-xl border border-gray-100"
            >
              <div className="p-3 rounded-xl bg-indigo-50 mr-4">
                <FaIdCard className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{doc.type}</h4>
                  {doc.status && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      doc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {doc.status}
                    </span>
                  )}
                </div>
                {doc.number && <p className="text-sm text-gray-500">Number: {doc.number}</p>}
                {doc.expiryDate && <p className="text-sm text-gray-500">Expires: {doc.expiryDate}</p>}
                {doc.fileName && <p className="text-xs text-gray-400 mt-1">{doc.fileName}</p>}
                {doc.fileSize && <p className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</p>}
              </div>
              <div className="ml-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDocumentDownload('identity', doc.id, doc.fileName)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Download"
                >
                  <FaDownload className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDocumentDelete('identity', doc.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <FaTrash className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
          {documents.identity.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-400">
              <FaIdCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No identity documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Financial Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-indigo-600" /> Financial Documents
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setUploadCategory('financial');
              setShowUploadModal(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
          >
            <FaUpload className="w-4 h-4" />
            Upload
          </motion.button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {documents.financial.map((doc: any, index) => (
            <motion.div 
              key={doc.id || index} 
              whileHover={{ y: -3 }}
              className="flex items-center p-4 bg-white shadow-sm rounded-xl border border-gray-100"
            >
              <div className="p-3 rounded-xl bg-green-50 mr-4">
                <FaFileInvoiceDollar className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{doc.type}</h4>
                {doc.institution && <p className="text-sm text-gray-500">{doc.institution}</p>}
                {doc.lastUpdated && <p className="text-xs text-gray-400 mt-1">Updated {doc.lastUpdated}</p>}
                {doc.fileName && <p className="text-xs text-gray-400">{doc.fileName}</p>}
                {doc.fileSize && <p className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</p>}
              </div>
              <div className="ml-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDocumentDownload('financial', doc.id, doc.fileName)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  title="Download"
                >
                  <FaDownload className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDocumentDelete('financial', doc.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <FaTrash className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
          {documents.financial.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-400">
              <FaFileInvoiceDollar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No financial documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaUpload className="text-indigo-600" />
                  Upload {uploadCategory === 'identity' ? 'Identity' : 'Financial'} Document
                </h3>
                <button
                  onClick={() => !uploading && setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={uploading}
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    required
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: PDF, Images, Office documents (Max 10MB)
                  </p>
                </div>

                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.documentType}
                    onChange={(e) => setUploadFormData({...uploadFormData, documentType: e.target.value})}
                    placeholder={uploadCategory === 'identity' ? 'e.g., Passport, Driver License' : 'e.g., Bank Statement, Tax Return'}
                    required
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Category-specific fields */}
                {uploadCategory === 'identity' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Number
                      </label>
                      <input
                        type="text"
                        value={uploadFormData.number}
                        onChange={(e) => setUploadFormData({...uploadFormData, number: e.target.value})}
                        placeholder="e.g., A1234567"
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={uploadFormData.expiryDate}
                        onChange={(e) => setUploadFormData({...uploadFormData, expiryDate: e.target.value})}
                        placeholder="e.g., 2028"
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={uploadFormData.status}
                        onChange={(e) => setUploadFormData({...uploadFormData, status: e.target.value})}
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={uploadFormData.institution}
                        onChange={(e) => setUploadFormData({...uploadFormData, institution: e.target.value})}
                        placeholder="e.g., HDFC Bank"
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 mt-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowUploadModal(false)}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        Upload
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BillingSection: React.FC<{ 
  billing: IUserProfile['billing']; 
  onAddPaymentMethod: (data: any) => Promise<boolean>;
  onDeletePaymentMethod: (methodId: string) => void;
  userName: string; // Add userName prop
}> = ({ billing, onAddPaymentMethod, onDeletePaymentMethod, userName }) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardData, setCardData] = useState({
    type: 'credit',
    provider: 'visa',
    lastFour: '',
    expiryDate: '',
    cardHolderName: userName, // Auto-fill with user's name
    isDefault: false
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Auto-fill cardholder name when userName changes or card form opens
  useEffect(() => {
    if (showAddCard && userName) {
      setCardData(prev => ({
        ...prev,
        cardHolderName: userName
      }));
    }
  }, [showAddCard, userName]);

  // Validation functions
  const validateCardHolderName = (name: string): string | null => {
    if (!name || name.trim() === '') {
      return 'Cardholder name is required';
    }
    if (name.length < 3 || name.length > 50) {
      return 'Name must be between 3 and 50 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return null;
  };

  const validateLastFourDigits = (digits: string): string | null => {
    if (!digits || digits.trim() === '') {
      return 'Last 4 digits are required';
    }
    if (!/^\d{4}$/.test(digits)) {
      return 'Must be exactly 4 digits';
    }
    return null;
  };

  const validateExpiryDate = (expiry: string): string | null => {
    if (!expiry || expiry.trim() === '') {
      return 'Expiry date is required';
    }
    
    // Check format MM/YY
    const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryPattern.test(expiry)) {
      return 'Invalid format. Use MM/YY (e.g., 12/25)';
    }

    // Check if card is not expired
    const [month, year] = expiry.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Card has expired';
    }

    // Check if expiry is not too far in future (max 20 years)
    if (year > currentYear + 20) {
      return 'Expiry date is too far in the future';
    }

    return null;
  };

  // Format expiry date as user types
  const handleExpiryChange = (value: string) => {
    // Remove all non-digit characters
    let cleaned = value.replace(/\D/g, '');
    
    // Limit to 4 digits (MMYY)
    cleaned = cleaned.slice(0, 4);
    
    // Auto-format with slash
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    
    setCardData({ ...cardData, expiryDate: cleaned });
    
    // Clear error when user starts typing
    if (cardErrors.expiryDate) {
      setCardErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  // Clear error when field is changed
  const clearError = (field: string) => {
    setCardErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateCardForm = (): boolean => {
    const errors: Record<string, string> = {};

    const nameError = validateCardHolderName(cardData.cardHolderName);
    if (nameError) errors.cardHolderName = nameError;

    const lastFourError = validateLastFourDigits(cardData.lastFour);
    if (lastFourError) errors.lastFour = lastFourError;

    const expiryError = validateExpiryDate(cardData.expiryDate);
    if (expiryError) errors.expiryDate = expiryError;

    setCardErrors(errors);

    if (Object.keys(errors).length > 0) {
      console.log('❌ Card validation failed:', errors);
      return false;
    }

    console.log('✅ Card validation passed');
    return true;
  };

  const handleAddCard = async () => {
    console.log('🔍 Validating card form...');
    
    if (!validateCardForm()) {
      alert('⚠️ Please fix the validation errors before adding the card');
      return;
    }

    const success = await onAddPaymentMethod(cardData);
    if (success) {
      setShowAddCard(false);
      setCardData({
        type: 'credit',
        provider: 'visa',
        lastFour: '',
        expiryDate: '',
        cardHolderName: userName, // Reset to user's name
        isDefault: false
      });
      setCardErrors({}); // Clear errors
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <FaCreditCard className="text-indigo-600" /> Payment Methods
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddCard(!showAddCard)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
          >
            <FaCreditCard className="w-4 h-4" />
            Add Card
          </motion.button>
        </div>

        {showAddCard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200"
          >
            <h4 className="font-medium text-gray-800 mb-3">Add New Payment Method</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                <select
                  value={cardData.type}
                  onChange={(e) => setCardData({ ...cardData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  value={cardData.provider}
                  onChange={(e) => setCardData({ ...cardData, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardData.cardHolderName}
                  onChange={(e) => {
                    setCardData({ ...cardData, cardHolderName: e.target.value });
                    clearError('cardHolderName');
                  }}
                  placeholder="John Doe"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    cardErrors.cardHolderName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {cardErrors.cardHolderName && (
                  <ValidationError message={cardErrors.cardHolderName} />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last 4 Digits <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardData.lastFour}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setCardData({ ...cardData, lastFour: val });
                    clearError('lastFour');
                  }}
                  placeholder="1234"
                  maxLength={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    cardErrors.lastFour ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {cardErrors.lastFour && (
                  <ValidationError message={cardErrors.lastFour} />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (MM/YY) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardData.expiryDate}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="12/25"
                  maxLength={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    cardErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {cardErrors.expiryDate && (
                  <ValidationError message={cardErrors.expiryDate} />
                )}
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cardData.isDefault}
                    onChange={(e) => setCardData({ ...cardData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Set as default</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddCard}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Card
              </button>
              <button
                onClick={() => setShowAddCard(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {billing.paymentMethods.map((method, index) => (
            <motion.div 
              key={method.id || index} 
              whileHover={{ y: -3 }}
              className={`p-4 bg-white shadow-sm rounded-xl border ${method.isDefault ? 'border-indigo-200' : 'border-gray-100'} relative group`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  method.provider === 'visa' ? 'bg-blue-50' : 'bg-orange-50'
                }`}>
                  {method.provider === 'visa' ? (
                    <FaCcVisa className="w-8 h-8 text-blue-600" />
                  ) : (
                    <FaCcMastercard className="w-8 h-8 text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{method.type.charAt(0).toUpperCase() + method.type.slice(1)} Card</h4>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">•••• {method.lastFour}</p>
                  <p className="text-sm text-gray-500 mt-1">Expires {method.expiryDate}</p>
                </div>
              </div>
              <button
                onClick={() => method.id && onDeletePaymentMethod(method.id)}
                className="absolute top-2 right-2 p-2 bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
              >
                <FaTrash className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
          <FaFileInvoiceDollar className="text-indigo-600" /> Recent Invoices
        </h3>
        <div className="bg-gray-50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left font-medium text-gray-600 p-3">Invoice ID</th>
                <th className="text-left font-medium text-gray-600 p-3">Date</th>
                <th className="text-left font-medium text-gray-600 p-3">Amount</th>
                <th className="text-left font-medium text-gray-600 p-3">Status</th>
                <th className="text-left font-medium text-gray-600 p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {billing.invoices.map((invoice, index) => (
                <tr key={invoice.id || index} className="hover:bg-white transition-colors">
                  <td className="p-3 text-gray-900 font-medium">{invoice.invoiceId || invoice.id}</td>
                  <td className="p-3 text-gray-600">{invoice.date}</td>
                  <td className="p-3 text-gray-900">₹{invoice.amount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <FaDownload className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState<IUserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [userProfile, setUserProfile] = useState<IUserProfile>({
    name: '',
    email: '',
    role: 'Free User',
    preferences: {
      theme: 'auto',
      notifications: true,
      language: 'English'
    },
    avatar: 'https://via.placeholder.com/150',
    memberSince: 'Just now',
    lastLogin: 'Just now',
    securityScore: 50,
    twoFactorEnabled: false,
    totalDevices: 0,
    activeSubscription: 'Free Plan',
    nextBilling: 'N/A',
    personalInfo: {
      dateOfBirth: "15 March 1990",
      phoneNumber: "+91 98765 43210",
      nationality: "Indian",
      maritalStatus: "Married",
      gender: "Male"
    },
    professionalInfo: {
      occupation: "Senior Software Engineer",
      company: "Tech Innovations Ltd",
      department: "Engineering",
      employeeId: "EMP123456",
      experience: "8+ years",
      education: [
        {
          degree: "Master of Computer Applications",
          institution: "Delhi University",
          year: "2012"
        },
        {
          degree: "Bachelor of Computer Science",
          institution: "Mumbai University",
          year: "2009"
        }
      ]
    },
    address: {
      street: "123 Cyber City, Phase 1",
      city: "Gurugram",
      state: "Haryana",
      country: "India",
      postalCode: "122002"
    },
    socialProfiles: {
      linkedin: "https://linkedin.com/in/rahulsingh",
      github: "https://github.com/rahulsingh",
      twitter: "https://twitter.com/rahulsingh",
      website: "https://rahulsingh.dev"
    },
    identityDocuments: [
      {
        type: "Passport",
        number: "********1234",
        expiryDate: "2028"
      },
      {
        type: "National ID",
        number: "********5678",
        expiryDate: "2025"
      }
    ],
    bankingInfo: {
      accountHolder: "Rahul Singh",
      accountType: "Savings", 
      lastFourDigits: "4321"
    },
    security: {
      lastPasswordChange: '1 month ago',
      loginAttempts: 5,
      securityQuestions: 3,
      activeDevices: 2,
      loginHistory: [
        { device: 'iPhone 12', location: 'New Delhi, India', time: '2 hours ago', status: 'success' },
        { device: 'MacBook Pro', location: 'Gurugram, India', time: '1 day ago', status: 'success' },
        { device: 'Windows PC', location: 'Mumbai, India', time: '3 days ago', status: 'failed' }
      ],
      recoveryEmail: 'RahulSingh05.recovery@gmail.com',
      backupCodes: 5
    },
    documents: {
      identity: [],
      financial: []
    },
    billing: {
      paymentMethods: [
        { type: 'credit', provider: 'visa', lastFour: '1234', expiryDate: '12/24', isDefault: true },
        { type: 'debit', provider: 'mastercard', lastFour: '5678', expiryDate: '11/23', isDefault: false }
      ],
      invoices: [
        { id: 'INV001', date: '01/01/2023', amount: 7999, status: 'paid', downloadUrl: '#' },
        { id: 'INV002', date: '02/01/2023', amount: 7999, status: 'pending', downloadUrl: '#' }
      ],
      subscriptionHistory: [
        { plan: 'Basic Plan', startDate: '01/01/2022', endDate: '12/31/2022', amount: 3999, status: 'expired' },
        { plan: 'Premium Plan', startDate: '01/01/2023', endDate: '12/31/2023', amount: 7999, status: 'active' }
      ]
    }
  });

  // ==================== PHONE FORMATTING FUNCTIONS ====================
  
  // Get country code from nationality
  const getCountryCode = (nationality: string): string => {
    if (!nationality) return '';
    const normalizedNationality = nationality.toLowerCase().trim();
    return COUNTRY_PHONE_CODES[normalizedNationality] || '';
  };

  // Format phone number with spacing after every 5 digits
  const formatPhoneNumber = (phone: string, countryCode: string): string => {
    // If input is empty or just spaces, return empty
    if (!phone || phone.trim() === '') return '';
    
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Extract or use country code
    let code = '';
    let phoneDigits = '';
    
    if (cleaned.startsWith('+')) {
      // If starts with +, extract the country code we know
      if (countryCode) {
        // Use the known country code
        code = countryCode;
        // Remove the country code part and get remaining digits
        phoneDigits = cleaned.substring(countryCode.length).replace(/\D/g, '');
      } else {
        // Try to extract country code (1-3 digits after +)
        const match = cleaned.match(/^(\+\d{1,3})(.*)$/);
        if (match) {
          code = match[1];
          phoneDigits = match[2].replace(/\D/g, '');
        }
      }
    } else {
      // No + at start
      if (countryCode) {
        code = countryCode;
        phoneDigits = cleaned.replace(/\D/g, '');
      } else {
        // No country code, just return cleaned digits
        return cleaned;
      }
    }
    
    // If no digits yet, just return country code with space
    if (!phoneDigits) {
      return code + ' ';
    }
    
    // Split into groups of 5 digits
    const formatted = phoneDigits.match(/.{1,5}/g)?.join(' ') || phoneDigits;
    return `${code} ${formatted}`;
  };

  // ==================== VALIDATION FUNCTIONS ====================
  
  // Validate name
  const validateName = (name: string): string | null => {
    if (!name || name.trim() === '') {
      return 'Name is required';
    }
    if (name.length < 2 || name.length > 50) {
      return 'Name must be between 2 and 50 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return null;
  };

  // Validate phone number
  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone) return null; // Optional field
    if (!/^\+?[\d\s-()]+$/.test(phone)) {
      return 'Phone number format is invalid';
    }
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return 'Phone number must be between 10 and 15 digits';
    }
    return null;
  };

  // Validate date of birth
  const validateDateOfBirth = (dob: string): string | null => {
    if (!dob) return null; // Optional field
    const date = new Date(dob);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    if (age < 13) {
      return 'You must be at least 13 years old';
    }
    if (age > 120) {
      return 'Please enter a valid date of birth';
    }
    return null;
  };

  // Validate URL
  const validateURL = (url: string, fieldName: string): string | null => {
    if (!url) return null; // Optional field
    try {
      new URL(url);
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `${fieldName} must start with http:// or https://`;
      }
      return null;
    } catch {
      return `${fieldName} is not a valid URL`;
    }
  };

  // Validate postal code
  const validatePostalCode = (code: string): string | null => {
    if (!code) return null; // Optional field
    if (!/^[A-Z0-9\s-]+$/i.test(code)) {
      return 'Postal code format is invalid';
    }
    if (code.length < 3 || code.length > 10) {
      return 'Postal code must be between 3 and 10 characters';
    }
    return null;
  };

  // Validate employee ID
  const validateEmployeeId = (id: string): string | null => {
    if (!id) return null; // Optional field
    if (!/^[A-Za-z0-9-_]+$/.test(id)) {
      return 'Employee ID can only contain letters, numbers, hyphens, and underscores';
    }
    if (id.length > 20) {
      return 'Employee ID cannot exceed 20 characters';
    }
    return null;
  };

  // Validate city/state/country names
  const validateLocationName = (name: string, fieldName: string): string | null => {
    if (!name) return null; // Optional field
    if (name.length < 2 || name.length > 50) {
      return `${fieldName} must be between 2 and 50 characters`;
    }
    if (!/^[a-zA-Z\s-]+$/.test(name)) {
      return `${fieldName} can only contain letters, spaces, and hyphens`;
    }
    return null;
  };

  // Validate text length
  const validateLength = (text: string, fieldName: string, min: number, max: number): string | null => {
    if (!text) return null; // Optional field
    if (text.length < min || text.length > max) {
      return `${fieldName} must be between ${min} and ${max} characters`;
    }
    return null;
  };

  // Comprehensive form validation
  const validateEditForm = (): boolean => {
    if (!editFormData) return false;

    const errors: Record<string, string> = {};

    // Validate name (required)
    const nameError = validateName(editFormData.name);
    if (nameError) errors.name = nameError;

    // Validate personal info (only if values are provided)
    if (editFormData.personalInfo) {
      // Only validate phone if it has a value
      if (editFormData.personalInfo.phoneNumber && editFormData.personalInfo.phoneNumber.trim()) {
        const phoneError = validatePhoneNumber(editFormData.personalInfo.phoneNumber);
        if (phoneError) errors['personalInfo.phoneNumber'] = phoneError;
      }

      // Only validate DOB if it has a value
      if (editFormData.personalInfo.dateOfBirth && editFormData.personalInfo.dateOfBirth.trim()) {
        const dobError = validateDateOfBirth(editFormData.personalInfo.dateOfBirth);
        if (dobError) errors['personalInfo.dateOfBirth'] = dobError;
      }

      // Only validate nationality if it has a value
      if (editFormData.personalInfo.nationality && editFormData.personalInfo.nationality.trim()) {
        const nationalityError = validateLength(editFormData.personalInfo.nationality, 'Nationality', 2, 50);
        if (nationalityError) errors['personalInfo.nationality'] = nationalityError;
      }
    }

    // Validate professional info (only if values are provided)
    if (editFormData.professionalInfo) {
      if (editFormData.professionalInfo.occupation && editFormData.professionalInfo.occupation.trim()) {
        const occupationError = validateLength(editFormData.professionalInfo.occupation, 'Occupation', 2, 100);
        if (occupationError) errors['professionalInfo.occupation'] = occupationError;
      }

      if (editFormData.professionalInfo.company && editFormData.professionalInfo.company.trim()) {
        const companyError = validateLength(editFormData.professionalInfo.company, 'Company', 2, 100);
        if (companyError) errors['professionalInfo.company'] = companyError;
      }

      if (editFormData.professionalInfo.department && editFormData.professionalInfo.department.trim()) {
        const deptError = validateLength(editFormData.professionalInfo.department, 'Department', 0, 50);
        if (deptError) errors['professionalInfo.department'] = deptError;
      }

      if (editFormData.professionalInfo.employeeId && editFormData.professionalInfo.employeeId.trim()) {
        const empIdError = validateEmployeeId(editFormData.professionalInfo.employeeId);
        if (empIdError) errors['professionalInfo.employeeId'] = empIdError;
      }

      if (editFormData.professionalInfo.experience && editFormData.professionalInfo.experience.trim()) {
        const expError = validateLength(editFormData.professionalInfo.experience, 'Experience', 0, 50);
        if (expError) errors['professionalInfo.experience'] = expError;
      }
    }

    // Validate address (only if values are provided)
    if (editFormData.address) {
      if (editFormData.address.street && editFormData.address.street.trim()) {
        const streetError = validateLength(editFormData.address.street, 'Street address', 5, 200);
        if (streetError) errors['address.street'] = streetError;
      }

      if (editFormData.address.city && editFormData.address.city.trim()) {
        const cityError = validateLocationName(editFormData.address.city, 'City');
        if (cityError) errors['address.city'] = cityError;
      }

      if (editFormData.address.state && editFormData.address.state.trim()) {
        const stateError = validateLocationName(editFormData.address.state, 'State');
        if (stateError) errors['address.state'] = stateError;
      }

      if (editFormData.address.country && editFormData.address.country.trim()) {
        const countryError = validateLocationName(editFormData.address.country, 'Country');
        if (countryError) errors['address.country'] = countryError;
      }

      if (editFormData.address.postalCode && editFormData.address.postalCode.trim()) {
        const postalError = validatePostalCode(editFormData.address.postalCode);
        if (postalError) errors['address.postalCode'] = postalError;
      }
    }

    // Validate social profiles (only if values are provided)
    if (editFormData.socialProfiles) {
      if (editFormData.socialProfiles.linkedin && editFormData.socialProfiles.linkedin.trim()) {
        const linkedinError = validateURL(editFormData.socialProfiles.linkedin, 'LinkedIn URL');
        if (linkedinError) errors['socialProfiles.linkedin'] = linkedinError;
      }

      if (editFormData.socialProfiles.github && editFormData.socialProfiles.github.trim()) {
        const githubError = validateURL(editFormData.socialProfiles.github, 'GitHub URL');
        if (githubError) errors['socialProfiles.github'] = githubError;
      }

      if (editFormData.socialProfiles.twitter && editFormData.socialProfiles.twitter.trim()) {
        const twitterError = validateURL(editFormData.socialProfiles.twitter, 'Twitter URL');
        if (twitterError) errors['socialProfiles.twitter'] = twitterError;
      }

      if (editFormData.socialProfiles.website && editFormData.socialProfiles.website.trim()) {
        const websiteError = validateURL(editFormData.socialProfiles.website, 'Website URL');
        if (websiteError) errors['socialProfiles.website'] = websiteError;
      }
    }

    setValidationErrors(errors);
    
    // Log validation results
    if (Object.keys(errors).length > 0) {
      console.log('❌ Validation failed:', errors);
    } else {
      console.log('✅ Validation passed');
    }

    return Object.keys(errors).length === 0;
  };

  // Clear validation error for a specific field
  const clearValidationError = (field: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // ==================== END VALIDATION FUNCTIONS ====================

  // Fetch user profile data from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          navigate('/signin');
          return;
        }

        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.data.user) {
          const userData = response.data.data.user;
          
          // Map backend data to frontend structure
          setUserProfile(prev => ({
            ...prev,
            name: userData.name,
            email: userData.email,
            role: userData.subscription?.plan === 'premium' ? 'Premium User' : 
                  userData.subscription?.plan === 'enterprise' ? 'Enterprise User' : 'Free User',
            avatar: userData.profile?.avatar || 'https://via.placeholder.com/150',
            memberSince: new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            lastLogin: userData.lastLogin ? getTimeAgo(new Date(userData.lastLogin)) : 'Just now',
            securityScore: userData.profile?.securityScore || 50,
            twoFactorEnabled: userData.twoFactorEnabled || false,
            totalDevices: userData.profile?.totalDevices || 0,
            activeSubscription: userData.subscription?.plan === 'premium' ? 'Premium Plan' : 
                               userData.subscription?.plan === 'enterprise' ? 'Enterprise Plan' : 'Free Plan',
            nextBilling: userData.subscription?.endDate ? 
                        new Date(userData.subscription.endDate).toLocaleDateString() : 'N/A',
            preferences: {
              theme: userData.profile?.preferences?.theme || 'auto',
              notifications: userData.profile?.preferences?.notifications?.email !== false,
              language: userData.profile?.preferences?.language || 'English'
            },
            personalInfo: userData.profile?.personalInfo || prev.personalInfo,
            professionalInfo: userData.profile?.professionalInfo || prev.professionalInfo,
            address: userData.profile?.address || prev.address,
            socialProfiles: userData.profile?.socialProfiles || prev.socialProfiles,
            security: {
              ...prev.security,
              lastPasswordChange: getTimeAgo(new Date(userData.updatedAt)),
              activeDevices: userData.profile?.totalDevices || 0,
              backupCodes: 5
            }
          }));
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/signin');
        } else {
          setError('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Fetch documents on component mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) return;

        const response = await axios.get(`${API_URL}/user/documents`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setUserProfile(prev => ({
            ...prev,
            documents: response.data.data.documents
          }));
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    
    fetchDocs();
  }, []);

  // Fetch billing information
  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) return;

        const response = await axios.get(`${API_URL}/user/billing`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setUserProfile(prev => ({
            ...prev,
            billing: response.data.data.billing
          }));
        }
      } catch (error) {
        console.error('Error fetching billing:', error);
      }
    };
    
    fetchBilling();
  }, []);

  // Fetch security information
  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) return;

        const response = await axios.get(`${API_URL}/user/security`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setUserProfile(prev => ({
            ...prev,
            security: {
              ...prev.security,
              ...response.data.data.security
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching security:', error);
      }
    };
    
    fetchSecurity();
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.put(`${API_URL}/user/profile`, {
        name: userProfile.name,
        'profile.personalInfo': userProfile.personalInfo,
        'profile.professionalInfo': userProfile.professionalInfo,
        'profile.address': userProfile.address,
        'profile.socialProfiles': userProfile.socialProfiles
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle add payment method
  const handleAddPaymentMethod = async (paymentData: any): Promise<boolean> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(`${API_URL}/user/billing/payment-method`, paymentData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Refresh billing data
        const billingResponse = await axios.get(`${API_URL}/user/billing`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (billingResponse.data.success) {
          setUserProfile(prev => ({
            ...prev,
            billing: billingResponse.data.data.billing
          }));
        }
        
        alert('Payment method added successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      alert(error.response?.data?.message || 'Failed to add payment method');
      return false;
    }
  };

  // Handle delete payment method
  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.delete(`${API_URL}/user/billing/payment-method/${methodId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Update local state
        setUserProfile(prev => ({
          ...prev,
          billing: {
            ...prev.billing,
            paymentMethods: prev.billing.paymentMethods.filter(m => m.id !== methodId)
          }
        }));
        
        alert('Payment method deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      alert(error.response?.data?.message || 'Failed to delete payment method');
    }
  };

  // Handle update recovery email
  const handleUpdateRecoveryEmail = async (email: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.put(`${API_URL}/user/security/recovery-email`, 
        { recoveryEmail: email },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUserProfile(prev => ({
          ...prev,
          security: {
            ...prev.security,
            recoveryEmail: email
          }
        }));
        
        alert('Recovery email updated successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error updating recovery email:', error);
      alert(error.response?.data?.message || 'Failed to update recovery email');
      return false;
    }
  };

  // Handle generate backup codes
  const handleGenerateBackupCodes = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(`${API_URL}/user/security/generate-backup-codes`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUserProfile(prev => ({
          ...prev,
          security: {
            ...prev.security,
            backupCodes: response.data.data.backupCodes
          }
        }));
        
        alert(`${response.data.data.backupCodes} backup codes generated successfully!`);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error generating backup codes:', error);
      alert(error.response?.data?.message || 'Failed to generate backup codes');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-indigo-600 w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <FaUser className="w-5 h-5" /> },
    { id: 'professional', label: 'Professional', icon: <FaBriefcase className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt className="w-5 h-5" /> },
    { id: 'documents', label: 'Documents', icon: <FaIdCard className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing', icon: <FaCreditCard className="w-5 h-5" /> }
  ];

  const handleEditClick = () => {
    setEditFormData({ ...userProfile });
    setShowEditModal(true);
  };

  const handleEditChange = (section: string, field: string, value: any) => {
    if (!editFormData) return;
    
    setEditFormData(prev => {
      if (!prev) return prev;
      
      let updatedData = prev;
      
      if (section === 'basic') {
        updatedData = { ...prev, [field]: value };
      } else {
        const sectionData = prev[section as keyof IUserProfile];
        if (typeof sectionData === 'object' && sectionData !== null) {
          updatedData = {
            ...prev,
            [section]: {
              ...(sectionData as any),
              [field]: value
            }
          };
        }
      }

      // Auto-format phone number when nationality changes
      if (section === 'personalInfo' && field === 'nationality') {
        const countryCode = getCountryCode(value);
        if (countryCode && updatedData.personalInfo.phoneNumber) {
          const formattedPhone = formatPhoneNumber(updatedData.personalInfo.phoneNumber, countryCode);
          updatedData = {
            ...updatedData,
            personalInfo: {
              ...updatedData.personalInfo,
              phoneNumber: formattedPhone
            }
          };
        } else if (countryCode && !updatedData.personalInfo.phoneNumber) {
          // Just add country code if phone is empty
          updatedData = {
            ...updatedData,
            personalInfo: {
              ...updatedData.personalInfo,
              phoneNumber: countryCode + ' '
            }
          };
        }
      }

      // Auto-format phone number as user types
      if (section === 'personalInfo' && field === 'phoneNumber') {
        const countryCode = getCountryCode(updatedData.personalInfo.nationality);
        const formattedPhone = formatPhoneNumber(value, countryCode);
        updatedData = {
          ...updatedData,
          personalInfo: {
            ...updatedData.personalInfo,
            phoneNumber: formattedPhone
          }
        };
      }

      return updatedData;
    });

    // Clear validation error when user starts typing
    const errorKey = section === 'basic' ? field : `${section}.${field}`;
    clearValidationError(errorKey);
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;
    
    // Validate form before submitting
    console.log('🔍 Starting form validation...');
    const isValid = validateEditForm();
    
    if (!isValid) {
      console.log('❌ Form validation failed');
      alert('⚠️ Please fix the validation errors before saving');
      return;
    }

    console.log('✅ Form validation passed. Submitting to backend...');
    
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.put(`${API_URL}/user/profile`, {
        name: editFormData.name,
        'profile.personalInfo.dateOfBirth': editFormData.personalInfo.dateOfBirth,
        'profile.personalInfo.phoneNumber': editFormData.personalInfo.phoneNumber,
        'profile.personalInfo.nationality': editFormData.personalInfo.nationality,
        'profile.personalInfo.maritalStatus': editFormData.personalInfo.maritalStatus,
        'profile.personalInfo.gender': editFormData.personalInfo.gender,
        'profile.professionalInfo.occupation': editFormData.professionalInfo.occupation,
        'profile.professionalInfo.company': editFormData.professionalInfo.company,
        'profile.professionalInfo.department': editFormData.professionalInfo.department,
        'profile.professionalInfo.employeeId': editFormData.professionalInfo.employeeId,
        'profile.professionalInfo.experience': editFormData.professionalInfo.experience,
        'profile.address.street': editFormData.address.street,
        'profile.address.city': editFormData.address.city,
        'profile.address.state': editFormData.address.state,
        'profile.address.country': editFormData.address.country,
        'profile.address.postalCode': editFormData.address.postalCode,
        'profile.socialProfiles.linkedin': editFormData.socialProfiles.linkedin,
        'profile.socialProfiles.github': editFormData.socialProfiles.github,
        'profile.socialProfiles.twitter': editFormData.socialProfiles.twitter,
        'profile.socialProfiles.website': editFormData.socialProfiles.website
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log('✅ Profile updated successfully on backend');
        setUserProfile(editFormData);
        
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.name = editFormData.name;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        alert('✅ Profile updated successfully!');
        setShowEditModal(false);
        setValidationErrors({});
      }
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle backend validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.field || err.param] = err.message;
        });
        setValidationErrors(backendErrors);
        alert('⚠️ Validation errors: Please check the form and try again');
      } else {
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || error.message 
          || 'Failed to update profile';
        alert(`❌ ${errorMessage}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Document upload handler
  const handleDocumentUpload = async (category: 'identity' | 'financial', formData: FormData) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(`${API_URL}/user/documents/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('✅ Document uploaded successfully!');
        // Refresh documents
        fetchDocuments();
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      alert(error.response?.data?.message || 'Failed to upload document');
      throw error;
    }
  };

  // Document delete handler
  const handleDocumentDelete = async (category: 'identity' | 'financial', documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.delete(`${API_URL}/user/documents/${category}/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('✅ Document deleted successfully!');
        // Refresh documents
        fetchDocuments();
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      alert(error.response?.data?.message || 'Failed to delete document');
    }
  };

  // Document download handler
  const handleDocumentDownload = async (category: 'identity' | 'financial', documentId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_URL}/user/documents/${category}/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  // Fetch documents function (used after upload/delete)
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_URL}/user/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUserProfile(prev => ({
          ...prev,
          documents: response.data.data.documents
        }));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <UserProfileHeader profile={userProfile} onEditClick={handleEditClick} />
      
      {/* Modern Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-md mb-8">
        <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600 font-medium' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content with Modern Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <ProfileSection title="Personal Information" icon={<HiOutlineUserCircle className="w-6 h-6 text-indigo-600" />}>
                  <PersonalInfoCard info={userProfile.personalInfo} />
                </ProfileSection>
                <ProfileSection title="Address" icon={<FaMapMarkerAlt className="w-5 h-5 text-indigo-600" />}>
                  <AddressCard address={userProfile.address} />
                </ProfileSection>
                <ProfileSection title="Social Profiles" icon={<FaGlobe className="w-5 h-5 text-indigo-600" />}>
                  <SocialProfilesCard profiles={userProfile.socialProfiles} />
                </ProfileSection>
              </motion.div>
            )}
            
            {activeTab === 'professional' && (
              <motion.div
                key="professional"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileSection title="Professional Information" icon={<FaBriefcase className="w-5 h-5 text-indigo-600" />}>
                  <ProfessionalInfoCard info={userProfile.professionalInfo} />
                </ProfileSection>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileSection title="Security Settings" icon={<FaShieldAlt className="w-5 h-5 text-indigo-600" />}>
                  <SecuritySection 
                    security={userProfile.security}
                    onUpdateRecoveryEmail={handleUpdateRecoveryEmail}
                    onGenerateBackupCodes={handleGenerateBackupCodes}
                  />
                </ProfileSection>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <ProfileSection title="My Documents" icon={<FaFileAlt className="w-5 h-5 text-indigo-600" />}>
                  <DocumentsSection 
                    documents={userProfile.documents}
                    onDocumentUpload={handleDocumentUpload}
                    onDocumentDelete={handleDocumentDelete}
                    onDocumentDownload={handleDocumentDownload}
                  />
                </ProfileSection>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileSection title="Billing & Payments" icon={<FaCreditCard className="w-5 h-5 text-indigo-600" />}>
                  <BillingSection 
                    billing={userProfile.billing}
                    onAddPaymentMethod={handleAddPaymentMethod}
                    onDeletePaymentMethod={handleDeletePaymentMethod}
                    userName={userProfile.name}
                  />
                </ProfileSection>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Enhanced */}
        <div className="space-y-6">
          <ProfileSection title="Subscription" icon={<FaCrown className="w-5 h-5 text-amber-500" />}>
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-10 -translate-y-10"></div>
                <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                
                <div className="relative flex items-start justify-between mb-4">
                  <FaCrown className="w-10 h-10 text-amber-300" />
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    Active
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{userProfile.activeSubscription}</p>
                <div className="flex items-center justify-between text-sm mt-4">
                  <span className="opacity-90">Member since: {userProfile.memberSince}</span>
                  <span className="opacity-90">Next billing: {userProfile.nextBilling}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Manage Subscription
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 text-center border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                >
                  View Benefits
                </motion.button>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="Account Actions" icon={<FaCog className="w-5 h-5 text-indigo-600" />}>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaFileExport className="text-indigo-500" />
                  <span className="font-medium">Export Data</span>
                </div>
                <FaChevronRight className="text-gray-400" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaKey className="text-indigo-500" />
                  <span className="font-medium">Change Password</span>
                </div>
                <FaChevronRight className="text-gray-400" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaTrash className="text-red-500" />
                  <span className="font-medium">Delete Account</span>
                </div>
                <FaChevronRight className="text-gray-400" />
              </motion.button>
            </div>
          </ProfileSection>
          
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-indigo-900">Security Score</h3>
              <span className="text-sm px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">Good</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full mb-3">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full" 
                style={{ width: `${userProfile.securityScore}%` }}
              ></div>
            </div>
            <p className="text-3xl font-bold text-indigo-700">{userProfile.securityScore}%</p>
            <p className="text-sm text-indigo-600 mt-1">2FA is enabled!</p>
            <button className="mt-4 w-full p-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors font-medium flex items-center justify-center gap-2">
              <FaShieldAlt /> Improve Security
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && editFormData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaEdit className="w-6 h-6" />
                  <div>
                    <h2 className="text-2xl font-bold">Edit Profile</h2>
                    <p className="text-sm text-white/80 mt-1">Fill in as much or as little as you'd like - only your name is required</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Profile is Flexible</h4>
                    <p className="text-sm text-blue-700">
                      You can update your profile anytime! Fill in the information you want now, and come back to add more later. 
                      Only your <strong>name</strong> is required - everything else is optional.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaUser className="text-indigo-600" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => handleEditChange('basic', 'name', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            validationErrors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                        <ValidationError message={validationErrors.name} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={editFormData.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaUserSecret className="text-indigo-600" />
                      Personal Information
                      <span className="text-xs text-gray-500 font-normal ml-2">(All Optional)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={editFormData.personalInfo.dateOfBirth}
                          onChange={(e) => handleEditChange('personalInfo', 'dateOfBirth', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['personalInfo.dateOfBirth'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <ValidationError message={validationErrors['personalInfo.dateOfBirth']} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                          <span className="text-xs text-gray-400 ml-1 font-normal">(auto-formats with country code)</span>
                        </label>
                        <input
                          type="tel"
                          value={editFormData.personalInfo.phoneNumber}
                          onChange={(e) => handleEditChange('personalInfo', 'phoneNumber', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['personalInfo.phoneNumber'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+1 (555) 000-0000"
                        />
                        <ValidationError message={validationErrors['personalInfo.phoneNumber']} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nationality
                          <span className="text-xs text-gray-400 ml-1 font-normal">(sets phone country code)</span>
                        </label>
                        <input
                          type="text"
                          value={editFormData.personalInfo.nationality}
                          onChange={(e) => handleEditChange('personalInfo', 'nationality', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['personalInfo.nationality'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., India, USA, UK"
                        />
                        <ValidationError message={validationErrors['personalInfo.nationality']} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                        <select
                          value={editFormData.personalInfo.maritalStatus}
                          onChange={(e) => handleEditChange('personalInfo', 'maritalStatus', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          value={editFormData.personalInfo.gender}
                          onChange={(e) => handleEditChange('personalInfo', 'gender', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaBriefcase className="text-indigo-600" />
                      Professional Information
                      <span className="text-xs text-gray-500 font-normal ml-2">(All Optional)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                        <input
                          type="text"
                          value={editFormData.professionalInfo.occupation}
                          onChange={(e) => handleEditChange('professionalInfo', 'occupation', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['professionalInfo.occupation'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Software Engineer"
                        />
                        <ValidationError message={validationErrors['professionalInfo.occupation']} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input
                          type="text"
                          value={editFormData.professionalInfo.company}
                          onChange={(e) => handleEditChange('professionalInfo', 'company', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['professionalInfo.company'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Company name"
                        />
                        <ValidationError message={validationErrors['professionalInfo.company']} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <input
                          type="text"
                          value={editFormData.professionalInfo.department}
                          onChange={(e) => handleEditChange('professionalInfo', 'department', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['professionalInfo.department'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Engineering"
                        />
                        <ValidationError message={validationErrors['professionalInfo.department']} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                        <input
                          type="text"
                          value={editFormData.professionalInfo.employeeId}
                          onChange={(e) => handleEditChange('professionalInfo', 'employeeId', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['professionalInfo.employeeId'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="EMP123456"
                        />
                        <ValidationError message={validationErrors['professionalInfo.employeeId']} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                        <input
                          type="text"
                          value={editFormData.professionalInfo.experience}
                          onChange={(e) => handleEditChange('professionalInfo', 'experience', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['professionalInfo.experience'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 5+ years"
                        />
                        <ValidationError message={validationErrors['professionalInfo.experience']} />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-indigo-600" />
                      Address
                      <span className="text-xs text-gray-500 font-normal ml-2">(All Optional)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                        <input
                          type="text"
                          value={editFormData.address.street}
                          onChange={(e) => handleEditChange('address', 'street', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['address.street'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123 Main Street"
                        />
                        <ValidationError message={validationErrors['address.street']} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={editFormData.address.city}
                          onChange={(e) => handleEditChange('address', 'city', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['address.city'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="City"
                        />
                        <ValidationError message={validationErrors['address.city']} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                        <input
                          type="text"
                          value={editFormData.address.state}
                          onChange={(e) => handleEditChange('address', 'state', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['address.state'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="State"
                        />
                        <ValidationError message={validationErrors['address.state']} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          value={editFormData.address.country}
                          onChange={(e) => handleEditChange('address', 'country', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['address.country'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Country"
                        />
                        <ValidationError message={validationErrors['address.country']} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={editFormData.address.postalCode}
                          onChange={(e) => handleEditChange('address', 'postalCode', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['address.postalCode'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="12345"
                        />
                        <ValidationError message={validationErrors['address.postalCode']} />
                      </div>
                    </div>
                  </div>

                  {/* Social Profiles */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaGlobe className="text-indigo-600" />
                      Social Profiles
                      <span className="text-xs text-gray-500 font-normal ml-2">(All Optional)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaLinkedin className="text-blue-600" /> LinkedIn
                        </label>
                        <input
                          type="url"
                          value={editFormData.socialProfiles.linkedin}
                          onChange={(e) => handleEditChange('socialProfiles', 'linkedin', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['socialProfiles.linkedin'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="https://linkedin.com/in/username"
                        />
                        <ValidationError message={validationErrors['socialProfiles.linkedin']} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaGithub className="text-gray-800" /> GitHub
                        </label>
                        <input
                          type="url"
                          value={editFormData.socialProfiles.github}
                          onChange={(e) => handleEditChange('socialProfiles', 'github', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['socialProfiles.github'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="https://github.com/username"
                        />
                        <ValidationError message={validationErrors['socialProfiles.github']} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaTwitter className="text-blue-400" /> Twitter
                        </label>
                        <input
                          type="url"
                          value={editFormData.socialProfiles.twitter}
                          onChange={(e) => handleEditChange('socialProfiles', 'twitter', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['socialProfiles.twitter'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="https://twitter.com/username"
                        />
                        <ValidationError message={validationErrors['socialProfiles.twitter']} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaGlobe className="text-green-600" /> Website
                        </label>
                        <input
                          type="url"
                          value={editFormData.socialProfiles.website}
                          onChange={(e) => handleEditChange('socialProfiles', 'website', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            validationErrors['socialProfiles.website'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="https://yourwebsite.com"
                        />
                        <ValidationError message={validationErrors['socialProfiles.website']} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;