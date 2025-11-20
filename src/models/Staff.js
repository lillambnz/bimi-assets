const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StaffSchema = new mongoose.Schema({
  // Personal Information
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: String,
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },

  // Contact Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  mobilePhone: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },

  // Address
  address: {
    street: String,
    suburb: String,
    state: String,
    postcode: String,
    country: {
      type: String,
      default: 'Australia'
    }
  },

  // Employment Details
  position: {
    type: String,
    required: true,
    enum: [
      'receptionist',
      'practice-manager',
      'practice-nurse',
      'nurse-practitioner',
      'registered-nurse',
      'enrolled-nurse',
      'medical-assistant',
      'pharmacist',
      'pharmacy-assistant',
      'pathology-collector',
      'radiographer',
      'physiotherapist',
      'occupational-therapist',
      'psychologist',
      'dietitian',
      'social-worker',
      'admin-officer',
      'billing-officer',
      'it-support',
      'cleaner',
      'security',
      'other'
    ]
  },
  department: String,
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  employmentType: {
    type: String,
    required: true,
    enum: ['full-time', 'part-time', 'casual', 'contract']
  },
  employmentStatus: {
    type: String,
    required: true,
    enum: ['active', 'on-leave', 'suspended', 'terminated', 'resigned'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,

  // Qualifications
  qualifications: [{
    type: String,
    institution: String,
    yearObtained: Number,
    expiryDate: Date
  }],
  certifications: [{
    name: String,
    issuingBody: String,
    certificationNumber: String,
    issueDate: Date,
    expiryDate: Date
  }],
  registrationNumber: String,
  registrationExpiry: Date,

  // Work Schedule
  workingHours: [{
    dayOfWeek: Number,
    startTime: String,
    endTime: String
  }],
  hoursPerWeek: Number,

  // Access and Permissions
  role: {
    type: String,
    required: true,
    enum: ['admin', 'manager', 'staff', 'reception'],
    default: 'staff'
  },
  permissions: [{
    module: String,
    read: Boolean,
    write: Boolean,
    delete: Boolean
  }],
  accessLevel: {
    type: String,
    enum: ['basic', 'standard', 'elevated', 'full'],
    default: 'basic'
  },

  // Account
  password: {
    type: String,
    required: true,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,

  // Leave
  annualLeave: {
    entitlement: Number,
    taken: Number,
    remaining: Number
  },
  sickLeave: {
    entitlement: Number,
    taken: Number,
    remaining: Number
  },
  leaveHistory: [{
    leaveType: {
      type: String,
      enum: ['annual', 'sick', 'personal', 'parental', 'unpaid']
    },
    startDate: Date,
    endDate: Date,
    numberOfDays: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  }],

  // Performance
  performanceReviews: [{
    reviewDate: Date,
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    rating: Number,
    strengths: String,
    areasForImprovement: String,
    goals: [String],
    comments: String
  }],

  // Training
  trainingCompleted: [{
    courseName: String,
    completionDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],

  // Compliance
  policeCheck: {
    date: Date,
    expiryDate: Date,
    clearance: Boolean
  },
  workingWithChildrenCheck: {
    number: String,
    expiryDate: Date
  },
  occupationalHealthScreening: {
    date: Date,
    nextDue: Date,
    cleared: Boolean
  },
  immunizations: [{
    vaccine: String,
    date: Date,
    nextDue: Date
  }],

  // Salary and Banking
  salary: {
    amount: Number,
    frequency: {
      type: String,
      enum: ['hourly', 'weekly', 'fortnightly', 'monthly', 'annually']
    },
    currency: {
      type: String,
      default: 'AUD'
    }
  },
  banking: {
    bsb: String,
    accountNumber: String,
    accountName: String
  },
  taxFileNumber: String,
  superannuation: {
    fund: String,
    memberNumber: String,
    contributionRate: Number
  },

  // Notes
  notes: String
}, {
  timestamps: true
});

// Indexes
StaffSchema.index({ employeeId: 1 });
StaffSchema.index({ email: 1 });
StaffSchema.index({ hospital: 1, position: 1 });

// Hash password
StaffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
StaffSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Staff', StaffSchema);
