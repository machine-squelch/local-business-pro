const mongoose = require('mongoose');
const { Schema } = mongoose;

const automationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'seasonal',
      'weather',
      'review',
      'event',
      'promotion',
      'holiday',
      'custom'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed'],
    default: 'active'
  },
  trigger: {
    triggerType: {
      type: String,
      enum: ['schedule', 'condition', 'manual', 'api'],
      required: true
    },
    schedule: {
      frequency: {
        type: String,
        enum: ['once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']
      },
      startDate: Date,
      endDate: Date,
      daysOfWeek: [Number], // 0-6, where 0 is Sunday
      timeOfDay: String, // HH:MM format
      timezone: String
    },
    condition: {
      type: {
        type: String,
        enum: ['weather', 'review', 'location', 'custom']
      },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains']
      },
      value: Schema.Types.Mixed,
      threshold: Number
    }
  },
  action: {
    actionType: {
      type: String,
      enum: ['create_design', 'update_design', 'publish_design', 'send_notification', 'custom'],
      required: true
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template'
    },
    designId: {
      type: Schema.Types.ObjectId,
      ref: 'Design'
    },
    parameters: Schema.Types.Mixed,
    customFunction: String
  },
  lastRun: {
    date: Date,
    status: {
      type: String,
      enum: ['success', 'partial', 'failed']
    },
    message: String,
    result: Schema.Types.Mixed
  },
  nextRun: Date,
  runHistory: [{
    date: Date,
    status: {
      type: String,
      enum: ['success', 'partial', 'failed']
    },
    message: String,
    result: Schema.Types.Mixed
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for faster queries
automationSchema.index({ business: 1 });
automationSchema.index({ location: 1 });
automationSchema.index({ type: 1 });
automationSchema.index({ status: 1 });
automationSchema.index({ nextRun: 1 });

// Update the updatedAt field before saving
automationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Automation = mongoose.model('Automation', automationSchema);

module.exports = Automation;
