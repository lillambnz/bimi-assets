const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  // Basic Information
  genericName: {
    type: String,
    required: [true, 'Generic name is required'],
    trim: true,
    index: true
  },
  brandNames: [{
    name: String,
    manufacturer: String
  }],
  scientificName: String,

  // Classification
  therapeuticClass: {
    type: String,
    required: true
  },
  pharmacologicalClass: String,
  drugClass: [{
    type: String,
    enum: [
      'analgesic',
      'antibiotic',
      'anticoagulant',
      'anticonvulsant',
      'antidepressant',
      'antidiabetic',
      'antifungal',
      'antihistamine',
      'antihypertensive',
      'anti-inflammatory',
      'antipsychotic',
      'antiviral',
      'bronchodilator',
      'cardiovascular',
      'chemotherapy',
      'corticosteroid',
      'diuretic',
      'gastrointestinal',
      'hormone',
      'immunosuppressant',
      'laxative',
      'lipid-lowering',
      'muscle-relaxant',
      'opiate',
      'sedative',
      'vaccine',
      'vitamin-supplement',
      'other'
    ]
  }],

  // Regulatory Information
  scheduleClass: {
    type: String,
    required: true,
    enum: ['unscheduled', 'S2', 'S3', 'S4', 'S8']
  },
  controlledSubstance: {
    type: Boolean,
    default: false
  },
  narcotic: {
    type: Boolean,
    default: false
  },

  // PBS Information
  pbsListed: {
    type: Boolean,
    default: false
  },
  pbsCodes: [{
    code: String,
    streamline: String,
    restriction: String,
    criteria: String,
    maxQuantity: Number,
    maxRepeats: Number,
    patientContribution: Number,
    pharmacistPrice: Number
  }],

  // Formulations
  formulations: [{
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
    strengths: [{
      value: String,
      unit: String
    }],
    route: {
      type: String,
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
    packaging: [{
      size: Number,
      unit: String
    }]
  }],

  // Dosing Information
  standardDosing: [{
    indication: String,
    adultDose: String,
    paediatricDose: String,
    elderlyDose: String,
    renalAdjustment: String,
    hepaticAdjustment: String,
    frequency: String,
    duration: String
  }],

  // Clinical Information
  indications: [{
    condition: String,
    approved: Boolean,
    offLabel: Boolean
  }],
  mechanismOfAction: {
    type: String,
    maxlength: 2000
  },
  pharmacokinetics: {
    absorption: String,
    distribution: String,
    metabolism: String,
    excretion: String,
    halfLife: String,
    onsetOfAction: String,
    durationOfAction: String
  },

  // Warnings and Precautions
  contraindications: [{
    condition: String,
    severity: {
      type: String,
      enum: ['absolute', 'relative']
    },
    explanation: String
  }],
  warnings: [String],
  precautions: [String],
  blackBoxWarning: {
    hasWarning: {
      type: Boolean,
      default: false
    },
    warning: String
  },

  // Adverse Effects
  adverseEffects: [{
    effect: String,
    frequency: {
      type: String,
      enum: ['very-common', 'common', 'uncommon', 'rare', 'very-rare']
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life-threatening']
    },
    description: String
  }],

  // Drug Interactions
  interactions: [{
    interactingDrug: String,
    interactionType: {
      type: String,
      enum: ['major', 'moderate', 'minor']
    },
    effect: String,
    management: String
  }],

  // Special Populations
  pregnancy: {
    category: {
      type: String,
      enum: ['A', 'B1', 'B2', 'B3', 'C', 'D', 'X']
    },
    description: String,
    fdaCategory: String
  },
  breastfeeding: {
    compatible: {
      type: String,
      enum: ['compatible', 'use-with-caution', 'not-recommended', 'contraindicated']
    },
    description: String
  },
  paediatric: {
    approved: Boolean,
    minimumAge: String,
    specialConsiderations: String
  },
  geriatric: {
    specialConsiderations: String,
    doseAdjustment: String
  },

  // Administration
  administrationInstructions: {
    general: String,
    withFood: {
      type: String,
      enum: ['with-food', 'without-food', 'no-restriction']
    },
    timing: String,
    specialInstructions: String
  },
  storage: {
    temperature: String,
    light: String,
    moisture: String,
    specialRequirements: String,
    shelfLife: String
  },

  // Monitoring
  monitoringRequired: {
    type: Boolean,
    default: false
  },
  monitoringParameters: [{
    parameter: String,
    frequency: String,
    reason: String
  }],

  // Patient Information
  patientCounseling: [String],
  commonQuestions: [{
    question: String,
    answer: String
  }],

  // Alternatives
  alternatives: [{
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication'
    },
    medicationName: String,
    reason: String
  }],

  // Cost Information
  costInformation: {
    averageWholesalePrice: Number,
    typicalRetailPrice: Number,
    pbsPrice: Number,
    patientContribution: Number,
    concessionalContribution: Number
  },

  // Manufacturer Information
  manufacturers: [{
    name: String,
    country: String,
    contact: String
  }],

  // Reference Information
  references: [{
    source: String,
    url: String,
    dateAccessed: Date
  }],

  // Images
  images: [{
    url: String,
    description: String,
    strength: String,
    form: String
  }],

  // Status
  status: {
    type: String,
    enum: ['active', 'discontinued', 'withdrawn', 'investigational'],
    default: 'active'
  },
  discontinuedDate: Date,
  discontinuedReason: String,

  // Search and Metadata
  searchKeywords: [String],
  atcCode: String, // Anatomical Therapeutic Chemical Classification
  rxcui: String, // RxNorm Concept Unique Identifier

  // Statistics
  prescriptionCount: {
    type: Number,
    default: 0
  },
  lastPrescribed: Date,

  // Audit
  lastReviewedDate: Date,
  reviewedBy: String,
  dataSource: String,
  lastUpdatedFrom: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
MedicationSchema.index({ genericName: 'text', 'brandNames.name': 'text' });
MedicationSchema.index({ therapeuticClass: 1 });
MedicationSchema.index({ drugClass: 1 });
MedicationSchema.index({ pbsListed: 1 });
MedicationSchema.index({ scheduleClass: 1 });
MedicationSchema.index({ status: 1 });

// Virtual for display name
MedicationSchema.virtual('displayName').get(function() {
  if (this.brandNames && this.brandNames.length > 0) {
    return `${this.genericName} (${this.brandNames[0].name})`;
  }
  return this.genericName;
});

// Method to check if medication requires special handling
MedicationSchema.methods.requiresSpecialHandling = function() {
  return this.controlledSubstance || this.narcotic || ['S4', 'S8'].includes(this.scheduleClass);
};

// Method to check drug interaction
MedicationSchema.methods.checkInteractionWith = function(otherMedicationName) {
  return this.interactions.find(interaction =>
    interaction.interactingDrug.toLowerCase() === otherMedicationName.toLowerCase()
  );
};

// Method to get PBS price
MedicationSchema.methods.getPBSPrice = function(pbsCode) {
  if (!this.pbsListed) return null;

  const pbsEntry = this.pbsCodes.find(pbs => pbs.code === pbsCode);
  return pbsEntry ? pbsEntry.patientContribution : null;
};

module.exports = mongoose.model('Medication', MedicationSchema);
