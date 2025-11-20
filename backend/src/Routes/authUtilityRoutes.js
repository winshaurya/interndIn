const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  changePassword,
} = require("../controllers/AuthUtilityController");
const { authenticate } = require("../middleware/authMiddleware");

// public
router.post("/forgot-password", forgotPassword);

// protected
router.post("/change-password", authenticate, changePassword);

module.exports = router;
