const Booking = require('../models/Booking');
const Test = require('../models/Test');
const Report = require('../models/Report');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const sendEmail = require('../utils/sendemail')
const { bookingConfirmationEmail } = require('../utils/emailtemplate')

// @desc    Create booking
// @route   POST /api/bookings
// @access  Patient
const createBooking = asyncHandler(async (req, res, next) => {
  const { testId, date, timeSlot, address, notes } = req.body

  const test = await Test.findById(testId)
  if (!test) return next(new AppError('Test not found', 404))

  const bookingDate = new Date(date)
  if (bookingDate < new Date().setHours(0, 0, 0, 0)) {
    return next(new AppError('Booking date cannot be in the past', 400))
  }

  const booking = await Booking.create({
    userId: req.user._id,
    testId,
    date: bookingDate,
    timeSlot,
    address,
    notes,
  })

  const populatedBooking = await Booking.findById(booking._id)
    .populate('testId', 'name price category')
    .populate('userId', 'name email')

  // Send booking confirmation email
  sendEmail({
    to: populatedBooking.userId.email,
    subject: `✅ Booking Confirmed — ${populatedBooking.testId.name}`,
    html: bookingConfirmationEmail(populatedBooking.userId.name, {
      bookingId: populatedBooking.bookingId,
      testName:  populatedBooking.testId.name,
      date:      new Date(populatedBooking.date).toLocaleDateString('en-IN', {
                   day: '2-digit', month: 'long', year: 'numeric'
                 }),
      timeSlot:  populatedBooking.timeSlot,
      price:     populatedBooking.testId.price,
    }),
  }).catch((err) => console.error('Booking email failed:', err.message))

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    booking: populatedBooking,
  })
})

// @desc    Get my bookings (patient)
// @route   GET /api/bookings/my
// @access  Patient
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { userId: req.user._id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('testId', 'name price category description')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Attach report to each booking if available
  const bookingsWithReports = await Promise.all(
    bookings.map(async (booking) => {
      const report = await Report.findOne({ bookingId: booking._id });
      return { ...booking.toObject(), report };
    })
  );

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    bookings: bookingsWithReports,
  });
});

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 15, search } = req.query;
  const query = {};
  if (status) query.status = status;

  let bookings = await Booking.find(query)
    .populate('testId', 'name price category')
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });

  // Filter by user name/email if search provided
  if (search) {
    bookings = bookings.filter(
      (b) =>
        b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.bookingId?.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = bookings.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginatedBookings = bookings.slice(skip, skip + Number(limit));

  // Attach reports
  const bookingsWithReports = await Promise.all(
    paginatedBookings.map(async (booking) => {
      const report = await Report.findOne({ bookingId: booking._id });
      return { ...booking.toObject(), report };
    })
  );

  res.status(200).json({
    success: true,
    count: paginatedBookings.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    bookings: bookingsWithReports,
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('testId', 'name price category description turnaroundTime')
    .populate('userId', 'name email phone');

  if (!booking) return next(new AppError('Booking not found', 404));

  // Patients can only view their own bookings
  if (req.user.role === 'patient' && booking.userId._id.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to view this booking', 403));
  }

  const report = await Report.findOne({ bookingId: booking._id });

  res.status(200).json({
    success: true,
    booking: { ...booking.toObject(), report },
  });
});

// @desc    Update booking status (admin)
// @route   PUT /api/bookings/:id/status
// @access  Admin
const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Sample Collected', 'Report Ready', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  )
    .populate('testId', 'name price category')
    .populate('userId', 'name email');

  if (!booking) return next(new AppError('Booking not found', 404));

  res.status(200).json({
    success: true,
    message: `Booking status updated to ${status}`,
    booking,
  });
});

// @desc    Cancel booking (patient)
// @route   PUT /api/bookings/:id/cancel
// @access  Patient
const cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) return next(new AppError('Booking not found', 404));

  if (booking.userId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  if (booking.status !== 'Pending') {
    return next(new AppError('Only pending bookings can be cancelled', 400));
  }

  booking.status = 'Cancelled';
  await booking.save();

  res.status(200).json({ success: true, message: 'Booking cancelled successfully', booking });
});

// @desc    Get booking stats (admin)
// @route   GET /api/bookings/stats
// @access  Admin
const getBookingStats = asyncHandler(async (req, res) => {
  const stats = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await Booking.countDocuments();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayBookings = await Booking.countDocuments({ createdAt: { $gte: todayStart } });

  res.status(200).json({
    success: true,
    stats,
    total,
    todayBookings,
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
};
