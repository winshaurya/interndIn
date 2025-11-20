const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

const getUserId = (req) => req.user?.userId ?? req.user?.id;
const nowIso = () => new Date().toISOString();
const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

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

const fetchUser = async (id) => {
  const { data, error } = await db.from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
};

const updateUser = async (id, payload) => {
  const { error } = await db.from("users").update(payload).eq("id", id);
  if (error) throw error;
};

/* -------------------------------------------
   1️⃣ ALUMNI VERIFICATION
-------------------------------------------- */
exports.getPendingAlumni = async (req, res) => {
  try {
    const { data, error } = await db
      .from("users")
      .select("id,email,status,is_verified,alumni_profiles(id,name,grad_year,created_at)")
      .eq("role", "alumni")
      .eq("status", "pending")
      .order("created_at", { ascending: false, referencedTable: "alumni_profiles" });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error("getPendingAlumni error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyAlumni = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status))
    return res.status(400).json({ error: "Invalid status" });

  try {
    const user = await fetchUser(id);
    if (!user || user.role !== "alumni") {
      return res.status(404).json({ error: "Alumni not found" });
    }

    await updateUser(id, {
      status,
      is_verified: status === "approved",
      updated_at: nowIso(),
    });

    await notifyUser(
      user.email,
      "Alumni Registration Status",
      `Your alumni registration has been ${status}.`
    );

    res.json({ message: `Alumni ${status}` });
  } catch (error) {
    console.error("verifyAlumni error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------
   2️⃣ COMPANY APPROVAL
-------------------------------------------- */
exports.approveAlumni = async (req, res) => {
  try {
    const { companyId } = req.params;

    const { error: companyError } = await db
      .from("companies")
      .update({ status: "approved", updated_at: nowIso() })
      .eq("alumni_id", companyId);

    if (companyError) throw companyError;

    const { data: alumni, error: alumniError } = await db
      .from("alumni_profiles")
      .select("id,user_id")
      .eq("id", companyId)
      .maybeSingle();

    if (alumniError) throw alumniError;
    if (!alumni) return res.status(404).json({ error: "Alumni not found" });

    await updateUser(alumni.user_id, { status: "approved", is_verified: true, updated_at: nowIso() });

    const user = await fetchUser(alumni.user_id);
    await notifyUser(
      user?.email,
      "Company Approved",
      "Your company has been approved. You can now post jobs."
    );

    res.json({ message: "Alumni & company approved successfully" });
  } catch (error) {
    console.error("approveAlumni error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rejectAlumni = async (req, res) => {
  try {
    const { companyId } = req.params;

    const { error: companyError } = await db
      .from("companies")
      .update({ status: "rejected", updated_at: nowIso() })
      .eq("alumni_id", companyId);

    if (companyError) throw companyError;

    const { data: alumni, error: alumniError } = await db
      .from("alumni_profiles")
      .select("id,user_id")
      .eq("id", companyId)
      .maybeSingle();

    if (alumniError) throw alumniError;
    if (!alumni) return res.status(404).json({ error: "Alumni not found" });

    await updateUser(alumni.user_id, { status: "rejected", updated_at: nowIso() });

    res.json({ message: "Alumni & company rejected successfully" });
  } catch (error) {
    console.error("rejectAlumni error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------
   3️⃣ JOB OVERSIGHT
-------------------------------------------- */
exports.getAllJobsAdmin = async (req, res) => {
  try {
    const { data, error } = await db
      .from("jobs")
      .select(
        `id,job_title,job_description,created_at,companies(name,website),alumni_profiles(name,users(email))`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error("getAllJobsAdmin error:", error);
    res.status(500).json({ error: "Internal server error" });
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
        .from("student_profiles")
        .select("id,name,branch,grad_year,created_at,users(id,email,role,status)")
        .order("created_at", { ascending: false }),
      db
        .from("alumni_profiles")
        .select(
          "id,name,grad_year,created_at,users(id,email,role,status),companies(name,status)"
        )
        .order("created_at", { ascending: false }),
    ]);

    if (studentsRes.error) throw studentsRes.error;
    if (alumniRes.error) throw alumniRes.error;

    res.json({ students: studentsRes.data || [], alumni: alumniRes.data || [] });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await fetchUser(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { error } = await db.from("users").delete().eq("id", id);
    if (error) throw error;

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------
   5️⃣ NOTIFICATIONS
-------------------------------------------- */
exports.sendNotification = async (req, res) => {
  const { message, targetRole } = req.body;

  if (!message || !["student", "alumni"].includes(targetRole))
    return res
      .status(400)
      .json({ error: "message and targetRole ('student'|'alumni') required" });

  try {
    const { data: recipients, error } = await db
      .from("users")
      .select("email")
      .eq("role", targetRole);

    if (error) throw error;

    for (const r of recipients || []) {
      await notifyUser(r.email, "Notification from Admin", message);
    }

    res.json({
      message: `Notifications sent to ${recipients?.length || 0} ${targetRole}(s)`,
    });
  } catch (error) {
    console.error("sendNotification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [{ count: newUsers }, { count: activeCompanies }, { count: livePostings }, { count: applicationsToday }] =
      await Promise.all([
        db.from("users").select("id", { count: "exact", head: true }).gt("created_at", thirtyDaysAgo()),
        db.from("companies").select("id", { count: "exact", head: true }).eq("status", "active"),
        db.from("jobs").select("id", { count: "exact", head: true }),
        db.from("job_applications").select("id", { count: "exact", head: true }).gt("applied_at", new Date().toISOString().slice(0, 10)),
      ]);

    res.json({
      newUsers: newUsers ?? 0,
      activeCompanies: activeCompanies ?? 0,
      livePostings: livePostings ?? 0,
      applicationsToday: applicationsToday ?? 0,
    });
  } catch (error) {
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
    const user = await fetchUser(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await updateUser(id, {
      status,
      is_verified: status === "approved",
      updated_at: nowIso(),
    });

    res.json({ message: "User status updated", status });
  } catch (err) {
    console.error("updateUserStatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
