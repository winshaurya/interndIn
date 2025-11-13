// src/Routes/connectionRoutes.js
const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/ConnectionController");
const {authenticate, isAdmin} = require("../middleware/authMiddleware");
 
// =================== Connection Routes ===================

// Send connection request
router.post("/connections/request", authenticate, connectionController.sendRequest);

// Accept connection request
router.put("/connections/:id/accept", authenticate, connectionController.acceptRequest);

// Reject connection request
router.put("/connections/:id/reject", authenticate, connectionController.rejectRequest);

// List all connections of logged-in user
router.get("/connections", authenticate, connectionController.getConnections);

module.exports = router;
