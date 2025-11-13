const express = require("express");
const {
  completeProfile,
  updateProfile,
} = require("../controllers/AlumniController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/profile", authenticate, completeProfile);

router.post("/update-profile", authenticate, updateProfile);
module.exports = router;
