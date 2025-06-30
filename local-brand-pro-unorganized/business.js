const mongoose = require('mongoose');
const { Schema } = mongoose;

const businessSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    enum: [
      'restaurant',
      'retail',
      'salon',
      'plumbing',
      'electrical',
      'landscaping',
      'auto_repair',
      'fitness',
      'healthcare',
      'legal',
      'real_estate',
      'other'
    ]
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: {
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  brand: {
    logo: {
      type: String, // URL to logo image
    },
    colors: {
      primary: {
        type: String,
        default: '#4361EE'
      },
      secondary: {
        type: String,
        default: '#3A0CA3'
      },
      accent: {
        type: String,
        default: '#F72585'
      }
    },
    fonts: {
      primary: {
        type: String,
        default: 'Inter'
      },
      secondary: {
        type: String,
        default: 'Poppins'
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'single', 'multi', 'agency'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'expired', 'cancelled'],
      default: 'trial'
    },
    trialEnds: {
      type: Date
    },
    currentPeriodEnd: {
      type: Date
    }
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

// Update the updatedAt field before saving
businessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for faster queries
businessSchema.index({ owner: 1 });
businessSchema.index({ industry: 1 });
businessSchema.index({ 'subscription.status': 1 });

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;
