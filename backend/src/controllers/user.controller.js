const User = require('../models/User');
const { cloudinary, deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      dateOfBirth, 
      gender, 
      address 
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    
    // Update address fields
    if (address) {
      // Initialize address if it doesn't exist
      if (!user.address) {
        user.address = {};
      }
      
      // Update individual address fields
      if (address.street !== undefined) user.address.street = address.street;
      if (address.city !== undefined) user.address.city = address.city;
      if (address.state !== undefined) user.address.state = address.state;
      if (address.zipCode !== undefined) user.address.zipCode = address.zipCode;
      if (address.coordinates) {
        if (!user.address.coordinates) {
          user.address.coordinates = {};
        }
        if (address.coordinates.lat !== undefined) user.address.coordinates.lat = address.coordinates.lat;
        if (address.coordinates.lng !== undefined) user.address.coordinates.lng = address.coordinates.lng;
      }
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Upload user profile photo
// @route   POST /api/users/profile/photo
// @access  Private
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile photo if exists
    if (user.avatar) {
      await deleteImage(user.avatar);
    }

    // Update user avatar with Cloudinary URL
    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    user.preferences = {
      ...user.preferences,
      ...preferences
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user registered with Google OAuth
    if (user.googleId && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for Google OAuth accounts'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// @desc    Add payment method
// @route   POST /api/users/payment-methods
// @access  Private
exports.addPaymentMethod = async (req, res) => {
  try {
    const { type, cardType, last4, expiryDate, isDefault, stripePaymentMethodId } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If this is set as default, unset other default payment methods
    if (isDefault) {
      user.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }

    // Add new payment method
    user.paymentMethods.push({
      type,
      cardType,
      last4,
      expiryDate,
      isDefault: isDefault || user.paymentMethods.length === 0, // First card is default
      stripePaymentMethodId
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment method added successfully',
      data: user.paymentMethods
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method',
      error: error.message
    });
  }
};

// @desc    Remove payment method
// @route   DELETE /api/users/payment-methods/:paymentMethodId
// @access  Private
exports.removePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the payment method being removed is the default
    const methodToRemove = user.paymentMethods.find(
      method => method._id.toString() === paymentMethodId
    );

    if (!methodToRemove) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    const wasDefault = methodToRemove.isDefault;

    // Remove payment method
    user.paymentMethods = user.paymentMethods.filter(
      method => method._id.toString() !== paymentMethodId
    );

    // If the removed method was default and there are other methods, set the first one as default
    if (wasDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment method removed successfully',
      data: user.paymentMethods
    });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove payment method',
      error: error.message
    });
  }
};

// @desc    Set default payment method
// @route   PUT /api/users/payment-methods/:paymentMethodId/default
// @access  Private
exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set all to non-default first
    user.paymentMethods.forEach(method => {
      method.isDefault = false;
    });

    // Set selected as default
    const method = user.paymentMethods.id(paymentMethodId);
    if (method) {
      method.isDefault = true;
    } else {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Default payment method updated',
      data: user.paymentMethods
    });
  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default payment method',
      error: error.message
    });
  }
};

// Admin routes
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete profile photo from Cloudinary if exists
    if (user.avatar) {
      await deleteImage(user.avatar);
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};
