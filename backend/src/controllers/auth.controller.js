const User = require('../models/User');
const Provider = require('../models/Provider');
const { validationResult } = require('express-validator');
const { generateToken } = require('../utils/generateToken');
const passport = require('passport');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, phone, role, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      address: address || ''
    });

    // If role is provider, create provider profile
    if (user.role === 'provider') {
      await Provider.create({
        userId: user._id,
        businessName: name,
        description: 'New provider - Please update your business profile',
        businessLicense: 'PENDING',
        address: {
          street: address || 'Not provided',
          city: 'Not provided',
          state: 'Not provided',
          zipCode: '00000',
          coordinates: { lat: 0, lng: 0 }
        },
        phone: phone,
        email: email,
        images: [],
        services: [],
        operatingHours: {
          monday: { open: '09:00', close: '18:00', isClosed: false },
          tuesday: { open: '09:00', close: '18:00', isClosed: false },
          wednesday: { open: '09:00', close: '18:00', isClosed: false },
          thursday: { open: '09:00', close: '18:00', isClosed: false },
          friday: { open: '09:00', close: '18:00', isClosed: false },
          saturday: { open: '09:00', close: '18:00', isClosed: false },
          sunday: { open: '', close: '', isClosed: true }
        },
        isVerified: false,
        isActive: true
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // If provider, get provider profile
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await Provider.findOne({ userId: user._id });
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified
      },
      providerId: providerProfile ? providerProfile._id : null,
      customerId: user.role === 'customer' ? user._id : null
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user has a password (Google OAuth users without password should use Google Sign-In)
    if (!user.password && user.googleId) {
      return res.status(400).json({
        success: false,
        message: 'This account was created with Google. Please login using Google Sign-In, or set a password in your profile to use email/password login.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // If provider, get provider profile
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await Provider.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      providerId: providerProfile ? providerProfile._id : null,
      customerId: user.role === 'customer' ? user._id : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        isVerified: user.isVerified,
        isActive: user.isActive,
        googleId: user.googleId,
        hasPassword: !!user.password, // Tell frontend if user has password set
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // If user doesn't have a password yet (Google OAuth user), allow them to set one
    if (!user.password) {
      if (!req.body.newPassword || req.body.newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }
      
      user.password = req.body.newPassword;
      await user.save();

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Password set successfully! You can now login with email and password.',
        token
      });
    }

    // For users with existing password, check current password
    if (!req.body.currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your current password'
      });
    }

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = async (req, res) => {
  try {
    // Check if authentication was successful
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    const { user, isNewUser } = req.user;

    // Generate JWT token
    const token = generateToken(user._id);

    // If provider, get provider profile
    let providerParam = '';
    if (user.role === 'provider') {
      const providerProfile = await Provider.findOne({ userId: user._id });
      if (providerProfile) {
        providerParam = `&providerId=${providerProfile._id}`;
      }
    }

    // Redirect to frontend with token
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // If new Google user, redirect to set password page
    if (isNewUser) {
      return res.redirect(`${frontendURL}/auth/google/callback?token=${token}&userId=${user._id}&role=${user.role}&needsPassword=true${providerParam}`);
    }
    
    // Existing user, normal redirect
    res.redirect(`${frontendURL}/auth/google/callback?token=${token}&userId=${user._id}&role=${user.role}${providerParam}`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendURL}/login?error=callback_failed`);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  let user;
  
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Check if user registered with Google
    if (user.googleId && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was created with Google. Please login using Google Sign-In.'
      });
    }

    // Get reset password token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Create email message
    const message = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WashX - Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>You have requested to reset your password for your WashX account.</p>
            <p>Please click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 3px;">
              ${resetUrl}
            </p>
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0;">
                <li>This link will expire in <strong>10 minutes</strong></li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated email from WashX. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} WashX. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
          process.env.EMAIL_USER === 'your-email@gmail.com') {
        // Email not configured, return link in response (development mode)
        return res.status(200).json({
          success: true,
          message: 'Email is not configured. Here is your reset link (Development Mode):',
          resetUrl,
          resetToken,
          note: 'To enable email sending: Configure EMAIL_USER and EMAIL_PASSWORD in backend/.env file'
        });
      }

      // Send email
      await sendEmail({
        email: user.email,
        subject: 'WashX - Password Reset Request',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email.',
        // Include resetUrl in development for easy testing
        ...(process.env.NODE_ENV === 'development' && { resetUrl })
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // If email fails, still provide the reset link
      return res.status(200).json({
        success: true,
        message: 'Password reset token generated. Email sending failed, but here is your reset link:',
        resetUrl,
        emailError: emailError.message,
        note: 'Please check your email configuration in .env file'
      });
    }

  } catch (error) {
    // Clear the reset token fields if there's an error
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(500).json({
      success: false,
      message: 'Error sending password reset email',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate JWT token for automatic login
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};
