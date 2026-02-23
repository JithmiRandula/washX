const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const providerServiceController = require('../controllers/providerService.controller');

// Public routes
router.get('/provider/:providerId', providerServiceController.getProviderServices);
router.get('/service/:serviceId', providerServiceController.getServiceProviders);
router.get('/details/:providerId/:serviceId', providerServiceController.getProviderServiceDetails);
router.get('/discounted', providerServiceController.getDiscountedServices);
router.get('/compare/:serviceId', providerServiceController.comparePrices);

// Protected routes - Provider/Admin only
router.post('/', protect, authorize('provider', 'admin'), providerServiceController.createProviderService);
router.put('/:id', protect, authorize('provider', 'admin'), providerServiceController.updateProviderService);
router.delete('/:id', protect, authorize('provider', 'admin'), providerServiceController.deleteProviderService);

module.exports = router;
