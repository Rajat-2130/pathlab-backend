const Report = require('../models/Report');
const Booking = require('../models/Booking');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Multer memory storage
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'pathlab-reports',
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )
    uploadStream.end(buffer)
  })
}

// @desc    Upload report
// @route   POST /api/reports/upload/:bookingId
// @access  Admin
const uploadReport = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params
  const { notes } = req.body

  const booking = await Booking.findById(bookingId)
  if (!booking) return next(new AppError('Booking not found', 404))

  if (!req.file) {
    return next(new AppError('Please upload a PDF file', 400))
  }

  try {
    // Create unique filename with .pdf extension
    const publicId = `report_${bookingId}_${Date.now()}.pdf`

    // Upload to Cloudinary and wait for result
    const result = await uploadToCloudinary(req.file.buffer, publicId)

// Convert raw URL to viewable PDF URL
const fileUrl = result.secure_url
  const fileName = req.file.originalname

    console.log('✅ Cloudinary upload success:', fileUrl)

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
    )

    await Booking.findByIdAndUpdate(bookingId, { status: 'Report Ready' })

    res.status(200).json({
      success: true,
      message: 'Report uploaded successfully',
      report,
    })
  } catch (uploadError) {
    console.error('❌ Cloudinary upload failed:', uploadError.message)
    return next(new AppError('Failed to upload report. Please try again.', 500))
  }
})

// @desc    Get report by bookingId
// @route   GET /api/reports/:bookingId
// @access  Private
const getReport = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params

  const booking = await Booking.findById(bookingId)
  if (!booking) return next(new AppError('Booking not found', 404))

  if (
    req.user.role === 'patient' &&
    booking.userId.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('Not authorized to access this report', 403))
  }

  const report = await Report.findOne({ bookingId }).populate('uploadedBy', 'name')
  if (!report) {
    return next(new AppError('Report not yet available for this booking', 404))
  }

  res.status(200).json({ success: true, report })
})

// @desc    Delete report
// @route   DELETE /api/reports/:bookingId
// @access  Admin
const deleteReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findOne({ bookingId: req.params.bookingId })
  if (!report) return next(new AppError('Report not found', 404))

  // Delete from Cloudinary
  if (report.fileUrl && report.fileUrl.includes('cloudinary')) {
    try {
      const urlParts = report.fileUrl.split('/')
      const fileWithExt = urlParts[urlParts.length - 1]
      const folder = urlParts[urlParts.length - 2]
      const publicId = `${folder}/${fileWithExt}`
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
      console.log('✅ Cloudinary file deleted:', publicId)
    } catch (err) {
      console.error('❌ Cloudinary delete error:', err.message)
    }
  }

  await report.deleteOne()

  res.status(200).json({
    success: true,
    message: 'Report deleted successfully',
  })
})

module.exports = { uploadReport, getReport, deleteReport, upload }