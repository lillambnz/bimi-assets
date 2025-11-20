const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  checkInAppointment,
  startConsultation,
  completeAppointment,
  markNoShow,
  getTodaysAppointments,
  getUpcomingAppointments,
  getAppointmentStatistics
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// General appointment routes
router.route('/')
  .get(getAllAppointments)
  .post(authorize('patient', 'doctor', 'staff', 'admin'), createAppointment);

// Special queries
router.get('/today', getTodaysAppointments);
router.get('/upcoming', getUpcomingAppointments);
router.get('/statistics', authorize('staff', 'admin'), getAppointmentStatistics);

// Individual appointment routes
router.route('/:id')
  .get(getAppointment)
  .put(authorize('patient', 'doctor', 'staff', 'admin'), updateAppointment);

// Appointment actions
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/reschedule', authorize('patient', 'staff', 'admin'), rescheduleAppointment);
router.put('/:id/checkin', authorize('patient', 'staff'), checkInAppointment);
router.put('/:id/start', authorize('doctor'), startConsultation);
router.put('/:id/complete', authorize('doctor'), completeAppointment);
router.put('/:id/no-show', authorize('staff', 'doctor'), markNoShow);

module.exports = router;
