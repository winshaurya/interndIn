// src/controllers/MessagingController.js
const db = require("../config/db");
const { getUserId, getCurrentTimestamp } = require("../utils/authUtils");

// ============ Helper: Check if conversation exists ============
const getOrCreateConversation = async (studentId, alumniId, jobId = null) => {
  // Check if conversation exists
  const { data: existing, error: fetchError } = await db
    .from("conversations")
    .select("id")
    .eq("student_id", studentId)
    .eq("alumni_id", alumniId)
    .is("job_id", jobId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) return existing.id;

  // Create new conversation
  const { data: newConv, error: insertError } = await db
    .from("conversations")
    .insert({
      student_id: studentId,
      alumni_id: alumniId,
      job_id: jobId,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return newConv.id;
};

// ============ POST /messages ============
// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, content, job_id } = req.body;
    const sender_id = getUserId(req);

    if (!sender_id) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    if (!receiver_id || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver and content required" });
    }

    // Get user roles to determine student/alumni
    const { data: senderProfile, error: senderError } = await db
      .from("profiles")
      .select("role")
      .eq("id", sender_id)
      .single();

    if (senderError || !senderProfile) {
      return res.status(403).json({ success: false, message: "Invalid sender" });
    }

    const { data: receiverProfile, error: receiverError } = await db
      .from("profiles")
      .select("role")
      .eq("id", receiver_id)
      .single();

    if (receiverError || !receiverProfile) {
      return res.status(403).json({ success: false, message: "Invalid receiver" });
    }

    // Ensure one is student, one is alumni
    if (senderProfile.role === receiverProfile.role) {
      return res.status(403).json({
        success: false,
        message: "Messages can only be sent between students and alumni",
      });
    }

    const studentId = senderProfile.role === 'student' ? sender_id : receiver_id;
    const alumniId = senderProfile.role === 'alumni' ? sender_id : receiver_id;

    // Get or create conversation
    const conversationId = await getOrCreateConversation(studentId, alumniId, job_id);

    // Insert message
    const { data, error } = await db
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id,
        content,
        is_read: false,
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

// ============ GET /messages/:conversationId ============
// Fetch messages for a conversation
exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    // Check if user is part of conversation
    const { data: conversation, error: convError } = await db
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .or(`student_id.eq.${userId},alumni_id.eq.${userId}`)
      .maybeSingle();

    if (convError) throw convError;

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const { data: messages, error: msgError } = await db
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgError) throw msgError;

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
      .select(`
        *,
        conversations!inner(student_id, alumni_id, job_id),
        sender:profiles!messages_sender_id_fkey(id, full_name)
      `)
      .eq("is_read", false)
      .or(`conversations.student_id.eq.${userId},conversations.alumni_id.eq.${userId}`)
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

    // Check if user can read this message (part of conversation)
    const { data: message, error: msgError } = await db
      .from("messages")
      .select(`
        id,
        conversations!inner(student_id, alumni_id)
      `)
      .eq("id", id)
      .or(`conversations.student_id.eq.${userId},conversations.alumni_id.eq.${userId}`)
      .maybeSingle();

    if (msgError) throw msgError;

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    const { error } = await db
      .from("messages")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: "Message marked as read" });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reuse the `exports.*` assignments above for module exports.
module.exports = exports;
