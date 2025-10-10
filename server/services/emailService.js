const nodemailer = require('nodemailer');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Prefer explicit SMTP credentials when provided (works in development and production)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined;
    const emailSecure = process.env.EMAIL_SECURE === 'true';

    if (emailUser && emailPass) {
      // If a custom host is provided use it (e.g. smtp.gmail.com), otherwise default to Gmail service
      const transportOptions = emailHost
        ? {
            host: emailHost,
            port: emailPort || 587,
            secure: Boolean(emailSecure),
            auth: { user: emailUser, pass: emailPass },
            debug: true, // Enable debug for detailed logs
            logger: true
          }
        : {
            service: 'gmail',
            auth: { user: emailUser, pass: emailPass },
            debug: true,
            logger: true
          };

      try {
        this.transporter = nodemailer.createTransport(transportOptions);
        console.log('✅ Email transporter configured using provided SMTP credentials');
        
        // Test the connection
        this.testConnection();
        
      } catch (err) {
        console.error('❌ Failed to create transporter with provided SMTP credentials:', err);
        // Fall back to test account below
      }

      return;
    }

    // If no explicit credentials and running in production, warn and continue without transporter
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ No EMAIL_USER/EMAIL_PASS provided in production - email sending disabled');
      return;
    }

    // Development fallback: use Ethereal test account
    this.createTestAccount();
  }

  async testConnection() {
    if (!this.transporter) {
      console.log('⚠️ No transporter available for connection test');
      return;
    }

    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully - Ready to send emails!');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error.message);
      console.log('\n💡 Gmail setup troubleshooting:');
      console.log('1. ✓ Enable 2-factor authentication on your Gmail account');
      console.log('2. ✓ Generate an App Password (Security → App passwords)');
      console.log('3. ✓ Use the 16-character App Password in EMAIL_PASS (not your regular password)');
      console.log('4. ✓ Make sure EMAIL_USER is your full Gmail address');
      console.log('5. ✓ Check that EMAIL_HOST=smtp.gmail.com and EMAIL_PORT=587');
      console.log('\n🔗 Guide: https://support.google.com/accounts/answer/185833');
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('📧 Test email account created (Ethereal):');
      console.log('User:', testAccount.user);
      console.log('Pass:', testAccount.pass);
      console.log('🔗 View emails at: https://ethereal.email');
    } catch (error) {
      console.error('❌ Failed to create test account:', error);
    }
  }

  generateVerificationEmailHTML(name, verificationLink) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Email Address for Fanview</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #0f172a;
            color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1e293b;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          }
          .header {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            width: 60px;
            height: 60px;
            background-color: #ffffff;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
          }
          .brand-name {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .greeting {
            font-size: 20px;
            color: #e2e8f0;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-bottom: 30px;
          }
          .verify-button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
          }
          .footer {
            padding: 30px;
            text-align: center;
            background-color: #0f172a;
            border-top: 1px solid #334155;
          }
          .footer-text {
            font-size: 14px;
            color: #64748b;
            margin: 0;
          }
          .link-fallback {
            margin-top: 30px;
            padding: 20px;
            background-color: #334155;
            border-radius: 8px;
          }
          .link-fallback p {
            font-size: 14px;
            color: #94a3b8;
            margin: 0 0 10px 0;
          }
          .link-fallback a {
            color: #60a5fa;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">F</div>
            <h1 class="brand-name">Fanview</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Welcome ${name}!</div>
            
            <div class="message">
              Thank you for signing up for Fanview! To complete your registration and start exploring amazing content, please verify your email address by clicking the button below.
            </div>
            
            <a href="${verificationLink}" class="verify-button">Verify Email Address</a>
            
            <div class="link-fallback">
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <a href="${verificationLink}">${verificationLink}</a>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              This email was sent by Fanview. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetEmailHTML(name, resetLink) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password for Fanview</title>
        <style>
          :root { color-scheme: dark light; }
          body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: #f4f6fb; }
          .wrapper { max-width:680px; margin:28px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(16,24,40,0.08); }
          .header { background: linear-gradient(90deg,#3b82f6,#8b5cf6); padding:28px 24px; text-align:center; }
          .logo { width:72px; height:72px; margin:0 auto 8px; border-radius:16px; background:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; color:#3b82f6; font-size:30px; }
          .brand { color:#fff; font-weight:700; letter-spacing:0.4px; margin:0; font-size:18px; }
          .content { padding:32px 28px; color:#0f172a; }
          .greeting { font-size:18px; margin:0 0 12px; }
          .message { font-size:15px; color:#334155; line-height:1.6; margin-bottom:22px; }
          .cta { display:inline-block; background:linear-gradient(90deg,#3b82f6,#8b5cf6); color:#fff; text-decoration:none; padding:12px 22px; border-radius:10px; font-weight:600; }
          .fallback { margin-top:18px; font-size:13px; color:#475569; background:#f8fafc; padding:12px; border-radius:8px; word-break:break-word; }
          .footer { padding:22px 28px; font-size:13px; color:#64748b; border-top:1px solid #eef2ff; }
          .signature { margin-top:16px; font-weight:600; color:#0f172a; }
          .small { font-size:13px; color:#94a3b8; }
          @media (prefers-color-scheme: dark) {
            body { background:#0b1220; }
            .wrapper { background:#0b1220; box-shadow:none; border:1px solid rgba(255,255,255,0.03); }
            .content { color:#e6eef8; }
            .message { color:#cbd5e1; }
            .fallback { background:rgba(255,255,255,0.03); color:#cbd5e1; }
            .footer { color:#9fb0c9; border-top-color: rgba(255,255,255,0.03); }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div class="logo">F</div>
            <p class="brand">Fanview</p>
          </div>

          <div class="content">
            <p class="greeting">Hi ${name},</p>

            <p class="message">You have requested to reset your Fanview password for your account.
            To set a new password, just click the button below.</p>

            <p style="text-align:center; margin:18px 0 6px;">
              <a class="cta" href="${resetLink}">Click Here</a>
            </p>

            <div class="fallback">
              <div style="font-weight:600; margin-bottom:6px;">If the button doesn't work, copy and paste this link into your browser:</div>
              <div><a href="${resetLink}" style="color:#2563eb; text-decoration:none;">${resetLink}</a></div>
            </div>

            <p class="message" style="margin-top:18px;">
              If you strongly believe that you did not request this password reset, please reply back to us and we will investigate.
            </p>

            <div class="signature">Thanks,
              <div style="font-weight:600; margin-top:6px;">Fanview Team <span style="font-size:16px;">❤️</span></div>
            </div>
          </div>

          <div class="footer">
            <div class="small">If you didn't request a password reset, you can safely ignore this email. This message was sent to you by Fanview.</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendVerificationEmail(to, name, verificationToken) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Fanview Team" <welcome@fanview.com>',
        to: to,
        subject: '🎉 Welcome to Fanview - Verify Your Email',
        html: this.generateVerificationEmailHTML(name, verificationLink)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Verification email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      console.log('📨 Sent to:', to);
      console.log('✅ accepted:', info.accepted);
      console.log('❌ rejected:', info.rejected);
      console.log('📬 response:', info.response);
      
      if (process.env.NODE_ENV !== 'production') {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) {
          console.log('👀 Preview URL:', preview);
        }
      }

      return info;
      
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to, name, resetToken) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const resetLink = `${baseUrl}/reset-password/${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Fanview Security" <security@fanview.com>',
        to: to,
        subject: '🔐 Reset Your Fanview Password',
        text: `Hi ${name},\n\nYou have requested to reset your Fanview password for your account.\n\nTo set a new password, open this link in your browser:\n${resetLink}\n\nIf you did not request this reset, please reply to this email and let us know.\n\nThanks,\nFanview Team ❤️`,
        html: this.generatePasswordResetEmailHTML(name, resetLink)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Password reset email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      console.log('📨 Sent to:', to);
      console.log('🔗 Reset link:', resetLink);
      
      if (process.env.NODE_ENV !== 'production') {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) {
          console.log('👀 Preview URL:', preview);
        }
      }

      return info;
      
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  // Test method to send a test email
  async sendTestEmail(to) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Fanview Test" <test@fanview.com>',
        to: to,
        subject: '✨ Fanview Email Test - Everything is Working!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 8px;">
            <h1 style="color: #3b82f6; text-align: center;">🎉 Email Test Successful!</h1>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Congratulations! Your Fanview email service is configured correctly and working perfectly.
            </p>
            <div style="background: #dbeafe; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #1e40af; margin: 0; font-weight: bold;">✅ SMTP Connection: Active</p>
              <p style="color: #1e40af; margin: 5px 0 0 0;">✅ Email Delivery: Successful</p>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
              Sent with ❤️ by the Fanview Team
            </p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Test email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('👀 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return info;
      
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      throw error;
    }
  }

  // Helper used by server startup to verify email connection
  async verifyConnection() {
    try {
      if (!this.transporter) return false;
      await this.transporter.verify();
      return true;
    } catch (err) {
      console.error('Email verification failed:', err && err.message ? err.message : err);
      return false;
    }
  }

}

module.exports = new EmailService();
