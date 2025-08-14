const express = require('express');
const {
  placeBid,
  getAnimalBids,
  getUserBids,
  getBidStats,
  placeBidValidation
} = require('../controllers/bidController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/animal/:animalId', optionalAuth, getAnimalBids);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/', placeBidValidation, placeBid);
router.get('/my-bids', getUserBids);
router.get('/stats', getBidStats);

module.exports = router;

