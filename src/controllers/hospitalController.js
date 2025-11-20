const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');

// @desc    Get all hospitals/clinics
// @route   GET /api/hospitals
// @access  Public
exports.getAllHospitals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    // Filter by facility type
    if (req.query.facilityType) {
      query.facilityType = req.query.facilityType;
    }

    // Filter by location
    if (req.query.suburb) {
      query['address.suburb'] = { $regex: req.query.suburb, $options: 'i' };
    }

    if (req.query.postcode) {
      query['address.postcode'] = req.query.postcode;
    }

    if (req.query.state) {
      query['address.state'] = req.query.state;
    }

    // Filter by services
    if (req.query.emergency) {
      query['emergencyServices.available'] = req.query.emergency === 'true';
    }

    if (req.query.bulkBilling) {
      query.bulkBillingAvailable = req.query.bulkBilling === 'true';
    }

    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Hospital.countDocuments(query);
    const hospitals = await Hospital.find(query)
      .populate('medicalDirector', 'firstName lastName specialty')
      .populate('doctors', 'firstName lastName specialty')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: hospitals.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
// @access  Public
exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate('medicalDirector', 'firstName lastName specialty phone email')
      .populate('doctors', 'firstName lastName specialty acceptingNewPatients bulkBillingAvailable')
      .populate('departments.headOfDepartment', 'firstName lastName');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create hospital
// @route   POST /api/hospitals
// @access  Private/Admin
exports.createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);

    res.status(201).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Private/Admin
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
// @access  Private/Admin
exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    hospital.isActive = false;
    await hospital.save();

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

// @desc    Get hospital doctors
// @route   GET /api/hospitals/:id/doctors
// @access  Public
exports.getHospitalDoctors = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    const doctors = await Doctor.find({
      $or: [
        { primaryWorkplace: req.params.id },
        { 'workplaces.hospitalId': req.params.id, 'workplaces.isActive': true }
      ],
      isActive: true
    })
      .select('title firstName lastName specialty acceptingNewPatients bulkBillingAvailable statistics')
      .sort({ lastName: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add review to hospital
// @route   POST /api/hospitals/:id/reviews
// @access  Private/Patient
exports.addReview = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    hospital.reviews.push({
      patientId: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
      category: req.body.category
    });

    await hospital.save();

    res.status(201).json({
      success: true,
      data: hospital.reviews
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Search hospitals
// @route   GET /api/hospitals/search
// @access  Public
exports.searchHospitals = async (req, res, next) => {
  try {
    const { name, suburb, postcode, facilityType, specialty } = req.query;

    let query = { isActive: true };

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (suburb) {
      query['address.suburb'] = { $regex: suburb, $options: 'i' };
    }

    if (postcode) {
      query['address.postcode'] = postcode;
    }

    if (facilityType) {
      query.facilityType = facilityType;
    }

    if (specialty) {
      query.specialties = { $in: [specialty] };
    }

    const hospitals = await Hospital.find(query)
      .select('name facilityType address phone emergencyServices bulkBillingAvailable specialties')
      .limit(50);

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get hospital statistics
// @route   GET /api/hospitals/:id/statistics
// @access  Private/Admin
exports.getHospitalStatistics = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id).select('statistics qualityMetrics');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        statistics: hospital.statistics,
        qualityMetrics: hospital.qualityMetrics,
        averageRating: hospital.averageRating
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
