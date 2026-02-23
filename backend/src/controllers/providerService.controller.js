const ProviderService = require('../models/ProviderService');
const Provider = require('../models/Provider');
const Service = require('../models/Service');

// @desc    Get all services offered by a specific provider
// @route   GET /api/provider-services/provider/:providerId
// @access  Public
exports.getProviderServices = async (req, res) => {
  try {
    const services = await ProviderService.find({
      providerId: req.params.providerId,
      isActive: true
    })
    .populate('serviceId', 'name description category features')
    .sort({ price: 1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all providers offering a specific service
// @route   GET /api/provider-services/service/:serviceId
// @access  Public
exports.getServiceProviders = async (req, res) => {
  try {
    const providers = await ProviderService.find({
      serviceId: req.params.serviceId,
      isActive: true
    })
    .populate('providerId', 'businessName address phone rating images operatingHours')
    .sort({ price: 1 }); // Sort by price (cheapest first)

    res.json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get provider-service details (includes pricing, discounts, etc.)
// @route   GET /api/provider-services/:providerId/:serviceId
// @access  Public
exports.getProviderServiceDetails = async (req, res) => {
  try {
    const providerService = await ProviderService.findOne({
      providerId: req.params.providerId,
      serviceId: req.params.serviceId
    })
    .populate('providerId', 'businessName address phone rating operatingHours')
    .populate('serviceId', 'name description category features');

    if (!providerService) {
      return res.status(404).json({
        success: false,
        message: 'Provider service not found'
      });
    }

    res.json({
      success: true,
      data: providerService
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get services with active discounts
// @route   GET /api/provider-services/discounted
// @access  Public
exports.getDiscountedServices = async (req, res) => {
  try {
    const discountedServices = await ProviderService.find({
      'discount.percentage': { $gt: 0 },
      'discount.validUntil': { $gte: new Date() },
      isActive: true
    })
    .populate('providerId', 'businessName address rating images')
    .populate('serviceId', 'name category description')
    .sort({ 'discount.percentage': -1 }); // Sort by highest discount first

    res.json({
      success: true,
      count: discountedServices.length,
      data: discountedServices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new provider-service link
// @route   POST /api/provider-services
// @access  Private (Provider/Admin)
exports.createProviderService = async (req, res) => {
  try {
    // Verify provider exists
    const provider = await Provider.findById(req.body.providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Verify service exists
    const service = await Service.findById(req.body.serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if link already exists
    const existing = await ProviderService.findOne({
      providerId: req.body.providerId,
      serviceId: req.body.serviceId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Provider already offers this service'
      });
    }

    const providerService = await ProviderService.create(req.body);

    res.status(201).json({
      success: true,
      data: providerService
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update provider-service (pricing, discount, status)
// @route   PUT /api/provider-services/:id
// @access  Private (Provider/Admin)
exports.updateProviderService = async (req, res) => {
  try {
    const providerService = await ProviderService.findById(req.params.id);

    if (!providerService) {
      return res.status(404).json({
        success: false,
        message: 'Provider service not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'price', 'unit', 'customDescription', 'isActive', 
      'discount', 'estimatedDuration', 'minOrder'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        providerService[key] = req.body[key];
      }
    });

    await providerService.save();

    res.json({
      success: true,
      data: providerService
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete provider-service link
// @route   DELETE /api/provider-services/:id
// @access  Private (Provider/Admin)
exports.deleteProviderService = async (req, res) => {
  try {
    const providerService = await ProviderService.findById(req.params.id);

    if (!providerService) {
      return res.status(404).json({
        success: false,
        message: 'Provider service not found'
      });
    }

    await providerService.deleteOne();

    res.json({
      success: true,
      message: 'Provider service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Compare prices for a service across all providers
// @route   GET /api/provider-services/compare/:serviceId
// @access  Public
exports.comparePrices = async (req, res) => {
  try {
    const providers = await ProviderService.find({
      serviceId: req.params.serviceId,
      isActive: true
    })
    .populate('providerId', 'businessName address rating totalOrders')
    .populate('serviceId', 'name category')
    .sort({ price: 1 });

    if (providers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No providers found offering this service'
      });
    }

    // Calculate price statistics
    const prices = providers.map(p => p.price);
    const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    res.json({
      success: true,
      service: providers[0].serviceId,
      statistics: {
        totalProviders: providers.length,
        averagePrice: parseFloat(avgPrice),
        minPrice,
        maxPrice,
        priceRange: maxPrice - minPrice
      },
      providers: providers.map(p => ({
        provider: p.providerId,
        price: p.price,
        unit: p.unit,
        discount: p.discount.percentage > 0 ? p.discount : null,
        estimatedDuration: p.estimatedDuration,
        minOrder: p.minOrder
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = exports;
