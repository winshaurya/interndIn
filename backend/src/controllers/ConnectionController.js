// src/controllers/ConnectionController.js
const db = require("../config/db");

const getUserId = (req) => req.user?.userId ?? req.user?.id;
const nowIso = () => new Date().toISOString();
const pairClause = (a, b) =>
  `and(sender_id.eq.${a},receiver_id.eq.${b}),and(sender_id.eq.${b},receiver_id.eq.${a})`;

const fetchConnectionById = async (id) => {
  const { data, error } = await db.from("connections").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
};

const findConnectionBetween = async (userA, userB, status) => {
  let query = db
    .from("connections")
    .select("*")
    .or(pairClause(userA, userB))
    .limit(1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data?.[0] ?? null;
};

// ============ POST /connections/request ============
// Send connection request (student ↔ alumni or student ↔ student, etc.)
exports.sendRequest = async (req, res) => {
  try {
    const sender_id = getUserId(req);
    const { receiver_id } = req.body;

    if (!sender_id) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    if (!receiver_id) {
      return res.status(400).json({ success: false, message: "Receiver ID required" });
    }

    if (receiver_id === sender_id) {
      return res.status(400).json({ success: false, message: "Cannot connect with yourself" });
    }

    const existing = await findConnectionBetween(sender_id, receiver_id);
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Connection already exists or pending" });
    }

    const { data, error } = await db
      .from("connections")
      .insert({
        sender_id,
        receiver_id,
        status: "pending",
        created_at: nowIso(),
        updated_at: nowIso(),
      })
      .select("*")
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const request = await fetchConnectionById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.receiver_id !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request already processed" });
    }

    const { error } = await db
      .from("connections")
      .update({ status: "accepted", updated_at: nowIso() })
      .eq("id", id);

    if (error) throw error;

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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const request = await fetchConnectionById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.receiver_id !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to reject this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request already processed" });
    }

    const { error } = await db
      .from("connections")
      .update({ status: "rejected", updated_at: nowIso() })
      .eq("id", id);

    if (error) throw error;

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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const { data, error } = await db
      .from("connections")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
