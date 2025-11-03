import React, { useState, useEffect } from 'react';
import { Terminal, QrCode, Clock, CheckCircle, XCircle, RefreshCw, AlertCircle, Copy, Loader2, Smartphone, Download, Image } from 'lucide-react';
import { terminalQrAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

interface TerminalQrScannerProps {
  onScanSuccess?: (passData: any) => void;
}

interface QRSession {
  sessionId: string;
  qrData: string;
  expiresAt: number;
  expirySeconds: number;
  passType: string;
  status: 'active' | 'scanned' | 'expired';
}

// Pass type templates
const PASS_TEMPLATES = {
  'boarding-pass': {
    title: 'Flight to NYC',
    description: 'Boarding pass for flight to New York',
    icon: '✈️',
    airline: 'Sky Airlines',
    from: 'LAX',
    to: 'JFK',
    flight: 'SA123',
    seat: '12A',
    gate: 'B7',
    boarding: '10:30 AM',
    departure: '11:00 AM',
    date: new Date().toISOString().split('T')[0],
    passenger: 'John Doe',
    class: 'Economy',
    category: 'travel'
  },
  'event-ticket': {
    title: 'Concert Ticket',
    description: 'Event ticket for music festival',
    icon: '🎟️',
    event: 'Summer Music Festival',
    venue: 'Madison Square Garden',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '7:00 PM',
    section: 'A',
    row: '12',
    seat: '5',
    price: '$150.00',
    ticketNumber: 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    category: 'entertainment'
  },
  'loyalty-card': {
    title: 'VIP Membership',
    description: 'Loyalty card with rewards',
    icon: '💳',
    program: 'Gold Member',
    memberNumber: 'GOLD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    memberSince: '2024',
    points: Math.floor(Math.random() * 5000) + 1000,
    tier: 'Gold',
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'membership'
  },
  'parking-pass': {
    title: 'Parking Pass',
    description: 'Monthly parking permit',
    icon: '🅿️',
    location: 'Downtown Parking Garage',
    level: 'Level 3',
    spot: 'A-45',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vehicle: 'Toyota Camry',
    plate: 'ABC-' + Math.floor(Math.random() * 9000 + 1000),
    passNumber: 'PARK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    category: 'parking'
  },
  'gym-membership': {
    title: 'Gym Membership',
    description: 'Fitness center access pass',
    icon: '💪',
    gym: 'FitLife Fitness Center',
    memberName: 'John Doe',
    membershipType: 'Premium',
    memberNumber: 'GYM-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    facilities: 'All Access',
    category: 'fitness'
  }
};

const TerminalQrScanner: React.FC<TerminalQrScannerProps> = ({ onScanSuccess }) => {
  const [session, setSession] = useState<QRSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedPassType, setSelectedPassType] = useState<string>('boarding-pass');
  const [copied, setCopied] = useState(false);

  // Cleanup on unmount - only cancel active sessions
  useEffect(() => {
    return () => {
      if (session && session.status === 'active') {
        terminalQrAPI.cancelSession(session.sessionId).catch(() => {
          // Silently ignore errors (session might already be cleaned up)
        });
      }
    };
  }, [session]);

  // Countdown timer
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((session.expiresAt - now) / 1000));
      
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setError('QR code expired. Please generate a new one.');
        setSession(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  // Poll session status
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await terminalQrAPI.getSessionStatus(session.sessionId);
        
        console.log('📊 Session status:', response.data);
        
        if (response.data.data.scanned) {
          setSession({ ...session, status: 'scanned' });
          setSuccess('✅ Pass created successfully! Refreshing your passes...');
          setError(null);
          
          // Notify parent component
          if (onScanSuccess) {
            onScanSuccess(response.data.data);
          }

          // Trigger page refresh after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      } catch (err: any) {
        // Handle 404/410 errors - session completed and cleaned up
        if (err.response?.status === 404 || err.response?.status === 410) {
          console.log('✅ Session completed (410/404) - Pass was created successfully');
          setSession({ ...session, status: 'scanned' });
          setSuccess('✅ Pass created successfully! Check your QR Scan page.');
          setError(null);
          
          // Keep success message visible longer
          setTimeout(() => {
            setSession(null);
            setSuccess(null);
          }, 5000);
        } else {
          // Only show errors for other issues
          console.error('❌ Error polling session:', err);
          setError(`Error: ${err.response?.data?.message || err.message}`);
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [session, onScanSuccess]);

  const generateQRSession = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const passData = PASS_TEMPLATES[selectedPassType as keyof typeof PASS_TEMPLATES];
      
      const response = await terminalQrAPI.generateSession({
        passType: selectedPassType,
        passData,
        expirySeconds: 60
      });

      if (response.data.success) {
        setSession({
          ...response.data.data,
          status: 'active'
        });
        setTimeRemaining(response.data.data.expirySeconds);
        setSuccess('✅ QR code ready! Scan with your phone camera.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate QR session');
    } finally {
      setIsGenerating(false);
    }
  };

  const cancelSession = async () => {
    if (!session) return;
    
    // Don't try to cancel already scanned/completed sessions
    if (session.status !== 'active') {
      setSession(null);
      return;
    }

    try {
      await terminalQrAPI.cancelSession(session.sessionId);
      setSession(null);
      setSuccess('✅ Session cancelled successfully');
      setError(null);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      // Silently handle 404/410 errors - session already cleaned up
      if (err.response?.status === 404 || err.response?.status === 410) {
        console.log('✅ Session already cleaned up on backend');
        setSession(null);
        setSuccess('Session ended');
        setTimeout(() => setSuccess(null), 2000);
      } else {
        console.error('❌ Error cancelling session:', err);
        setError(err.response?.data?.message || 'Failed to cancel session');
      }
    }
  };

  const copyCommand = () => {
    navigator.clipboard.writeText('npm run generate-qr');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number): string => {
    if (seconds <= 10) return 'text-rose-600';
    if (seconds <= 30) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50/30 p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Terminal className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Terminal QR Scanner</h3>
            <p className="text-sm text-slate-600">Generate QR code in terminal and scan with phone</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
            <span className="text-rose-600 text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-emerald-600 text-sm">{success}</span>
          </div>
        )}

        {!session ? (
          <>
            {/* Pass Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Pass Type
              </label>
              <select
                value={selectedPassType}
                onChange={(e) => setSelectedPassType(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
              >
                <option value="boarding-pass">✈️ Boarding Pass</option>
                <option value="event-ticket">🎟️ Event Ticket</option>
                <option value="loyalty-card">💳 Loyalty Card</option>
                <option value="parking-pass">🅿️ Parking Pass</option>
                <option value="gym-membership">💪 Gym Membership</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateQRSession}
              disabled={isGenerating}
              className="w-full p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating QR Code...
                </>
              ) : (
                <>
                  <QrCode className="h-5 w-5" />
                  Generate QR Code
                </>
              )}
            </button>

            {/* Instructions */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-600" />
                How it works - No Terminal Required!
              </h4>
              <ol className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-purple-600 flex-shrink-0">1.</span>
                  <span>Select a pass type and click "Generate QR Code"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-purple-600 flex-shrink-0">2.</span>
                  <span>QR code will appear directly in your browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-purple-600 flex-shrink-0">3.</span>
                  <span>Scan with your phone's Camera app (OR Google Lens)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-purple-600 flex-shrink-0">4.</span>
                  <span>Pass automatically created in your account!</span>
                </li>
              </ol>
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Important:</strong> Your phone must be on the same WiFi network as your computer</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Active Session - Show QR Code Directly in Browser! */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
              <div className="text-center space-y-6">
                {/* Title */}
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <Smartphone className="h-6 w-6 text-purple-600" />
                    <h4 className="text-xl font-bold text-slate-800">
                      Scan with Your Phone
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    No terminal needed! Just scan this QR code with your phone camera
                  </p>
                </div>

                {/* QR Code Display - DIRECTLY IN BROWSER */}
                <div className="bg-white p-6 rounded-xl shadow-lg inline-block mx-auto border-4 border-purple-200">
                  {session.qrData ? (
                    <QRCodeSVG
                      value={session.qrData}
                      size={280}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  ) : (
                    <div className="w-[280px] h-[280px] flex items-center justify-center bg-slate-100 rounded">
                      <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Timer */}
                <div className="inline-flex items-center justify-center gap-3 bg-white/70 backdrop-blur-sm py-3 px-6 rounded-full">
                  <Clock className={`h-6 w-6 ${getTimeColor(timeRemaining)}`} />
                  <span className={`text-3xl font-bold tabular-nums ${getTimeColor(timeRemaining)}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>

                {/* Instructions */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 text-left">
                  <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    How to Scan:
                  </h5>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>iPhone:</strong> Open Camera app, point at QR code, tap banner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Android:</strong> Open Camera app OR Google Lens, scan, tap notification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Tip:</strong> Hold phone steady 6-12 inches from screen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>WiFi:</strong> Phone must be on same network as computer</span>
                    </li>
                  </ul>
                </div>

                {/* Pass Info */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Pass Type</p>
                      <p className="font-semibold text-slate-800 capitalize">
                        {PASS_TEMPLATES[selectedPassType as keyof typeof PASS_TEMPLATES]?.icon} {PASS_TEMPLATES[selectedPassType as keyof typeof PASS_TEMPLATES]?.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Session ID</p>
                      <p className="font-mono text-xs text-slate-700">{session.sessionId.slice(0, 12)}...</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={cancelSession}
                    className="flex-1 p-3 bg-white/70 backdrop-blur-sm text-slate-700 rounded-lg hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <XCircle className="h-5 w-5" />
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(session.qrData);
                      setSuccess('✅ URL copied! Open in phone browser if camera scan fails');
                      setTimeout(() => setSuccess(null), 3000);
                    }}
                    className="flex-1 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <Copy className="h-5 w-5" />
                    Copy URL (Backup)
                  </button>
                </div>
              </div>
            </div>

            {/* Waiting Status or Success */}
            {session.status === 'scanned' ? (
              <div className="flex flex-col items-center justify-center gap-4 text-emerald-600 bg-emerald-50 rounded-lg p-6 border-2 border-emerald-200">
                <div className="bg-emerald-100 rounded-full p-4">
                  <CheckCircle className="h-12 w-12 text-emerald-600" />
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-emerald-700 mb-2">Successfully Scanned!</h4>
                  <p className="text-emerald-600 font-medium">Your pass has been created and added to your account</p>
                  <p className="text-sm text-emerald-500 mt-2">Go to QR Scan page to view your new pass</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 text-slate-600 bg-slate-50 rounded-lg p-4">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span className="font-medium">Waiting for you to scan the QR code...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TerminalQrScanner;
