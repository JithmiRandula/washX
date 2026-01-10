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
    enum: ['wash-and-fold', 'dry-cleaning', 'ironing', 'wash-and-iron', 'specialty']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price']
  },
  priceUnit: {
    type: String,
    enum: ['per-kg', 'per-item', 'per-load'],
    default: 'per-kg'
  },
  turnaroundTime: {
    type: Number,
    required: true // in hours
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
