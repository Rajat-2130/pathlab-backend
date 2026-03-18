const User = require('../models/User');
const Booking = require('../models/Booking');
const { AppError, asyncHandler } = require('../utils/errorHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 15 } = req.query;
  const query = {};

  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  const bookingCount = await Booking.countDocuments({ userId: user._id });

  res.status(200).json({ success: true, user: { ...user.toObject(), bookingCount } });
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Admin
const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  if (!['patient', 'admin'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return next(new AppError('User not found', 404));

  res.status(200).json({ success: true, message: 'User role updated', user });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  if (user.role === 'admin') {
    return next(new AppError('Cannot delete admin users', 400));
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

// @desc    Get dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalPatients, totalBookings, pendingBookings, reportReadyBookings] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Pending' }),
      Booking.countDocuments({ status: 'Report Ready' }),
    ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayBookings = await Booking.countDocuments({ createdAt: { $gte: todayStart } });

  // Recent bookings
  const recentBookings = await Booking.find()
    .populate('userId', 'name email')
    .populate('testId', 'name price')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalPatients,
      totalBookings,
      pendingBookings,
      reportReadyBookings,
      todayBookings,
    },
    recentBookings,
  });
});

module.exports = { getAllUsers, getUser, updateUserRole, deleteUser, getDashboardStats };
