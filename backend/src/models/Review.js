const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
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
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    trim: true
  },
  response: {
    comment: String,
    date: Date
  },
  isVerified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update provider rating when a review is added
reviewSchema.post('save', async function() {
  const Provider = mongoose.model('Provider');
  const Review = mongoose.model('Review');
  
  const reviews = await Review.find({ providerId: this.providerId });
  const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  await Provider.findByIdAndUpdate(this.providerId, {
    'rating.average': avgRating,
    'rating.count': reviews.length
  });
});

module.exports = mongoose.model('Review', reviewSchema);
