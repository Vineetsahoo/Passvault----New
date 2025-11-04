import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { QrCode, Camera, Settings, History, CheckCircle2, XCircle, Image, 
         RotateCcw, Layers, ZoomIn, ZoomOut, Lightbulb, Filter, Share2, 
         CreditCard, ChevronLeft, ChevronRight, ArrowUpCircle, Lock, LogIn, Trash2, AlertCircle, ArrowLeft,
         Plus, Edit3, Save, Download, Eye, EyeOff, Palette, Type, Calendar, User, Building, Check, Share, Loader2, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import TerminalQrScanner from '../../components/TerminalQrScanner';
import qrcodeService, { QRCode as QRCodeType, QRCodeType as QRType, CreateQRCodeData } from '../../services/qrcodeService';

// Feature Template component for page layout
const FeatureTemplate: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon, children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/20 to-white min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
        {/* Go Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 text-slate-700 hover:text-indigo-600 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute top-20 right-20 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-blue-100/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 left-10 w-24 h-24 bg-purple-100/30 rounded-full blur-2xl -z-10"></div>
        
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
          {/* Redesigned header section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-purple-500/10 z-0"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-100/30 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8 border-b border-slate-200/50">
              {/* Enhanced icon container */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-lg flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {React.cloneElement(icon as React.ReactElement, { 
                  className: "h-12 w-12 text-indigo-600 relative z-10 transition-transform duration-300 group-hover:scale-110" 
                })}
              </div>
              
              <div className="space-y-2">
                <div className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 mb-1">
                  Feature
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 bg-clip-text text-transparent mb-3">{title}</h1>
                <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">{description}</p>
              </div>
            </div>
          </div>
          
          {/* Improved content section */}
          <div className="p-8 md:p-12 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-indigo-50/5 to-blue-50/10 opacity-70"></div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
        
        {/* Redesigned bottom accent */}
        <div className="relative h-1 mx-auto w-60 mt-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-full shadow-lg opacity-70"></div>
          <div className="absolute inset-0 bg-white rounded-full shadow blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-full opacity-90"></div>
        </div>
      </div>
    </div>
  );
};

// Add new interfaces
interface CardData {
  id: string;
  type: 'credit' | 'debit' | 'pass' | 'membership';
  title: string;
  number: string;
  expiryDate?: string;
  holderName: string;
  issuer: string;
  backgroundColor: string | { gradient: string };
  textColor: string;
  qrData: string;
  logo?: string;
}

interface NewCardForm {
  type: 'credit' | 'debit' | 'pass' | 'membership';
  title: string;
  number: string;
  expiryDate: string;
  holderName: string;
  issuer: string;
  backgroundColor: string;
  textColor: string;
  customData: string;
  category: string;
  notes: string;
}

interface CardTemplate {
  id: string;
  name: string;
  type: 'credit' | 'debit' | 'pass' | 'membership';
  gradient: string;
  textColor: string;
  category: string;
}

interface ScanResult {
  id: string;
  timestamp: Date;
  type: 'pass' | 'ticket' | 'membership';
  content: string;
  status: 'success' | 'failed';
}

interface ScanSettings {
  enableAutoFocus: boolean;
  enableBeep: boolean;
  enableVibration: boolean;
  saveHistory: boolean;
  preferredCamera: 'back' | 'front';
}

interface ScanQuality {
  brightness: number;
  contrast: number;
  zoom: number;
  resolution: 'low' | 'medium' | 'high';
}

interface BatchScanConfig {
  enabled: boolean;
  delay: number;
  maxItems: number;
  autoSave: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email: string; } | null;
}

// Add card templates for quick creation
const cardTemplates: CardTemplate[] = [
  {
    id: 'premium-black',
    name: 'Premium Black',
    type: 'credit',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)',
    textColor: '#ffffff',
    category: 'Credit Card'
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    type: 'debit',
    gradient: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
    textColor: '#ffffff',
    category: 'Debit Card'
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    type: 'debit',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    textColor: '#ffffff',
    category: 'Debit Card'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    type: 'membership',
    gradient: 'linear-gradient(135deg, #8A2BE2 0%, #9932CC 50%, #FF1493 100%)',
    textColor: '#ffffff',
    category: 'Membership'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    type: 'pass',
    gradient: 'linear-gradient(135deg, #FF4500 0%, #FF6347 50%, #DC143C 100%)',
    textColor: '#ffffff',
    category: 'Pass'
  },
  {
    id: 'galaxy-gradient',
    name: 'Galaxy Gradient',
    type: 'pass',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    category: 'Pass'
  },
  {
    id: 'golden-luxury',
    name: 'Golden Luxury',
    type: 'membership',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
    textColor: '#ffffff',
    category: 'Premium Membership'
  },
  {
    id: 'arctic-silver',
    name: 'Arctic Silver',
    type: 'membership',
    gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
    textColor: '#ffffff',
    category: 'Silver Membership'
  }
];

// Add predefined categories
const cardCategories = {
  credit: ['Cashback', 'Travel', 'Premium', 'Business', 'Rewards'],
  debit: ['Checking', 'Savings', 'Student', 'Premium', 'International'],
  pass: ['Transit', 'Gym', 'Cinema', 'Museum', 'Library', 'Event', 'Concert', 'Others'],
  membership: ['Premium', 'VIP', 'Gold', 'Silver', 'Diamond', 'Platinum', 'Elite']
};
// Add new card images and pass designs
const cardImages = {
  mastercard: '/images/mastercard-logo.png',
  visa: '/images/visa-logo.png',
  amex: '/images/amex-logo.png',
  cinema: '/images/cinema-logo.png',
  transit: '/images/transit-logo.png',
  membership: '/images/membership-logo.png'
};

const passDesigns = {
  membership: '/images/membership-pass.svg',
  gym: '/images/gym-pass.svg',
  cinema: '/images/cinema-pass.svg',
  transit: '/images/transit-pass.svg',
  library: '/images/library-pass.svg',
  event: '/images/event-pass.svg'
};

// Remove all sample cards - data will come from backend
const sampleCards: CardData[] = [];

// Manual Entry Form Component - Moved outside to prevent re-renders
const ManualEntryForm: React.FC<{
  formData: NewCardForm;
  validationErrors: string[];
  loading: boolean;
  onFormChange: (field: keyof NewCardForm, value: string) => void;
  onSave: () => void;
}> = React.memo(({ formData, validationErrors, loading, onFormChange, onSave }) => {
  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      {/* Card Type Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Card/Pass Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['credit', 'debit', 'pass', 'membership'] as const).map(type => (
            <button
              key={type}
              onClick={() => onFormChange('type', type)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                formData.type === type
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="text-2xl mb-1">
                {type === 'credit' ? '💳' : type === 'debit' ? '🏦' : type === 'pass' ? '🎫' : '🏛️'}
              </div>
              <div className="font-medium capitalize text-sm">{type}</div>
            </button>
          ))}
        </div>
        
        {/* Input Requirements Info */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              {formData.type === 'credit' || formData.type === 'debit' ? (
                <>
                  <strong>Card Number:</strong> 13-16 digits only • Auto-formatted with spaces • Test/demo cards accepted
                </>
              ) : (
                <>
                  <strong>Pass/Membership ID:</strong> Alphanumeric characters allowed • Min 3 characters
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            placeholder="e.g., Premium Credit Card"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {formData.type === 'credit' || formData.type === 'debit' ? 'Card Number' : 'Pass/Membership ID'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => onFormChange('number', e.target.value)}
            placeholder={
              formData.type === 'credit' || formData.type === 'debit' 
                ? '1234 5678 9012 3456' 
                : 'ABC-123-XYZ'
            }
            maxLength={formData.type === 'credit' || formData.type === 'debit' ? 19 : 50}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
          />
          <p className="text-xs text-slate-500 mt-1">
            {formData.type === 'credit' || formData.type === 'debit' 
              ? '13-16 digits, auto-formatted with spaces' 
              : 'Alphanumeric characters allowed'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Holder Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.holderName}
            onChange={(e) => onFormChange('holderName', e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Issuer/Organization
          </label>
          <input
            type="text"
            value={formData.issuer}
            onChange={(e) => onFormChange('issuer', e.target.value)}
            placeholder="Bank Name, Company"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Expiry Date {(formData.type === 'credit' || formData.type === 'debit') && <span className="text-amber-500">(Recommended)</span>}
          </label>
          <input
            type="text"
            value={formData.expiryDate}
            onChange={(e) => onFormChange('expiryDate', e.target.value)}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
          />
          <p className="text-xs text-slate-500 mt-1">
            Format: MM/YY (e.g., 12/25)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => onFormChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Category</option>
            {cardCategories[formData.type]?.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.customData}
          onChange={(e) => onFormChange('customData', e.target.value)}
          placeholder="Any additional information..."
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Live QR Code Preview */}
      {formData.title && formData.number && formData.holderName && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-indigo-600" />
            <h4 className="font-semibold text-slate-800">Live QR Code Preview</h4>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <QRCodeSVG
                value={`${formData.type}:${formData.title}:${formData.number}`}
                size={180}
                level="M"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Preview QR code (simplified for display)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {formData.type === 'credit' || formData.type === 'debit' ? '🔒 Full data will be encrypted when saved' : '📄 Full data will be included when saved'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-700 mb-2">Please fix the following errors:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div>
        <button
          onClick={onSave}
          disabled={loading}
          className={`w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2 shadow-md ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save {formData.type === 'credit' || formData.type === 'debit' ? 'Card' : 'Pass'}
            </>
          )}
        </button>
      </div>
    </div>
  );
});

ManualEntryForm.displayName = 'ManualEntryForm';

const QrScan = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [settings, setSettings] = useState<ScanSettings>({
    enableAutoFocus: true,
    enableBeep: true,
    enableVibration: true,
    saveHistory: true,
    preferredCamera: 'back'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [quality, setQuality] = useState<ScanQuality>({
    brightness: 100,
    contrast: 100,
    zoom: 1,
    resolution: 'high'
  });

  const [batchConfig, setBatchConfig] = useState<BatchScanConfig>({
    enabled: false,
    delay: 1000,
    maxItems: 10,
    autoSave: true
  });

  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Manual entry form state
  const [formData, setFormData] = useState<NewCardForm>({
    type: 'credit',
    title: '',
    number: '',
    expiryDate: '',
    holderName: '',
    issuer: '',
    backgroundColor: cardTemplates[0].gradient,
    textColor: '#ffffff',
    customData: '',
    category: '',
    notes: ''
  });

  // Add auth state
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const isAuthFlag = localStorage.getItem('isAuthenticated') === 'true';
    const userData = localStorage.getItem('userData');
    
    // User is authenticated only if BOTH token AND auth flag exist
    const isAuthenticated = token !== null && isAuthFlag;
    
    console.log('🔐 Auth check:', { hasToken: !!token, isAuthFlag, isAuthenticated });
    
    const user = userData ? JSON.parse(userData) : null;
    
    setAuth({
      isAuthenticated,
      user
    });
    
    // Auto-fill holder name with logged-in user's name
    if (isAuthenticated && user?.name) {
      setFormData(prev => ({
        ...prev,
        holderName: user.name
      }));
    }
    
    // Clear cards if not authenticated
    if (!isAuthenticated) {
      console.log('⚠️ Not authenticated - clearing cards');
      setCards([]);
    }
  }, []);

  // Fetch QR codes from backend when authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      console.log('✅ Authenticated - fetching QR codes');
      fetchQRCodes();
    } else {
      console.log('❌ Not authenticated - skipping fetch');
      setCards([]); // Clear cards when not authenticated
    }
  }, [auth.isAuthenticated]);

  // Fetch QR codes from backend
  const fetchQRCodes = async () => {
    // Double-check authentication before making API call
    const token = localStorage.getItem('accessToken');
    const isAuthFlag = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!token || !isAuthFlag) {
      console.error('❌ Cannot fetch QR codes - not authenticated');
      setCards([]);
      setError('Please sign in to view your cards');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching QR codes for authenticated user...');
      
      const response = await qrcodeService.getQRCodes({
        page: 1,
        limit: 100,
        sortBy: '-createdAt'
      });
      
      console.log('📊 QR codes response:', response);
      
      // Check if response has qrcodes array
      if (!response || !response.qrcodes || !Array.isArray(response.qrcodes)) {
        console.warn('No QR codes found in response:', response);
        setCards([]);
        return;
      }
      
      console.log(`✅ Fetched ${response.qrcodes.length} QR codes`);
      console.log('📦 Raw QR codes from backend:', response.qrcodes);
      
      // Convert backend QR codes to CardData format
      const convertedCards = response.qrcodes.map((qr: QRCodeType) => {
        const gradient = qr.color && qr.backgroundColor 
          ? `linear-gradient(135deg, ${qr.backgroundColor} 0%, ${qr.color} 100%)`
          : cardTemplates[0].gradient;

        // Extract data from QR data object - handle both direct objects and nested text field
        let qrData = typeof qr.data === 'object' ? qr.data : {};
        let parsedData = qrData;
        
        // Try to parse the text field if it exists (for text type QR codes)
        if (qrData.text && typeof qrData.text === 'string') {
          try {
            parsedData = JSON.parse(qrData.text);
            console.log(`📝 Parsed text field for "${qr.title}":`, parsedData);
          } catch (e) {
            console.log(`⚠️ Could not parse text field for "${qr.title}"`);
            parsedData = qrData;
          }
        }
        
        // For password type, check if data is directly available
        if (qr.qrType === 'password' && qrData && !qrData.text) {
          parsedData = qrData;
          console.log(`🔐 Using direct password data for "${qr.title}":`, parsedData);
        }

        // Determine card type with improved logic
        let cardType: 'credit' | 'debit' | 'pass' | 'membership' = 'pass';
        
        console.log(`🔍 Processing card "${qr.title}":`, {
          qrType: qr.qrType,
          category: qr.category,
          hasQrCodeImage: !!qr.qrCodeImage,
          qrCodeImageLength: qr.qrCodeImage?.length || 0,
          qrCodeImagePreview: qr.qrCodeImage?.substring(0, 50),
          rawQrData: qrData,
          parsedData
        });
        
        // Priority 1: Check parsedData.type (from saved card data)
        if (parsedData.type) {
          const rawType = parsedData.type.toLowerCase();
          
          // Map the raw type to our standardized types
          if (rawType === 'credit') {
            cardType = 'credit';
          } else if (rawType === 'debit') {
            cardType = 'debit';
          } else if (
            rawType.includes('membership') || 
            rawType === 'loyalty-card' ||
            rawType.includes('loyalty') ||
            rawType.includes('vip') ||
            rawType.includes('premium')
          ) {
            cardType = 'membership';
          } else {
            // Everything else (boarding-pass, parking-pass, event-ticket, etc.) is a pass
            cardType = 'pass';
          }
          
          console.log(`✅ Card "${qr.title}" type from parsedData.type "${parsedData.type}" → mapped to:`, cardType);
        } 
        // Priority 2: Check qrType - password types are credit/debit cards
        else if (qr.qrType === 'password') {
          // If it's password type, check category or default to credit
          const catLower = (qr.category || '').toLowerCase();
          if (catLower.includes('debit')) {
            cardType = 'debit';
          } else if (catLower.includes('credit')) {
            cardType = 'credit';
          } else if (catLower.includes('card')) {
            // Default to credit if it mentions "card" but not specific
            cardType = 'credit';
          } else {
            // Default password types to credit card
            cardType = 'credit';
          }
          console.log(`💳 Card "${qr.title}" type from qrType=password + category:`, cardType);
        } 
        // Priority 3: Check category for text types (including terminal QR passes)
        else if (qr.category) {
          const catLower = qr.category.toLowerCase();
          
          // Check for credit/debit cards
          if (catLower.includes('credit')) {
            cardType = 'credit';
          } else if (catLower.includes('debit')) {
            cardType = 'debit';
          } 
          // Check for memberships (gym-membership, loyalty-card, VIP, premium, etc.)
          else if (
            catLower.includes('membership') || 
            catLower.includes('premium') || 
            catLower.includes('vip') || 
            catLower.includes('gold') || 
            catLower.includes('silver') ||
            catLower.includes('platinum') ||
            catLower.includes('diamond') ||
            catLower.includes('elite') ||
            catLower.includes('loyalty')
          ) {
            cardType = 'membership';
          } 
          // Everything else is a pass (boarding-pass, parking-pass, event-ticket, etc.)
          else {
            cardType = 'pass';
          }
          
          console.log(`🏷️ Card "${qr.title}" type from category "${qr.category}":`, cardType);
        }
        
        console.log(`📌 Final card type for "${qr.title}":`, cardType);
        
        // Determine QR data to display
        const finalQrData = qr.qrCodeImage || qr._id;
        console.log(`🖼️ Card "${qr.title}" QR data:`, {
          hasImage: !!qr.qrCodeImage,
          imageStartsWith: qr.qrCodeImage?.substring(0, 20),
          usingImage: !!qr.qrCodeImage,
          fallbackToId: !qr.qrCodeImage
        });
        
        return {
          id: qr._id,
          type: cardType,
          title: qr.title,
          number: parsedData.number || qrData.number || qrData.id || '****',
          expiryDate: parsedData.expiry || qrData.expiry || (qr.expiresAt ? new Date(qr.expiresAt).toLocaleDateString() : undefined),
          holderName: parsedData.holder || qrData.holder || auth.user?.name || 'Card Holder',
          issuer: parsedData.issuer || qrData.issuer || qr.category || 'Issuer',
          backgroundColor: { gradient },
          textColor: '#ffffff',
          qrData: finalQrData,
        };
      });

      console.log('🎯 Converted cards:', convertedCards);
      console.log('📊 Card types breakdown:', {
        total: convertedCards.length,
        credit: convertedCards.filter(c => c.type === 'credit').length,
        debit: convertedCards.filter(c => c.type === 'debit').length,
        pass: convertedCards.filter(c => c.type === 'pass').length,
        membership: convertedCards.filter(c => c.type === 'membership').length
      });
      
      // Debug: Log all pass types individually
      const allPasses = convertedCards.filter(c => c.type === 'pass' || c.type === 'membership');
      console.log('🎫 ALL PASSES & MEMBERSHIPS:', allPasses.map(p => ({
        title: p.title,
        type: p.type,
        id: p.id
      })));

      setCards(convertedCards);
    } catch (err: any) {
      console.error('❌ Error fetching QR codes:', err);
      console.error('Error response:', err.response);
      
      // Handle authentication errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error('🔒 Authentication failed - clearing session');
        // Clear authentication state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        setAuth({
          isAuthenticated: false,
          user: null
        });
        setError('Session expired. Please sign in again.');
        setCards([]);
        // Optionally redirect to signin
        // navigate('/signin');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load QR codes');
        setCards([]); // Set empty array on error
      }
    } finally {
      setLoading(false);
    }
  };

  // Add error handling for camera access
  const startScanning = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: settings.preferredCamera === 'back' ? 'environment' : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      setValidationErrors([`Camera access failed: ${err instanceof Error ? err.message : 'Unknown error'}`]);
    }
  };

  const stopScanning = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsScanning(false);
  };

  const handleScanResult = (result: string) => {
    const scanResult: ScanResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type: 'pass',
      content: result,
      status: 'success'
    };

    setLastScan(scanResult);
    if (settings.saveHistory) {
      setScanHistory(prev => [scanResult, ...prev]);
    }
  };

  const adjustQuality = (property: keyof ScanQuality, value: any) => {
    setQuality(prev => ({ ...prev, [property]: value }));
    // Apply camera adjustments here
  };

  const toggleBatchMode = () => {
    setBatchConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  // Generate QR data from form
  const generateQRData = (data: NewCardForm): string => {
    const qrData = {
      type: data.type,
      title: data.title,
      number: data.number,
      holder: data.holderName,
      issuer: data.issuer,
      expiry: data.expiryDate,
      category: data.category,
      custom: data.customData,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(qrData);
  };

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string, type: 'credit' | 'debit' | 'pass' | 'membership'): string => {
    // For credit/debit cards - only numbers with auto-spacing
    if (type === 'credit' || type === 'debit') {
      // Remove all non-numeric characters
      const numbers = value.replace(/\D/g, '');
      
      // Limit to 16 digits (standard card length)
      const limited = numbers.slice(0, 16);
      
      // Add space after every 4 digits
      const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
      
      return formatted;
    }
    
    // For pass/membership - allow alphanumeric
    return value.slice(0, 50); // Limit length
  };

  // Validate card number based on type
  const validateCardNumber = (number: string, type: 'credit' | 'debit' | 'pass' | 'membership'): string | null => {
    if (!number || number.trim() === '') {
      return 'Card/Pass number is required';
    }

    if (type === 'credit' || type === 'debit') {
      // Remove spaces for validation
      const digits = number.replace(/\s/g, '');
      
      // Check if only contains numbers
      if (!/^\d+$/.test(digits)) {
        return 'Card number must contain only digits';
      }
      
      // Check minimum length (13 digits for some cards, 16 for most)
      if (digits.length < 13) {
        return 'Card number must be at least 13 digits';
      }
      
      // Check maximum length
      if (digits.length > 16) {
        return 'Card number cannot exceed 16 digits';
      }
      
      // Luhn algorithm validation - REMOVED (too strict for test/demo cards)
      // Users can create demo/test cards without real card numbers
    } else {
      // For pass/membership - just check it's not empty and has reasonable length
      if (number.length < 3) {
        return 'Pass number must be at least 3 characters';
      }
    }
    
    return null; // Valid
  };

  // Luhn algorithm for card number validation
  const isValidLuhn = (cardNumber: string): boolean => {
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Validate expiry date format (MM/YY)
  const validateExpiryDate = (expiry: string): string | null => {
    if (!expiry) return null; // Optional field
    
    // Check format MM/YY
    const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryPattern.test(expiry)) {
      return 'Expiry date must be in MM/YY format';
    }
    
    // Check if date is in the future
    const [month, year] = expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    
    if (expiryDate < today) {
      return 'Card has expired';
    }
    
    return null;
  };

  // Format expiry date as user types
  const formatExpiryDate = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 4 digits (MMYY)
    const limited = numbers.slice(0, 4);
    
    // Add slash after month
    if (limited.length >= 3) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    }
    
    return limited;
  };

  // Handle form changes with validation and formatting
  const handleFormChange = (field: keyof NewCardForm, value: string) => {
    let processedValue = value;
    
    // Special handling for card number
    if (field === 'number') {
      processedValue = formatCardNumber(value, formData.type);
    }
    
    // Special handling for expiry date
    if (field === 'expiryDate') {
      processedValue = formatExpiryDate(value);
    }
    
    // Special handling for holder name - only letters and spaces
    if (field === 'holderName') {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Save new card/pass with comprehensive validation
  const saveNewCard = async () => {
    // Check authentication first
    if (!auth.isAuthenticated) {
      setValidationErrors(['Please sign in to create cards']);
      return;
    }

    // Collect all validation errors
    const errors: string[] = [];
    
    // Required fields validation
    if (!formData.title || formData.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!formData.holderName || formData.holderName.trim() === '') {
      errors.push('Holder name is required');
    }
    
    // Card number validation with type-specific rules
    const numberError = validateCardNumber(formData.number, formData.type);
    if (numberError) {
      errors.push(numberError);
    }
    
    // Expiry date validation (only for credit/debit cards)
    if ((formData.type === 'credit' || formData.type === 'debit') && formData.expiryDate) {
      const expiryError = validateExpiryDate(formData.expiryDate);
      if (expiryError) {
        errors.push(expiryError);
      }
    }
    
    // Show all validation errors at once
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to validation errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setValidationErrors([]);
    
    try {
      // Determine QR type based on card type
      const qrType: QRType = (formData.type === 'credit' || formData.type === 'debit') ? 'password' : 'text';

      // Prepare the card data object
      const cardData = {
        type: formData.type,
        title: formData.title,
        number: formData.number,
        holder: formData.holderName,
        issuer: formData.issuer || 'N/A',
        expiry: formData.expiryDate || 'N/A',
        category: formData.category || formData.type,
        notes: formData.notes || ''
      };

      // Prepare data based on QR type
      // For 'text' type, backend expects { text: string }
      // For 'password' type, backend expects an object
      const data = qrType === 'text' 
        ? { text: JSON.stringify(cardData) }
        : cardData;

      // Extract solid color from gradient or use default
      // QR code library only accepts hex colors, not gradients
      const extractColorFromGradient = (bgColor: string): string => {
        // If it's a gradient, extract the first hex color
        if (bgColor.includes('linear-gradient') || bgColor.includes('gradient')) {
          const hexMatch = bgColor.match(/#[0-9A-Fa-f]{6}/);
          return hexMatch ? hexMatch[0] : '#FFFFFF';
        }
        // If it's already a hex color, return it
        return bgColor.startsWith('#') ? bgColor : '#FFFFFF';
      };

      const qrCodeData: CreateQRCodeData = {
        qrType,
        title: formData.title,
        data,
        isEncrypted: false, // Disabled encryption to allow viewing card details
        category: formData.category || formData.type,
        tags: [formData.type, formData.category].filter(Boolean) as string[],
        description: formData.notes || `${formData.type.toUpperCase()} - ${formData.holderName}`,
        color: formData.textColor || '#000000',
        backgroundColor: extractColorFromGradient(formData.backgroundColor),
        size: 256
      };

      console.log('Creating QR code with data:', qrCodeData);
      const newQRCode = await qrcodeService.createQRCode(qrCodeData);
      console.log('QR code created successfully:', newQRCode);
      console.log('🖼️ QR code image received:', {
        hasImage: !!newQRCode.qrCodeImage,
        imageLength: newQRCode.qrCodeImage?.length || 0,
        imagePreview: newQRCode.qrCodeImage?.substring(0, 50),
        startsWithDataImage: newQRCode.qrCodeImage?.startsWith('data:image')
      });

      const gradient = newQRCode.color && newQRCode.backgroundColor 
        ? `linear-gradient(135deg, ${newQRCode.backgroundColor} 0%, ${newQRCode.color} 100%)`
        : formData.backgroundColor;

      const finalQrData = newQRCode.qrCodeImage || newQRCode._id;
      console.log('📌 Using QR data:', {
        source: newQRCode.qrCodeImage ? 'image' : 'id',
        value: finalQrData.substring(0, 50)
      });

      const newCard: CardData = {
        id: newQRCode._id,
        type: formData.type,
        title: formData.title,
        number: formData.number,
        expiryDate: formData.expiryDate,
        holderName: formData.holderName,
        issuer: formData.issuer,
        backgroundColor: { gradient },
        textColor: formData.textColor,
        qrData: finalQrData
      };

      setCards(prev => [newCard, ...prev]);
      
      // Reset form but keep holder name pre-filled with logged-in user
      setFormData({
        type: 'credit',
        title: '',
        number: '',
        expiryDate: '',
        holderName: auth.user?.name || '', // Keep user's name
        issuer: '',
        backgroundColor: cardTemplates[0].gradient,
        textColor: '#ffffff',
        customData: '',
        category: '',
        notes: ''
      });
      
      setValidationErrors([]);
      
      // Show success message with notification info
      const cardTypeName = formData.type === 'credit' || formData.type === 'debit' ? 'Card' : 'Pass';
      alert(`✅ ${cardTypeName} created successfully!\n\n📬 A notification has been added to your dashboard.`);
    } catch (err: any) {
      console.error('Error creating card:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to create card. Please try again.';
      
      setValidationErrors([`Error: ${errorMessage}`]);
    } finally {
      setLoading(false);
    }
  };

  const AuthPrompt = () => (
    <div className="bg-white border border-slate-200/60 p-8 rounded-xl shadow-lg text-center backdrop-blur-sm">
      <div className="bg-indigo-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Lock className="h-10 w-10 text-indigo-600" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-3">Sign in Required</h3>
      <p className="text-slate-600 mb-6">Please sign in to view your cards and passes</p>
      <button 
        onClick={() => navigate('/signin')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
      >
        <LogIn className="h-5 w-5" />
        Sign In
      </button>
    </div>
  );

  // Add sign out functionality
  const handleSignOut = () => {
    console.log('🚪 Signing out - clearing all data');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    setAuth({
      isAuthenticated: false,
      user: null
    });
    setCards([]); // Clear cards on sign out
    setSelectedCard(null); // Clear selected card
    setError(null); // Clear any errors
    navigate('/signin');
  };

  // Add sign out button in the header
  const renderHeader = () => (
    auth.isAuthenticated && (
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <LogIn className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    )
  );

  // Update the CardDisplay component with uniform design for all cards and passes
  const CardDisplay: React.FC<{ card: CardData }> = ({ card }) => {
    return (
      <div className="relative w-[340px] flex-shrink-0 rounded-2xl shadow-lg mx-2 overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:shadow-xl">
        {/* Background - gradient for all cards and passes */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: typeof card.backgroundColor === 'string' 
              ? card.backgroundColor 
              : card.backgroundColor.gradient
          }}
        >
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/card-pattern.svg')] mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
          </div>
        </div>

        {/* Card Content */}
        <div className="relative z-10 p-6 h-[200px] flex flex-col" style={{ color: card.textColor }}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-wide">{card.title}</h3>
              <p className="text-sm opacity-80 font-mono tracking-wider">{card.number}</p>
            </div>
            {card.logo && (
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-1.5 shadow-sm">
                <img 
                  src={card.logo} 
                  alt={card.issuer} 
                  className="h-8 transition-transform group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="mt-auto space-y-3">
            <div>
              <p className="text-sm opacity-90 uppercase tracking-wider font-medium">{card.holderName}</p>
              {card.expiryDate && (
                <p className="text-xs opacity-80 mt-1 font-medium">Valid Thru: {card.expiryDate}</p>
              )}
            </div>
            <div className="text-xs opacity-70 uppercase tracking-wider">{card.issuer}</div>
          </div>

          {/* Enhanced QR Code with hover effect for all cards */}
          <div className="absolute right-4 bottom-4 group-hover:scale-110 transition-all duration-300 transform-gpu">
            <div className="relative">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg blur-sm"></div>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 relative shadow-lg border border-white/50">
                {card.qrData && card.qrData.startsWith('data:image') ? (
                  <img 
                    src={card.qrData} 
                    alt="QR Code" 
                    className="w-[84px] h-[84px]"
                    onError={(e) => {
                      console.error(`❌ Failed to load QR image for card: ${card.title}`);
                      // Fallback to SVG QR code if image fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-[84px] h-[84px] flex items-center justify-center bg-slate-100 text-xs text-slate-600">
                          QR Code
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <QRCodeSVG 
                    value={card.qrData || card.number}
                    size={84}
                    level="M"
                    includeMargin={true}
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update selected card QR code rendering
  const renderSelectedCardQR = () => {
    if (!selectedCard) return null;

    return (
      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-slate-700">Selected Card QR Code</h4>
          <button 
            onClick={() => setSelectedCard(null)}
            className="text-slate-500 hover:text-slate-700"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="flex justify-center p-4 bg-white rounded-lg">
          {selectedCard.qrData && selectedCard.qrData.startsWith('data:image') ? (
            <img 
              src={selectedCard.qrData} 
              alt="QR Code" 
              className="w-[200px] h-[200px]"
            />
          ) : (
            <QRCodeSVG 
              value={selectedCard.qrData || selectedCard.number}
              size={200}
              level="M"
              includeMargin={true}
              className="w-full h-full max-w-[200px]"
            />
          )}
        </div>
      </div>
    );
  };

  // Separate cards and passes
  const creditCards = cards.filter(card => card.type === 'credit' || card.type === 'debit');
  const passes = cards.filter(card => card.type === 'pass' || card.type === 'membership');

  // Delete all passes function
  const deleteAllPasses = async () => {
    if (!auth.isAuthenticated) {
      alert('Please sign in to delete passes');
      return;
    }

    const passesCount = passes.length;
    if (passesCount === 0) {
      alert('No passes to delete');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${passesCount} passes/memberships?\n\nThis action cannot be undone!`
    );

    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🗑️ Deleting ${passesCount} passes...`);
      
      // Delete all passes one by one
      const deletePromises = passes.map(pass => 
        qrcodeService.deleteQRCode(pass.id).catch(err => {
          console.error(`Failed to delete pass ${pass.title}:`, err);
          return null; // Continue even if one fails
        })
      );

      await Promise.all(deletePromises);

      console.log('✅ All passes deleted successfully');
      
      // Refresh the list
      await fetchQRCodes();
      
      alert(`✅ Successfully deleted ${passesCount} passes!`);
    } catch (err: any) {
      console.error('❌ Error deleting passes:', err);
      setError(err.response?.data?.message || 'Failed to delete passes');
      alert('Error deleting passes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete all cards function
  const deleteAllCards = async () => {
    const cardsCount = creditCards.length;
    
    if (cardsCount === 0) {
      alert('No cards to delete');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Are you sure you want to delete ALL ${cardsCount} cards?\n\nThis action cannot be undone!`
    );

    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🗑️ Deleting ${cardsCount} cards...`);
      
      // Delete all cards one by one
      const deletePromises = creditCards.map(card => 
        qrcodeService.deleteQRCode(card.id).catch(err => {
          console.error(`Failed to delete card ${card.title}:`, err);
          return null; // Continue even if one fails
        })
      );

      await Promise.all(deletePromises);

      console.log('✅ All cards deleted successfully');
      
      // Refresh the list
      await fetchQRCodes();
      
      alert(`✅ Successfully deleted ${cardsCount} cards!`);
    } catch (err: any) {
      console.error('❌ Error deleting cards:', err);
      setError(err.response?.data?.message || 'Failed to delete cards');
      alert('Error deleting cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cards section
  const cardsSection = auth.isAuthenticated ? (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60 flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2 text-slate-800">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          Credit & Debit Cards
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            {creditCards.length} Cards
          </div>
          {creditCards.length > 0 && (
            <button
              onClick={deleteAllCards}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete all cards"
            >
              <Trash2 className="h-4 w-4" />
              Delete All
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-indigo-600 animate-spin mb-3" />
            <p className="text-slate-600">Loading your cards...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-3" />
            <p className="font-medium">{error}</p>
            <button 
              onClick={fetchQRCodes}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        ) : creditCards.length > 0 ? (
          <div className="relative">
            <div className="overflow-x-auto pb-6 scrollbar-hide -mx-2">
              <div className="flex flex-row space-x-6 px-2">
                {creditCards.map(card => (
                  <div 
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className="cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                  >
                    <CardDisplay card={card} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Enhanced scroll indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            
            {/* Carousel navigation */}
            {creditCards.length > 1 && (
              <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-slate-200/50 hover:bg-white transition-colors">
                    <ChevronLeft className="h-5 w-5 text-slate-700" />
                  </button>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-slate-200/50 hover:bg-white transition-colors">
                    <ChevronRight className="h-5 w-5 text-slate-700" />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            <CreditCard className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="font-medium">No credit or debit cards</p>
            <p className="text-sm text-slate-400 mt-1">Add your first card to get started</p>
          </div>
        )}
      </div>
    </div>
  ) : (
    <AuthPrompt />
  );

  // Passes section
  const passesSection = auth.isAuthenticated ? (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50/30 p-4 border-b border-slate-200/60 flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2 text-slate-800">
          <Layers className="h-5 w-5 text-emerald-600" />
          Passes & Memberships
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
            {passes.length} Passes
          </div>
          {passes.length > 0 && (
            <button
              onClick={deleteAllPasses}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete all passes"
            >
              <Trash2 className="h-4 w-4" />
              Delete All
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-emerald-600 animate-spin mb-3" />
            <p className="text-slate-600">Loading your passes...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-3" />
            <p className="font-medium">{error}</p>
            <button 
              onClick={fetchQRCodes}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Retry
            </button>
          </div>
        ) : passes.length > 0 ? (
          <div className="relative">
            <div className="overflow-x-auto pb-6 scrollbar-hide -mx-2">
              <div className="flex flex-row space-x-6 px-2">
                {passes.map(card => (
                  <div 
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className="cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                  >
                    <CardDisplay card={card} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Enhanced scroll indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            
            {/* Carousel navigation */}
            {passes.length > 1 && (
              <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-slate-200/50 hover:bg-white transition-colors">
                    <ChevronLeft className="h-5 w-5 text-slate-700" />
                  </button>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-slate-200/50 hover:bg-white transition-colors">
                    <ChevronRight className="h-5 w-5 text-slate-700" />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            <Layers className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="font-medium">No passes or memberships</p>
            <p className="text-sm text-slate-400 mt-1">Add your first pass to get started</p>
          </div>
        )}
      </div>
    </div>
  ) : (
    <AuthPrompt />
  );

  // Selected card/pass QR section
  const selectedCardSection = selectedCard && auth.isAuthenticated ? (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50/50 rounded-xl p-6 border border-indigo-100/50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-slate-800 flex items-center gap-2">
          <QrCode className="h-5 w-5 text-indigo-600" />
          Selected {selectedCard.type === 'credit' || selectedCard.type === 'debit' ? 'Card' : 'Pass'} QR Code
        </h4>
        <button 
          onClick={() => setSelectedCard(null)}
          className="text-slate-500 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200/60">
          {selectedCard.qrData && selectedCard.qrData.startsWith('data:image') ? (
            <img 
              src={selectedCard.qrData} 
              alt="QR Code" 
              className="w-[200px] h-[200px]"
            />
          ) : (
            <QRCodeSVG 
              value={selectedCard.qrData || selectedCard.number}
              size={200}
              level="M"
              includeMargin={true}
              className="w-full h-full max-w-[200px]"
            />
          )}
        </div>
        <div className="space-y-2">
          <h5 className="text-lg font-medium">{selectedCard.title}</h5>
          <p className="text-slate-600">{selectedCard.issuer}</p>
          <div className="flex items-center gap-2 mt-4">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Image className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const ScanHistorySection = () => (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
        <h3 className="font-medium flex items-center gap-2 text-slate-800">
          <History className="h-5 w-5 text-indigo-600" />
          Recent Scans
        </h3>
      </div>
      <div className="divide-y divide-slate-200">
        {scanHistory.length === 0 ? (
          <div className="py-8 text-slate-500 text-center">
            <History className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="font-medium">No scan history</p>
            <p className="text-sm text-slate-400 mt-1">Your scan results will appear here</p>
          </div>
        ) : (
          scanHistory.slice(0, 5).map(scan => (
            <div key={scan.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-2 ${
                  scan.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {scan.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-slate-800">{scan.type}</div>
                  <div className="text-sm text-slate-500">
                    {scan.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
                <button className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <FeatureTemplate
        title="QR Code Scanning & Card Management"
        description="Scan QR codes or manually create digital cards and passes with auto-generated QR codes"
        icon={<QrCode className="h-8 w-8 text-gray-700" />}
      >
        {renderHeader()}
        <div className="space-y-6 relative">
          
          {/* Enhanced Action Bar */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <QrCode className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">Quick Actions</h3>
                  <p className="text-sm text-slate-600">Scan QR codes and manage your cards</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Settings className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Camera Scanner Section */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
              <h3 className="font-medium flex items-center gap-2 text-slate-800">
                <Camera className="h-5 w-5 text-indigo-600" />
                QR Code Scanner
              </h3>
            </div>
            
            <div className="p-6">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                {isScanning ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      style={{
                        filter: `brightness(${quality.brightness}%) contrast(${quality.contrast}%)`,
                        transform: `scale(${quality.zoom})`
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-white/80 rounded-2xl animate-pulse">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm">
                        {quality.resolution.toUpperCase()} | Zoom: {quality.zoom}x
                      </div>
                      <button
                        onClick={stopScanning}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors shadow-lg"
                      >
                        <XCircle className="h-6 w-6" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-200">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 mb-6">
                      <Camera className="h-16 w-16" />
                    </div>
                    <h4 className="text-xl font-medium mb-2">Ready to Scan</h4>
                    <p className="text-gray-400 text-center mb-6 max-w-md">
                      Position a QR code within the frame to scan
                    </p>
                    <button
                      onClick={startScanning}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg"
                    >
                      <Camera className="h-5 w-5" />
                      Start Scanning
                    </button>
                  </div>
                )}
              </div>

              {/* Scanner Controls */}
              {isScanning && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Brightness:</label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={quality.brightness}
                      onChange={(e) => adjustQuality('brightness', parseInt(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Contrast:</label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={quality.contrast}
                      onChange={(e) => adjustQuality('contrast', parseInt(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Zoom:</label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={quality.zoom}
                      onChange={(e) => adjustQuality('zoom', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <button
                    onClick={toggleBatchMode}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      batchConfig.enabled
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Batch Mode
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Terminal QR Scanner Section - NEW! */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50/30 p-4 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium flex items-center gap-2 text-slate-800">
                    <QrCode className="h-5 w-5 text-purple-600" />
                    Terminal QR Scanner
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Generate QR code in terminal, scan with phone camera
                  </p>
                </div>
                <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  Recommended
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {auth.isAuthenticated ? (
                <TerminalQrScanner 
                  onScanSuccess={(passData) => {
                    console.log('Terminal scan successful:', passData);
                    // Refresh the cards list
                    fetchQRCodes();
                    // Show success notification
                    alert(`✅ Pass created successfully!\n\n📬 ${passData.title} has been added to your collection.`);
                  }}
                />
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                  <Lock className="h-12 w-12 mx-auto text-amber-600 mb-3" />
                  <h4 className="font-semibold text-slate-800 mb-2">Sign in Required</h4>
                  <p className="text-slate-600 mb-4">
                    Please sign in to use the Terminal QR Scanner
                  </p>
                  <button 
                    onClick={() => navigate('/signin')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-4 border-b border-emerald-100">
              <h3 className="font-medium flex items-center gap-2 text-slate-800">
                <Edit3 className="h-5 w-5 text-emerald-600" />
                Manual Entry - Create Card or Pass
              </h3>
              <p className="text-sm text-slate-600 mt-1">Fill in the details below to generate a digital card with QR code</p>
            </div>
            
            <div className="p-6">
              <ManualEntryForm 
                formData={formData}
                validationErrors={validationErrors}
                loading={loading}
                onFormChange={handleFormChange}
                onSave={saveNewCard}
              />
            </div>
          </div>

          {/* Protected Sections */}
          {auth.isAuthenticated ? (
            <>
              {cardsSection}
              {passesSection}
              {selectedCardSection}
              <ScanHistorySection />
            </>
          ) : (
            <AuthPrompt />
          )}
        </div>
      </FeatureTemplate>
      <Footer />
    </>
  );
};

export default QrScan;
