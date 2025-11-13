const express = require("express");
const router = express.Router();
const utilityController = require("../controllers/UtilityController");
const { authenticate } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");


// Allow both students and alumni (and admin) to search
router.get(
  "/search/students",
  authenticate,
  authorizeRoles("student", "alumni", "admin"),
  utilityController.searchStudents
);

router.get(
  "/search/alumni",
  authenticate,
  authorizeRoles("student", "alumni", "admin"),
  utilityController.searchAlumni
);

module.exports = router;