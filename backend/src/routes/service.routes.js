const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getProviderServices,
  getMyServices,
  toggleServiceStatus
} = require('../controllers/service.controller');

// Public routes
router.get('/', getServices);
router.get('/provider/:providerId', getProviderServices);

// Protected routes (Provider/Admin) - must come before /:id
router.get('/my-services', protect, authorize('provider', 'admin'), getMyServices);
router.post('/', protect, authorize('provider', 'admin'), createService);
router.patch('/:id/toggle', protect, authorize('provider', 'admin'), toggleServiceStatus);
router.put('/:id', protect, authorize('provider', 'admin'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

// Public route with dynamic ID - must come last
router.get('/:id', getService);

module.exports = router;
