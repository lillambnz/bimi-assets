const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  // Reference Information
  prescriptionNumber: {
    type: String,
    unique: true,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },

  // Prescription Date
  prescriptionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },

  // Prescription Type
  prescriptionType: {
    type: String,
    required: true,
    enum: ['standard', 'repeat', 'authority', 'private', 'compounded']
  },

  // Medications
  medications: [{
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication'
    },
    medicationName: {
      type: String,
      required: true
    },
    brandName: String,
    genericName: String,

    // PBS Information
    pbsCode: String,
    pbsListed: {
      type: Boolean,
      default: false
    },
    pbsRestrictionCode: String,

    // Dosage
    strength: {
      type: String,
      required: true
    },
    form: {
      type: String,
      required: true,
      enum: [
        'tablet',
        'capsule',
        'liquid',
        'syrup',
        'suspension',
        'injection',
        'cream',
        'ointment',
        'gel',
        'patch',
        'inhaler',
        'drops',
        'spray',
        'suppository',
        'powder',
        'lozenge'
      ]
    },
    route: {
      type: String,
      required: true,
      enum: [
        'oral',
        'topical',
        'intravenous',
        'intramuscular',
        'subcutaneous',
        'inhaled',
        'nasal',
        'ophthalmic',
        'otic',
        'rectal',
        'vaginal',
        'transdermal',
        'sublingual'
      ]
    },

    // Directions
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    timing: String,
    duration: String,
    directions: {
      type: String,
      required: true,
      maxlength: 500
    },

    // Quantity
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      required: true
    },

    // Repeats
    repeats: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    repeatsRemaining: Number,

    // Additional Information
    indication: String,
    brandSubstitution: {
      type: Boolean,
      default: true
    },

    // Authority Prescription Details
    authorityRequired: {
      type: Boolean,
      default: false
    },
    authorityApprovalNumber: String,
    authorityStreamline: Boolean,

    // Safety Information
    warnings: [String],
    contraindications: [String],
    interactions: [String],

    // Administration Instructions
    specialInstructions: String,
    foodInteraction: String,
    storageInstructions: String
  }],

  // Clinical Information
  diagnosis: String,
  clinicalIndication: {
    type: String,
    required: true
  },
  treatmentDuration: String,

  // Status
  status: {
    type: String,
    required: true,
    enum: ['active', 'dispensed', 'partially-dispensed', 'expired', 'cancelled', 'superseded'],
    default: 'active'
  },

  // Dispensing Information
  dispensingHistory: [{
    pharmacy: {
      name: String,
      address: String,
      phone: String,
      pharmacistName: String,
      registrationNumber: String
    },
    dispensedDate: Date,
    medications: [{
      medicationName: String,
      quantityDispensed: Number,
      batchNumber: String,
      expiryDate: Date
    }],
    repeatNumber: Number,
    cost: {
      pbsPrice: Number,
      patientContribution: Number,
      concessionApplied: Boolean
    }
  }],

  // Electronic Prescription
  electronicPrescription: {
    token: String,
    qrCode: String,
    active: {
      type: Boolean,
      default: false
    }
  },

  // PBS Safety Net
  pbsSafetyNet: {
    cardNumber: String,
    concessional: Boolean,
    thresholdReached: Boolean
  },

  // Patient Instructions
  patientInstructions: {
    type: String,
    maxlength: 1000
  },
  counselingRequired: {
    type: Boolean,
    default: false
  },
  counselingNotes: String,

  // Doctor's Signature
  prescribedBy: {
    name: String,
    ahpraNumber: String,
    medicareProviderNumber: String,
    prescribingNumber: String,
    signature: String,
    signatureDate: Date
  },

  // Urgent/Immediate Supply
  urgent: {
    type: Boolean,
    default: false
  },
  immediateSupplyRequired: {
    type: Boolean,
    default: false
  },

  // Regulatory Requirements
  scheduleClass: {
    type: String,
    enum: ['unscheduled', 'S2', 'S3', 'S4', 'S8']
  },
  narcotic: {
    type: Boolean,
    default: false
  },
  controlledDrug: {
    type: Boolean,
    default: false
  },

  // Cancellation
  cancelled: {
    type: Boolean,
    default: false
  },
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  cancellationDate: Date,

  // Notes
  clinicalNotes: String,
  pharmacistNotes: String,

  // Audit Trail
  printedCount: {
    type: Number,
    default: 0
  },
  lastPrintedDate: Date,
  accessLog: [{
    accessedBy: mongoose.Schema.Types.ObjectId,
    accessDate: Date,
    action: String
  }],

  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
PrescriptionSchema.index({ prescriptionNumber: 1 });
PrescriptionSchema.index({ patient: 1, prescriptionDate: -1 });
PrescriptionSchema.index({ doctor: 1 });
PrescriptionSchema.index({ status: 1 });
PrescriptionSchema.index({ expiryDate: 1 });

// Generate prescription number
PrescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.prescriptionNumber = `RX${year}${month}${random}`;
  }

  // Set expiry date if not provided (12 months from prescription date)
  if (!this.expiryDate) {
    this.expiryDate = new Date(this.prescriptionDate);
    this.expiryDate.setFullYear(this.expiryDate.getFullYear() + 1);
  }

  // Initialize repeats remaining
  this.medications.forEach(med => {
    if (med.repeatsRemaining === undefined) {
      med.repeatsRemaining = med.repeats;
    }
  });

  next();
});

// Virtual for days until expiry
PrescriptionSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual to check if prescription is expired
PrescriptionSchema.virtual('isExpired').get(function() {
  return new Date() > new Date(this.expiryDate);
});

// Method to check if repeats are available
PrescriptionSchema.methods.hasRepeatsAvailable = function() {
  return this.medications.some(med => med.repeatsRemaining > 0);
};

// Method to dispense prescription
PrescriptionSchema.methods.dispense = function(pharmacyInfo, medicationsDispensed) {
  this.dispensingHistory.push({
    pharmacy: pharmacyInfo,
    dispensedDate: new Date(),
    medications: medicationsDispensed,
    repeatNumber: this.dispensingHistory.length
  });

  // Update repeats remaining
  medicationsDispensed.forEach(dispensed => {
    const med = this.medications.find(m => m.medicationName === dispensed.medicationName);
    if (med && med.repeatsRemaining > 0) {
      med.repeatsRemaining--;
    }
  });

  // Update status
  if (!this.hasRepeatsAvailable()) {
    this.status = 'dispensed';
  } else {
    this.status = 'partially-dispensed';
  }

  return this.save();
};

module.exports = mongoose.model('Prescription', PrescriptionSchema);
