const express = require("express");
const router = express.Router();
const { createUserProfile, getSession } = require("../controllers/AuthController");
const { authenticate } = require("../middleware/authMiddleware");

// Create user profile after Supabase auth
router.post("/create-profile", createUserProfile);

// Current session / me (for compatibility)
router.get('/me', authenticate, getSession);

/**
 * Capability probe: GET /auth/capabilities
 * Allows frontend to detect enabled optional features.
 */
router.get("/capabilities", (_req, res) => {
  res.json({
    success: true,
    features: {
      supabaseAuth: true,
      googleOAuth: true,
    },
  });
});

module.exports = router;
