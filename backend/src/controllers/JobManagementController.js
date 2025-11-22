// JobManagementController.js - Handles administrative job management operations
const db = require("../config/db");

// View applicants for a specific job (Alumni/Admin only)
exports.viewApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user?.userId ?? req.user?.id;
    const role = (req.user?.role || "").toLowerCase();

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // ---------------------------
// Authorization (admin bypass)
    // ---------------------------
    if (role === "alumni") {
      const { data: profile, error: profileError } = await db
        .from('alumni_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('viewApplicants profile error:', profileError);
        return res.status(500).json({ error: "Server error" });
      }

      if (!profile) {
        return res.status(400).json({ error: "Alumni profile not found for this user." });
      }

      const { data: ownsJob, error: ownsJobError } = await db
        .from('jobs')
        .select('id')
        .eq('id', jobId)
        .eq('posted_by_alumni_id', profile.id)
        .maybeSingle();

      if (ownsJobError) {
        console.error('viewApplicants job check error:', ownsJobError);
        return res.status(500).json({ error: "Server error" });
      }

      if (!ownsJob) {
        return res
          .status(403)
          .json({ error: "Not authorized to view applicants of this job" });
      }
    }
    // role === 'admin' → allowed. For other roles, forbid:
    else if (role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    // ---------------------------
// Fetch applicants
    // ---------------------------
    const { data: applicants, error: applicantsError } = await db
      .from('job_applications')
      .select(`
        job_id,
        user_id,
        resume_url,
        applicant_count,
        applied_at,
        users!inner(email),
        student_profiles!inner(name, branch, grad_year)
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (applicantsError) {
      console.error('viewApplicants query error:', applicantsError);
      return res.status(500).json({ error: "Server error" });
    }

    return res.status(200).json({
      success: true,
      count: applicants?.length || 0,
      applicants: applicants || [],
    });
  } catch (err) {
    console.error("View applicants error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};