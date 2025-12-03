const express = require('express');
const { register, login, getProfile, updateProfile, logout } = require('../controllers/SimpleAuthController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// User registration
// POST /api/auth/register
// Body: { email, password, role, firstName, lastName }
router.post('/register', register);

// User login
// POST /api/auth/login
// Body: { email, password }
router.post('/login', login);

// User logout
// POST /api/auth/logout
router.post('/logout', logout);

// Get user profile
// GET /api/auth/profile
// Headers: Authorization: Bearer <token>
router.get('/profile', authenticate, getProfile);

// Update user profile
// PUT /api/auth/profile
// Headers: Authorization: Bearer <token>
// Body: { fullName, headline, about, avatarUrl }
router.put('/profile', authenticate, updateProfile);

module.exports = router;
