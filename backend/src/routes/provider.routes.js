const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder controller (to be implemented)
const providerController = {
  getProviders: (req, res) => res.json({ success: true, message: 'Get all providers' }),
  getProvider: (req, res) => res.json({ success: true, message: 'Get provider by ID' }),
  createProvider: (req, res) => res.json({ success: true, message: 'Create provider' }),
  updateProvider: (req, res) => res.json({ success: true, message: 'Update provider' }),
  deleteProvider: (req, res) => res.json({ success: true, message: 'Delete provider' }),
  getNearbyProviders: (req, res) => res.json({ success: true, message: 'Get nearby providers' })
};

router.get('/', providerController.getProviders);
router.get('/nearby', providerController.getNearbyProviders);
router.get('/:id', providerController.getProvider);
router.post('/', protect, authorize('provider', 'admin'), providerController.createProvider);
router.put('/:id', protect, authorize('provider', 'admin'), providerController.updateProvider);
router.delete('/:id', protect, authorize('admin'), providerController.deleteProvider);

module.exports = router;
