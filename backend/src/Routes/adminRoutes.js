const express = require("express");
const {
  approveAlumni,
  rejectAlumni,
  getPendingAlumni,
  verifyAlumni,
  getAllJobsAdmin,
  deleteJobAdmin,
  getAllUsers,
  deleteUser,
  sendNotification,
  getDashboardStats,
  updateUserStatus, // newly added
} = require("../controllers/AdminController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Alumni Verification
router.get("/alumni/pending", authenticate, isAdmin, getPendingAlumni);
router.put("/alumni/verify/:id", authenticate, isAdmin, verifyAlumni);

// Company Approval
router.patch(
  "/companies/:companyId/approve",
  authenticate,
  isAdmin,
  approveAlumni
);
router.patch(
  "/companies/:companyId/reject",
  authenticate,
  isAdmin,
  rejectAlumni
);

// Job Oversight
router.get("/jobs", authenticate, isAdmin, getAllJobsAdmin);
router.delete("/jobs/:id", authenticate, isAdmin, deleteJobAdmin);

/**
 * User Management
 * Includes status update alias consumed by frontend updateUserStatus()
 */
router.get("/users", authenticate, isAdmin, getAllUsers);
router.put("/users/:id/status", authenticate, isAdmin, updateUserStatus);
router.delete("/users/:id", authenticate, isAdmin, deleteUser);

// Notifications
router.post("/notify", authenticate, isAdmin, sendNotification);

router.get("/dashboard", authenticate, isAdmin, getDashboardStats);
// Analytics alias for frontend getAnalytics()
router.get("/analytics", authenticate, isAdmin, getDashboardStats);

module.exports = router;
