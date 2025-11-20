const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DoctorSchema = new mongoose.Schema({
  // Professional Information
  ahpraNumber: {
    type: String,
    required: [true, 'AHPRA registration number is required'],
    unique: true,
    match: [/^[A-Z]{3}\d{10}$/, 'Invalid AHPRA registration number format']
  },
  medicareProviderNumber: {
    type: String,
    required: [true, 'Medicare provider number is required'],
    unique: true,
    match: [/^\d{6,8}[A-Z]{2}$/, 'Invalid Medicare provider number format']
  },
  prescribingNumber: {
    type: String,
    unique: true,
    sparse: true
  },

  // Personal Information
  title: {
    type: String,
    required: true,
    enum: ['Dr', 'Prof', 'A/Prof', 'Mr', 'Ms', 'Mrs']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },

  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  mobilePhone: {
    type: String,
    match: [/^(\+?61|0)4(?:[ -]?[0-9]){8}$/, 'Please provide a valid Australian mobile number']
  },

  // Address
  address: {
    street: String,
    suburb: String,
    state: {
      type: String,
      enum: ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']
    },
    postcode: String,
    country: {
      type: String,
      default: 'Australia'
    }
  },

  // Professional Details
  specialty: {
    type: String,
    required: true,
    enum: [
      'General Practice',
      'Cardiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Geriatrics',
      'Haematology',
      'Immunology',
      'Infectious Diseases',
      'Nephrology',
      'Neurology',
      'Oncology',
      'Ophthalmology',
      'Orthopaedics',
      'Otolaryngology',
      'Paediatrics',
      'Psychiatry',
      'Radiology',
      'Rheumatology',
      'Surgery',
      'Urology',
      'Emergency Medicine',
      'Anaesthetics',
      'Pathology',
      'Obstetrics and Gynaecology',
      'Plastic Surgery',
      'Other'
    ]
  },
  subSpecialties: [String],

  // Qualifications
  qualifications: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Australia'
    },
    yearObtained: {
      type: Number,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],

  // Fellowship and Memberships
  fellowships: [{
    organization: String,
    type: String,
    yearObtained: Number,
    membershipNumber: String
  }],

  // Work Experience
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0
  },
  previousPositions: [{
    title: String,
    organization: String,
    location: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],

  // Current Employment
  employmentStatus: {
    type: String,
    required: true,
    enum: ['full-time', 'part-time', 'casual', 'contract', 'locum', 'retired']
  },
  primaryWorkplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  workplaces: [{
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    role: String,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Consultation Details
  consultationTypes: [{
    type: {
      type: String,
      enum: ['in-person', 'telehealth', 'home-visit', 'hospital-visit']
    },
    duration: Number, // in minutes
    fee: Number,
    bulkBilling: {
      type: Boolean,
      default: false
    }
  }],
  bulkBillingAvailable: {
    type: Boolean,
    default: false
  },
  acceptingNewPatients: {
    type: Boolean,
    default: true
  },

  // Availability
  workingHours: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    },
    startTime: String, // HH:MM format
    endTime: String,
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    }
  }],
  leaveSchedule: [{
    startDate: Date,
    endDate: Date,
    reason: String,
    type: {
      type: String,
      enum: ['annual-leave', 'sick-leave', 'conference', 'other']
    }
  }],

  // Language and Skills
  languagesSpoken: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['native', 'fluent', 'intermediate', 'basic']
    }
  }],
  specialSkills: [String],
  clinicalInterests: [String],

  // Research and Publications
  publications: [{
    title: String,
    journal: String,
    yearPublished: Number,
    doi: String,
    authors: [String]
  }],
  researchInterests: [String],

  // Patient Statistics
  statistics: {
    totalPatients: {
      type: Number,
      default: 0
    },
    activePatients: {
      type: Number,
      default: 0
    },
    totalConsultations: {
      type: Number,
      default: 0
    },
    averageConsultationDuration: Number,
    patientSatisfactionRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },

  // Reviews
  reviews: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    },
    anonymous: {
      type: Boolean,
      default: false
    }
  }],

  // Professional Development
  continuingEducation: [{
    course: String,
    provider: String,
    completionDate: Date,
    cpd Points: Number,
    certificate: String
  }],

  // Account Information
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    default: 'doctor',
    enum: ['doctor', 'specialist', 'gp', 'surgeon']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  lastLogin: Date,
  passwordChangedAt: Date,

  // Compliance and Insurance
  indemnityInsurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverageAmount: Number
  },
  ahpraRegistrationExpiry: {
    type: Date,
    required: true
  },
  policeCheckDate: Date,
  workingWithChildrenCheck: {
    number: String,
    expiryDate: Date
  },

  // Billing Information
  billingDetails: {
    abn: String,
    bankName: String,
    bsb: String,
    accountNumber: String,
    accountName: String
  },

  // Notifications Preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    appointmentReminders: {
      type: Boolean,
      default: true
    },
    patientMessages: {
      type: Boolean,
      default: true
    }
  },

  // Profile
  profilePhoto: String,
  biography: {
    type: String,
    maxlength: 1000
  },
  website: String,

  // System Fields
  registrationDate: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
DoctorSchema.index({ ahpraNumber: 1 });
DoctorSchema.index({ medicareProviderNumber: 1 });
DoctorSchema.index({ email: 1 });
DoctorSchema.index({ specialty: 1 });
DoctorSchema.index({ primaryWorkplace: 1 });
DoctorSchema.index({ acceptingNewPatients: 1 });
DoctorSchema.index({ 'address.postcode': 1 });
DoctorSchema.index({ 'statistics.patientSatisfactionRating': -1 });

// Virtual for full name
DoctorSchema.virtual('fullName').get(function() {
  return `${this.title} ${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
});

// Virtual for display name
DoctorSchema.virtual('displayName').get(function() {
  return `${this.title} ${this.lastName}`;
});

// Encrypt password
DoctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
DoctorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate average rating
DoctorSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) return 0;

  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(2);
};

// Check if doctor is available
DoctorSchema.methods.isAvailableOn = function(date) {
  const dayOfWeek = date.getDay();
  return this.workingHours.some(wh => wh.dayOfWeek === dayOfWeek);
};

module.exports = mongoose.model('Doctor', DoctorSchema);
