const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');

// Route to verify Firebase token and get/create user profile
router.post('/verify', authController.verifyToken);

module.exports = router;
