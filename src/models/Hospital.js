const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    unique: true
  },
  facilityType: {
    type: String,
    required: true,
    enum: [
      'public-hospital',
      'private-hospital',
      'gp-clinic',
      'medical-centre',
      'specialist-clinic',
      'day-surgery',
      'community-health-centre',
      'mental-health-facility',
      'rehabilitation-centre',
      'aged-care-facility',
      'pathology-centre',
      'radiology-centre',
      'emergency-department'
    ]
  },
  classification: {
    type: String,
    enum: ['principal-referral', 'specialist', 'large', 'medium', 'small', 'clinic']
  },

  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/, 'Please provide a valid Australian phone number']
  },
  emergencyPhone: String,
  fax: String,
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  website: String,

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
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Registration Details
  abn: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{11}$/, 'ABN must be 11 digits']
  },
  acn: String,
  healthServiceIdentifier: String,

  // Facility Details
  numberOfBeds: {
    type: Number,
    min: 0
  },
  icuBeds: {
    type: Number,
    min: 0,
    default: 0
  },
  emergencyBeds: {
    type: Number,
    min: 0,
    default: 0
  },
  operatingTheatres: {
    type: Number,
    min: 0,
    default: 0
  },
  numberOfStaff: {
    doctors: {
      type: Number,
      default: 0
    },
    nurses: {
      type: Number,
      default: 0
    },
    administrativeStaff: {
      type: Number,
      default: 0
    },
    alliedHealth: {
      type: Number,
      default: 0
    }
  },

  // Services Offered
  services: [{
    serviceName: {
      type: String,
      required: true
    },
    description: String,
    available24Hours: {
      type: Boolean,
      default: false
    },
    bulkBilling: {
      type: Boolean,
      default: false
    },
    waitTime: String
  }],

  // Departments
  departments: [{
    name: {
      type: String,
      required: true,
      enum: [
        'Emergency',
        'Cardiology',
        'Oncology',
        'Neurology',
        'Orthopaedics',
        'Paediatrics',
        'Obstetrics',
        'Gynaecology',
        'Surgery',
        'ICU',
        'Radiology',
        'Pathology',
        'Psychiatry',
        'Rehabilitation',
        'Geriatrics',
        'Maternity',
        'Neonatal',
        'Dental',
        'Ophthalmology',
        'ENT',
        'Dermatology',
        'Urology',
        'Nephrology',
        'Endocrinology',
        'Gastroenterology',
        'Respiratory',
        'General Practice',
        'Allied Health',
        'Pharmacy',
        'Administration'
      ]
    },
    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    numberOfStaff: Number,
    location: String,
    phone: String,
    operatingHours: {
      startTime: String,
      endTime: String,
      available24Hours: Boolean
    }
  }],

  // Specialties Available
  specialties: [{
    type: String,
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
      'Plastic Surgery'
    ]
  }],

  // Operating Hours
  operatingHours: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    openTime: String,
    closeTime: String,
    is24Hours: Boolean
  }],
  emergencyServices: {
    available: {
      type: Boolean,
      default: false
    },
    available24Hours: {
      type: Boolean,
      default: false
    },
    traumaLevel: {
      type: String,
      enum: ['level-1', 'level-2', 'level-3', 'none']
    }
  },

  // Staff
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  medicalDirector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  ceo: {
    name: String,
    email: String,
    phone: String
  },

  // Accreditation
  accreditation: [{
    body: String,
    standard: String,
    dateAwarded: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['current', 'expired', 'pending', 'suspended']
    }
  }],

  // Insurance and Billing
  acceptedInsurances: [{
    provider: String,
    membershipTypes: [String]
  }],
  bulkBillingAvailable: {
    type: Boolean,
    default: false
  },
  medicareAgreement: {
    type: Boolean,
    default: true
  },

  // Parking and Accessibility
  parking: {
    available: {
      type: Boolean,
      default: false
    },
    spaces: Number,
    cost: String,
    disabledParking: {
      type: Boolean,
      default: false
    }
  },
  accessibility: {
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    hearingLoopAvailable: {
      type: Boolean,
      default: false
    },
    interpreterServicesAvailable: {
      type: Boolean,
      default: false
    }
  },

  // Public Transport
  publicTransport: [{
    type: {
      type: String,
      enum: ['train', 'bus', 'tram', 'ferry']
    },
    details: String,
    walkingDistance: String
  }],

  // Facilities
  facilities: [{
    type: String,
    enum: [
      'cafeteria',
      'chapel',
      'gift-shop',
      'atm',
      'wifi',
      'accommodation',
      'childcare',
      'pharmacy',
      'blood-collection',
      'imaging',
      'library'
    ]
  }],

  // Quality Metrics
  qualityMetrics: {
    patientSatisfactionScore: {
      type: Number,
      min: 0,
      max: 100
    },
    readmissionRate: Number,
    averageWaitTime: Number, // in minutes
    cleanlinessRating: {
      type: Number,
      min: 0,
      max: 5
    },
    staffRating: {
      type: Number,
      min: 0,
      max: 5
    }
  },

  // Statistics
  statistics: {
    totalPatientsSeen: {
      type: Number,
      default: 0
    },
    monthlyPatients: {
      type: Number,
      default: 0
    },
    emergencyVisits: {
      type: Number,
      default: 0
    },
    surgeries: {
      type: Number,
      default: 0
    },
    births: {
      type: Number,
      default: 0
    }
  },

  // Equipment
  equipment: [{
    name: String,
    type: String,
    manufacturer: String,
    model: String,
    serialNumber: String,
    purchaseDate: Date,
    warrantyExpiry: Date,
    lastServiceDate: Date,
    nextServiceDate: Date,
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'repair', 'decommissioned']
    }
  }],

  // COVID-19 Information
  covidInfo: {
    testingAvailable: {
      type: Boolean,
      default: false
    },
    vaccinationCentre: {
      type: Boolean,
      default: false
    },
    covidWard: {
      type: Boolean,
      default: false
    },
    visitorRestrictions: String
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
      max: 5
    },
    comment: String,
    category: {
      type: String,
      enum: ['cleanliness', 'staff', 'wait-time', 'facilities', 'overall']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  temporarilyClosed: {
    type: Boolean,
    default: false
  },
  closureReason: String,
  expectedReopenDate: Date,

  // System Fields
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: Date,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
HospitalSchema.index({ name: 1 });
HospitalSchema.index({ facilityType: 1 });
HospitalSchema.index({ 'address.postcode': 1 });
HospitalSchema.index({ 'address.state': 1 });
HospitalSchema.index({ specialties: 1 });
HospitalSchema.index({ bulkBillingAvailable: 1 });
HospitalSchema.index({ 'emergencyServices.available': 1 });

// Virtual for full address
HospitalSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.suburb}, ${this.address.state} ${this.address.postcode}`;
});

// Virtual for average rating
HospitalSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(2);
});

// Method to check if hospital is open
HospitalSchema.methods.isOpenNow = function() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todayHours = this.operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);

  if (!todayHours) return false;
  if (todayHours.is24Hours) return true;

  const [openHour, openMin] = todayHours.openTime.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.closeTime.split(':').map(Number);

  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime <= closeTime;
};

module.exports = mongoose.model('Hospital', HospitalSchema);
