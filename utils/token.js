const jwt = require('jsonwebtoken')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

const sendTokenCookie = (res, user, statusCode, message) => {
  const token = generateToken(user._id)

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }

  res.cookie('token', token, cookieOptions)

  // Also send token in response body as backup
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      age: user.age,
      gender: user.gender,
    },
  })
}

module.exports = { generateToken, sendTokenCookie }