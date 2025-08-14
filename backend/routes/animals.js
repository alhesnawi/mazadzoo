const express = require('express');
const {
  getAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  startAuction,
  endAuction,
  toggleWatchlist,
  getWatchlist,
  createAnimalValidation,
  updateAnimalValidation
} = require('../controllers/animalController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadAnimalFiles, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAnimals);
router.get('/watchlist', protect, getWatchlist);
router.get('/:id', optionalAuth, getAnimal);

// Protected routes
router.use(protect); // All routes after this middleware are protected

// Seller routes
router.post('/', authorize('seller', 'admin'), uploadAnimalFiles, handleMulterError, createAnimalValidation, createAnimal);
router.put('/:id', uploadAnimalFiles, handleMulterError, updateAnimalValidation, updateAnimal);
router.delete('/:id', deleteAnimal);

// Watchlist routes
router.post('/:id/watchlist', toggleWatchlist);

// Admin routes
router.post('/:id/start-auction', authorize('admin'), startAuction);
router.post('/:id/end-auction', authorize('admin'), endAuction);

module.exports = router;

