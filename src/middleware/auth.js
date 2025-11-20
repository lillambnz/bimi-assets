const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');

// Protect routes - general authentication
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    let user;
    switch (decoded.role) {
      case 'patient':
        user = await Patient.findById(decoded.id).select('-password');
        break;
      case 'doctor':
      case 'gp':
      case 'specialist':
        user = await Doctor.findById(decoded.id).select('-password');
        break;
      case 'staff':
      case 'admin':
      case 'reception':
        user = await Staff.findById(decoded.id).select('-password');
        break;
      default:
        return res.status(401).json({
          success: false,
          message: 'Invalid user role'
        });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    req.user = user;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.userRole} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check ownership - patient can only access their own data
exports.checkOwnership = async (req, res, next) => {
  try {
    // Admin and staff can access any patient data
    if (['admin', 'staff', 'reception'].includes(req.userRole)) {
      return next();
    }

    // Doctors can access their assigned patients
    if (['doctor', 'gp', 'specialist'].includes(req.userRole)) {
      const patientId = req.params.patientId || req.params.id;
      const patient = await Patient.findById(patientId);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Check if doctor is the primary doctor or in specialists list
      const isDoctorAuthorized =
        patient.primaryDoctor && patient.primaryDoctor.toString() === req.user._id.toString() ||
        patient.specialists.some(spec => spec.doctorId.toString() === req.user._id.toString());

      if (!isDoctorAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this patient data'
        });
      }

      return next();
    }

    // Patients can only access their own data
    if (req.userRole === 'patient') {
      const patientId = req.params.patientId || req.params.id;

      if (patientId && patientId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this data'
        });
      }

      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  } catch (error) {
    console.error('Ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization check'
    });
  }
};

// Check if doctor is verified
exports.requireVerifiedDoctor = async (req, res, next) => {
  if (!['doctor', 'gp', 'specialist'].includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Only doctors can access this route'
    });
  }

  const doctor = await Doctor.findById(req.user._id);

  if (!doctor.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Doctor account must be verified to perform this action'
    });
  }

  next();
};

// Generate JWT token
exports.generateToken = (user, role) => {
  return jwt.sign(
    {
      id: user._id,
      role: role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res, role) => {
  const token = exports.generateToken(user, role);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.fullName || `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: role
      }
    });
};
