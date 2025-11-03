import express from 'express';
import crypto from 'crypto';
import qrcode from 'qrcode';
import QRCode from '../models/QRCode.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// In-memory store for active QR sessions (in production, use Redis)
const qrSessions = new Map();

// Cleanup expired sessions every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of qrSessions.entries()) {
    if (session.expiresAt < now) {
      qrSessions.delete(sessionId);
      logger.info(`🗑️ [Terminal QR] Cleaned up expired session: ${sessionId}`);
    }
  }
}, 30000);

/**
 * @route   POST /api/terminal-qr/generate
 * @desc    Generate a time-limited QR code session for terminal scanning
 * @access  Private
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { passType, passData, expirySeconds = 60 } = req.body;

    // Validation
    if (!passType || !passData) {
      return res.status(400).json({
        success: false,
        message: 'Pass type and pass data are required'
      });
    }

    // Validate expiry seconds (min 30s, max 300s = 5 minutes)
    const validExpirySeconds = Math.min(Math.max(expirySeconds, 30), 300);

    // Generate unique session ID
    const sessionId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const expiresAt = timestamp + (validExpirySeconds * 1000);

    // Create session data
    const sessionData = {
      sessionId,
      userId,
      passType,
      passData,
      timestamp,
      expiresAt,
      scanned: false,
      createdAt: new Date().toISOString()
    };

    // Store session
    qrSessions.set(sessionId, sessionData);

    // Get the host - if it's localhost, try to get the actual IP address
    let host = req.get('host');
    
    // If running on localhost, try to use the local network IP instead
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      // Try to get the local network IP
      const os = await import('os');
      const networkInterfaces = os.networkInterfaces();
      let localIP = 'localhost';
      
      // Find the first non-internal IPv4 address
      Object.values(networkInterfaces).forEach(interfaces => {
        if (interfaces) {
          interfaces.forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
              localIP = iface.address;
            }
          });
        }
      });
      
      // Replace localhost with the local IP, keep the port
      const port = host.split(':')[1];
      host = port ? `${localIP}:${port}` : localIP;
    }

    // Create QR code data as a URL that can be scanned
    // When user scans this URL with their phone, it will open the scan endpoint
    const scanUrl = `${req.protocol}://${host}/api/terminal-qr/scan?sessionId=${sessionId}&userId=${userId}&timestamp=${timestamp}`;

    logger.info(`✅ [Terminal QR] Generated session for user ${userId}: ${sessionId}`);
    logger.info(`⏱️ [Terminal QR] Expires in ${validExpirySeconds}s`);
    logger.info(`🔗 [Terminal QR] Scan URL: ${scanUrl}`);
    logger.info(`📱 [Terminal QR] Make sure your phone is on the same WiFi network!`);

    res.json({
      success: true,
      message: 'QR session created successfully',
      data: {
        sessionId,
        qrData: scanUrl, // Return URL instead of JSON string
        expiresAt,
        expirySeconds: validExpirySeconds,
        passType,
        status: 'active'
      }
    });

  } catch (error) {
    logger.error('❌ [Terminal QR] Generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR session',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/terminal-qr/status/:sessionId
 * @desc    Check status of a QR session (for polling)
 * @access  Private
 */
router.get('/status/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = qrSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired',
        status: 'expired'
      });
    }

    // Verify user owns this session
    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to session'
      });
    }

    // Check if expired
    if (session.expiresAt < Date.now()) {
      qrSessions.delete(sessionId);
      return res.status(410).json({
        success: false,
        message: 'Session expired',
        status: 'expired'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.scanned ? 'scanned' : 'waiting',
        scanned: session.scanned,
        expiresAt: session.expiresAt,
        timeRemaining: Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000)),
        passType: session.passType
      }
    });

  } catch (error) {
    logger.error('❌ [Terminal QR] Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check session status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/terminal-qr/scan
 * @desc    Handle QR code scan from phone (when user scans the URL)
 * @access  Public
 */
router.get('/scan', async (req, res) => {
  try {
    const { sessionId, userId, timestamp } = req.query;

    if (!sessionId || !userId) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid QR Code</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
            .error { color: #dc3545; font-size: 24px; margin: 20px; }
          </style>
        </head>
        <body>
          <h1>❌ Invalid QR Code</h1>
          <p class="error">This QR code is invalid or malformed.</p>
        </body>
        </html>
      `);
    }

    const session = qrSessions.get(sessionId);

    if (!session) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code Expired</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
            .error { color: #dc3545; font-size: 24px; margin: 20px; }
          </style>
        </head>
        <body>
          <h1>⏰ QR Code Expired</h1>
          <p class="error">This QR code has expired or was not found.</p>
          <p>Please generate a new QR code from the terminal.</p>
        </body>
        </html>
      `);
    }

    // Check if already scanned
    if (session.scanned) {
      return res.status(409).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Scanned</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
            .warning { color: #ffc107; font-size: 24px; margin: 20px; }
          </style>
        </head>
        <body>
          <h1>⚠️ Already Scanned</h1>
          <p class="warning">This QR code has already been used.</p>
        </body>
        </html>
      `);
    }

    // Check if expired
    if (session.expiresAt < Date.now()) {
      qrSessions.delete(sessionId);
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code Expired</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
            .error { color: #dc3545; font-size: 24px; margin: 20px; }
          </style>
        </head>
        <body>
          <h1>⏰ QR Code Expired</h1>
          <p class="error">This QR code has expired.</p>
          <p>Please generate a new QR code from the terminal.</p>
        </body>
        </html>
      `);
    }

    // Verify user match
    if (session.userId !== userId) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Access Denied</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
            .error { color: #dc3545; font-size: 24px; margin: 20px; }
          </style>
        </head>
        <body>
          <h1>🔒 Access Denied</h1>
          <p class="error">User mismatch. This QR code belongs to a different user.</p>
        </body>
        </html>
      `);
    }

    // Mark as scanned
    session.scanned = true;
    session.scannedAt = new Date().toISOString();

    // Prepare QR data string
    const passDataWithType = {
      type: session.passType,
      ...session.passData
    };
    const qrDataString = JSON.stringify(passDataWithType);

    // Generate QR code image
    let qrCodeImage;
    try {
      qrCodeImage = await qrcode.toDataURL(qrDataString, {
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256,
        errorCorrectionLevel: 'H'
      });
      
      logger.info(`✅ [Terminal QR] QR code image generated successfully`);
      logger.info(`📏 [Terminal QR] Image length: ${qrCodeImage?.length || 0} characters`);
      logger.info(`🎨 [Terminal QR] Image preview: ${qrCodeImage?.substring(0, 50)}...`);
    } catch (qrGenError) {
      logger.error('❌ [Terminal QR] QR code image generation failed:', qrGenError);
      // Use a default/fallback if QR generation fails
      qrCodeImage = null;
    }

    // Create the pass in database
    const qrCodeData = {
      userId: session.userId,
      qrType: 'text', // Use 'text' type for passes
      title: session.passData.title || `${session.passType} Pass`,
      data: {
        text: qrDataString
      },
      qrCodeImage, // Add the generated QR code image
      isEncrypted: false,
      category: session.passType,
      description: `Created via QR scan - ${session.passData.title || session.passType}`,
      tags: ['qr-scan', session.passType],
      scanCount: 0,
      lastScannedAt: null,
      isActive: true,
      color: '#000000',
      backgroundColor: '#FFFFFF',
      size: 256
    };

    try {
      const newQRCode = await QRCode.create(qrCodeData);
      
      logger.info(`✅ [Terminal QR] Pass created for user ${userId}: ${newQRCode._id}`);
      logger.info(`🎉 [Terminal QR] Session ${sessionId} completed successfully`);
      logger.info(`📋 [Terminal QR] Pass title: ${newQRCode.title}`);
      logger.info(`🖼️ [Terminal QR] QR image saved: ${newQRCode.qrCodeImage ? 'YES' : 'NO'}`);
      logger.info(`📏 [Terminal QR] QR image length in DB: ${newQRCode.qrCodeImage?.length || 0}`);

      // Keep session for longer so frontend can poll and see the success status
      setTimeout(() => {
        qrSessions.delete(sessionId);
        logger.info(`🗑️ [Terminal QR] Session ${sessionId} cleaned up`);
      }, 10000); // Keep for 10 seconds instead of 5 for status polling

      // Return success HTML page
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code Scanned Successfully</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: Arial; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .success { 
              font-size: 72px; 
              margin: 20px; 
              animation: bounce 1s ease-in-out;
            }
            .title { font-size: 32px; margin: 20px; font-weight: bold; }
            .message { font-size: 18px; margin: 20px; opacity: 0.9; }
            .pass-details {
              background: rgba(255,255,255,0.1);
              border-radius: 15px;
              padding: 20px;
              margin: 30px auto;
              max-width: 400px;
              backdrop-filter: blur(10px);
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
          </style>
        </head>
        <body>
          <div class="success">✅</div>
          <h1 class="title">Successfully Scanned!</h1>
          <p class="message">Your pass has been created and added to your account.</p>
          <div class="pass-details">
            <h2>📄 ${session.passData.title || session.passType}</h2>
            <p>Type: ${session.passType}</p>
            <p>Created: ${new Date().toLocaleString()}</p>
          </div>
          <p class="message">You can close this page now.</p>
          <p class="message">Check your terminal to confirm!</p>
        </body>
        </html>
      `);

    } catch (dbError) {
      logger.error('❌ [Terminal QR] Database error:', dbError);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error Creating Pass</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
            .error { color: #dc3545; font-size: 24px; margin: 20px; }
          </style>
        </head>
        <body>
          <h1>❌ Error</h1>
          <p class="error">Failed to create pass in database.</p>
          <p>${dbError.message}</p>
        </body>
        </html>
      `);
    }

  } catch (error) {
    logger.error('❌ [Terminal QR] Scan error:', error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
          .error { color: #dc3545; font-size: 24px; margin: 20px; }
        </style>
      </head>
      <body>
        <h1>❌ Server Error</h1>
        <p class="error">Something went wrong while processing the QR code.</p>
      </body>
      </html>
    `);
  }
});

/**
 * @route   POST /api/terminal-qr/scan
 * @desc    Process scanned QR data and create pass (called when user scans QR)
 * @access  Public (but validates session data)
 */
router.post('/scan', async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }

    // Parse QR data
    let parsedData;
    try {
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR data format'
      });
    }

    // Validate required fields
    if (!parsedData.sessionId || !parsedData.userId || !parsedData.type === 'terminal-scan') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data'
      });
    }

    const session = qrSessions.get(parsedData.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'QR code session not found or expired'
      });
    }

    // Check if already scanned
    if (session.scanned) {
      return res.status(409).json({
        success: false,
        message: 'QR code already scanned'
      });
    }

    // Check if expired
    if (session.expiresAt < Date.now()) {
      qrSessions.delete(parsedData.sessionId);
      return res.status(410).json({
        success: false,
        message: 'QR code expired'
      });
    }

    // Verify user match
    if (session.userId !== parsedData.userId) {
      return res.status(403).json({
        success: false,
        message: 'User mismatch in QR data'
      });
    }

    // Mark as scanned
    session.scanned = true;
    session.scannedAt = new Date().toISOString();

    // Create the pass in database
    const qrCodeData = {
      userId: session.userId,
      qrType: session.passType,
      title: session.passData.title || `${session.passType} Pass`,
      data: session.passData,
      category: session.passData.category || 'general',
      description: session.passData.description || 'Created via terminal QR scan',
      tags: ['terminal-scan', session.passType],
      scanCount: 0,
      lastScanned: null,
      isActive: true
    };

    const newQRCode = new QRCode(qrCodeData);
    await newQRCode.save();

    logger.info(`✅ [Terminal QR] Successfully scanned and created pass for session: ${parsedData.sessionId}`);

    // Clean up session after successful scan
    setTimeout(() => qrSessions.delete(parsedData.sessionId), 5000);

    res.json({
      success: true,
      message: 'QR code scanned successfully! Pass created.',
      data: {
        qrCode: newQRCode,
        sessionId: parsedData.sessionId,
        passType: session.passType,
        scannedAt: session.scannedAt
      }
    });

  } catch (error) {
    logger.error('❌ [Terminal QR] Scan processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process QR scan',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/terminal-qr/cancel/:sessionId
 * @desc    Cancel an active QR session
 * @access  Private
 */
router.delete('/cancel/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = qrSessions.get(sessionId);

    if (!session) {
      // Return 410 Gone for non-existent sessions (likely already completed/cleaned up)
      return res.status(410).json({
        success: false,
        message: 'Session not found or already completed'
      });
    }

    // Verify user owns this session
    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Don't try to delete already scanned sessions
    if (session.scanned) {
      return res.status(410).json({
        success: true,
        message: 'Session already completed'
      });
    }

    qrSessions.delete(sessionId);

    logger.info(`🗑️ [Terminal QR] Session cancelled by user: ${sessionId}`);

    res.json({
      success: true,
      message: 'Session cancelled successfully'
    });

  } catch (error) {
    logger.error('❌ [Terminal QR] Cancel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel session',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/terminal-qr/sessions
 * @desc    Get all active sessions for user
 * @access  Private
 */
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = Date.now();

    const userSessions = [];
    for (const [sessionId, session] of qrSessions.entries()) {
      if (session.userId === userId && session.expiresAt > now) {
        userSessions.push({
          sessionId: session.sessionId,
          passType: session.passType,
          status: session.scanned ? 'scanned' : 'waiting',
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          timeRemaining: Math.floor((session.expiresAt - now) / 1000)
        });
      }
    }

    res.json({
      success: true,
      data: {
        sessions: userSessions,
        count: userSessions.length
      }
    });

  } catch (error) {
    logger.error('❌ [Terminal QR] Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions',
      error: error.message
    });
  }
});

export default router;
