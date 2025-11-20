const express = require('express');
const router = express.Router();
const {
  registerPatient,
  loginPatient,
  getMe,
  updateMe,
  getAllPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientAppointments,
  getPatientMedicalRecords,
  getPatientPrescriptions,
  addAllergy,
  addChronicCondition,
  searchPatients
} = require('../controllers/patientController');
const { protect, authorize, checkOwnership } = require('../middleware/auth');

// Public routes
router.post('/register', registerPatient);
router.post('/login', loginPatient);

// Protected routes
router.use(protect);

// Current patient routes
router.get('/me', authorize('patient'), getMe);
router.put('/me', authorize('patient'), updateMe);

// Search
router.get('/search', authorize('doctor', 'staff', 'admin'), searchPatients);

// Patient management
router.route('/')
  .get(authorize('doctor', 'staff', 'admin'), getAllPatients)
  .post(authorize('staff', 'admin'), createPatient);

router.route('/:id')
  .get(authorize('patient', 'doctor', 'staff', 'admin'), checkOwnership, getPatient)
  .put(authorize('doctor', 'staff', 'admin'), checkOwnership, updatePatient)
  .delete(authorize('admin'), deletePatient);

// Patient appointments, records, prescriptions
router.get('/:id/appointments', authorize('patient', 'doctor', 'staff', 'admin'), checkOwnership, getPatientAppointments);
router.get('/:id/medical-records', authorize('patient', 'doctor', 'staff', 'admin'), checkOwnership, getPatientMedicalRecords);
router.get('/:id/prescriptions', authorize('patient', 'doctor', 'staff', 'admin'), checkOwnership, getPatientPrescriptions);

// Add medical information
router.post('/:id/allergies', authorize('doctor'), addAllergy);
router.post('/:id/chronic-conditions', authorize('doctor'), addChronicCondition);

module.exports = router;
