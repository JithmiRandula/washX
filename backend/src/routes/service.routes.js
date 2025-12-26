const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder controller (to be implemented)
const serviceController = {
  getServices: (req, res) => res.json({ success: true, message: 'Get all services' }),
  getService: (req, res) => res.json({ success: true, message: 'Get service by ID' }),
  createService: (req, res) => res.json({ success: true, message: 'Create service' }),
  updateService: (req, res) => res.json({ success: true, message: 'Update service' }),
  deleteService: (req, res) => res.json({ success: true, message: 'Delete service' }),
  getProviderServices: (req, res) => res.json({ success: true, message: 'Get services by provider' })
};

router.get('/', serviceController.getServices);
router.get('/provider/:providerId', serviceController.getProviderServices);
router.get('/:id', serviceController.getService);
router.post('/', protect, authorize('provider', 'admin'), serviceController.createService);
router.put('/:id', protect, authorize('provider', 'admin'), serviceController.updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), serviceController.deleteService);

module.exports = router;
