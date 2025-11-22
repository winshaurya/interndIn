const express = require("express");
const router = express.Router();
const { verifySupabaseToken, getSession, handleOAuthCallback, signOut } = require("../controllers/AuthController");

// OAuth callback handler
router.post("/oauth/callback", handleOAuthCallback);

// Current session / me
router.get('/me', verifySupabaseToken, getSession);

// Sign out
router.post('/signout', signOut);

/**
 * Capability probe: GET /auth/capabilities
 * Allows frontend to detect enabled optional features.
 */
router.get("/capabilities", (_req, res) => {
  const currentYear = new Date().getFullYear();
  const gradYears = Array.from({ length: 10 }, (_, i) => currentYear + 4 - i);

  res.json({
    success: true,
    features: {
      supabaseAuth: true,
      googleOAuth: true,
    },
    data: {
      branches: [
        { value: "CSE", label: "Computer Science & Engineering" },
        { value: "IT", label: "Information Technology" },
        { value: "ECE", label: "Electronics & Communication Engineering" },
        { value: "EE", label: "Electrical Engineering" },
        { value: "ME", label: "Mechanical Engineering" },
        { value: "CE", label: "Civil Engineering" },
        { value: "CHE", label: "Chemical Engineering" },
        { value: "MCA", label: "Master of Computer Applications" },
        { value: "MBA", label: "Master of Business Administration" },
      ],
      gradYears,
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
      ],
    },
  });
});

module.exports = router;
