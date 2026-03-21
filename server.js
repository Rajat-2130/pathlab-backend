require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/error');
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

// Route imports
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

// ─── App must be created FIRST ────────────────────────────
const app = express();

// Security headers
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later.' }
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      'https://pathlab-frontend-nine.vercel.app',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  })
)

app.set('trust proxy', 1)

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// ─── Test Email Route ─────────────────────────────────────
app.get('/api/test-email', async (req, res) => {
  try {
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: 'Production Email Test',
      html: '<h1>Email works on production!</h1>',
    })

    res.json({
      success: true,
      message: 'Email sent! Check your inbox.',
      user: process.env.EMAIL_USER,
    })
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      user: process.env.EMAIL_USER,
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PathLab API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 PathLab API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health\n`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

module.exports = app;
