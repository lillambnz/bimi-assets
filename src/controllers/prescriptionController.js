const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Medication = require('../models/Medication');

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
exports.createPrescription = async (req, res, next) => {
  try {
    // Verify patient exists
    const patient = await Patient.findById(req.body.patient);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Set doctor from authenticated user
    req.body.doctor = req.user.id;

    // Get doctor details for signature
    const doctor = await Doctor.findById(req.user.id);
    req.body.prescribedBy = {
      name: doctor.fullName,
      ahpraNumber: doctor.ahpraNumber,
      medicareProviderNumber: doctor.medicareProviderNumber,
      prescribingNumber: doctor.prescribingNumber,
      signatureDate: Date.now()
    };

    const prescription = await Prescription.create(req.body);

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'firstName lastName dateOfBirth medicareNumber')
      .populate('doctor', 'firstName lastName specialty')
      .populate('medications.medicationId');

    res.status(201).json({
      success: true,
      data: populatedPrescription
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
exports.getAllPrescriptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by user role
    if (req.userRole === 'patient') {
      query.patient = req.user.id;
    } else if (req.userRole === 'doctor') {
      query.doctor = req.user.id;
    }

    // Filter by patient
    if (req.query.patient) {
      query.patient = req.query.patient;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.prescriptionDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName dateOfBirth medicareNumber')
      .populate('doctor', 'firstName lastName specialty')
      .populate('hospital', 'name')
      .populate('medications.medicationId', 'genericName brandNames')
      .sort({ prescriptionDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
exports.getPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth medicareNumber address')
      .populate('doctor', 'firstName lastName specialty phone')
      .populate('hospital', 'name address phone')
      .populate('medications.medicationId');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    // Check authorization
    if (req.userRole === 'patient' && prescription.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this prescription'
      });
    }

    if (req.userRole === 'doctor' && prescription.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this prescription'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private/Doctor
exports.updatePrescription = async (req, res, next) => {
  try {
    let prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    // Only the prescribing doctor can update
    if (prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this prescription'
      });
    }

    // Cannot update dispensed prescriptions
    if (prescription.status === 'dispensed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update a dispensed prescription'
      });
    }

    prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('medications.medicationId');

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Cancel prescription
// @route   PUT /api/prescriptions/:id/cancel
// @access  Private/Doctor
exports.cancelPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    if (prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this prescription'
      });
    }

    prescription.status = 'cancelled';
    prescription.cancelled = true;
    prescription.cancellationReason = req.body.reason;
    prescription.cancelledBy = req.user.id;
    prescription.cancellationDate = Date.now();

    await prescription.save();

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Dispense prescription
// @route   POST /api/prescriptions/:id/dispense
// @access  Private/Pharmacist
exports.dispensePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    if (prescription.status === 'cancelled' || prescription.status === 'expired') {
      return res.status(400).json({
        success: false,
        error: 'Prescription cannot be dispensed'
      });
    }

    if (prescription.isExpired) {
      return res.status(400).json({
        success: false,
        error: 'Prescription has expired'
      });
    }

    const { pharmacyInfo, medicationsDispensed } = req.body;

    await prescription.dispense(pharmacyInfo, medicationsDispensed);

    // Add to access log
    prescription.accessLog.push({
      accessedBy: req.user.id,
      accessDate: Date.now(),
      action: 'dispensed'
    });

    await prescription.save();

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get active prescriptions for patient
// @route   GET /api/prescriptions/patient/:patientId/active
// @access  Private
exports.getActivePatientPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.params.patientId,
      status: 'active',
      expiryDate: { $gte: new Date() }
    })
      .populate('doctor', 'firstName lastName specialty')
      .populate('medications.medicationId', 'genericName brandNames')
      .sort({ prescriptionDate: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Print prescription
// @route   GET /api/prescriptions/:id/print
// @access  Private/Doctor
exports.printPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate('doctor')
      .populate('hospital')
      .populate('medications.medicationId');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    prescription.printedCount += 1;
    prescription.lastPrintedDate = Date.now();

    prescription.accessLog.push({
      accessedBy: req.user.id,
      accessDate: Date.now(),
      action: 'printed'
    });

    await prescription.save();

    // Here you would generate a PDF or formatted document
    // For now, return the prescription data

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Check drug interactions
// @route   POST /api/prescriptions/check-interactions
// @access  Private/Doctor
exports.checkDrugInteractions = async (req, res, next) => {
  try {
    const { patientId, newMedications } = req.body;

    // Get patient's current medications
    const patient = await Patient.findById(patientId).populate('medications.medicationId');

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Get details of new medications
    const newMeds = await Medication.find({ _id: { $in: newMedications } });

    const interactions = [];

    // Check for interactions between current and new medications
    for (const currentMed of patient.medications) {
      if (currentMed.medicationId) {
        for (const newMed of newMeds) {
          const interaction = currentMed.medicationId.checkInteractionWith(newMed.genericName);
          if (interaction) {
            interactions.push({
              medication1: currentMed.medicationId.genericName,
              medication2: newMed.genericName,
              interactionType: interaction.interactionType,
              effect: interaction.effect,
              management: interaction.management
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      hasInteractions: interactions.length > 0,
      interactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get expiring prescriptions
// @route   GET /api/prescriptions/expiring
// @access  Private
exports.getExpiringPrescriptions = async (req, res, next) => {
  try {
    const daysAhead = parseInt(req.query.days) || 30;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    let query = {
      expiryDate: {
        $gte: today,
        $lte: futureDate
      },
      status: 'active'
    };

    if (req.userRole === 'patient') {
      query.patient = req.user.id;
    } else if (req.userRole === 'doctor') {
      query.doctor = req.user.id;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName phone email')
      .populate('doctor', 'firstName lastName')
      .populate('medications.medicationId', 'genericName')
      .sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
