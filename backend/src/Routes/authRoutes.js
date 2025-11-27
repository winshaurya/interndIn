const express = require('express');
const { register, login, getProfile } = require('../controllers/SimpleAuthController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile
router.get('/profile', authenticate, getProfile);

module.exports = router;
