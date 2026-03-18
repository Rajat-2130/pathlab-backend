const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Test ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    timeSlot: {
      type: String,
      default: '09:00 AM',
    },
    status: {
      type: String,
      enum: ['Pending', 'Sample Collected', 'Report Ready', 'Cancelled'],
      default: 'Pending',
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    bookingId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate booking ID
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
