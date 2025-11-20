// src/controllers/MessagingController.js
const db = require("../config/db");

const getUserId = (req) => req.user?.userId ?? req.user?.id;
const nowIso = () => new Date().toISOString();
const convoClause = (a, b) =>
  `and(sender_id.eq.${a},receiver_id.eq.${b}),and(sender_id.eq.${b},receiver_id.eq.${a})`;

// ============ Helper: Check if users are connected ============
const checkConnection = async (userId, otherUserId) => {
  const { data, error } = await db
    .from("connections")
    .select("id")
    .or(convoClause(userId, otherUserId))
    .eq("status", "accepted")
    .limit(1);

  if (error) throw error;
  return Boolean(data?.length);
};

// ============ POST /messages ============
// Send a message (only if connected)
exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = getUserId(req);

    if (!sender_id) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    if (!receiver_id || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver and content required" });
    }

    const connected = await checkConnection(sender_id, receiver_id);
    if (!connected) {
      return res.status(403).json({
        success: false,
        message: "You can only message connected users",
      });
    }

    const { data, error } = await db
      .from("messages")
      .insert({
        sender_id,
        receiver_id,
        content,
        is_read: false,
        created_at: nowIso(),
        updated_at: nowIso(),
      })
      .select("*")
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const { data: connection, error: connectionError } = await db
      .from("connections")
      .select("*")
      .eq("id", connectionId)
      .maybeSingle();

    if (connectionError) throw connectionError;

    if (!connection) {
      return res
        .status(404)
        .json({ success: false, message: "Connection not found" });
    }

    if (
      connection.sender_id !== userId &&
      connection.receiver_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this conversation",
      });
    }

    const { data: messages, error: messagesError } = await db
      .from("messages")
      .select("*")
      .or(convoClause(connection.sender_id, connection.receiver_id))
      .order("created_at", { ascending: true });

    if (messagesError) throw messagesError;

    res.json({ success: true, data: messages || [] });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ GET /messages/unread ============
// Fetch unread messages for logged-in user
exports.getUnreadMessages = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const { data, error } = await db
      .from("messages")
      .select("*")
      .eq("receiver_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const { data: message, error: messageError } = await db
      .from("messages")
      .select("id")
      .eq("id", id)
      .eq("receiver_id", userId)
      .maybeSingle();

    if (messageError) throw messageError;

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    const { error } = await db
      .from("messages")
      .update({ is_read: true, updated_at: nowIso() })
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: "Message marked as read" });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
