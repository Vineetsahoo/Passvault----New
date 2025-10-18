import React, { useState, useEffect } from 'react';
import { 
  Users, AlertCircle, Plus, Clock, XCircle, Link, Copy, UserPlus, 
  Shield, History, Settings2, Users2, Lock, LogIn, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface SharedPass {
  id: string;
  recipient: string;
  accessLevel: 'read' | 'edit';
  status: 'active' | 'pending';
  expiresAt?: Date;
  lastAccessed?: Date;
}

interface ShareTemplate {
  id: string;
  name: string;
  accessLevel: 'read' | 'edit';
  expiryDays: number;
  restrictions: string[];
}

interface ShareLog {
  id: string;
  action: 'shared' | 'revoked' | 'modified';
  timestamp: Date;
  recipient: string;
  performedBy: string;
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
  const [sharedPasses, setSharedPasses] = useState<SharedPass[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [shareTemplates, setShareTemplates] = useState<ShareTemplate[]>([
    {
      id: '1',
      name: 'Basic Access',
      accessLevel: 'read',
      expiryDays: 30,
      restrictions: ['no-download', 'no-print']
    },
    {
      id: '2',
      name: 'Full Access',
      accessLevel: 'edit',
      expiryDays: 90,
      restrictions: []
    }
  ]);

  const [shareLogs, setShareLogs] = useState<ShareLog[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>('');
  const [batchEmails, setBatchEmails] = useState<string>('');
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadShares = async () => {
      // Simulate auth check
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);
      
      if (authStatus) {
        setIsLoading(true);
        try {
          // Only fetch shared passes if authenticated
          await new Promise(resolve => setTimeout(resolve, 1000));
          setSharedPasses([
            { id: '1', recipient: 'john@example.com', accessLevel: 'read', status: 'active' },
            { id: '2', recipient: 'jane@example.com', accessLevel: 'edit', status: 'pending' },
          ]);
        } catch (err) {
          setError('Failed to load shared passes');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAuthAndLoadShares();
  }, []);

  const handleRevokeAccess = async (passId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSharedPasses(prev => prev.filter(pass => pass.id !== passId));
    } catch (err) {
      setError('Failed to revoke access');
    } finally {
      setIsLoading(false);
    }
  };

  const generateShareLink = async () => {
    // Simulate link generation
    const link = `https://example.com/share/${Math.random().toString(36).substr(2, 9)}`;
    setShareLink(link);
  };

  const handleBatchShare = async () => {
    const emails = batchEmails.split('\n').filter(email => email.trim());
    // Implement batch sharing logic
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
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                </div>
                <span className="text-rose-600 font-medium">{error}</span>
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
              <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                  <h3 className="font-medium flex items-center gap-2 text-slate-800">
                    <UserPlus className="h-5 w-5 text-indigo-600" />
                    Share with New User
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">Recipient Email</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">Access Level</label>
                      <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm">
                        <option value="read">Read Only</option>
                        <option value="edit">Edit Access</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">Expiry Date</label>
                      <input
                        type="datetime-local"
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Send Invitation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Share Templates */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <Settings2 className="h-5 w-5 text-indigo-600" />
                  Sharing Templates
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shareTemplates.map(template => (
                    <div key={template.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className={`p-4 border-b border-slate-200 ${
                        template.accessLevel === 'edit' 
                          ? 'bg-gradient-to-r from-indigo-50 to-blue-50/30' 
                          : 'bg-gradient-to-r from-slate-50 to-gray-50'
                      }`}>
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-slate-800">{template.name}</h4>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            template.accessLevel === 'edit' 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {template.accessLevel === 'edit' ? 'Full Access' : 'View Only'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-1.5 bg-blue-100 rounded-full">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="text-sm text-slate-600">
                            Expires after <span className="font-medium text-slate-800">{template.expiryDays} days</span>
                          </div>
                        </div>
                        
                        {template.restrictions.length > 0 ? (
                          <div className="space-y-2">
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
                          <div className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md inline-block">
                            No restrictions
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Quick Share Link */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200/60">
                <h3 className="font-medium flex items-center gap-2 text-slate-800">
                  <Link className="h-5 w-5 text-indigo-600" />
                  Quick Share Link
                </h3>
              </div>
              <div className="p-6">
                <div className={`p-5 rounded-lg border ${shareLink ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      placeholder="Generate a shareable link"
                    />
                    {!shareLink ? (
                      <button
                        onClick={generateShareLink}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <Link className="h-5 w-5" />
                        Generate Link
                      </button>
                    ) : (
                      <button
                        onClick={() => navigator.clipboard.writeText(shareLink)}
                        className="px-5 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <Copy className="h-5 w-5" />
                        Copy
                      </button>
                    )}
                  </div>
                  
                  {shareLink && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-indigo-600">
                      <Clock className="h-4 w-4" />
                      Link expires in 24 hours
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
                    onChange={(e) => setBatchEmails(e.target.value)}
                    placeholder="john@example.com&#10;jane@example.com&#10;alex@example.com"
                    className="w-full h-28 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-mono text-sm"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="flex-1 p-2.5 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select sharing template</option>
                    {shareTemplates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
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
                        <div key={pass.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition-all">
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
                                <span className="font-medium text-slate-800">{pass.recipient}</span>
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
                                onClick={() => handleRevokeAccess(pass.id)}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                                title="Revoke Access"
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
                  <div className="divide-y divide-slate-200">
                    {[
                      { action: 'shared', recipient: 'john@example.com', timestamp: new Date(), performedBy: 'you' },
                      { action: 'revoked', recipient: 'old@example.com', timestamp: new Date(Date.now() - 86400000), performedBy: 'you' }
                    ].map((log, index) => (
                      <div key={index} className="py-3 first:pt-0 last:pb-0 hover:bg-slate-50 transition-colors px-2 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-full ${
                              log.action === 'shared' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'
                            }`}>
                              {log.action === 'shared' ? <UserPlus className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            </div>
                            <div className="text-sm">
                              <span className="capitalize font-medium">{log.action}</span> with <span className="text-indigo-600">{log.recipient}</span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 sm:text-right">
                            {log.timestamp.toLocaleString()} by {log.performedBy}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
