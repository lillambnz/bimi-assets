const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  // Invoice Information
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  invoiceDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },

  // References
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
    ref: 'Hospital',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },

  // Billing Type
  billingType: {
    type: String,
    required: true,
    enum: [
      'consultation',
      'procedure',
      'surgery',
      'diagnostic',
      'emergency',
      'hospital-admission',
      'pathology',
      'radiology',
      'other'
    ]
  },

  // Service Items (MBS)
  serviceItems: [{
    mbsItemNumber: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: String,
    serviceDate: {
      type: Date,
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    scheduleFee: {
      type: Number,
      required: true
    },
    medicareRebate: {
      type: Number,
      required: true
    },
    chargedAmount: {
      type: Number,
      required: true
    },
    gapPayment: {
      type: Number,
      required: true
    },

    // Medicare Claiming
    eligibleForMedicare: {
      type: Boolean,
      default: true
    },
    bulkBilled: {
      type: Boolean,
      default: false
    },
    medicareClaimNumber: String,
    medicareClaimStatus: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'rejected', 'paid']
    },
    medicareClaimDate: Date,
    medicarePaymentDate: Date,
    medicareReferenceNumber: String,

    // DVA Claiming
    dvaEligible: {
      type: Boolean,
      default: false
    },
    dvaClaimNumber: String,
    dvaClaimStatus: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'rejected', 'paid']
    }
  }],

  // Additional Charges
  additionalCharges: [{
    description: String,
    amount: Number,
    taxable: {
      type: Boolean,
      default: false
    }
  }],

  // Discounts
  discounts: [{
    description: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed-amount']
    },
    value: Number,
    amount: Number,
    reason: String
  }],

  // Financial Summary
  subtotal: {
    type: Number,
    required: true
  },
  gst: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  medicareRebateTotal: {
    type: Number,
    default: 0
  },
  healthInsurancePayment: {
    type: Number,
    default: 0
  },
  patientPaymentAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    required: true
  },

  // Medicare Information
  medicareDetails: {
    medicareNumber: String,
    irnNumber: String,
    medicareCardExpiry: Date,
    claimType: {
      type: String,
      enum: ['patient-claim', 'bulk-bill', 'no-claim']
    },
    referralRequired: Boolean,
    referralProvided: Boolean,
    referralDate: Date,
    referralValidUntil: Date,
    referringDoctor: {
      name: String,
      providerNumber: String
    }
  },

  // Health Insurance
  healthInsurance: {
    provider: String,
    membershipNumber: String,
    policyNumber: String,
    claimNumber: String,
    claimStatus: {
      type: String,
      enum: ['not-claimed', 'pending', 'submitted', 'approved', 'rejected', 'paid']
    },
    claimDate: Date,
    expectedPayment: Number,
    actualPayment: Number,
    paymentDate: Date,
    rejectionReason: String
  },

  // DVA Details
  dvaDetails: {
    isDvaMember: Boolean,
    dvaCardType: {
      type: String,
      enum: ['gold', 'white', 'orange']
    },
    dvaNumber: String,
    treatmentCovered: Boolean
  },

  // Concession
  concessionDetails: {
    hasConcession: Boolean,
    concessionType: {
      type: String,
      enum: ['healthcare-card', 'pensioner-card', 'dva', 'safety-net']
    },
    cardNumber: String,
    expiryDate: Date
  },

  // PBS Safety Net
  pbsSafetyNet: {
    applies: Boolean,
    thresholdReached: Boolean,
    cardNumber: String,
    recordedAmount: Number
  },

  // Payment Information
  payments: [{
    paymentDate: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        'cash',
        'credit-card',
        'debit-card',
        'eftpos',
        'bank-transfer',
        'medicare',
        'health-insurance',
        'dva',
        'cheque',
        'other'
      ]
    },
    reference: String,
    transactionId: String,
    cardLast4Digits: String,
    cardType: String,
    receiptNumber: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'payments.processedByModel'
    },
    processedByModel: {
      type: String,
      enum: ['Doctor', 'Staff', 'Patient']
    },
    notes: String
  }],

  // Status
  paymentStatus: {
    type: String,
    required: true,
    enum: [
      'unpaid',
      'partially-paid',
      'paid',
      'overdue',
      'cancelled',
      'refunded',
      'written-off'
    ],
    default: 'unpaid'
  },

  // Bulk Billing
  bulkBilled: {
    type: Boolean,
    default: false
  },
  bulkBillingDate: Date,

  // Reminders and Follow-ups
  reminders: [{
    reminderDate: Date,
    reminderType: {
      type: String,
      enum: ['email', 'sms', 'letter', 'phone']
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed']
    },
    sentDate: Date
  }],

  // Write-off
  writtenOff: {
    type: Boolean,
    default: false
  },
  writeOffReason: String,
  writeOffDate: Date,
  writeOffAmount: Number,
  authorizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },

  // Refund
  refund: {
    refunded: {
      type: Boolean,
      default: false
    },
    refundDate: Date,
    refundAmount: Number,
    refundMethod: String,
    refundReason: String,
    refundReference: String
  },

  // Credit Notes
  creditNotes: [{
    creditNoteNumber: String,
    date: Date,
    amount: Number,
    reason: String
  }],

  // Payment Plan
  paymentPlan: {
    active: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    numberOfInstallments: Number,
    installmentAmount: Number,
    frequency: {
      type: String,
      enum: ['weekly', 'fortnightly', 'monthly']
    },
    nextPaymentDate: Date,
    installmentsPaid: {
      type: Number,
      default: 0
    }
  },

  // Tax Information
  taxInvoice: {
    type: Boolean,
    default: false
  },
  abn: String,
  taxBreakdown: {
    gstIncluded: Boolean,
    gstRate: {
      type: Number,
      default: 10
    },
    gstAmount: Number,
    gstFreeItems: Number
  },

  // Printing and Delivery
  printed: {
    type: Boolean,
    default: false
  },
  printedDate: Date,
  printCount: {
    type: Number,
    default: 0
  },
  emailedToPatient: {
    type: Boolean,
    default: false
  },
  emailDate: Date,

  // Notes
  billingNotes: String,
  internalNotes: String,

  // Audit Trail
  auditLog: [{
    action: String,
    performedBy: mongoose.Schema.Types.ObjectId,
    performedAt: {
      type: Date,
      default: Date.now
    },
    changes: String,
    ipAddress: String
  }],

  // Disputes
  disputed: {
    type: Boolean,
    default: false
  },
  disputeDetails: {
    disputeDate: Date,
    disputeReason: String,
    disputeStatus: {
      type: String,
      enum: ['open', 'under-review', 'resolved', 'rejected']
    },
    resolutionDate: Date,
    resolutionNotes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
BillingSchema.index({ invoiceNumber: 1 });
BillingSchema.index({ patient: 1, invoiceDate: -1 });
BillingSchema.index({ doctor: 1 });
BillingSchema.index({ hospital: 1 });
BillingSchema.index({ paymentStatus: 1 });
BillingSchema.index({ dueDate: 1 });
BillingSchema.index({ 'medicareDetails.medicareNumber': 1 });

// Generate invoice number
BillingSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.invoiceNumber = `INV${year}${month}${random}`;
  }

  // Calculate balance
  this.balance = this.patientPaymentAmount - this.amountPaid;

  // Update payment status based on balance
  if (this.balance <= 0) {
    this.paymentStatus = 'paid';
  } else if (this.amountPaid > 0 && this.balance > 0) {
    this.paymentStatus = 'partially-paid';
  } else if (new Date() > new Date(this.dueDate) && this.balance > 0) {
    this.paymentStatus = 'overdue';
  }

  next();
});

// Virtual for is overdue
BillingSchema.virtual('isOverdue').get(function() {
  return new Date() > new Date(this.dueDate) && this.balance > 0;
});

// Virtual for days overdue
BillingSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;

  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = now - due;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to add payment
BillingSchema.methods.addPayment = function(paymentData) {
  this.payments.push(paymentData);
  this.amountPaid += paymentData.amount;
  this.balance = this.patientPaymentAmount - this.amountPaid;

  if (this.balance <= 0) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partially-paid';
  }

  return this.save();
};

// Method to calculate Medicare rebate
BillingSchema.methods.calculateMedicareRebate = function() {
  let totalRebate = 0;
  this.serviceItems.forEach(item => {
    if (item.eligibleForMedicare) {
      totalRebate += item.medicareRebate * item.quantity;
    }
  });
  return totalRebate;
};

module.exports = mongoose.model('Billing', BillingSchema);
