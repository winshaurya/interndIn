const express = require('express');
const router = express.Router();
const { register, login, getProfile, refreshToken } = require('../controllers/AuthController');
const { authenticate } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/profile', authenticate, getProfile);

module.exports = router;
