const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  // Reference IDs
  appointmentNumber: {
    type: String,
    unique: true,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: [true, 'Hospital/Clinic is required']
  },

  // Appointment Details
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
  },
  duration: {
    type: Number,
    required: true,
    min: 5,
    max: 240 // in minutes
  },

  // Appointment Type
  appointmentType: {
    type: String,
    required: true,
    enum: [
      'consultation',
      'follow-up',
      'annual-check-up',
      'vaccination',
      'procedure',
      'surgery',
      'diagnostic-test',
      'mental-health',
      'antenatal',
      'postnatal',
      'telehealth',
      'home-visit',
      'emergency',
      'specialist-referral',
      'physiotherapy',
      'pathology',
      'radiology',
      'other'
    ]
  },
  consultationType: {
    type: String,
    required: true,
    enum: ['in-person', 'telehealth', 'phone', 'home-visit']
  },

  // Clinical Information
  reasonForVisit: {
    type: String,
    required: [true, 'Reason for visit is required'],
    maxlength: 500
  },
  symptoms: [String],
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'emergency'],
    default: 'routine'
  },
  clinicalNotes: {
    type: String,
    maxlength: 2000
  },

  // Status
  status: {
    type: String,
    required: true,
    enum: [
      'scheduled',
      'confirmed',
      'checked-in',
      'in-progress',
      'completed',
      'cancelled',
      'no-show',
      'rescheduled'
    ],
    default: 'scheduled'
  },
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'hospital', 'system']
  },
  cancellationDate: Date,

  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed']
    }
  }],
  remindersSent: {
    type: Boolean,
    default: false
  },

  // Check-in
  checkInTime: Date,
  checkInMethod: {
    type: String,
    enum: ['reception', 'kiosk', 'mobile-app', 'online']
  },

  // Consultation
  consultationStartTime: Date,
  consultationEndTime: Date,
  actualDuration: Number, // in minutes

  // Clinical Details (filled during/after consultation)
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number
  },
  diagnosis: [{
    condition: String,
    icdCode: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    notes: String
  }],
  treatment: {
    type: String,
    maxlength: 2000
  },
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  testsOrdered: [{
    testType: String,
    testName: String,
    orderedDate: Date,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'stat']
    },
    facility: String,
    notes: String
  }],
  referrals: [{
    specialistType: String,
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    reason: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency']
    },
    referralDate: Date,
    expiryDate: Date
  }],

  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpNotes: String,
  followUpAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },

  // Medical Certificates
  medicalCertificate: {
    issued: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    numberOfDays: Number,
    reason: String,
    restrictions: String
  },

  // Billing
  billing: {
    itemNumbers: [{
      mbsItemNumber: String,
      description: String,
      fee: Number,
      rebate: Number
    }],
    totalFee: Number,
    totalRebate: Number,
    outOfPocket: Number,
    bulkBilled: {
      type: Boolean,
      default: false
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially-paid', 'bulk-billed', 'waived'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'eftpos', 'medicare', 'health-insurance', 'dva']
    },
    paymentDate: Date,
    invoiceNumber: String,
    medicareClaimNumber: String,
    medicareClaimDate: Date
  },

  // Telehealth Details
  telehealthDetails: {
    platform: {
      type: String,
      enum: ['zoom', 'teams', 'phone', 'custom']
    },
    meetingLink: String,
    meetingId: String,
    password: String,
    connectionQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    }
  },

  // Wait Time
  estimatedWaitTime: Number, // in minutes
  actualWaitTime: Number, // in minutes

  // Patient Feedback
  patientFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },

  // Documents
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['referral', 'test-result', 'image', 'report', 'consent-form', 'other']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Related Appointments
  previousAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  nextAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },

  // System Fields
  createdBy: {
    userType: {
      type: String,
      enum: ['patient', 'doctor', 'receptionist', 'system']
    },
    userId: mongoose.Schema.Types.ObjectId
  },
  modifiedBy: [{
    userType: String,
    userId: mongoose.Schema.Types.ObjectId,
    modifiedAt: Date,
    changes: String
  }],

  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
AppointmentSchema.index({ appointmentNumber: 1 });
AppointmentSchema.index({ patient: 1, appointmentDate: -1 });
AppointmentSchema.index({ doctor: 1, appointmentDate: 1 });
AppointmentSchema.index({ hospital: 1, appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentDate: 1, startTime: 1 });

// Generate appointment number before saving
AppointmentSchema.pre('save', async function(next) {
  if (!this.appointmentNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.appointmentNumber = `APT${year}${month}${random}`;
  }
  next();
});

// Virtual for appointment datetime
AppointmentSchema.virtual('appointmentDateTime').get(function() {
  const date = new Date(this.appointmentDate);
  const [hours, minutes] = this.startTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes));
  return date;
});

// Method to check if appointment is upcoming
AppointmentSchema.methods.isUpcoming = function() {
  return this.appointmentDateTime > new Date() && this.status === 'scheduled';
};

// Method to check if patient can cancel
AppointmentSchema.methods.canBeCancelled = function() {
  const hoursUntilAppointment = (this.appointmentDateTime - new Date()) / (1000 * 60 * 60);
  return hoursUntilAppointment > 24 && ['scheduled', 'confirmed'].includes(this.status);
};

// Method to calculate wait time
AppointmentSchema.methods.calculateWaitTime = function() {
  if (this.checkInTime && this.consultationStartTime) {
    return Math.round((this.consultationStartTime - this.checkInTime) / (1000 * 60));
  }
  return null;
};

module.exports = mongoose.model('Appointment', AppointmentSchema);
