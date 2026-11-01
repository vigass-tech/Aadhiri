const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required']
    },
    title: {
      type: String,
      required: [true, 'Budget title is required'],
      trim: true
    },
    financialYear: {
      type: String,
      required: [true, 'Financial year is required (e.g., 2025-2026)'],
      trim: true
    },
    allocatedAmount: {
      type: Number,
      required: [true, 'Allocated amount is required'],
      min: [0, 'Allocated amount cannot be negative']
    },
    utilizedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Utilized amount cannot be negative']
    },
    remainingAmount: {
      type: Number,
      default: function () {
        return this.allocatedAmount - this.utilizedAmount;
      }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'DEPLETED', 'CLOSED'],
        message: '{VALUE} is not a valid budget status'
      },
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

// Calculate remaining amount before saving
budgetSchema.pre('save', function (next) {
  this.remainingAmount = Math.max(0, this.allocatedAmount - this.utilizedAmount);
  if (this.remainingAmount === 0 && this.allocatedAmount > 0) {
    this.status = 'DEPLETED';
  }
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);

