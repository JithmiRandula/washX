const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder controller (to be implemented)
const bookingController = {
  getBookings: (req, res) => res.json({ success: true, message: 'Get all bookings' }),
  getBooking: (req, res) => res.json({ success: true, message: 'Get booking by ID' }),
  createBooking: (req, res) => res.json({ success: true, message: 'Create booking' }),
  updateBooking: (req, res) => res.json({ success: true, message: 'Update booking' }),
  cancelBooking: (req, res) => res.json({ success: true, message: 'Cancel booking' }),
  getMyBookings: (req, res) => res.json({ success: true, message: 'Get my bookings' }),
  getProviderBookings: (req, res) => res.json({ success: true, message: 'Get provider bookings' })
};

router.get('/', protect, authorize('admin'), bookingController.getBookings);
router.get('/my-bookings', protect, bookingController.getMyBookings);
router.get('/provider/:providerId', protect, authorize('provider', 'admin'), bookingController.getProviderBookings);
router.get('/:id', protect, bookingController.getBooking);
router.post('/', protect, bookingController.createBooking);
router.put('/:id', protect, bookingController.updateBooking);
router.delete('/:id', protect, bookingController.cancelBooking);

module.exports = router;
