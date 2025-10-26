import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Email service for sending verification codes and notifications
class EmailService {
  constructor() {
    // Configure email transporter
    // For development, we'll use console logging
    // In production, configure with real SMTP credentials
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'noreply@passvault.com',
        pass: process.env.SMTP_PASS || 'your-password'
      }
    });

    // For development mode, log emails instead of sending
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  async sendVerificationCode(userEmail, userName, deviceName, verificationCode, deviceInfo) {
    const mailOptions = {
      from: '"PassVault Security" <noreply@passvault.com>',
      to: userEmail,
      subject: '🔐 Verify Your New Device - PassVault',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .device-info { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Device Verification Required</h1>
              <p>A new device is trying to access your PassVault account</p>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              <p>We detected a new device attempting to access your PassVault account. To ensure your security, please verify this device using the code below.</p>
              
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Verification Code</p>
                <div class="code">${verificationCode}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Expires in 10 minutes</p>
              </div>

              <div class="device-info">
                <h3 style="margin-top: 0;">📱 Device Details:</h3>
                <p><strong>Device Name:</strong> ${deviceName}</p>
                <p><strong>Device Type:</strong> ${deviceInfo.deviceType || 'Unknown'}</p>
                <p><strong>Operating System:</strong> ${deviceInfo.operatingSystem || 'Unknown'}</p>
                <p><strong>Browser:</strong> ${deviceInfo.browser || 'Unknown'}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Didn't add this device?</strong></p>
                <p style="margin: 5px 0 0 0;">If you didn't attempt to add this device, please change your password immediately and contact support.</p>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <a href="#" class="button">View Account Activity</a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated security notification from PassVault</p>
              <p>© ${new Date().getFullYear()} PassVault. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        PassVault - Device Verification Required
        
        Hi ${userName},
        
        A new device is trying to access your PassVault account.
        
        Verification Code: ${verificationCode}
        (Expires in 10 minutes)
        
        Device Details:
        - Name: ${deviceName}
        - Type: ${deviceInfo.deviceType || 'Unknown'}
        - OS: ${deviceInfo.operatingSystem || 'Unknown'}
        - Browser: ${deviceInfo.browser || 'Unknown'}
        - Time: ${new Date().toLocaleString()}
        
        If you didn't add this device, please change your password immediately.
        
        - PassVault Security Team
      `
    };

    try {
      if (this.isDevelopment) {
        // In development, log the email content
        logger.info('📧 [DEV MODE] Email would be sent:');
        logger.info(`To: ${userEmail}`);
        logger.info(`Subject: ${mailOptions.subject}`);
        logger.info(`Verification Code: ${verificationCode}`);
        logger.info(`Device: ${deviceName} (${deviceInfo.deviceType})`);
        console.log('\n' + '='.repeat(80));
        console.log('📧 VERIFICATION EMAIL (Development Mode)');
        console.log('='.repeat(80));
        console.log(`To: ${userEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`\n🔑 VERIFICATION CODE: ${verificationCode}`);
        console.log(`\n📱 Device: ${deviceName}`);
        console.log(`   Type: ${deviceInfo.deviceType}`);
        console.log(`   OS: ${deviceInfo.operatingSystem}`);
        console.log(`   Browser: ${deviceInfo.browser}`);
        console.log('='.repeat(80) + '\n');
        
        return { success: true, messageId: 'dev-mode' };
      } else {
        // In production, send actual email
        const info = await this.transporter.sendMail(mailOptions);
        logger.info(`Verification email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      }
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      // Still return success in dev mode for testing
      if (this.isDevelopment) {
        return { success: true, messageId: 'dev-mode-fallback' };
      }
      throw error;
    }
  }

  async sendDeviceVerifiedNotification(userEmail, userName, deviceName) {
    const mailOptions = {
      from: '"PassVault Security" <noreply@passvault.com>',
      to: userEmail,
      subject: '✅ Device Verified Successfully - PassVault',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Device Verified Successfully!</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              <p>Your device "<strong>${deviceName}</strong>" has been successfully verified and added to your PassVault account.</p>
              <p>You can now access all your passwords and data from this device.</p>
              <p style="margin-top: 30px;">If you didn't verify this device, please contact support immediately.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} PassVault. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      if (this.isDevelopment) {
        logger.info(`📧 [DEV MODE] Verification success email would be sent to ${userEmail}`);
        console.log(`\n✅ Device "${deviceName}" verified for ${userName}\n`);
        return { success: true };
      } else {
        await this.transporter.sendMail(mailOptions);
        return { success: true };
      }
    } catch (error) {
      logger.error('Failed to send verification success email:', error);
      // Non-critical, don't throw
      return { success: false };
    }
  }
}

export default new EmailService();
