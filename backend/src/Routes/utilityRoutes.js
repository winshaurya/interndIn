const express = require("express");
const router = express.Router();
const utilityController = require("../controllers/UtilityController");
const { authenticate } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// Allow both students and alumni (and admin) to search
router.get(
  "/search/students",
  authenticate,
  roleMiddleware("student", "alumni", "admin"),
  utilityController.searchStudents
);

router.get(
  "/search/alumni",
  authenticate,
  roleMiddleware("student", "alumni", "admin"),
  utilityController.searchAlumni
);

/**
 * Public skill taxonomy (stubbed for now; replace with DB-backed lookup later)
 * Frontend fallback expects array if endpoint exists.
 */
router.get("/skills", (_req, res) => {
  res.json({
    success: true,
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "SQL",
      "PostgreSQL",
      "Python",
      "Django",
      "Java",
      "C++",
      "Data Structures",
      "Algorithms",
      "Cloud",
      "DevOps",
      "Git",
      "Communication"
    ],
  });
});

/**
 * Public locations taxonomy (stubbed)
 */
router.get("/locations", (_req, res) => {
  res.json({
    success: true,
    locations: [
      "Remote",
      "Indore",
      "Bhopal",
      "Mumbai",
      "Delhi",
      "Bengaluru",
      "Hyderabad",
      "Pune"
    ],
  });
});

module.exports = router;
