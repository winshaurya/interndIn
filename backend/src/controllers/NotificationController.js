// src/controllers/NotificationController.js
const db = require("../config/db");

const getUserId = (req) => req.user?.userId ?? req.user?.id;
const nowIso = () => new Date().toISOString();

// ================== Notifications ==================

// GET /notifications - Get own notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const { data, error } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /notifications/:id/read - Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const { data: notification, error: fetchError } = await db
      .from("notifications")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    const { error } = await db
      .from("notifications")
      .update({ is_read: true, updated_at: nowIso() })
      .eq("id", id);

    if (error) throw error;

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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const { data: notification, error: fetchError } = await db
      .from("notifications")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    const { error } = await db
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getNotifications, markNotificationRead, deleteNotification };
