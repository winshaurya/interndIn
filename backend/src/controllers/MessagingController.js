// src/controllers/MessagingController.js
const db = require("../config/db");

// ============ Helper: Check if users are connected ============
const checkConnection = async (userId, otherUserId) => {
  const connection = await db("connections")
    .where(function () {
      this.where({ sender_id: userId, receiver_id: otherUserId })
        .orWhere({ sender_id: otherUserId, receiver_id: userId });
    })
    .andWhere({ status: "accepted" })
    .first();

  return !!connection;
};

// ============ POST /messages ============
// Send a message (only if connected)
exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver and content required" });
    }

    // Check if connection exists
    const connected = await checkConnection(sender_id, receiver_id);
    if (!connected) {
      return res.status(403).json({
        success: false,
        message: "You can only message connected users",
      });
    }

    const [message] = await db("messages")
      .insert({
        sender_id,
        receiver_id,
        content,
        is_read: false,
        created_at: new Date(),
      })
      .returning("*");

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ GET /messages/:connectionId ============
// Fetch conversation for a connection
exports.getConversation = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await db("connections").where({ id: connectionId }).first();

    if (!connection) {
      return res
        .status(404)
        .json({ success: false, message: "Connection not found" });
    }

    // Ensure user is part of this connection
    if (
      connection.sender_id !== userId &&
      connection.receiver_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this conversation",
      });
    }

    const messages = await db("messages")
      .where(function () {
        this.where({
          sender_id: connection.sender_id,
          receiver_id: connection.receiver_id,
        }).orWhere({
          sender_id: connection.receiver_id,
          receiver_id: connection.sender_id,
        });
      })
      .orderBy("created_at", "asc");

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ GET /messages/unread ============
// Fetch unread messages for logged-in user
exports.getUnreadMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await db("messages")
      .where({ receiver_id: userId, is_read: false })
      .orderBy("created_at", "desc");

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ PUT /messages/:id/read ============
// Mark single message as read
exports.markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await db("messages")
      .where({ id, receiver_id: userId })
      .first();

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    await db("messages")
      .where({ id })
      .update({ is_read: true, updated_at: new Date() });

    res.json({ success: true, message: "Message marked as read" });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
