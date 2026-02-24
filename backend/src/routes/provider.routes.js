const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const providerController = require('../controllers/provider.controller');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', providerController.getProviders);
router.get('/nearby', providerController.getNearbyProviders);
router.get('/:id', providerController.getProvider);

// Protected routes - Provider specific with providerId validation
router.get('/user/:userId', protect, providerController.getProviderByUserId);
router.get('/:providerId/profile', protect, authorize('provider', 'admin'), providerController.getProvider);
router.post('/', protect, authorize('provider', 'admin'), providerController.createProvider);
router.put('/:providerId/profile', protect, authorize('provider', 'admin'), providerController.updateProvider);
router.post('/:providerId/upload', protect, authorize('provider', 'admin'), upload.single('image'), providerController.uploadImage);
router.delete('/:id', protect, authorize('admin'), providerController.deleteProvider);

module.exports = router;
