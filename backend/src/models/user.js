const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'agency'],
    default: 'user'
  },
  profileImage: {
    type: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  preferences: {
    notifications: {
      email: {
        marketing: {
          type: Boolean,
          default: true
        },
        updates: {
          type: Boolean,
          default: true
        },
        security: {
          type: Boolean,
          default: true
        }
      },
      app: {
        designUpdates: {
          type: Boolean,
          default: true
        },
        reviewAlerts: {
          type: Boolean,
          default: true
        },
        seasonalReminders: {
          type: Boolean,
          default: true
        }
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    defaultView: {
      type: String,
      enum: ['dashboard', 'designs', 'templates'],
      default: 'dashboard'
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

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Update the updatedAt field
  user.updatedAt = Date.now();
  
  // Only hash the password if it has been modified or is new
  if (!user.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET || 'localbrand-secret-key',
    { expiresIn: '24h' }
  );
  return token;
};

// Virtual for user's full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to return user data without sensitive information
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
