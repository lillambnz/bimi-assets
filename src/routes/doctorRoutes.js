const express = require('express');
const router = express.Router();
const {
  registerDoctor,
  loginDoctor,
  getAllDoctors,
  getDoctor,
  updateDoctor,
  getDoctorPatients,
  getDoctorAppointments,
  getDoctorSchedule,
  addReview,
  getDoctorAvailability,
  searchDoctors,
  getDoctorStatistics
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.get('/search', searchDoctors);
router.get('/', getAllDoctors);
router.get('/:id', getDoctor);
router.get('/:id/schedule', getDoctorSchedule);
router.get('/:id/availability', getDoctorAvailability);

// Protected routes
router.use(protect);

router.put('/:id', authorize('doctor', 'admin'), updateDoctor);
router.get('/:id/patients', authorize('doctor', 'admin'), getDoctorPatients);
router.get('/:id/appointments', authorize('doctor', 'staff', 'admin'), getDoctorAppointments);
router.get('/:id/statistics', authorize('doctor', 'admin'), getDoctorStatistics);

// Reviews
router.post('/:id/reviews', authorize('patient'), addReview);

module.exports = router;
