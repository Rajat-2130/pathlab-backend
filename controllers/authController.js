const User = require('../models/User');
const { sendTokenCookie } = require('../utils/token');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const sendEmail = require('../utils/sendemail')
const { welcomeEmail } = require('../utils/emailtemplate')

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, age, gender } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return next(new AppError('Email already registered. Please login.', 400))
  }

  const user = await User.create({ name, email, password, phone, age, gender })

  // Send welcome email
  sendEmail({
    to: user.email,
    subject: '🧪 Welcome to PathLab!',
    html: welcomeEmail(user.name),
  }).catch((err) => console.error('Welcome email failed:', err.message))

  sendTokenCookie(res, user, 201, 'Registration successful')
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  sendTokenCookie(res, user, 200, 'Login successful');
});

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, age, gender } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, age, gender },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: 'Profile updated', user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

module.exports = { register, login, logout, getMe, updateProfile, changePassword };
