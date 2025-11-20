const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');

// @desc    Create medical record
// @route   POST /api/medical-records
// @access  Private/Doctor
exports.createMedicalRecord = async (req, res, next) => {
  try {
    // Set doctor from authenticated user
    req.body.doctor = req.user.id;

    // Set signed by
    req.body.signedBy = req.user.id;
    req.body.signedDate = Date.now();

    const medicalRecord = await MedicalRecord.create(req.body);

    const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
      .populate('patient', 'firstName lastName dateOfBirth medicareNumber')
      .populate('doctor', 'firstName lastName specialty')
      .populate('hospital', 'name');

    res.status(201).json({
      success: true,
      data: populatedRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all medical records
// @route   GET /api/medical-records
// @access  Private
exports.getAllMedicalRecords = async (req, res, next) => {
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

    // Filter by record type
    if (req.query.recordType) {
      query.recordType = req.query.recordType;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.visitDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const total = await MedicalRecord.countDocuments(query);
    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName dateOfBirth medicareNumber')
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

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
// @access  Private
exports.getMedicalRecord = async (req, res, next) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'firstName lastName specialty phone')
      .populate('hospital', 'name address phone')
      .populate('appointment')
      .populate('prescriptions')
      .populate('procedures.performedBy', 'firstName lastName')
      .populate('referrals.doctor', 'firstName lastName specialty')
      .populate('signedBy', 'firstName lastName');

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    // Check authorization
    if (req.userRole === 'patient' && medicalRecord.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this medical record'
      });
    }

    // Add to access log
    medicalRecord.accessLog.push({
      user: req.user.id,
      userType: req.userRole,
      accessDate: Date.now(),
      action: 'view',
      ipAddress: req.ip
    });

    await medicalRecord.save();

    res.status(200).json({
      success: true,
      data: medicalRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Private/Doctor
exports.updateMedicalRecord = async (req, res, next) => {
  try {
    let medicalRecord = await MedicalRecord.findById(req.params.id);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    // Only the authoring doctor can update
    if (medicalRecord.doctor.toString() !== req.user.id && !['admin', 'staff'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this medical record'
      });
    }

    // If record is already approved, create amendment
    if (medicalRecord.approved) {
      medicalRecord.status = 'amended';
      medicalRecord.amendmentHistory.push({
        amendedBy: req.user.id,
        amendmentDate: Date.now(),
        reason: req.body.amendmentReason || 'Amendment',
        changes: JSON.stringify(req.body)
      });
    }

    medicalRecord = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('hospital', 'name');

    // Add to access log
    medicalRecord.accessLog.push({
      user: req.user.id,
      userType: req.userRole,
      accessDate: Date.now(),
      action: 'edit',
      ipAddress: req.ip
    });

    await medicalRecord.save();

    res.status(200).json({
      success: true,
      data: medicalRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get patient medical history
// @route   GET /api/medical-records/patient/:patientId/history
// @access  Private/Doctor
exports.getPatientMedicalHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.patientId)
      .select('allergies chronicConditions medications immunizations pastMedicalHistory pastSurgicalHistory familyHistory socialHistory');

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const medicalRecords = await MedicalRecord.find({
      patient: req.params.patientId
    })
      .select('visitDate recordType chiefComplaint diagnoses procedures')
      .sort({ visitDate: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        patientInfo: patient,
        recentRecords: medicalRecords
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Approve medical record
// @route   PUT /api/medical-records/:id/approve
// @access  Private/Doctor
exports.approveMedicalRecord = async (req, res, next) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    medicalRecord.approved = true;
    medicalRecord.approvedBy = req.user.id;
    medicalRecord.approvalDate = Date.now();

    await medicalRecord.save();

    res.status(200).json({
      success: true,
      data: medicalRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add attachment to medical record
// @route   POST /api/medical-records/:id/attachments
// @access  Private/Doctor
exports.addAttachment = async (req, res, next) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    medicalRecord.attachments.push({
      ...req.body,
      uploadedBy: req.user.id
    });

    await medicalRecord.save();

    res.status(201).json({
      success: true,
      data: medicalRecord.attachments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Search medical records
// @route   GET /api/medical-records/search
// @access  Private/Doctor/Admin
exports.searchMedicalRecords = async (req, res, next) => {
  try {
    const { patientName, diagnosis, dateFrom, dateTo, recordType } = req.query;

    let query = {};

    if (patientName) {
      const patients = await Patient.find({
        $or: [
          { firstName: { $regex: patientName, $options: 'i' } },
          { lastName: { $regex: patientName, $options: 'i' } }
        ]
      }).select('_id');

      query.patient = { $in: patients.map(p => p._id) };
    }

    if (diagnosis) {
      query['diagnoses.condition'] = { $regex: diagnosis, $options: 'i' };
    }

    if (dateFrom && dateTo) {
      query.visitDate = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      };
    }

    if (recordType) {
      query.recordType = recordType;
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName dateOfBirth medicareNumber')
      .populate('doctor', 'firstName lastName')
      .sort({ visitDate: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
