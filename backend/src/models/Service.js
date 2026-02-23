const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  category: {
    type: String,
    required: true,
    enum: ['Washing', 'Dry Clean', 'Ironing', 'Premium', 'Express']
  },
  prices: [{
    unit: {
      type: String,
      enum: ['per kg', 'per piece', 'per item', 'per bundle', 'per set'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  duration: {
    type: String,
    required: true // e.g., "2 hours", "24 hours", "2-3 days"
  },
  minOrder: {
    type: String,
    default: '' // e.g., "2 kg", "3 items"
  },
  features: [{
    type: String
  }],
  specialInstructions: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
serviceSchema.index({ providerId: 1, active: 1 });
serviceSchema.index({ category: 1 });

module.exports = mongoose.model('Service', serviceSchema);
