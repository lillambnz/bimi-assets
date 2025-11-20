const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const { sendTokenResponse } = require('../middleware/auth');

// @desc    Register new doctor
// @route   POST /api/doctors/register
// @access  Public
exports.registerDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);

    sendTokenResponse(doctor, 201, res, 'doctor');
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login doctor
// @route   POST /api/doctors/login
// @access  Public
exports.loginDoctor = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await doctor.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    doctor.lastLogin = Date.now();
    await doctor.save();

    sendTokenResponse(doctor, 200, res, 'doctor');
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    // Filter by specialty
    if (req.query.specialty) {
      query.specialty = req.query.specialty;
    }

    // Filter by hospital
    if (req.query.hospital) {
      query.primaryWorkplace = req.query.hospital;
    }

    // Filter accepting new patients
    if (req.query.acceptingNewPatients) {
      query.acceptingNewPatients = req.query.acceptingNewPatients === 'true';
    }

    // Filter bulk billing
    if (req.query.bulkBilling) {
      query.bulkBillingAvailable = req.query.bulkBilling === 'true';
    }

    // Filter by location
    if (req.query.postcode) {
      query['address.postcode'] = req.query.postcode;
    }

    if (req.query.state) {
      query['address.state'] = req.query.state;
    }

    // Search by name
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort = { 'statistics.patientSatisfactionRating': -1 };
    }

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .select('-password')
      .populate('primaryWorkplace', 'name address phone')
      .populate('workplaces.hospitalId', 'name address')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('-password')
      .populate('primaryWorkplace', 'name address phone email website')
      .populate('workplaces.hospitalId', 'name address phone')
      .populate('reviews.patientId', 'firstName lastName');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private/Doctor
exports.updateDoctor = async (req, res, next) => {
  try {
    // Restrict certain fields from being updated by doctor themselves
    const restrictedFields = ['ahpraNumber', 'medicareProviderNumber', 'isVerified', 'role'];
    restrictedFields.forEach(field => delete req.body[field]);

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get doctor's patients
// @route   GET /api/doctors/:id/patients
// @access  Private/Doctor
exports.getDoctorPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { primaryDoctor: req.params.id },
        { 'specialists.doctorId': req.params.id }
      ]
    };

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .select('firstName lastName dateOfBirth medicareNumber phone email address')
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

// @desc    Get doctor's appointments
// @route   GET /api/doctors/:id/appointments
// @access  Private/Doctor
exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { doctor: req.params.id };

    // Filter by date
    if (req.query.date) {
      const date = new Date(req.query.date);
      query.appointmentDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName dateOfBirth medicareNumber phone')
      .populate('hospital', 'name address phone')
      .sort({ appointmentDate: 1, startTime: 1 })
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

// @desc    Get doctor's schedule
// @route   GET /api/doctors/:id/schedule
// @access  Public
exports.getDoctorSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('workingHours leaveSchedule')
      .populate('workingHours.location', 'name address phone');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Get appointments for the next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = await Appointment.find({
      doctor: req.params.id,
      appointmentDate: {
        $gte: today,
        $lte: nextWeek
      },
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('appointmentDate startTime endTime status');

    res.status(200).json({
      success: true,
      data: {
        workingHours: doctor.workingHours,
        leaveSchedule: doctor.leaveSchedule,
        upcomingAppointments: appointments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add review to doctor
// @route   POST /api/doctors/:id/reviews
// @access  Private/Patient
exports.addReview = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Check if patient has had an appointment with this doctor
    const appointment = await Appointment.findOne({
      patient: req.user.id,
      doctor: req.params.id,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(400).json({
        success: false,
        error: 'You can only review doctors you have had appointments with'
      });
    }

    // Check if patient has already reviewed this doctor
    const existingReview = doctor.reviews.find(
      review => review.patientId && review.patientId.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this doctor'
      });
    }

    // Add review
    doctor.reviews.push({
      patientId: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
      anonymous: req.body.anonymous || false
    });

    // Update statistics
    doctor.statistics.totalReviews = doctor.reviews.length;
    doctor.statistics.patientSatisfactionRating = doctor.calculateAverageRating();

    await doctor.save();

    res.status(201).json({
      success: true,
      data: doctor.reviews
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get doctor availability
// @route   GET /api/doctors/:id/availability
// @access  Public
exports.getDoctorAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a date'
      });
    }

    const doctor = await Doctor.findById(req.params.id).select('workingHours consultationTypes');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Check if doctor works on this day
    const workingHoursForDay = doctor.workingHours.filter(wh => wh.dayOfWeek === dayOfWeek);

    if (workingHoursForDay.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          available: false,
          message: 'Doctor does not work on this day'
        }
      });
    }

    // Get existing appointments for this day
    const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      doctor: req.params.id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('startTime endTime duration');

    // Generate available time slots
    const availableSlots = [];
    const consultationDuration = doctor.consultationTypes[0]?.duration || 30;

    workingHoursForDay.forEach(workingHour => {
      const [startHour, startMin] = workingHour.startTime.split(':').map(Number);
      const [endHour, endMin] = workingHour.endTime.split(':').map(Number);

      let currentTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      while (currentTime + consultationDuration <= endTime) {
        const slotStartHour = Math.floor(currentTime / 60);
        const slotStartMin = currentTime % 60;
        const slotStart = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;

        // Check if slot is already booked
        const isBooked = appointments.some(apt => apt.startTime === slotStart);

        if (!isBooked) {
          availableSlots.push(slotStart);
        }

        currentTime += consultationDuration;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        available: availableSlots.length > 0,
        date: date,
        slots: availableSlots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Search doctors by specialty and location
// @route   GET /api/doctors/search
// @access  Public
exports.searchDoctors = async (req, res, next) => {
  try {
    const { specialty, postcode, suburb, state, bulkBilling, acceptingPatients } = req.query;

    let query = { isActive: true, isVerified: true };

    if (specialty) {
      query.specialty = { $regex: specialty, $options: 'i' };
    }

    if (postcode) {
      query['address.postcode'] = postcode;
    }

    if (suburb) {
      query['address.suburb'] = { $regex: suburb, $options: 'i' };
    }

    if (state) {
      query['address.state'] = state;
    }

    if (bulkBilling === 'true') {
      query.bulkBillingAvailable = true;
    }

    if (acceptingPatients === 'true') {
      query.acceptingNewPatients = true;
    }

    const doctors = await Doctor.find(query)
      .select('title firstName lastName specialty address phone bulkBillingAvailable acceptingNewPatients statistics')
      .populate('primaryWorkplace', 'name address')
      .sort({ 'statistics.patientSatisfactionRating': -1 })
      .limit(50);

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

// @desc    Get doctor statistics
// @route   GET /api/doctors/:id/statistics
// @access  Private/Doctor
exports.getDoctorStatistics = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('statistics');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Get appointment statistics
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const appointmentStats = await Appointment.aggregate([
      { $match: { doctor: doctor._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      appointmentDate: { $gte: thisMonth }
    });

    res.status(200).json({
      success: true,
      data: {
        doctorStatistics: doctor.statistics,
        appointmentStatistics: appointmentStats,
        monthlyAppointments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
