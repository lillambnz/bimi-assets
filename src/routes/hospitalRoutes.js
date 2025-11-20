const express = require('express');
const router = express.Router();
const {
  getAllHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitalDoctors,
  addReview,
  searchHospitals,
  getHospitalStatistics
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/search', searchHospitals);
router.get('/', getAllHospitals);
router.get('/:id', getHospital);
router.get('/:id/doctors', getHospitalDoctors);

// Protected routes
router.use(protect);

router.post('/', authorize('admin'), createHospital);
router.put('/:id', authorize('admin'), updateHospital);
router.delete('/:id', authorize('admin'), deleteHospital);
router.post('/:id/reviews', authorize('patient'), addReview);
router.get('/:id/statistics', authorize('admin'), getHospitalStatistics);

module.exports = router;
