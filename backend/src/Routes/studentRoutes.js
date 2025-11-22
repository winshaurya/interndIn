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
    name: Joi.string().min(2).max(255).optional().allow(''),
    studentId: Joi.string().min(2).max(50).optional().allow(''),
    branch: Joi.string().min(2).max(100).optional().allow(''),
    gradYear: Joi.alternatives(Joi.number().integer().min(1950).max(2100), Joi.string().pattern(/^\d+$/)).optional(),
    skills: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())).optional(),
    resumeUrl: Joi.string().uri().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().allow(''),
    dateOfBirth: Joi.date().optional().allow(null),
    currentYear: Joi.alternatives(Joi.number().integer().min(1).max(4), Joi.string().pattern(/^\d+$/)).optional(),
    cgpa: Joi.alternatives(Joi.number().min(0).max(10), Joi.string().pattern(/^\d+(\.\d+)?$/)).optional().allow(''),
    achievements: Joi.string().optional().allow(''),
    experiences: Joi.array().items(Joi.object({
      title: Joi.string().optional().allow(''),
      company: Joi.string().optional().allow(''),
      duration: Joi.string().optional().allow(''),
      link: Joi.string().uri().optional().allow(''),
      description: Joi.string().optional().allow(''),
    })).optional(),
    desiredRoles: Joi.array().items(Joi.string()).optional(),
    preferredLocations: Joi.array().items(Joi.string()).optional(),
    workMode: Joi.string().valid('remote', 'onsite', 'hybrid').optional().allow(''),
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

// GET /student/dashboard
router.get(
  "/dashboard",
  authenticate,
  roleMiddleware("student"),
  require("../controllers/StudentController").getDashboardStats
);

module.exports = router;
