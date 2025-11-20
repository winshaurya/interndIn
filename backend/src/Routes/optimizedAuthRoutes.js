// Optimized Auth Routes - Only server-side operations
const express = require('express');
const router = express.Router();
const optimizedAuthController = require('../controllers/OptimizedAuthController');
const authMiddleware = require('../middleware/authMiddleware');

// Server-side auth operations only
router.post('/signup', optimizedAuthController.signup);
router.post('/reset-password', optimizedAuthController.resetPassword);
router.post('/verify-email', optimizedAuthController.verifyEmail);

// Admin operations (protected)
router.get('/admin/users', authMiddleware, optimizedAuthController.getAllUsers);
router.put('/admin/users/:userId/status', authMiddleware, optimizedAuthController.updateUserStatus);

module.exports = router;
