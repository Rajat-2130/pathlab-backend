const express = require('express');
const router = express.Router();
const { uploadReport, getReport, deleteReport, upload } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/upload/:bookingId', protect, adminOnly, upload.single('report'), uploadReport);
router.get('/:bookingId', protect, getReport);
router.delete('/:bookingId', protect, adminOnly, deleteReport);

module.exports = router;
