const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required']
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer reference is required']
    },
    decision: {
      type: String,
      enum: {
        values: ['APPROVED', 'REJECTED', 'RECOMMENDED_ACTION'],
        message: '{VALUE} is not a valid review decision'
      },
      required: [true, 'Review decision is required']
    },
    remarks: {
      type: String,
      required: [true, 'Review remarks are required'],
      trim: true
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ''
    },
    recommendation: {
      type: String,
      trim: true,
      default: ''
    },
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Review', reviewSchema);

