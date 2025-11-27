const db = require("../config/db");

const getUserId = (req) => req.user?.userId ?? req.user?.id;

// ============ GET /connections ============
// Get all connections for the logged-in user
const getConnections = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthenticated" });

    const { data, error } = await db
      .from("conversations")
      .select("id, student_id, alumni_id, created_at")
      .or(`student_id.eq.${userId},alumni_id.eq.${userId}`)
      .is("job_id", null);

    if (error) throw error;

    const connections = data.map(conv => {
      const otherId = conv.student_id === userId ? conv.alumni_id : conv.student_id;
      return {
        id: conv.id,
        userId: otherId,
        status: 'accepted',
        createdAt: conv.created_at,
      };
    });

    res.json({ success: true, connections });
  } catch (err) {
    console.error("getConnections error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ GET /connections/requests ============
// Get pending connection requests for the logged-in user
const getConnectionRequests = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthenticated" });

    // Since no status in schema, return empty
    res.json({ success: true, requests: [] });
  } catch (err) {
    console.error("getConnectionRequests error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ POST /connections/request ============
// Send connection request
const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = getUserId(req);
    const { receiverId } = req.body;

    if (!senderId) return res.status(401).json({ success: false, message: "Unauthenticated" });
    if (!receiverId) return res.status(400).json({ success: false, message: "Receiver ID required" });
    if (receiverId === senderId) return res.status(400).json({ success: false, message: "Cannot connect with yourself" });

    // Assume sender is student, receiver is alumni
    const { error } = await db
      .from("conversations")
      .insert({
        student_id: senderId,
        alumni_id: receiverId,
        job_id: null,
      });

    if (error) throw error;

    res.json({ success: true, message: "Connection request sent" });
  } catch (err) {
    console.error("sendConnectionRequest error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ PUT /connections/:id/accept ============
// Accept connection request
const acceptConnectionRequest = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthenticated" });

    // Since no status, assume it's accepted, do nothing
    res.json({ success: true, message: "Connection accepted" });
  } catch (err) {
    console.error("acceptConnectionRequest error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ PUT /connections/:id/reject ============
// Reject connection request
const rejectConnectionRequest = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthenticated" });

    const { error } = await db
      .from("conversations")
      .delete()
      .eq("id", id)
      .or(`student_id.eq.${userId},alumni_id.eq.${userId}`);

    if (error) throw error;

    res.json({ success: true, message: "Connection request rejected" });
  } catch (err) {
    console.error("rejectConnectionRequest error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ DELETE /connections/:connectionId ============
// Remove connection
const removeConnection = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { connectionId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthenticated" });
    if (!connectionId) return res.status(400).json({ success: false, message: "Connection ID required" });

    const { error } = await db
      .from("conversations")
      .delete()
      .eq("id", connectionId)
      .or(`student_id.eq.${userId},alumni_id.eq.${userId}`);

    if (error) throw error;

    res.json({ success: true, message: "Connection removed" });
  } catch (err) {
    console.error("removeConnection error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getConnections,
  getConnectionRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
};
