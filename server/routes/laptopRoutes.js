const express = require('express');
const multer = require('multer'); // Import multer
const path = require('path');
const laptopController = require('../controllers/laptopController');
const { protect } = require('../middleware/authMiddleware');

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder tujuan penyimpanan
  },
  filename: function (req, file, cb) {
    // Buat nama file yang unik untuk menghindari duplikat
    cb(null, 'laptop-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Tambahkan middleware 'upload.single('image')' pada rute POST dan PUT
// 'image' adalah nama field pada form di front-end
router.post('/', protect, upload.single('image'), laptopController.createLaptop);
router.put('/:id', protect, upload.single('image'), laptopController.updateLaptop);

// Rute lain tetap sama
router.delete('/:id', protect, laptopController.deleteLaptop);
router.patch('/:id/status', protect, laptopController.updateLaptopStatus);

module.exports = router;
