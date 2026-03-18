const Report = require('../models/Report');
const Booking = require('../models/Booking');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer Storage Config ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/reports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `report_${req.params.bookingId}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ─── Only Allow PDF ───────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// ─── Multer Upload Instance ───────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// @desc    Upload report
// @route   POST /api/reports/upload/:bookingId
// @access  Admin
const uploadReport = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const { notes } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (!req.file) {
    return next(new AppError('Please upload a PDF file', 400));
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/reports/${req.file.filename}`;
  const fileName = req.file.originalname;

  const report = await Report.findOneAndUpdate(
    { bookingId },
    {
      bookingId,
      fileUrl,
      fileName,
      uploadedBy: req.user._id,
      notes,
    },
    { new: true, upsert: true }
  );

  await Booking.findByIdAndUpdate(bookingId, { status: 'Report Ready' });

  res.status(200).json({
    success: true,
    message: 'Report uploaded successfully',
    report,
  });
});

// @desc    Get report by bookingId
// @route   GET /api/reports/:bookingId
// @access  Private (patient own or admin)
const getReport = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (
    req.user.role === 'patient' &&
    booking.userId.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('Not authorized to access this report', 403));
  }

  const report = await Report.findOne({ bookingId }).populate('uploadedBy', 'name');
  if (!report) return next(new AppError('Report not yet available for this booking', 404));

  res.status(200).json({ success: true, report });
});

// @desc    Delete report (admin)
// @route   DELETE /api/reports/:bookingId
// @access  Admin
const deleteReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findOne({ bookingId: req.params.bookingId });
  if (!report) return next(new AppError('Report not found', 404));

  // Delete local file if exists
  if (report.fileUrl) {
    const filename = path.basename(report.fileUrl);
    const filePath = path.join(process.cwd(), 'uploads', 'reports', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await report.deleteOne();

  res.status(200).json({ success: true, message: 'Report deleted successfully' });
});

module.exports = { uploadReport, getReport, deleteReport, upload };
