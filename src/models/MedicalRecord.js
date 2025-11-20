const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  // References
  recordNumber: {
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },

  // Record Type
  recordType: {
    type: String,
    required: true,
    enum: [
      'consultation',
      'emergency-visit',
      'hospital-admission',
      'surgery',
      'diagnostic-test',
      'pathology-result',
      'radiology-result',
      'vaccination',
      'prescription',
      'referral',
      'discharge-summary',
      'progress-note',
      'specialist-letter',
      'mental-health-assessment',
      'aged-care-assessment',
      'other'
    ]
  },

  // Visit Information
  visitDate: {
    type: Date,
    required: true,
    index: true
  },
  visitType: {
    type: String,
    enum: ['outpatient', 'inpatient', 'emergency', 'day-surgery', 'telehealth']
  },

  // Chief Complaint
  chiefComplaint: {
    type: String,
    required: true,
    maxlength: 500
  },
  presentingSymptoms: [{
    symptom: String,
    onset: Date,
    duration: String,
    severity: {
      type: Number,
      min: 1,
      max: 10
    },
    description: String
  }],

  // History
  historyOfPresentIllness: {
    type: String,
    maxlength: 5000
  },
  pastMedicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic']
    },
    notes: String
  }],
  pastSurgicalHistory: [{
    procedure: String,
    date: Date,
    hospital: String,
    surgeon: String,
    complications: String
  }],
  familyHistory: [{
    relationship: String,
    condition: String,
    ageOfOnset: Number,
    alive: Boolean,
    causeOfDeath: String
  }],
  socialHistory: {
    smokingStatus: {
      type: String,
      enum: ['never', 'former', 'current']
    },
    smokingPackYears: Number,
    alcoholConsumption: {
      type: String,
      enum: ['none', 'occasional', 'moderate', 'heavy']
    },
    recreationalDrugUse: Boolean,
    occupation: String,
    livingArrangement: String,
    exercise: String,
    diet: String
  },

  // Medications
  currentMedications: [{
    medicationName: String,
    dosage: String,
    frequency: String,
    route: String,
    startDate: Date,
    prescribedBy: String,
    indication: String
  }],
  medicationAllergies: [{
    medication: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life-threatening']
    }
  }],

  // Physical Examination
  physicalExamination: {
    general: {
      appearance: String,
      consciousness: {
        type: String,
        enum: ['alert', 'drowsy', 'confused', 'unconscious']
      },
      distress: String
    },
    vitalSigns: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number,
        position: {
          type: String,
          enum: ['sitting', 'standing', 'lying']
        }
      },
      heartRate: {
        value: Number,
        rhythm: {
          type: String,
          enum: ['regular', 'irregular']
        }
      },
      temperature: Number,
      temperatureRoute: {
        type: String,
        enum: ['oral', 'tympanic', 'axillary', 'rectal']
      },
      respiratoryRate: Number,
      oxygenSaturation: Number,
      supplementalOxygen: String,
      weight: Number,
      height: Number,
      bmi: Number,
      painScore: {
        type: Number,
        min: 0,
        max: 10
      }
    },
    systemsReview: {
      cardiovascular: String,
      respiratory: String,
      gastrointestinal: String,
      genitourinary: String,
      musculoskeletal: String,
      neurological: String,
      psychiatric: String,
      skin: String,
      ent: String,
      eyes: String
    }
  },

  // Investigations
  investigations: [{
    type: {
      type: String,
      enum: ['blood-test', 'urine-test', 'imaging', 'ecg', 'spirometry', 'endoscopy', 'biopsy', 'other']
    },
    testName: String,
    orderedDate: Date,
    performedDate: Date,
    results: String,
    interpretation: String,
    abnormal: Boolean,
    criticalResult: Boolean,
    documentUrl: String
  }],

  // Pathology Results
  pathologyResults: [{
    testName: String,
    testDate: Date,
    laboratoryName: String,
    results: [{
      parameter: String,
      value: String,
      unit: String,
      referenceRange: String,
      abnormalFlag: {
        type: String,
        enum: ['normal', 'low', 'high', 'critical']
      }
    }],
    interpretation: String,
    reportUrl: String
  }],

  // Radiology Results
  radiologyResults: [{
    studyType: String,
    studyDate: Date,
    radiologist: String,
    facility: String,
    findings: String,
    impression: String,
    recommendation: String,
    imageUrl: String,
    reportUrl: String
  }],

  // Diagnosis
  diagnoses: [{
    condition: {
      type: String,
      required: true
    },
    icd10Code: String,
    snomedCode: String,
    type: {
      type: String,
      enum: ['primary', 'secondary', 'differential']
    },
    status: {
      type: String,
      enum: ['confirmed', 'suspected', 'ruled-out']
    },
    onsetDate: Date,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'critical']
    },
    notes: String
  }],

  // Management Plan
  managementPlan: {
    summary: String,
    pharmacologicalTreatment: [{
      medication: String,
      indication: String,
      duration: String
    }],
    nonPharmacologicalTreatment: [String],
    lifestyle Modifications: [String],
    followUpPlan: String,
    patientEducation: String,
    safetyNetting: String
  },

  // Procedures Performed
  procedures: [{
    procedureName: String,
    procedureCode: String,
    date: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    assistant: String,
    anaesthesia: {
      type: String,
      enum: ['none', 'local', 'regional', 'general', 'sedation']
    },
    findings: String,
    complications: String,
    outcome: String
  }],

  // Prescriptions
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],

  // Referrals
  referrals: [{
    specialty: String,
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    facility: String,
    reason: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency']
    },
    referralDate: Date,
    appointmentMade: Boolean
  }],

  // Follow-up
  followUp: {
    required: Boolean,
    timeframe: String,
    reason: String,
    appointmentScheduled: Boolean,
    appointmentDate: Date
  },

  // Medical Certificates
  medicalCertificate: {
    issued: Boolean,
    startDate: Date,
    endDate: Date,
    numberOfDays: Number,
    unfit: Boolean,
    restrictions: String
  },

  // Clinical Notes
  clinicalNotes: {
    type: String,
    maxlength: 10000
  },
  privateNotes: {
    type: String,
    maxlength: 5000
  },

  // Discharge Information (if applicable)
  discharge: {
    dischargeDate: Date,
    dischargeDiagnosis: String,
    dischargeInstructions: String,
    dischargeMedications: [{
      medication: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    followUpArrangements: String,
    dischargedTo: {
      type: String,
      enum: ['home', 'nursing-home', 'rehabilitation', 'other-hospital', 'deceased']
    },
    dischargedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  },

  // Attachments
  attachments: [{
    fileName: String,
    fileType: String,
    fileSize: Number,
    fileUrl: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    description: String
  }],

  // Review and Approval
  reviewedBy: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    reviewDate: Date,
    comments: String
  }],
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  approvalDate: Date,

  // Confidentiality
  confidential: {
    type: Boolean,
    default: false
  },
  accessRestrictions: [{
    userType: String,
    userId: mongoose.Schema.Types.ObjectId,
    accessLevel: {
      type: String,
      enum: ['read', 'write', 'none']
    }
  }],

  // Audit Trail
  accessLog: [{
    user: mongoose.Schema.Types.ObjectId,
    userType: String,
    accessDate: Date,
    action: {
      type: String,
      enum: ['view', 'edit', 'print', 'export']
    },
    ipAddress: String
  }],

  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'amended', 'archived'],
    default: 'active'
  },
  amendmentHistory: [{
    amendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    amendmentDate: Date,
    reason: String,
    changes: String
  }],

  // Electronic Signature
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  signedDate: Date,
  electronicSignature: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
MedicalRecordSchema.index({ recordNumber: 1 });
MedicalRecordSchema.index({ patient: 1, visitDate: -1 });
MedicalRecordSchema.index({ doctor: 1, visitDate: -1 });
MedicalRecordSchema.index({ hospital: 1 });
MedicalRecordSchema.index({ recordType: 1 });
MedicalRecordSchema.index({ 'diagnoses.icd10Code': 1 });

// Generate record number
MedicalRecordSchema.pre('save', async function(next) {
  if (!this.recordNumber) {
    const date = new Date();
    const year = date.getFullYear().toString();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    this.recordNumber = `MR${year}${random}`;
  }
  next();
});

// Virtual for patient age at time of visit
MedicalRecordSchema.virtual('patientAgeAtVisit').get(function() {
  if (!this.patient || !this.patient.dateOfBirth) return null;

  const visitDate = new Date(this.visitDate);
  const birthDate = new Date(this.patient.dateOfBirth);
  let age = visitDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = visitDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && visitDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
