const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    previousStatus: {
      type: String,
      default: ''
    },
    newStatus: {
      type: String,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userRole: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Complaint must belong to a citizen']
    },
    title: {
      type: String,
      required: [true, 'Please provide complaint title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide complaint description'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a complaint category'],
      trim: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    assignedReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    priority: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'],
        message: '{VALUE} is not a valid priority'
      },
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: {
        values: [
          'SUBMITTED',
          'UNDER_REVIEW',
          'APPROVED',
          'REJECTED',
          'ASSIGNED',
          'IN_PROGRESS',
          'RESOLVED',
          'CLOSED'
        ],
        message: '{VALUE} is not a valid status'
      },
      default: 'SUBMITTED'
    },
    location: {
      type: String,
      required: [true, 'Please provide locality / area'],
      trim: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    aiAnalysis: {
      isValidCivicIssue: { type: Boolean, default: true },
      predictedCategory: { type: String, default: '' },
      predictedSeverity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT', ''],
        default: ''
      },
      confidence: { type: Number, default: 0 },
      detectedIssue: { type: String, default: '' },
      explanation: { type: String, default: '' },
      recommendedAction: { type: String, default: '' },
      autoStatement: { type: String, default: '' },
      isLowConfidence: { type: Boolean, default: false },
      requiresManualReview: { type: Boolean, default: false },
      invalidReason: { type: String, default: '' },
      modelVersion: { type: String, default: 'MobileNetV3-Civic-v1.0' }
    },
    humanReview: {
      isOverridden: { type: Boolean, default: false },
      verifiedCategory: { type: String, default: '' },
      verifiedSeverity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT', ''],
        default: ''
      },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reviewedAt: { type: Date, default: null },
      reviewNotes: { type: String, default: '' }
    },
    attachments: [
      {
        url: String,
        filename: String
      }
    ],
    reviewRemarks: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    resolutionRemarks: {
      type: String,
      default: ''
    },
    statusHistory: [statusHistorySchema]
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast role queries
complaintSchema.index({ citizen: 1, status: 1 });
complaintSchema.index({ assignedReviewer: 1, status: 1 });
complaintSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);

