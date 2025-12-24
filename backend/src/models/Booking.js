const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  services: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  pickupDate: {
    type: Date,
    required: true
  },
  pickupTime: {
    type: String,
    required: true
  },
  deliveryDate: {
    type: Date
  },
  specialInstructions: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picked-up', 'in-progress', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'online'],
      default: 'online'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    amount: {
      type: Number,
      required: true
    },
    transactionId: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'provider', 'admin']
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
