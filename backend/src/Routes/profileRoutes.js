// Profile Routes - Industry Standard REST API
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateStudentProfile,
  updateAlumniProfile,
  uploadProfilePicture,
  deleteProfilePicture
} = require('../controllers/ProfileController');

// Configure multer for profile picture uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  }
});

// All profile routes require authentication
router.use(authenticate);

// ==================== PROFILE CRUD ====================

/**
 * GET /api/profile
 * Get current user's complete profile
 * Response: 200 OK
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user-id",
 *     "email": "user@example.com",
 *     "role": "student|alumni",
 *     "status": "active|pending",
 *     "is_verified": true,
 *     "profile": { ...profile data... }
 *   }
 * }
 */
router.get('/', getProfile);

/**
 * PUT /api/profile/student
 * Update student profile
 * Body: Student profile data (partial update supported)
 * Response: 200 OK
 */
router.put('/student', updateStudentProfile);

/**
 * PUT /api/profile/alumni
 * Update alumni profile
 * Body: Alumni profile data (partial update supported)
 * Response: 200 OK
 */
router.put('/alumni', updateAlumniProfile);

// ==================== PROFILE PICTURE ====================

/**
 * POST /api/profile/picture
 * Upload profile picture
 * Content-Type: multipart/form-data
 * Field: picture (file)
 * Response: 200 OK
 */
router.post('/picture', upload.single('picture'), uploadProfilePicture);

/**
 * DELETE /api/profile/picture
 * Delete profile picture
 * Response: 200 OK
 */
router.delete('/picture', deleteProfilePicture);

module.exports = router;
