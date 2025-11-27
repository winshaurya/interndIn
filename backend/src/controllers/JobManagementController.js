// JobManagementController.js - Handles administrative job management operations
const db = require("../config/db");

// View applicants for a specific job (Alumni/Admin only)
const viewApplicants = async (req, res) => {
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
      // Ensure user is an alumni profile
      const { data: profCheck, error: profErr } = await db.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (profErr) {
        console.error('viewApplicants profile error:', profErr);
        return res.status(500).json({ error: "Server error" });
      }
      if (!profCheck || profCheck.role !== 'alumni') {
        return res.status(400).json({ error: "Alumni profile not found for this user." });
      }

      const { data: ownsJob, error: ownsJobError } = await db
        .from('jobs')
        .select('id')
        .eq('id', jobId)
        .eq('posted_by', userId)
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
        student_id,
        resume_url,
        applied_at,
        profiles!inner(email),
        student_details!inner(university_branch, grad_year, skills)
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

module.exports = { viewApplicants };