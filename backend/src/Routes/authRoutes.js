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

// Get system capabilities
// GET /api/auth/capabilities
router.get('/capabilities', (req, res) => {
  res.json({
    success: true,
    data: {
      branches: [
        "Computer Science",
        "Information Technology",
        "Electronics & Communication",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Chemical Engineering"
      ],
      features: [
        {
          icon: "Users",
          title: "Alumni Network",
          description: "Connect with SGSITS alumni working in top companies worldwide"
        },
        {
          icon: "Briefcase",
          title: "Job Opportunities",
          description: "Access exclusive job postings and internships from alumni companies"
        },
        {
          icon: "TrendingUp",
          title: "Career Growth",
          description: "Get mentorship and career guidance from experienced professionals"
        },
        {
          icon: "CheckCircle",
          title: "Quality Matches",
          description: "Smart matching based on your skills, branch, and preferences"
        }
      ]
    }
  });
});

module.exports = router;
