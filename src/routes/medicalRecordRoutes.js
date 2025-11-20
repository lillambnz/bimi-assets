const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getAllMedicalRecords,
  getMedicalRecord,
  updateMedicalRecord,
  getPatientMedicalHistory,
  approveMedicalRecord,
  addAttachment,
  searchMedicalRecords
} = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// General routes
router.route('/')
  .get(getAllMedicalRecords)
  .post(authorize('doctor'), createMedicalRecord);

// Search
router.get('/search', authorize('doctor', 'admin'), searchMedicalRecords);

// Patient medical history
router.get('/patient/:patientId/history', authorize('doctor', 'admin'), getPatientMedicalHistory);

// Individual record routes
router.route('/:id')
  .get(getMedicalRecord)
  .put(authorize('doctor', 'admin'), updateMedicalRecord);

// Record actions
router.put('/:id/approve', authorize('doctor'), approveMedicalRecord);
router.post('/:id/attachments', authorize('doctor'), addAttachment);

module.exports = router;
