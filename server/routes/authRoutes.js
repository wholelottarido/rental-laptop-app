const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Rute untuk registrasi: POST /api/auth/register
router.post('/register', authController.register);

// Rute untuk login: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
