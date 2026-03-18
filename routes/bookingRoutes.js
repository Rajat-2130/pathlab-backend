const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');
const { bookingValidation, validate } = require('../middleware/validate');

router.post('/', protect, bookingValidation, validate, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/stats', protect, adminOnly, getBookingStats);
router.get('/', protect, adminOnly, getAllBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/status', protect, adminOnly, updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
