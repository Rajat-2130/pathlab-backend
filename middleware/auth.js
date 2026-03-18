const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { AppError } = require('../utils/errorHandler')

const protect = async (req, res, next) => {
  try {
    let token

    // Check cookie first
    if (req.cookies.token) {
      token = req.cookies.token
    }

    // Check Authorization header as fallback
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return next(new AppError('Not authorized. Please login.', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return next(new AppError('User no longer exists.', 401))
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please login again.', 401))
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please login again.', 401))
    }
    next(error)
  }
}

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    return next(new AppError('Access denied. Admins only.', 403))
  }
}

module.exports = { protect, adminOnly }