const mongoose = require('mongoose');

const providerServiceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['per kg', 'per piece', 'per item', 'per bundle', 'per set'],
    required: true
  },
  customDescription: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  discount: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    validUntil: {
      type: Date
    }
  },
  estimatedDuration: {
    type: String,
    default: '24 hours' // e.g., "24 hours", "2-3 days"
  },
  minOrder: {
    quantity: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      default: 'kg'
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure unique provider-service combinations
providerServiceSchema.index({ providerId: 1, serviceId: 1 }, { unique: true });

// Index for faster queries
providerServiceSchema.index({ providerId: 1, isActive: 1 });
providerServiceSchema.index({ serviceId: 1, isActive: 1 });

module.exports = mongoose.model('ProviderService', providerServiceSchema);
