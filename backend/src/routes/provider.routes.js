const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const providerController = require('../controllers/provider.controller');
const upload = require('../config/multer');

router.get('/', providerController.getProviders);
router.get('/nearby', providerController.getNearbyProviders);
router.get('/user/:userId', protect, providerController.getProviderByUserId);
router.get('/:id', providerController.getProvider);
router.post('/', protect, authorize('provider', 'admin'), providerController.createProvider);
router.put('/:id', protect, authorize('provider', 'admin'), providerController.updateProvider);
router.post('/:id/upload', protect, authorize('provider', 'admin'), upload.single('image'), providerController.uploadImage);
router.delete('/:id', protect, authorize('admin'), providerController.deleteProvider);

module.exports = router;
