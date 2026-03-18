const { body, validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(', ');
    return next(new AppError(messages, 400));
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const testValidation = [
  body('name').trim().notEmpty().withMessage('Test name is required'),
  body('price').isNumeric().withMessage('Valid price is required').isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
];

const bookingValidation = [
  body('testId').notEmpty().withMessage('Test ID is required'),
  body('date').notEmpty().withMessage('Booking date is required').isISO8601().withMessage('Invalid date format'),
];

module.exports = { validate, registerValidation, loginValidation, testValidation, bookingValidation };
