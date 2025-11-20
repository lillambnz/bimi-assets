const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getAllPrescriptions,
  getPrescription,
  updatePrescription,
  cancelPrescription,
  dispensePrescription,
  getActivePatientPrescriptions,
  printPrescription,
  checkDrugInteractions,
  getExpiringPrescriptions
} = require('../controllers/prescriptionController');
const { protect, authorize, requireVerifiedDoctor } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// General routes
router.route('/')
  .get(getAllPrescriptions)
  .post(authorize('doctor'), requireVerifiedDoctor, createPrescription);

// Special queries
router.get('/expiring', getExpiringPrescriptions);
router.post('/check-interactions', authorize('doctor'), checkDrugInteractions);
router.get('/patient/:patientId/active', getActivePatientPrescriptions);

// Individual prescription routes
router.route('/:id')
  .get(getPrescription)
  .put(authorize('doctor'), updatePrescription);

// Prescription actions
router.put('/:id/cancel', authorize('doctor'), cancelPrescription);
router.post('/:id/dispense', authorize('staff'), dispensePrescription);
router.get('/:id/print', authorize('doctor'), printPrescription);

module.exports = router;
