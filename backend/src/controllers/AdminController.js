const db = require("../config/db");
const { sendEmail } = require("../services/emailService");
const { getUserId, getCurrentTimestamp } = require("../utils/authUtils");
const { getAdminDashboardStats } = require("../services/dashboardService");

// Helper to safely send HTML/text emails
const notifyUser = async (email, subject, message) => {
  if (!email) return;
  try {
    await sendEmail({
      to: email,
      subject,
      html: `${message}`,
      text: message,
    });
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};

const fetchProfile = async (id) => {
  const { data, error } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
};

const updateProfile = async (id, payload) => {
  const { error } = await db.from("profiles").update(payload).eq("id", id);
  if (error) throw error;
};

/* -------------------------------------------
   1️⃣ ALUMNI VERIFICATION
-------------------------------------------- */
exports.getPendingAlumni = async (req, res) => {
  try {
    const { data, error } = await db
      .from("profiles")
      .select("id, email, full_name, created_at, is_verified, alumni_details(*)")
      .eq("role", "alumni")
      .eq("is_verified", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error("getPendingAlumni error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyAlumni = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // action = 'approve'|'reject'

  if (!['approve', 'reject'].includes(action))
    return res.status(400).json({ error: 'Invalid action' });

  try {
    const profile = await fetchProfile(id);
    if (!profile || profile.role !== 'alumni') {
      return res.status(404).json({ error: 'Alumni profile not found' });
    }

    const is_verified = action === 'approve';
    await updateProfile(id, { is_verified, updated_at: nowIso() });

    await notifyUser(
      profile.email,
      'Alumni Registration Status',
      `Your alumni registration has been ${is_verified ? 'approved' : 'rejected'}.`
    );

    res.json({ message: `Alumni ${is_verified ? 'approved' : 'rejected'}` });
  } catch (error) {
    console.error('verifyAlumni error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* -------------------------------------------
   2️⃣ COMPANY APPROVAL
-------------------------------------------- */
// Approve a company (activate)
exports.approveCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { error } = await db
      .from('companies')
      .update({ is_active: true, updated_at: nowIso() })
      .eq('id', companyId);
    if (error) throw error;

    // notify owner
    const { data: company } = await db.from('companies').select('id, owner_id, name').eq('id', companyId).maybeSingle();
    if (company) {
      const owner = await fetchProfile(company.owner_id);
      await notifyUser(owner?.email, 'Company Approved', `Your company "${company.name}" has been approved.`);
    }

    res.json({ message: 'Company approved' });
  } catch (error) {
    console.error('approveCompany error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reject a company (deactivate)
exports.rejectCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { error } = await db
      .from('companies')
      .update({ is_active: false, updated_at: nowIso() })
      .eq('id', companyId);
    if (error) throw error;

    const { data: company } = await db.from('companies').select('id, owner_id, name').eq('id', companyId).maybeSingle();
    if (company) {
      const owner = await fetchProfile(company.owner_id);
      await notifyUser(owner?.email, 'Company Rejected', `Your company "${company.name}" has been rejected.`);
    }

    res.json({ message: 'Company rejected' });
  } catch (error) {
    console.error('rejectCompany error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* -------------------------------------------
   3️⃣ JOB OVERSIGHT
-------------------------------------------- */
exports.getAllJobsAdmin = async (req, res) => {
  try {
    const { data, error } = await db
      .from('jobs')
      .select(`
        *,
        companies(name, website, description),
        posted_by:profiles(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('getAllJobsAdmin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteJobAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: exists, error: fetchError } = await db
      .from("jobs")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!exists) return res.status(404).json({ error: "Job not found" });

    const { error } = await db.from("jobs").delete().eq("id", id);
    if (error) throw error;

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("deleteJobAdmin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------
   4️⃣ USER MANAGEMENT
-------------------------------------------- */
exports.getAllUsers = async (req, res) => {
  try {
    const [studentsRes, alumniRes] = await Promise.all([
      db
        .from('profiles')
        .select('id, full_name, email, created_at, student_details(*)')
        .eq('role', 'student')
        .order('created_at', { ascending: false }),
      db
        .from('profiles')
        .select('id, full_name, email, created_at, alumni_details(*), companies(*)')
        .eq('role', 'alumni')
        .order('created_at', { ascending: false }),
    ]);

    if (studentsRes.error) throw studentsRes.error;
    if (alumniRes.error) throw alumniRes.error;

    res.json({ students: studentsRes.data || [], alumni: alumniRes.data || [] });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await fetchProfile(id);
    if (!profile) return res.status(404).json({ error: 'User not found' });

    // Use Supabase admin to delete auth user
    const svc = db.getServiceClient();
    const { error: deleteErr } = await svc.auth.admin.deleteUser(id);
    if (deleteErr) throw deleteErr;

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* -------------------------------------------
   5️⃣ NOTIFICATIONS
-------------------------------------------- */
exports.sendNotification = async (req, res) => {
  const { message, targetRole } = req.body;

  if (!message || !['student', 'alumni'].includes(targetRole))
    return res.status(400).json({ error: "message and targetRole ('student'|'alumni') required" });

  try {
    const { data: recipients, error } = await db
      .from('profiles')
      .select('email')
      .eq('role', targetRole);

    if (error) throw error;

    for (const r of recipients || []) {
      await notifyUser(r.email, 'Notification from Admin', message);
    }

    res.json({ message: `Notifications sent to ${recipients?.length || 0} ${targetRole}(s)` });
  } catch (error) {
    console.error('sendNotification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await getAdminDashboardStats();
catc{j(ss);
 c (err {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PUT /admin/users/:id/status
 * Admin updates a user status (approved|rejected|pending|inactive)
 * Mirrors frontend updateUserStatus(userId, status)
 */
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ["approved", "rejected", "pending", "inactive"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }
  try {
    const profile = await fetchProfile(id);
    if (!profile) return res.status(404).json({ error: "User not found" });

    await updateProfile(id, {
      is_verified: status === "approved",
      updated_at: nowIso(),
    });

    res.json({ message: "User status updated", status });
  } catch (err) {
    console.error("updateUserStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getPendingAlumni,
  verifyAlumni,
  approveCompany,
  rejectCompany,
  getAllJobsAdmin,
  deleteJobAdmin,
  getAllUsers,
  deleteUser,
  sendNotification,
  getDashboardStats,
  updateUserStatus,
};
