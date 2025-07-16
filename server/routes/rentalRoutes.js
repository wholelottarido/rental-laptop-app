const express = require('express');
const rentalController = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rute yang sudah ada
router.post('/new', protect, rentalController.createSingleRental);
router.post('/checkout-cart', protect, rentalController.createBulkRental);

// Rute BARU untuk riwayat pengguna
router.get('/my-history', protect, rentalController.getUserRentals);

// Rute BARU untuk riwayat admin
router.get('/all-history', protect, rentalController.getAllRentals);

module.exports = router;
