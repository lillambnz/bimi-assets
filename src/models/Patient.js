const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PatientSchema = new mongoose.Schema({
  // Personal Information
  medicareNumber: {
    type: String,
    required: [true, 'Medicare number is required'],
    unique: true,
    match: [/^\d{10}$/, 'Medicare number must be 10 digits']
  },
  irnNumber: {
    type: String,
    required: true,
    match: [/^\d{1}$/, 'IRN must be 1 digit']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  middleName: {
    type: String,
    trim: true,
    maxlength: [50, 'Middle name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
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
    required: [true, 'Phone number is required'],
    match: [/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/, 'Please provide a valid Australian phone number']
  },
  mobilePhone: {
    type: String,
    match: [/^(\+?61|0)4(?:[ -]?[0-9]){8}$/, 'Please provide a valid Australian mobile number']
  },

  // Address
  address: {
    street: {
      type: String,
      required: true
    },
    suburb: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
      enum: ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']
    },
    postcode: {
      type: String,
      required: true,
      match: [/^\d{4}$/, 'Postcode must be 4 digits']
    },
    country: {
      type: String,
      default: 'Australia'
    }
  },

  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String
  },

  // Medical Information
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
  },
  height: Number, // in cm
  weight: Number, // in kg
  allergies: [{
    allergen: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life-threatening']
    },
    reaction: String,
    diagnosedDate: Date
  }],
  chronicConditions: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'managed', 'resolved']
    },
    notes: String
  }],
  medications: [{
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication'
    },
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  }],
  immunizations: [{
    vaccine: String,
    dateAdministered: Date,
    batchNumber: String,
    administeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    nextDueDate: Date
  }],

  // Healthcare Providers
  primaryDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  specialists: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    specialty: String,
    referralDate: Date,
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  }],

  // Insurance and Healthcare Cards
  healthInsurance: {
    provider: String,
    membershipNumber: String,
    expiryDate: Date,
    level: {
      type: String,
      enum: ['basic', 'bronze', 'silver', 'gold']
    }
  },
  pensionCard: {
    type: String,
    number: String,
    expiryDate: Date
  },
  dvaMember: {
    type: Boolean,
    default: false
  },
  dvaCardNumber: String,

  // Account Information
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    default: 'patient',
    enum: ['patient']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Consent and Privacy
  consentToTreat: {
    type: Boolean,
    default: false
  },
  consentToShareInfo: {
    type: Boolean,
    default: false
  },
  consentDate: Date,

  // Additional Information
  occupation: String,
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed', 'de-facto']
  },
  preferredLanguage: {
    type: String,
    default: 'English'
  },
  interpreterRequired: {
    type: Boolean,
    default: false
  },
  culturalBackground: String,
  indigenousStatus: {
    type: String,
    enum: ['aboriginal', 'torres-strait-islander', 'both', 'neither', 'prefer-not-to-say']
  },

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

// Indexes for performance
PatientSchema.index({ medicareNumber: 1 });
PatientSchema.index({ email: 1 });
PatientSchema.index({ lastName: 1, firstName: 1 });
PatientSchema.index({ primaryDoctor: 1 });
PatientSchema.index({ 'address.postcode': 1 });

// Virtual for full name
PatientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
});

// Virtual for age
PatientSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for BMI
PatientSchema.virtual('bmi').get(function() {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }
  return null;
});

// Encrypt password before saving
PatientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
PatientSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if Medicare number is valid
PatientSchema.methods.validateMedicareNumber = function() {
  if (this.medicareNumber.length !== 10) return false;

  const weights = [1, 3, 7, 9, 1, 3, 7, 9];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    sum += parseInt(this.medicareNumber[i]) * weights[i];
  }

  const checkDigit = sum % 10;
  return checkDigit === parseInt(this.medicareNumber[8]);
};

module.exports = mongoose.model('Patient', PatientSchema);
