const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  try {
    // Verify patient exists
    const patient = await Patient.findById(req.body.patient);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(req.body.doctor);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Verify hospital exists
    const hospital = await Hospital.findById(req.body.hospital);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital/Clinic not found'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctor: req.body.doctor,
      appointmentDate: req.body.appointmentDate,
      startTime: req.body.startTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        error: 'This time slot is already booked'
      });
    }

    // Set created by
    req.body.createdBy = {
      userType: req.userRole,
      userId: req.user._id
    };

    const appointment = await Appointment.create(req.body);

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName dateOfBirth medicareNumber phone')
      .populate('doctor', 'firstName lastName specialty')
      .populate('hospital', 'name address phone');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAllAppointments = async (req, res, next) => {
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

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.appointmentDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.date) {
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

    // Filter by doctor
    if (req.query.doctor) {
      query.doctor = req.query.doctor;
    }

    // Filter by patient
    if (req.query.patient) {
      query.patient = req.query.patient;
    }

    // Filter by hospital
    if (req.query.hospital) {
      query.hospital = req.query.hospital;
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName dateOfBirth medicareNumber phone')
      .populate('doctor', 'firstName lastName specialty phone')
      .populate('hospital', 'name address phone')
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

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth medicareNumber phone address')
      .populate('doctor', 'firstName lastName specialty phone email')
      .populate('hospital', 'name address phone')
      .populate('prescriptions');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.userRole === 'patient' && appointment.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this appointment'
      });
    }

    if (req.userRole === 'doctor' && appointment.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Patients can only update certain fields
    if (req.userRole === 'patient') {
      const allowedFields = ['reasonForVisit', 'symptoms'];
      const updateData = {};
      allowedFields.forEach(field => {
        if (req.body[field]) updateData[field] = req.body[field];
      });
      req.body = updateData;
    }

    // Add to modification log
    req.body.$push = {
      modifiedBy: {
        userType: req.userRole,
        userId: req.user._id,
        modifiedAt: Date.now(),
        changes: JSON.stringify(req.body)
      }
    };

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialty')
      .populate('hospital', 'name address');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Check if appointment can be cancelled
    if (!['scheduled', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        error: 'Appointment cannot be cancelled'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason;
    appointment.cancelledBy = req.userRole;
    appointment.cancellationDate = Date.now();

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const { appointmentDate, startTime, endTime } = req.body;

    // Check for conflicts
    const conflict = await Appointment.findOne({
      doctor: appointment.doctor,
      appointmentDate: appointmentDate,
      startTime: startTime,
      status: { $in: ['scheduled', 'confirmed'] },
      _id: { $ne: appointment._id }
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        error: 'The new time slot is already booked'
      });
    }

    appointment.appointmentDate = appointmentDate;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.status = 'rescheduled';

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Check in to appointment
// @route   PUT /api/appointments/:id/checkin
// @access  Private
exports.checkInAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    if (appointment.status !== 'scheduled' && appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: 'Appointment cannot be checked in'
      });
    }

    appointment.status = 'checked-in';
    appointment.checkInTime = Date.now();
    appointment.checkInMethod = req.body.checkInMethod || 'reception';

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Start consultation
// @route   PUT /api/appointments/:id/start
// @access  Private/Doctor
exports.startConsultation = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    appointment.status = 'in-progress';
    appointment.consultationStartTime = Date.now();

    // Calculate wait time
    if (appointment.checkInTime) {
      appointment.actualWaitTime = appointment.calculateWaitTime();
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Complete appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private/Doctor
exports.completeAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    appointment.status = 'completed';
    appointment.consultationEndTime = Date.now();

    // Calculate actual duration
    if (appointment.consultationStartTime) {
      const durationMs = appointment.consultationEndTime - appointment.consultationStartTime;
      appointment.actualDuration = Math.round(durationMs / (1000 * 60));
    }

    // Add clinical data if provided
    if (req.body.vitalSigns) appointment.vitalSigns = req.body.vitalSigns;
    if (req.body.diagnosis) appointment.diagnosis = req.body.diagnosis;
    if (req.body.treatment) appointment.treatment = req.body.treatment;
    if (req.body.clinicalNotes) appointment.clinicalNotes = req.body.clinicalNotes;
    if (req.body.followUpRequired !== undefined) appointment.followUpRequired = req.body.followUpRequired;
    if (req.body.followUpDate) appointment.followUpDate = req.body.followUpDate;

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Mark appointment as no-show
// @route   PUT /api/appointments/:id/no-show
// @access  Private/Staff/Doctor
exports.markNoShow = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    appointment.status = 'no-show';
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get today's appointments
// @route   GET /api/appointments/today
// @access  Private
exports.getTodaysAppointments = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    let query = {
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };

    if (req.userRole === 'doctor') {
      query.doctor = req.user.id;
    } else if (req.userRole === 'patient') {
      query.patient = req.user.id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialty')
      .populate('hospital', 'name address')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/appointments/upcoming
// @access  Private
exports.getUpcomingAppointments = async (req, res, next) => {
  try {
    const today = new Date();
    const limit = parseInt(req.query.limit) || 10;

    let query = {
      appointmentDate: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] }
    };

    if (req.userRole === 'patient') {
      query.patient = req.user.id;
    } else if (req.userRole === 'doctor') {
      query.doctor = req.user.id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialty')
      .populate('hospital', 'name address phone')
      .sort({ appointmentDate: 1, startTime: 1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/statistics
// @access  Private/Admin/Staff
exports.getAppointmentStatistics = async (req, res, next) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const stats = await Appointment.aggregate([
      {
        $facet: {
          statusCount: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          monthlyCount: [
            { $match: { appointmentDate: { $gte: thisMonth } } },
            { $count: 'count' }
          ],
          todayCount: [
            {
              $match: {
                appointmentDate: {
                  $gte: new Date(today.setHours(0, 0, 0, 0)),
                  $lt: new Date(today.setHours(23, 59, 59, 999))
                }
              }
            },
            { $count: 'count' }
          ],
          avgWaitTime: [
            { $match: { actualWaitTime: { $exists: true, $ne: null } } },
            { $group: { _id: null, avgWait: { $avg: '$actualWaitTime' } } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
