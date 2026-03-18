const Test = require('../models/Test');
const { AppError, asyncHandler } = require('../utils/errorHandler');

// @desc    Get all tests (with search & filter)
// @route   GET /api/tests
// @access  Public
const getAllTests = asyncHandler(async (req, res) => {
  const { search, category, popular, page = 1, limit = 20 } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (popular === 'true') query.popular = true;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Test.countDocuments(query);
  const tests = await Test.find(query).sort({ popular: -1, createdAt: -1 }).skip(skip).limit(Number(limit));

  res.status(200).json({
    success: true,
    count: tests.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    tests,
  });
});

// @desc    Get single test
// @route   GET /api/tests/:id
// @access  Public
const getTest = asyncHandler(async (req, res, next) => {
  const test = await Test.findById(req.params.id);
  if (!test) return next(new AppError('Test not found', 404));

  res.status(200).json({ success: true, test });
});

// @desc    Create new test
// @route   POST /api/tests
// @access  Admin
const createTest = asyncHandler(async (req, res, next) => {
  const test = await Test.create(req.body);
  res.status(201).json({ success: true, message: 'Test created successfully', test });
});

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Admin
const updateTest = asyncHandler(async (req, res, next) => {
  const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!test) return next(new AppError('Test not found', 404));

  res.status(200).json({ success: true, message: 'Test updated successfully', test });
});

// @desc    Delete test
// @route   DELETE /api/tests/:id
// @access  Admin
const deleteTest = asyncHandler(async (req, res, next) => {
  const test = await Test.findById(req.params.id);
  if (!test) return next(new AppError('Test not found', 404));

  await test.deleteOne();
  res.status(200).json({ success: true, message: 'Test deleted successfully' });
});

// @desc    Get categories
// @route   GET /api/tests/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Test.distinct('category', { isActive: true });
  res.status(200).json({ success: true, categories });
});

module.exports = { getAllTests, getTest, createTest, updateTest, deleteTest, getCategories };
