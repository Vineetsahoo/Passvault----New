import React, { useState, useEffect } from 'react';
import { 
  Users, AlertCircle, Plus, Clock, XCircle, Link, Copy, UserPlus, 
  Shield, History, Settings2, Users2, Lock, LogIn, ArrowLeft, CheckCircle,
  Trash2, Save, FileCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { sharingAPI, qrCodesAPI, isLoggedIn, getStoredUser } from '../../services/api';
import { validationUtils, getValidationClassName } from '../../utils/validation';

interface SharedPass {
  _id: string;
  pass: {
    _id: string;
    title: string;
    type?: string;
    qrType?: string;
    cardNumber?: string;
  };
  recipient: {
    email: string;
    name: string;
  };
  accessLevel: 'read' | 'edit';
  status: 'active' | 'pending' | 'revoked' | 'expired';
  expiresAt?: string;
  lastAccessed?: string;
  createdAt: string;
}

interface ShareTemplate {
  _id: string;
  name: string;
  description?: string;
  accessLevel: 'read' | 'edit';
  expiryDays: number;
  restrictions: string[];
  permissions?: {
    canDownload?: boolean;
    canPrint?: boolean;
    canShare?: boolean;
  };
  usageCount: number;
}

interface ShareLog {
  _id: string;
  action: 'shared' | 'revoked' | 'modified' | 'accessed';
  timestamp: string;
  recipient: {
    email: string;
  };
  performedBy: {
    name: string;
  };
  details?: {
    reason?: string;
  };
}

interface Pass {
  _id: string;
  title: string;
  qrType?: string;
  type?: string;
  category?: string;
}

interface FeatureTemplateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FeatureTemplate: React.FC<FeatureTemplateProps> = ({ title, description, icon, children }) => {
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

const AuthPrompt = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white border border-slate-200/60 p-8 rounded-xl shadow-lg text-center backdrop-blur-sm">
      <div className="bg-indigo-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Lock className="h-10 w-10 text-indigo-600" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-3">Sign in Required</h3>
      <p className="text-slate-600 mb-6">Please sign in to manage your shared passes</p>
      <button 
        onClick={() => navigate('/signin')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
      >
        <LogIn className="h-5 w-5" />
        Sign In
      </button>
    </div>
  );
};

const Sharing: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sharedPasses, setSharedPasses] = useState<SharedPass[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [shareTemplates, setShareTemplates] = useState<ShareTemplate[]>([]);
  const [shareLogs, setShareLogs] = useState<ShareLog[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>('');
  const [batchEmails, setBatchEmails] = useState<string>('');
  const [showLogs, setShowLogs] = useState(false);
  const [userPasses, setUserPasses] = useState<Pass[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form state
  const [shareForm, setShareForm] = useState({
    passId: '',
    recipientEmail: '',
    recipientName: '',
    accessLevel: 'read' as 'read' | 'edit',
    expiryDays: 30,
    restrictions: [] as string[],
    message: ''
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    accessLevel: 'read' as 'read' | 'edit',
    expiryDays: 30,
    restrictions: [] as string[],
    permissions: {
      canDownload: false,
      canPrint: false,
      canShare: false
    }
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const authStatus = isLoggedIn();
      setIsAuthenticated(authStatus);
      
      if (authStatus) {
        await Promise.all([
          loadSharedPasses(),
          loadTemplates(),
          loadStats(),
          loadUserPasses()
        ]);
      }
    };

    checkAuthAndLoadData();
  }, []);

  const loadUserPasses = async () => {
    try {
      const response = await qrCodesAPI.getCodes({ limit: 100 });
      if (response.data.success) {
        setUserPasses(response.data.qrCodes || []);
      }
    } catch (err: any) {
      console.error('Load passes error:', err);
    }
  };

  const loadSharedPasses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sharingAPI.getMyShares({ status: 'active' });
      if (response.data.success) {
        setSharedPasses(response.data.data.shares);
      }
    } catch (err: any) {
      console.error('Load shares error:', err);
      setError(err.response?.data?.message || 'Failed to load shared passes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await sharingAPI.getTemplates();
      if (response.data.success) {
        setShareTemplates(response.data.data.templates);
      }
    } catch (err: any) {
      console.error('Load templates error:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await sharingAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: any) {
      console.error('Load stats error:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await sharingAPI.getLogs({ limit: 20 });
      if (response.data.success) {
        setShareLogs(response.data.data.logs);
      }
    } catch (err: any) {
      console.error('Load logs error:', err);
    }
  };

  const handleSharePass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    setError(null);
    setSuccess(null);

    // Validate form
    const validation = validationUtils.shareForm(
      {
        passId: shareForm.passId,
        recipientEmail: shareForm.recipientEmail,
        recipientName: shareForm.recipientName,
        expiryDays: shareForm.expiryDays,
        message: shareForm.message
      },
      userPasses
    );

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setError('Please fix the validation errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const response = await sharingAPI.sharePass({
        passId: shareForm.passId,
        recipientEmail: shareForm.recipientEmail,
        recipientName: shareForm.recipientName,
        accessLevel: shareForm.accessLevel,
        expiryDays: shareForm.expiryDays,
        restrictions: shareForm.restrictions,
        message: shareForm.message
      });

      if (response.data.success) {
        setSuccess('Pass shared successfully!');
        setShowAddForm(false);
        setValidationErrors({});
        setShareForm({
          passId: '',
          recipientEmail: '',
          recipientName: '',
          accessLevel: 'read',
          expiryDays: 30,
          restrictions: [],
          message: ''
        });
        await loadSharedPasses();
        await loadStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to share pass');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAccess = async (shareId: string) => {
    if (!confirm('Are you sure you want to revoke access to this pass?')) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await sharingAPI.revokeAccess(shareId, 'Access revoked by owner');
      if (response.data.success) {
        setSuccess('Access revoked successfully');
        await loadSharedPasses();
        await loadStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke access');
    } finally {
      setIsLoading(false);
    }
  };

  const generateShareLink = async () => {
    // Validate pass selection
    const passValidation = validationUtils.passSelection(shareForm.passId, userPasses);
    if (!passValidation.valid) {
      setError(passValidation.error!);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await sharingAPI.generateLink({
        passId: shareForm.passId,
        accessLevel: shareForm.accessLevel,
        expiryHours: 24,
        maxUses: 10
      });

      if (response.data.success) {
        setShareLink(response.data.data.shareUrl);
        setSuccess('Share link generated successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchShare = async () => {
    // Validate batch emails
    const emailValidation = validationUtils.batchEmails(batchEmails);
    if (!emailValidation.valid) {
      setError(emailValidation.error!);
      return;
    }

    // Validate pass selection
    const passValidation = validationUtils.passSelection(shareForm.passId, userPasses);
    if (!passValidation.valid) {
      setError(passValidation.error!);
      return;
    }

    const emails = emailValidation.validEmails!;

    setIsLoading(true);
    setError(null);
    try {
      const response = await sharingAPI.batchShare({
        passId: shareForm.passId,
        recipients: emails.map(email => ({ email: email.trim() })),
        accessLevel: shareForm.accessLevel,
        expiryDays: shareForm.expiryDays,
        templateId: selectedTemplate || undefined
      });

      if (response.data.success) {
        const { success, failed } = response.data.data;
        setSuccess(`Shared with ${success.length} recipients. ${failed.length} failed.`);
        setBatchEmails('');
        await loadSharedPasses();
        await loadStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to batch share');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLogs = async () => {
    if (!showLogs) {
      await loadLogs();
    }
    setShowLogs(!showLogs);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    setError(null);

    // Validate template form
    const validation = validationUtils.templateForm({
      name: templateForm.name,
      expiryDays: templateForm.expiryDays,
      restrictions: templateForm.restrictions
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setError('Please fix the validation errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const response = await sharingAPI.createTemplate(templateForm);

      if (response.data.success) {
        setSuccess('Template created successfully!');
        setValidationErrors({});
        setTemplateForm({
          name: '',
          accessLevel: 'read',
          expiryDays: 30,
          restrictions: [],
          permissions: {
            canDownload: false,
            canPrint: false,
            canShare: false
          }
        });
        setShowTemplateForm(false);
        await loadTemplates();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await sharingAPI.deleteTemplate(templateId);

      if (response.data.success) {
        setSuccess('Template deleted successfully!');
        await loadTemplates();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete template');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTemplateRestriction = (restriction: string) => {
    setTemplateForm(prev => ({
      ...prev,
      restrictions: prev.restrictions.includes(restriction)
        ? prev.restrictions.filter(r => r !== restriction)
        : [...prev.restrictions, restriction]
    }));
  };

  return (
    <>
      <Navbar />
      <FeatureTemplate
        title="Pass Sharing"
        description="Share passes securely with family and friends."
        icon={<Users className="h-8 w-8 text-slate-700" />}
      >
        {!isAuthenticated ? (
          <AuthPrompt />
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                <div className="p-2 bg-rose-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                </div>
                <span className="text-rose-600 font-medium flex-1">{error}</span>
                <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-emerald-600 font-medium flex-1">{success}</span>
                <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-600">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-200">
                  <div className="text-emerald-600 text-sm font-medium mb-1">Active</div>
                  <div className="text-2xl font-bold text-emerald-700">{stats.totalActive}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-xl border border-amber-200">
                  <div className="text-amber-600 text-sm font-medium mb-1">Pending</div>
                  <div className="text-2xl font-bold text-amber-700">{stats.totalPending}</div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-4 rounded-xl border border-rose-200">
                  <div className="text-rose-600 text-sm font-medium mb-1">Revoked</div>
                  <div className="text-2xl font-bold text-rose-700">{stats.totalRevoked}</div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200">
                  <div className="text-slate-600 text-sm font-medium mb-1">Expired</div>
                  <div className="text-2xl font-bold text-slate-700">{stats.totalExpired}</div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800">Pass Sharing Management</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow"
              >
                <Plus className="h-4 w-4" />
                Share New Pass
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSharePass} className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                  <h3 className="font-medium flex items-center gap-2 text-slate-800">
                    <UserPlus className="h-5 w-5 text-indigo-600" />
                    Share with New User
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">Select Pass to Share</label>
                    <select
                      value={shareForm.passId}
                      onChange={(e) => setShareForm(prev => ({ ...prev, passId: e.target.value }))}
                      required
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                    >
                      <option value="">Select a pass...</option>
                      {userPasses.map(pass => (
                        <option key={pass._id} value={pass._id}>
                          {pass.title} ({pass.qrType || pass.type || 'Pass'})
                        </option>
                      ))}
                    </select>
                    {userPasses.length === 0 && (
                      <p className="text-sm text-amber-600 mt-1">
                        No passes found. Create a pass first in the QR Scan feature.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">Recipient Email *</label>
                      <input
                        type="email"
                        value={shareForm.recipientEmail}
                        onChange={(e) => {
                          setShareForm(prev => ({ ...prev, recipientEmail: e.target.value }));
                          // Real-time validation
                          const validation = validationUtils.email(e.target.value);
                          setValidationErrors(prev => ({
                            ...prev,
                            recipientEmail: validation.valid ? '' : validation.error!
                          }));
                        }}
                        onBlur={(e) => {
                          // Validate on blur
                          const validation = validationUtils.email(e.target.value);
                          if (!validation.valid) {
                            setValidationErrors(prev => ({
                              ...prev,
                              recipientEmail: validation.error!
                            }));
                          }
                        }}
                        required
                        placeholder="Enter email address"
                        className={getValidationClassName(
                          !!validationErrors.recipientEmail,
                          'w-full p-2.5 border rounded-lg focus:ring-2 transition-all shadow-sm'
                        )}
                      />
                      {validationErrors.recipientEmail && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.recipientEmail}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">Recipient Name</label>
                      <input
                        type="text"
                        value={shareForm.recipientName}
                        onChange={(e) => {
                          setShareForm(prev => ({ ...prev, recipientName: e.target.value }));
                          // Real-time validation
                          const validation = validationUtils.recipientName(e.target.value);
                          setValidationErrors(prev => ({
                            ...prev,
                            recipientName: validation.valid ? '' : validation.error!
                          }));
                        }}
                        placeholder="Optional"
                        className={getValidationClassName(
                          !!validationErrors.recipientName,
                          'w-full p-2.5 border rounded-lg focus:ring-2 transition-all shadow-sm'
                        )}
                      />
                      {validationErrors.recipientName && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.recipientName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">Access Level</label>
                      <select
                        value={shareForm.accessLevel}
                        onChange={(e) => setShareForm(prev => ({ ...prev, accessLevel: e.target.value as 'read' | 'edit' }))}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                      >
                        <option value="read">Read Only</option>
                        <option value="edit">Edit Access</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">Expires In (Days)</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={shareForm.expiryDays}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 30;
                          setShareForm(prev => ({ ...prev, expiryDays: value }));
                          // Real-time validation
                          const validation = validationUtils.expiryDays(value);
                          setValidationErrors(prev => ({
                            ...prev,
                            expiryDays: validation.valid ? '' : validation.error!
                          }));
                        }}
                        className={getValidationClassName(
                          !!validationErrors.expiryDays,
                          'w-full p-2.5 border rounded-lg focus:ring-2 shadow-sm'
                        )}
                      />
                      {validationErrors.expiryDays && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.expiryDays}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">Message (Optional)</label>
                    <textarea
                      value={shareForm.message}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setShareForm(prev => ({ ...prev, message: e.target.value }));
                          // Real-time validation
                          const validation = validationUtils.message(e.target.value);
                          setValidationErrors(prev => ({
                            ...prev,
                            message: validation.valid ? '' : validation.error!
                          }));
                        }
                      }}
                      placeholder="Add a message for the recipient..."
                      rows={3}
                      maxLength={500}
                      className={getValidationClassName(
                        !!validationErrors.message,
                        'w-full p-2.5 border rounded-lg focus:ring-2 shadow-sm resize-none'
                      )}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">
                        {shareForm.message.length}/500 characters
                      </span>
                      {validationErrors.message && (
                        <p className="text-xs text-rose-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Sharing...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5" />
                          Send Invitation
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Enhanced Share Templates */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium flex items-center gap-2 text-slate-800">
                      <Settings2 className="h-5 w-5 text-indigo-600" />
                      Sharing Templates
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">Create reusable sharing configurations to quickly share passes with consistent settings</p>
                  </div>
                  <button
                    onClick={() => setShowTemplateForm(!showTemplateForm)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    {showTemplateForm ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        New Template
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Template Creation Form */}
              {showTemplateForm && (
                <form onSubmit={handleCreateTemplate} className="p-6 bg-indigo-50/30 border-b border-slate-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => {
                          setTemplateForm({...templateForm, name: e.target.value});
                          // Real-time validation
                          const validation = validationUtils.templateName(e.target.value);
                          setValidationErrors(prev => ({
                            ...prev,
                            templateName: validation.valid ? '' : validation.error!
                          }));
                        }}
                        placeholder="e.g., Family Members, Trusted Friends, Work Colleagues"
                        className={getValidationClassName(
                          !!validationErrors.templateName,
                          'w-full p-2.5 border rounded-lg focus:ring-2 shadow-sm'
                        )}
                        required
                      />
                      {validationErrors.templateName && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.templateName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Access Level
                        </label>
                        <select
                          value={templateForm.accessLevel}
                          onChange={(e) => setTemplateForm({...templateForm, accessLevel: e.target.value as 'read' | 'edit'})}
                          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        >
                          <option value="read">View Only</option>
                          <option value="edit">Full Access</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Expiry (Days)
                        </label>
                        <input
                          type="number"
                          value={templateForm.expiryDays}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setTemplateForm({...templateForm, expiryDays: value});
                            // Real-time validation
                            const validation = validationUtils.expiryDays(value);
                            setValidationErrors(prev => ({
                              ...prev,
                              templateExpiryDays: validation.valid ? '' : validation.error!
                            }));
                          }}
                          min="1"
                          max="365"
                          className={getValidationClassName(
                            !!validationErrors.templateExpiryDays,
                            'w-full p-2.5 border rounded-lg focus:ring-2 shadow-sm'
                          )}
                        />
                        {validationErrors.templateExpiryDays && (
                          <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.templateExpiryDays}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Permissions
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={templateForm.permissions.canDownload}
                            onChange={(e) => setTemplateForm({
                              ...templateForm,
                              permissions: {...templateForm.permissions, canDownload: e.target.checked}
                            })}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700">Can Download</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={templateForm.permissions.canPrint}
                            onChange={(e) => setTemplateForm({
                              ...templateForm,
                              permissions: {...templateForm.permissions, canPrint: e.target.checked}
                            })}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700">Can Print</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={templateForm.permissions.canShare}
                            onChange={(e) => setTemplateForm({
                              ...templateForm,
                              permissions: {...templateForm.permissions, canShare: e.target.checked}
                            })}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700">Can Re-share</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Restrictions
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'no-download', label: 'No Download' },
                          { value: 'no-print', label: 'No Print' },
                          { value: 'no-share', label: 'No Re-share' },
                          { value: 'no-export', label: 'No Export' },
                          { value: 'view-only', label: 'View Only' }
                        ].map(restriction => (
                          <button
                            key={restriction.value}
                            type="button"
                            onClick={() => toggleTemplateRestriction(restriction.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              templateForm.restrictions.includes(restriction.value)
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {restriction.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        <strong>Note:</strong> Restrictions work differently than permissions. 
                        "View Only" restriction disables all permissions. Individual restrictions override specific permissions.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Create Template
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Templates List */}
              <div className="p-6">
                {shareTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-slate-100 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Settings2 className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-slate-600 mb-2">No templates yet</p>
                    <p className="text-sm text-slate-500 mb-4">Create templates to quickly share passes with consistent settings</p>
                    <button
                      onClick={() => setShowTemplateForm(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Template
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shareTemplates.map(template => (
                      <div key={template._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className={`p-4 border-b border-slate-200 ${
                          template.accessLevel === 'edit' 
                            ? 'bg-gradient-to-r from-indigo-50 to-blue-50/30' 
                            : 'bg-gradient-to-r from-slate-50 to-gray-50'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-800">{template.name}</h4>
                              <p className="text-xs text-slate-500 mt-1">Used {template.usageCount || 0} times</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-3 py-1 rounded-full ${
                                template.accessLevel === 'edit' 
                                  ? 'bg-indigo-100 text-indigo-700' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {template.accessLevel === 'edit' ? 'Full Access' : 'View Only'}
                              </span>
                              <button
                                onClick={() => handleDeleteTemplate(template._id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete template"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-blue-100 rounded-full">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-sm text-slate-600">
                              Expires after <span className="font-medium text-slate-800">{template.expiryDays} days</span>
                            </div>
                          </div>

                          {template.permissions && Object.values(template.permissions).some(v => v) && (
                            <div className="space-y-1.5">
                              <div className="text-xs font-medium text-slate-500">Permissions:</div>
                              <div className="flex gap-2 flex-wrap">
                                {template.permissions.canDownload && (
                                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">
                                    Can Download
                                  </span>
                                )}
                                {template.permissions.canPrint && (
                                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">
                                    Can Print
                                  </span>
                                )}
                                {template.permissions.canShare && (
                                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">
                                    Can Re-share
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {template.restrictions && template.restrictions.length > 0 ? (
                            <div className="space-y-1.5">
                              <div className="text-xs font-medium text-slate-500">Restrictions:</div>
                              <div className="flex gap-2 flex-wrap">
                                {template.restrictions.map(r => (
                                  <span key={r} className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-md border border-rose-100">
                                    {r.replace('-', ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-md inline-block">
                              No restrictions
                            </div>
                          )}

                          <button
                            onClick={() => {
                              setSelectedTemplate(template._id);
                              setShareForm(prev => ({
                                ...prev,
                                accessLevel: template.accessLevel,
                                expiryDays: template.expiryDays,
                                restrictions: template.restrictions || []
                              }));
                              setSuccess(`Template "${template.name}" applied to share form!`);
                            }}
                            className="w-full mt-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <FileCheck className="h-4 w-4" />
                            Use This Template
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Quick Share Link */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <Link className="h-5 w-5 text-indigo-600" />
                  Quick Share Link
                </h3>
                <p className="text-sm text-slate-600 mt-1">Generate a temporary link that anyone can use to view your pass</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Pass Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Pass to Share
                  </label>
                  <select
                    value={shareForm.passId}
                    onChange={(e) => setShareForm({...shareForm, passId: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  >
                    <option value="">Choose a pass...</option>
                    {userPasses.map(pass => (
                      <option key={pass._id} value={pass._id}>
                        {pass.title} ({pass.qrType || pass.type || 'Pass'})
                      </option>
                    ))}
                  </select>
                  {userPasses.length === 0 && (
                    <p className="text-sm text-amber-600 mt-1">No passes available. Create a pass first!</p>
                  )}
                </div>

                {/* Access Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Access Level
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="linkAccessLevel"
                        value="read"
                        checked={shareForm.accessLevel === 'read'}
                        onChange={(e) => setShareForm({...shareForm, accessLevel: e.target.value as 'read' | 'edit'})}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">View Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="linkAccessLevel"
                        value="edit"
                        checked={shareForm.accessLevel === 'edit'}
                        onChange={(e) => setShareForm({...shareForm, accessLevel: e.target.value as 'read' | 'edit'})}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">Full Access</span>
                    </label>
                  </div>
                </div>

                {/* Generated Link Display */}
                <div className={`p-5 rounded-lg border ${shareLink ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      placeholder="Generated link will appear here"
                    />
                    {!shareLink ? (
                      <button
                        onClick={generateShareLink}
                        disabled={!shareForm.passId}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        <Link className="h-5 w-5" />
                        Generate Link
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink);
                          setSuccess('Link copied to clipboard!');
                        }}
                        className="px-5 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <Copy className="h-5 w-5" />
                        Copy
                      </button>
                    )}
                  </div>
                  
                  {shareLink && (
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-sm text-indigo-600">
                        <Clock className="h-4 w-4" />
                        Link expires in 24 hours
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users2 className="h-4 w-4" />
                        Maximum 10 uses
                      </div>
                      <button
                        onClick={() => {
                          setShareLink('');
                          setSuccess('Link cleared. You can generate a new one.');
                        }}
                        className="text-sm text-rose-600 hover:text-rose-700 underline"
                      >
                        Clear and generate new link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Batch Sharing */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <Users2 className="h-5 w-5 text-indigo-600" />
                  Batch Share
                </h3>
              </div>
              <div className="p-6">
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-5 mb-4">
                  <div className="text-sm text-slate-600 mb-4">
                    Share with multiple users at once by entering their email addresses below (one per line)
                  </div>
                  <textarea
                    value={batchEmails}
                    onChange={(e) => {
                      setBatchEmails(e.target.value);
                      // Real-time validation
                      if (e.target.value.trim()) {
                        const validation = validationUtils.batchEmails(e.target.value);
                        setValidationErrors(prev => ({
                          ...prev,
                          batchEmails: validation.valid ? '' : validation.error!
                        }));
                      } else {
                        setValidationErrors(prev => ({
                          ...prev,
                          batchEmails: ''
                        }));
                      }
                    }}
                    placeholder="john@example.com&#10;jane@example.com&#10;alex@example.com"
                    className={getValidationClassName(
                      !!validationErrors.batchEmails,
                      'w-full h-28 p-3 border rounded-lg focus:ring-2 shadow-sm font-mono text-sm'
                    )}
                  />
                  {validationErrors.batchEmails && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 mt-2">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.batchEmails}
                    </p>
                  )}
                  {batchEmails.trim() && !validationErrors.batchEmails && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
                      <CheckCircle className="h-3 w-3" />
                      {batchEmails.split('\n').filter(e => e.trim()).length} valid email(s) ready to share
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="flex-1 p-2.5 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select sharing template</option>
                    {shareTemplates.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleBatchShare}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <UserPlus className="h-5 w-5" />
                    Share with All
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Current Shares Section */}
            {isLoading ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200/60 shadow-lg text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 mb-3"></div>
                <p className="text-slate-600">Loading shared passes...</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                  <h3 className="font-medium flex items-center gap-2 text-slate-800">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Currently Shared With
                  </h3>
                </div>
                <div className="p-6">
                  {sharedPasses.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-lg">
                      <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-700 font-medium mb-1">No passes shared yet</p>
                      <p className="text-slate-500 text-sm">Share your passes with family and friends</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sharedPasses.map(pass => (
                        <div key={pass._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition-all">
                          <div className={`p-4 ${
                            pass.status === 'active' 
                              ? 'bg-gradient-to-r from-emerald-50 to-blue-50/30 border-b border-emerald-100' 
                              : 'bg-gradient-to-r from-amber-50 to-slate-50 border-b border-amber-100'
                          }`}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                  pass.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                  <Users className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-800">{pass.recipient.email}</span>
                                  {pass.recipient.name && (
                                    <span className="text-xs text-slate-500">{pass.recipient.name}</span>
                                  )}
                                  {pass.pass && (
                                    <span className="text-xs text-indigo-600 mt-1">{pass.pass.title}</span>
                                  )}
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                pass.status === 'active' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {pass.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-slate-400" />
                                  <span className="text-slate-600">Access: </span>
                                  <span className={`font-medium ${
                                    pass.accessLevel === 'edit' ? 'text-indigo-600' : 'text-slate-700'
                                  }`}>
                                    {pass.accessLevel === 'edit' ? 'Full Access' : 'View Only'}
                                  </span>
                                </div>
                                
                                {pass.expiresAt && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600">Expires: </span>
                                    <span className="font-medium text-slate-700">
                                      {new Date(pass.expiresAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleRevokeAccess(pass._id)}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                title="Revoke Access"
                                disabled={isLoading}
                              >
                                <XCircle className="h-4 w-4" />
                                Revoke Access
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Share Activity Logs */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60 flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <History className="h-5 w-5 text-indigo-600" />
                  Activity Logs
                </h3>
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    showLogs 
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {showLogs ? 'Hide' : 'Show'} Logs
                </button>
              </div>
              
              {showLogs && (
                <div className="p-6">
                  {shareLogs.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-lg">
                      <History className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-700 font-medium mb-1">No activity logs yet</p>
                      <p className="text-slate-500 text-sm">Share activity will appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {shareLogs.map((log) => (
                        <div key={log._id} className="py-3 first:pt-0 last:pb-0 hover:bg-slate-50 transition-colors px-2 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-full ${
                                log.action === 'shared' ? 'bg-blue-100 text-blue-600' : 
                                log.action === 'revoked' ? 'bg-rose-100 text-rose-600' : 
                                'bg-amber-100 text-amber-600'
                              }`}>
                                {log.action === 'shared' ? <UserPlus className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                              </div>
                              <div className="text-sm">
                                <span className="capitalize font-medium">{log.action}</span> with{' '}
                                <span className="text-indigo-600">{log.recipient.email}</span>
                                {log.details?.reason && (
                                  <span className="text-slate-500 text-xs block mt-1">{log.details.reason}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 sm:text-right">
                              {new Date(log.timestamp).toLocaleString()} by {log.performedBy.name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </FeatureTemplate>
      <Footer />
    </>
  );
};

export default Sharing;
