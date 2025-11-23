const express = require("express");
const {
  // New / expanded controller API
  getProfile,
  upsertProfile,
  createOrUpdateCompany,
  listCompanies,
  // Legacy (backward compatibility)
  completeProfile,
  updateProfile,
  getDashboardStats,
  getPublicProfile,
} = require("../controllers/AlumniController");
const { authenticate } = require("../middleware/authMiddleware");
const { getMyJobs } = require("../controllers/JobPostingController");

const router = express.Router();

/**
 * New RESTful alumni profile endpoints (frontend expects these):
 * GET    /alumni/profile          -> read combined alumni + company
 * PUT    /alumni/profile          -> partial update (alumni + company fields)
 */
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, upsertProfile);

/**
 * Public profile viewing (for students to view alumni profiles)
 */
router.get("/profile/:userId", authenticate, getPublicProfile);

/**
 * Company management (frontend createCompany() expects POST /alumni/company)
 * List companies (frontend getCompanies() expects GET /alumni/companies)
 * Listing is public for now (can tighten later).
 */
router.post("/company", authenticate, createOrUpdateCompany);
router.get("/companies", listCompanies);

/**
 * Jobs alias for alumni (frontend uses GET /alumni/jobs for "my jobs")
 * Internally reuses JobController.getMyJobs
 */
router.get("/jobs", authenticate, getMyJobs);

/**
 * Legacy endpoints retained for backward compatibility; can be deprecated later.
 * POST /alumni/profile (original completeProfile create flow)
 * POST /alumni/update-profile (original update flow)
 */
router.post("/profile", authenticate, completeProfile); // legacy create
router.post("/update-profile", authenticate, updateProfile); // legacy update

/**
 * Dashboard stats (frontend may call /alumni/dashboard)
 */
router.get("/dashboard", authenticate, getDashboardStats);

module.exports = router;
