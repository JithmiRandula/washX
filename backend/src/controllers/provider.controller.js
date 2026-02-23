const Provider = require('../models/Provider');
const User = require('../models/User');

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ isActive: true })
      .populate('userId', 'name email')
      .populate('services');
    
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

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
exports.getProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('services');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get provider by user ID
// @route   GET /api/providers/user/:userId
// @access  Private
exports.getProviderByUserId = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.params.userId })
      .populate('userId', 'name email')
      .populate('services');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new provider
// @route   POST /api/providers
// @access  Private (Provider/Admin)
exports.createProvider = async (req, res) => {
  try {
    // Check if provider already exists for this user
    const existingProvider = await Provider.findOne({ userId: req.user._id });
    
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: 'Provider profile already exists'
      });
    }

    // Add userId from authenticated user
    req.body.userId = req.user._id;

    const provider = await Provider.create(req.body);

    res.status(201).json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update provider
// @route   PUT /api/providers/:id
// @access  Private (Provider/Admin)
exports.updateProvider = async (req, res) => {
  try {
    let provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Make sure user owns the provider profile or is admin
    if (provider.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this provider'
      });
    }

    provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload provider logo/image
// @route   POST /api/providers/:id/upload
// @access  Private (Provider/Admin)
exports.uploadImage = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Make sure user owns the provider profile or is admin
    if (provider.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this provider'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Create the image URL
    const imageUrl = `/uploads/providers/${req.file.filename}`;

    // Add image to provider's images array
    provider.images.push(imageUrl);
    await provider.save();

    res.json({
      success: true,
      data: imageUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete provider
// @route   DELETE /api/providers/:id
// @access  Private (Admin)
exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    await provider.deleteOne();

    res.json({
      success: true,
      message: 'Provider deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get nearby providers
// @route   GET /api/providers/nearby
// @access  Public
exports.getNearbyProviders = async (req, res) => {
  try {
    const { lat, lng, distance = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    // Convert distance from miles to meters (MongoDB uses meters)
    const distanceInMeters = distance * 1609.34;

    const providers = await Provider.find({
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: distanceInMeters
        }
      },
      isActive: true
    }).populate('services');

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
