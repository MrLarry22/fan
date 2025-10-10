const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/database');
const { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateInitials,
  isValidEmail,
  generateUsername
} = require('../utils/helpers');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// User Registration
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password, fullName } = req.body;
    let authUser;
    let isNewUser = false;

    // 1. Check if a user already exists in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ email });
    if (listError) {
      console.error('Error checking for existing auth user:', listError);
      return res.status(500).json({ success: false, message: 'Error checking user existence' });
    }

    if (users && users.length > 0) {
      authUser = users[0];
      console.log('Existing auth user found:', authUser.id);
      
      // Check if profile exists for this auth user
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', authUser.id)
        .single();
      
      if (existingProfile) {
        console.log('Profile already exists for user ID:', authUser.id);
        return res.status(409).json({ 
          success: false, 
          message: 'An account with this email already exists. Please try logging in instead.' 
        });
      }
      
      // Auth user exists but no profile - this is an inconsistent state, create profile
      console.log('Auth user exists but no profile found - creating profile');
    } else {
      // 2. If not, create a new user in Supabase Auth
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name: fullName, username: generateUsername(email) }
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        return res.status(authError.status || 500).json({ success: false, message: authError.message || 'Failed to create user account' });
      }
      authUser = newAuthUser.user;
      isNewUser = true;
      console.log('New auth user created:', authUser.id);
    }

    // 3. Check if a profile already exists for this user ID
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', authUser.id).single();

    if (existingProfile) {
      console.log('Profile already exists for user ID:', authUser.id);
      // If the user was just created, this is an inconsistent state. Clean up.
      if (isNewUser) {
        await supabase.auth.admin.deleteUser(authUser.id);
      }
      return res.status(409).json({ success: false, message: 'A profile for this user already exists.' });
    }

    // 4. Create the profile record
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authUser.id,
        email,
        full_name: fullName,
        role: 'user',
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // If profile creation fails, clean up the newly created auth user
      if (isNewUser) {
        await supabase.auth.admin.deleteUser(authUser.id);
      }
      return res.status(500).json({ success: false, message: 'Failed to create user profile' });
    }

    // 5. Send verification email
    try {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await emailService.sendVerificationEmail(email, fullName, verificationToken);
      
      await supabase
        .from('profiles')
        .update({
          verification_token: verificationToken,
          verification_token_expires: tokenExpires.toISOString()
        })
        .eq('id', profile.id);
        
    } catch (emailError) {
      console.error('Email service error during registration:', emailError);
      // Don't fail the whole registration if email fails, just log it
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification instructions.',
      data: {
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role,
          emailVerified: false,
          initials: generateInitials(fullName)
        }
      }
    });

  } catch (error) {
    console.error('Unhandled registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
});

// User Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Handle OAuth login (special case)
    if (password === 'oauth-login') {
      // For OAuth users, just check if they exist in our database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          success: false,
          message: 'OAuth user profile not found'
        });
      }

      // Generate JWT token for OAuth user
      const token = generateToken(profile.id);

      // Update last login
      await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      return res.json({
        success: true,
        message: 'OAuth login successful',
        data: {
          user: {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            role: profile.role,
            bio: profile.bio,
            avatarUrl: profile.avatar_url,
            initials: generateInitials(profile.full_name)
          },
          token
        }
      });
    }

    // Regular password-based login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Check if email is verified
    if (!profile.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please check your email for verification instructions.'
      });
    }

    // For demo purposes, email verification is not enforced
    // In production with proper database columns, you would check:
    // if (!profile.email_verified) { ... }
    console.log('User signed in:', profile.email);

    // Generate JWT token
    const token = generateToken(authData.user.id);

    // Update last login
    await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role,
          bio: profile.bio,
          avatarUrl: profile.avatar_url,
          emailVerified: true, // For demo purposes, always true
          initials: generateInitials(profile.full_name)
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get current user profile
router.get('/me', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          bio: user.bio,
          avatarUrl: user.avatar_url,
          emailVerified: true, // For demo purposes, always true
          initials: generateInitials(user.full_name),
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// Email verification route (simplified for demo)
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // For demo purposes, we'll just return success
    // In production, you would verify the token against the database
    console.log('Email verification requested with token:', token);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now sign in to your account.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during email verification'
    });
  }
});

// Resend verification email route (simplified for demo)
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      // For security, don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with this email exists and is not verified, a verification email has been sent.'
      });
    }

    // Send verification email
    try {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const emailResult = await emailService.sendVerificationEmail(email, profile.full_name, verificationToken);
      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        return res.status(500).json({ success: false, message: 'Failed to send verification email' });
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const { email } = req.body;

    // Check if user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      // Don't reveal if email exists or not for security - show success message
      return res.json({
        success: true,
        message: 'If an account with that email exists, we\'ve sent you a password reset link. Please check your email.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update profile with reset token
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        reset_token: resetToken,
        reset_token_expires: tokenExpires.toISOString()
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating reset token:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate reset token'
      });
    }

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(email, profile.full_name || 'User', resetToken);
      console.log('Password reset email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Still show success message for security
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent you a password reset link. Please check your email.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset Password Page (GET)
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (error || !profile) {
      return res.status(400).send(`
        <html>
          <body>
            <h1>Invalid or Expired Token</h1>
            <p>The password reset link is invalid or has expired. Please request a new one.</p>
            <a href="/forgot-password">Request New Reset Link</a>
          </body>
        </html>
      `);
    }

    if (new Date(profile.reset_token_expires) < new Date()) {
      return res.status(400).send(`
        <html>
          <body>
            <h1>Token Expired</h1>
            <p>The password reset link has expired. Please request a new one.</p>
            <a href="/forgot-password">Request New Reset Link</a>
          </body>
        </html>
      `);
    }

    // Render reset form
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - Fanview</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
          .container { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          h1 { text-align: center; color: #333; }
          form { display: flex; flex-direction: column; }
          input { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
          button { background: #007bff; color: white; padding: 10px; border: none; border-radius: 4px; cursor: pointer; }
          button:hover { background: #0056b3; }
          .error { color: red; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset Your Password</h1>
          <form action="/api/auth/reset-password/${token}" method="POST">
            <input type="password" name="password" placeholder="New Password" required minlength="6">
            <input type="password" name="confirmPassword" placeholder="Confirm New Password" required>
            <button type="submit">Reset Password</button>
          </form>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Reset password page error:', error);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});

// Reset Password (POST)
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { token } = req.params;
    const { password } = req.body;

    // Verify token and get user
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (error || !profile) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    if (new Date(profile.reset_token_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
      password: password
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    // Clear reset token
    await supabase
      .from('profiles')
      .update({
        reset_token: null,
        reset_token_expires: null
      })
      .eq('id', profile.id);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Temporary test email route for debugging email delivery
router.get('/test-email', async (req, res) => {
  try {
    const to = req.query.to || process.env.EMAIL_USER;
    if (!to) return res.status(400).json({ success: false, message: 'No recipient specified' });

    const info = await emailService.sendTestEmail(to);

    // Try to get Ethereal preview URL (if using test account)
    let previewUrl = null;
    try {
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
    } catch (err) {
      // ignore
    }

    res.json({ success: true, message: 'Test email sent (if transporter configured)', previewUrl, info });
  } catch (error) {
    console.error('Test email route error:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email', error: error.message });
  }
});

module.exports = router;