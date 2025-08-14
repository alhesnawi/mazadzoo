const express = require('express');
const {
  addFunds,
  withdrawFunds,
  payListingFee,
  processFinalPayment,
  getPaymentHistory,
  getPaymentStats,
  processRefund,
  addFundsValidation,
  withdrawFundsValidation,
  paymentMethodValidation
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// User payment routes
router.post('/add-funds', addFundsValidation, addFunds);
router.post('/withdraw', withdrawFundsValidation, withdrawFunds);
router.post('/listing-fee/:animalId', paymentMethodValidation, payListingFee);
router.post('/final-payment/:animalId', paymentMethodValidation, processFinalPayment);
router.get('/history', getPaymentHistory);
router.get('/stats', getPaymentStats);

// Admin routes
router.post('/:paymentId/refund', authorize('admin'), processRefund);

module.exports = router;

