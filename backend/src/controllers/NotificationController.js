// src/controllers/NotificationController.js
const db = require("../config/db");

// ================== Notifications ==================

// GET /notifications - Get own notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await db("notifications")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /notifications/:id/read - Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await db("notifications")
      .where({ id, user_id: userId })
      .first();

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    await db("notifications")
      .where({ id })
      .update({ is_read: true, updated_at: new Date() });

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// (Optional) DELETE /notifications/:id - Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await db("notifications")
      .where({ id, user_id: userId })
      .first();

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    await db("notifications").where({ id }).del();

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
