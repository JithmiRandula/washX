const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { avatarUpload } = require('../config/cloudinary');
const userController = require('../controllers/user.controller');

// Profile routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.post('/profile/photo', protect, avatarUpload.single('avatar'), userController.uploadProfilePhoto);

// Preferences routes
router.put('/preferences', protect, userController.updatePreferences);

// Security routes
router.put('/change-password', protect, userController.changePassword);

// Payment methods routes
router.post('/payment-methods', protect, userController.addPaymentMethod);
router.delete('/payment-methods/:paymentMethodId', protect, userController.removePaymentMethod);
router.put('/payment-methods/:paymentMethodId/default', protect, userController.setDefaultPaymentMethod);

// Admin routes
router.get('/', protect, authorize('admin'), userController.getUsers);
router.get('/:id', protect, userController.getUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
