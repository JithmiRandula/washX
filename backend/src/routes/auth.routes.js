const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const passport = require('passport');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Standard auth routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', protect, authController.getMe);
router.put('/updatepassword', protect, authController.updatePassword);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);

// Google OAuth routes - only if configured
const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const isGoogleConfigured = googleClientID && 
                          googleClientSecret &&
                          googleClientID.length > 20 &&
                          /^\d/.test(googleClientID) && // Real client IDs start with numbers
                          googleClientSecret.startsWith('GOCSPX-'); // Real secrets start with GOCSPX-

if (isGoogleConfigured) {
  router.get('/google',
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      session: false
    })
  );

  router.get('/google/callback',
    passport.authenticate('google', { 
      session: false,
      failureRedirect: '/login'
    }),
    authController.googleCallback
  );
} else {
  // Provide helpful error message if Google OAuth is accessed but not configured
  router.get('/google', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.',
      setup_guide: 'See SETUP_NOW.md for instructions'
    });
  });
  
  router.get('/google/callback', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured.',
      setup_guide: 'See SETUP_NOW.md for instructions'
    });
  });
}

module.exports = router;
