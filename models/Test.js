const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Test price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Test description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Blood Test',
        'Urine Test',
        'Radiology',
        'Cardiology',
        'Pathology',
        'Microbiology',
        'Biochemistry',
        'Immunology',
        'Genetics',
        'Other',
      ],
    },
    popular: {
      type: Boolean,
      default: false,
    },
    turnaroundTime: {
      type: String,
      default: '24 hours',
    },
    preparationRequired: {
      type: String,
      default: 'No special preparation required',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for search
testSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Test', testSchema);
