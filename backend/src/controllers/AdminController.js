const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

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

/* -------------------------------------------
   1️⃣ ALUMNI VERIFICATION
-------------------------------------------- */
exports.getPendingAlumni = async (req, res) => {
  try {
    const rows = await db("users as u")
      .leftJoin("alumni_profiles as ap", "ap.user_id", "u.id")
      .select(
        "u.id as user_id",
        "u.email",
        "u.status",
        "u.is_verified",
        "ap.id as alumni_profile_id",
        "ap.name",
        "ap.grad_year",
        "ap.created_at"
      )
      .where({ "u.role": "alumni", "u.status": "pending" })
      .orderBy("ap.created_at", "desc");

    res.json(rows);
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
    const user = await db("users").where({ id, role: "alumni" }).first();
    if (!user) return res.status(404).json({ error: "Alumni not found" });

    await db("users")
      .where({ id })
      .update({
        status,
        is_verified: status === "approved",
      });

    await notifyUser(
      user.email,
      "Alumni Registration Status",
      " Your alumni registration has been ${status}."
    );

    res.json({ message: "Alumni ${status}" });
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

    const updated = await db("companies")
      .where({ alumni_id: companyId })
      .update({ status: "approved" });

    if (!updated)
      return res
        .status(404)
        .json({ error: "Company not found for this alumni" });

    const alumni = await db("alumni_profiles").where({ id: companyId }).first();
    if (!alumni) return res.status(404).json({ error: "Alumni not found" });

    await db("users")
      .where({ id: alumni.user_id })
      .update({ status: "approved", is_verified: true });

    const user = await db("users").where({ id: alumni.user_id }).first();
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

    const updated = await db("companies")
      .where({ alumni_id: companyId })
      .update({ status: "rejected" });

    if (!updated)
      return res
        .status(404)
        .json({ error: "Company not found for this alumni" });

    const alumni = await db("alumni_profiles").where({ id: companyId }).first();
    if (!alumni) return res.status(404).json({ error: "Alumni not found" });

    await db("users")
      .where({ id: alumni.user_id })
      .update({ status: "rejected" });

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
    const rows = await db("jobs as j")
      .leftJoin("companies as c", "c.alumni_id", "j.company_id")
      .leftJoin("alumni_profiles as ap", "ap.id", "j.posted_by_alumni_id")
      .leftJoin("users as u", "u.id", "ap.user_id")
      .select(
        "j.id as job_id",
        "j.job_title",
        "j.job_description",
        "j.created_at as job_created_at",
        "c.name as company_name",
        "c.website",
        "ap.name as alumni_name",
        "u.email as alumni_email"
      )
      .orderBy("j.created_at", "desc");

    res.json(rows);
  } catch (error) {
    console.error("getAllJobsAdmin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteJobAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await db("jobs").where({ id }).first();
    if (!exists) return res.status(404).json({ error: "Job not found" });

    await db("jobs").where({ id }).del();
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
    const students = await db("student_profiles as sp")
      .leftJoin("users as u", "u.id", "sp.user_id")
      .select(
        "u.id as user_id",
        "u.email",
        "u.role",
        "u.status",
        "sp.name",
        "sp.branch",
        "sp.grad_year"
      )
      .orderBy("sp.created_at", "desc");

    const alumni = await db("alumni_profiles as ap")
      .leftJoin("users as u", "u.id", "ap.user_id")
      .leftJoin("companies as c", "c.alumni_id", "ap.id")
      .select(
        "u.id as user_id",
        "u.email",
        "u.role",
        "u.status",
        "ap.name",
        "ap.grad_year",
        "c.name as company_name",
        "c.status as company_status"
      )
      .orderBy("ap.created_at", "desc");

    res.json({ students, alumni });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await db("users").where({ id }).first();
    if (!exists) return res.status(404).json({ error: "User not found" });

    await db("users").where({ id }).del();
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
    const recipients = await db("users")
      .where({ role: targetRole })
      .select("email");

    for (const r of recipients) {
      await notifyUser(r.email, "Notification from Admin", message);
    }

    res.json({
      message: `Notifications sent to ${recipients.length} ${targetRole}(s)`,
    });
  } catch (error) {
    console.error("sendNotification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
