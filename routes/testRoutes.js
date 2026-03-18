const express = require('express');
const router = express.Router();
const {
  getAllTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  getCategories,
} = require('../controllers/testController');
const { protect, adminOnly } = require('../middleware/auth');
const { testValidation, validate } = require('../middleware/validate');

router.get('/categories', getCategories);
router.get('/', getAllTests);
router.get('/:id', getTest);
router.post('/', protect, adminOnly, testValidation, validate, createTest);
router.put('/:id', protect, adminOnly, updateTest);
router.delete('/:id', protect, adminOnly, deleteTest);

module.exports = router;
