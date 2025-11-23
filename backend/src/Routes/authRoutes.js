const express = require('express');
const router = express.Router();
const { register, login, getProfile, refreshToken, requestPasswordReset, resetPassword } = require('../controllers/AuthController');
const { authenticate } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);

module.exports = router;
