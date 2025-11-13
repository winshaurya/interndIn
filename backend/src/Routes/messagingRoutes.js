// src/Routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messagingController = require("../controllers/MessagingController");
const authMiddleware = require("../middleware/authMiddleware");

// =================== Messaging Routes ===================

// Send a message (only if connected)
router.post("/messages", authMiddleware, messagingController.sendMessage);

// Fetch conversation by connectionId
router.get("/messages/:connectionId", authMiddleware, messagingController.getConversation);

// Fetch unread messages for logged-in user
router.get("/messages/unread", authMiddleware, messagingController.getUnreadMessages);

// Mark a message as read
router.put("/messages/:id/read", authMiddleware, messagingController.markMessageRead);

module.exports = router;
