// src/Routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messagingController = require("../controllers/MessagingController");
const { authenticate } = require("../middleware/authMiddleware");

// =================== Messaging Routes ===================

// Send a message (only if connected)
router.post("/messages", authenticate, messagingController.sendMessage);

// Fetch conversation by connectionId
router.get("/messages/:connectionId", authenticate, messagingController.getConversation);

// Fetch unread messages for logged-in user
router.get("/messages/unread", authenticate, messagingController.getUnreadMessages);

// Mark a message as read
router.put("/messages/:id/read", authenticate, messagingController.markMessageRead);

module.exports = router;
