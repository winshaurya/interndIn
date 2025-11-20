const express = require("express");
const router = express.Router();
const {
  registerStudent,
  registerAlumni,
  login,
  refreshSession,
  forgotPasswordGenerateOtp,
  resetPasswordWithOTP,
  generateEmailVerificationOTP,
  verifyEmailWithOTP,
  logout,
  startGoogleOAuth,
} = require("../controllers/AuthController");
const { authenticate } = require("../middleware/authMiddleware");

 // ==================== AUTH ROUTES ====================

// Unified signup alias: POST /auth/signup { role: 'student'|'alumni', ...fields }
router.post("/signup", (req, res) => {
  const role = (req.body.role || "").toLowerCase();
  if (role === "student") {
    return registerStudent(req, res);
  } else if (role === "alumni") {
    return registerAlumni(req, res);
  }
  return res.status(400).json({ error: "Invalid or missing role for signup" });
});

// Student signup (legacy)
router.post("/register/student", registerStudent);

/**
 * Alumni signup (legacy)
 * Prefer /auth/signup with role='alumni'
 */
router.post("/register/alumni", registerAlumni);

// Login
router.post("/login", login);

// Refresh session
router.post("/refresh", refreshSession);

// Google OAuth helper (returns Supabase hosted URL)
router.get("/oauth/google", startGoogleOAuth);

// Forgot password (generate OTP)
router.post("/forgot-password", forgotPasswordGenerateOtp);

// Reset password with OTP
router.post("/reset-password", resetPasswordWithOTP);

// Email verification (send OTP)
router.post("/email/send-otp", generateEmailVerificationOTP);

// Verify email with OTP
router.post("/email/verify-otp", verifyEmailWithOTP);


 //logout 
router.post("/logout", authenticate, logout);

/**
 * Capability probe: GET /auth/capabilities
 * Allows frontend to detect enabled optional features.
 */
router.get("/capabilities", (_req, res) => {
  res.json({
    success: true,
    features: {
      signupAlias: true,
      skillsEndpoint: true,
      locationsEndpoint: true,
      adminAnalyticsAlias: true,
      userStatusUpdate: true,
    },
  });
});

module.exports = router;
