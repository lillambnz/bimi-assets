const express = require('express');
const router = express.Router();
const {
  createBilling,
  getAllBillings,
  getBilling,
  addPayment,
  submitMedicareClaim,
  createPaymentPlan,
  writeOffBalance,
  getPatientBillingHistory,
  getBillingStatistics
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// General routes
router.route('/')
  .get(getAllBillings)
  .post(authorize('doctor', 'staff', 'admin'), createBilling);

// Statistics
router.get('/statistics', authorize('admin'), getBillingStatistics);

// Patient billing history
router.get('/patient/:patientId/history', getPatientBillingHistory);

// Individual billing routes
router.get('/:id', getBilling);

// Billing actions
router.post('/:id/payment', addPayment);
router.post('/:id/medicare-claim', authorize('staff', 'admin'), submitMedicareClaim);
router.post('/:id/payment-plan', authorize('staff', 'admin'), createPaymentPlan);
router.post('/:id/writeoff', authorize('admin'), writeOffBalance);

module.exports = router;
