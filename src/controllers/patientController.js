const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const { sendTokenResponse } = require('../middleware/auth');

// @desc    Register new patient
// @route   POST /api/patients/register
// @access  Public
exports.registerPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);

    sendTokenResponse(patient, 201, res, 'patient');
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login patient
// @route   POST /api/patients/login
// @access  Public
exports.loginPatient = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const patient = await Patient.findOne({ email }).select('+password');

    if (!patient) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await patient.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    patient.lastLogin = Date.now();
    await patient.save();

    sendTokenResponse(patient, 200, res, 'patient');
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current patient
// @route   GET /api/patients/me
// @access  Private/Patient
exports.getMe = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.user.id)
      .populate('primaryDoctor', 'firstName lastName specialty phone')
      .populate('specialists.doctorId', 'firstName lastName specialty');

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update patient details
// @route   PUT /api/patients/me
// @access  Private/Patient
exports.updateMe = async (req, res, next) => {
  try {
    // Fields that are not allowed to be updated
    const restrictedFields = ['medicareNumber', 'irnNumber', 'password', 'role'];
    restrictedFields.forEach(field => delete req.body[field]);

    const patient = await Patient.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Admin/Staff/Doctor
exports.getAllPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Search by name
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { medicareNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by doctor (if doctor is making the request)
    if (req.userRole === 'doctor') {
      query.$or = [
        { primaryDoctor: req.user.id },
        { 'specialists.doctorId': req.user.id }
      ];
    }

    // Filter by active status
    if (req.query.isActive) {
      query.isActive = req.query.isActive === 'true';
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .select('-password')
      .populate('primaryDoctor', 'firstName lastName specialty')
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: patients.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private/Admin/Staff/Doctor
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .select('-password')
      .populate('primaryDoctor', 'firstName lastName specialty phone email')
      .populate('specialists.doctorId', 'firstName lastName specialty')
      .populate('specialists.referredBy', 'firstName lastName')
      .populate('medications.prescribedBy', 'firstName lastName');

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new patient (admin/staff)
// @route   POST /api/patients
// @access  Private/Admin/Staff
exports.createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private/Admin/Staff/Doctor
exports.updatePatient = async (req, res, next) => {
  try {
    // Restrict certain fields from being updated
    if (req.userRole === 'doctor') {
      const allowedFields = ['medications', 'allergies', 'chronicConditions', 'immunizations'];
      const updateData = {};
      allowedFields.forEach(field => {
        if (req.body[field]) updateData[field] = req.body[field];
      });
      req.body = updateData;
    }

    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private/Admin
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Soft delete - just deactivate
    patient.isActive = false;
    await patient.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get patient appointments
// @route   GET /api/patients/:id/appointments
// @access  Private
exports.getPatientAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { patient: req.params.id };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.appointmentDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('doctor', 'firstName lastName specialty')
      .populate('hospital', 'name address')
      .sort({ appointmentDate: -1, startTime: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get patient medical records
// @route   GET /api/patients/:id/medical-records
// @access  Private
exports.getPatientMedicalRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { patient: req.params.id };

    // Filter by record type
    if (req.query.recordType) {
      query.recordType = req.query.recordType;
    }

    const total = await MedicalRecord.countDocuments(query);
    const records = await MedicalRecord.find(query)
      .populate('doctor', 'firstName lastName specialty')
      .populate('hospital', 'name')
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get patient prescriptions
// @route   GET /api/patients/:id/prescriptions
// @access  Private
exports.getPatientPrescriptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { patient: req.params.id };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
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

// @desc    Add allergy to patient
// @route   POST /api/patients/:id/allergies
// @access  Private/Doctor
exports.addAllergy = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    patient.allergies.push(req.body);
    await patient.save();

    res.status(200).json({
      success: true,
      data: patient.allergies
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add chronic condition to patient
// @route   POST /api/patients/:id/chronic-conditions
// @access  Private/Doctor
exports.addChronicCondition = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    patient.chronicConditions.push(req.body);
    await patient.save();

    res.status(200).json({
      success: true,
      data: patient.chronicConditions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Search patients
// @route   GET /api/patients/search
// @access  Private/Staff/Doctor
exports.searchPatients = async (req, res, next) => {
  try {
    const { q, medicareNumber, dateOfBirth, postcode } = req.query;

    let query = {};

    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    if (medicareNumber) {
      query.medicareNumber = medicareNumber;
    }

    if (dateOfBirth) {
      query.dateOfBirth = new Date(dateOfBirth);
    }

    if (postcode) {
      query['address.postcode'] = postcode;
    }

    const patients = await Patient.find(query)
      .select('firstName lastName dateOfBirth medicareNumber email phone address')
      .limit(50);

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
