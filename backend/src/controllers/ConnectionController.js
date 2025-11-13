// src/controllers/ConnectionController.js
const db = require("../config/db");

// ============ POST /connections/request ============
// Send connection request (student ↔ alumni or student ↔ student, etc.)
exports.sendRequest = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id } = req.body;

    if (!receiver_id) {
      return res.status(400).json({ success: false, message: "Receiver ID required" });
    }

    if (receiver_id === sender_id) {
      return res.status(400).json({ success: false, message: "Cannot connect with yourself" });
    }

    // Check if already connected or pending
    const existing = await db("connections")
      .where(function () {
        this.where({ sender_id, receiver_id }).orWhere({
          sender_id: receiver_id,
          receiver_id: sender_id,
        });
      })
      .first();

    if (existing) {
      return res.status(409).json({ success: false, message: "Connection already exists or pending" });
    }

    const [request] = await db("connections")
      .insert({
        sender_id,
        receiver_id,
        status: "pending",
        created_at: new Date(),
      })
      .returning("*");

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error("Error sending request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ PUT /connections/:id/accept ============
// Accept a connection request
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await db("connections").where({ id }).first();

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.receiver_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request already processed" });
    }

    await db("connections")
      .where({ id })
      .update({ status: "accepted", updated_at: new Date() });

    res.json({ success: true, message: "Connection request accepted" });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ PUT /connections/:id/reject ============
// Reject a connection request
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await db("connections").where({ id }).first();

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.receiver_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to reject this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request already processed" });
    }

    await db("connections")
      .where({ id })
      .update({ status: "rejected", updated_at: new Date() });

    res.json({ success: true, message: "Connection request rejected" });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ GET /connections ============
// List all connections of logged-in user
exports.getConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const connections = await db("connections")
      .where(function () {
        this.where("sender_id", userId).orWhere("receiver_id", userId);
      })
      .orderBy("created_at", "desc");

    res.json({ success: true, data: connections });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
