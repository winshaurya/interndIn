// src/routes/studentRoutes.js
const express = require("express");
const { getMyProfile, upsertProfile } = require("../controllers/StudentController");
const { authenticate } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const Joi = require("joi");

const router = express.Router();

/**
 * Validation:
 * - GET: no body
 * - PUT: allow partial update; if first-time create, controller enforces required fields
 */
const putProfileSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    studentId: Joi.string().min(2).max(50).optional(),
    branch: Joi.string().min(2).max(100).optional(),
    gradYear: Joi.number().integer().min(1950).max(2100).optional(),
    skills: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())).optional(),
    resumeUrl: Joi.string().uri().optional(),
  }),
};

// GET /student/profile
router.get(
  "/profile",
  authenticate,
  roleMiddleware("student"),    // remove this if you want alumni/admin to read it too
  getMyProfile
);

// PUT /student/profile (create/update)
router.put(
  "/profile",
  authenticate,
  roleMiddleware("student"),    // remove or widen roles if needed
  validate(putProfileSchema),
  upsertProfile
);

module.exports = router;
