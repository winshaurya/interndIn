// src/Routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messagingController = require("../controllers/MessagingController");
const { authenticate } = require("../middleware/authMiddleware");
const { getUserId } = require("../utils/authUtils");
const validate = require("../middleware/validationMiddleware");
const Joi = require("joi");
const db = require("../config/db");

// =================== Validation Schemas ===================
const sendMessageSchema = {
  body: Joi.object({
    receiver_id: Joi.string().uuid().required(),
    content: Joi.string().min(1).max(1000).required(),
    job_id: Joi.string().uuid().optional(),
  }),
};

const conversationIdSchema = {
  params: Joi.object({
    conversationId: Joi.string().uuid().required(),
  }),
};

const messageIdSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

// =================== Messaging Routes ===================

// Send a message (only if connected)
router.post("/messages", authenticate, validate(sendMessageSchema), messagingController.sendMessage);

// Fetch conversation by conversationId
router.get("/messages/:conversationId", authenticate, validate(conversationIdSchema), messagingController.getConversation);

// Fetch unread messages for logged-in user
router.get("/messages/unread", authenticate, messagingController.getUnreadMessages);

// Mark a message as read
router.put("/messages/:id/read", authenticate, validate(messageIdSchema), messagingController.markMessageRead);

// Delete a message (optional - only sender can delete their own messages)
router.delete("/messages/:id", authenticate, validate(messageIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    // Check if user is the sender of this message
    const { data: message, error } = await db
      .from("messages")
      .select("sender_id")
      .eq("id", id)
      .eq("sender_id", userId)
      .maybeSingle();

    if (error) throw error;

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found or not authorized to delete" });
    }

    const { error: deleteError } = await db
      .from("messages")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
