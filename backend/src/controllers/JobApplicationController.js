// JobApplicationController.js - Handles student job application operations
const db = require("../config/db");

// Apply for a job (Student only)
const applyForJob = async (req, res) => {
  const userId = req.user?.userId ?? req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthenticated user." });

  const {
    jobId,
    job_id,
    coverLetter,
    resumeUrl
  } = req.body;

  const finalJobId = job_id || jobId;
  if (!finalJobId) return res.status(400).json({ error: "jobId is required" });

  try {
    // 1) Ensure the job exists
    const { data: job, error: jobError } = await db
      .from('jobs')
      .select('id')
      .eq('id', finalJobId)
      .maybeSingle();

    if (jobError) {
      console.error('Job check error:', jobError);
      return res.status(500).json({ error: "Server error" });
    }

    if (!job) return res.status(404).json({ error: "Job not found" });

    // 2) Capacity check based on current applications count
    const { count: currentCount, error: countError } = await db
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', finalJobId);

    if (countError) {
      console.error('Count error:', countError);
      return res.status(500).json({ error: "Server error" });
    }

    if (currentCount >= 50) {
      return res.status(400).json({ error: "Applications are closed for this job (capacity reached)." });
    }

    // 3) Prevent duplicate application by same user
    const { data: already, error: alreadyError } = await db
      .from('job_applications')
      .select('*')
      .eq('job_id', finalJobId)
      .eq('student_id', userId)
      .maybeSingle();

    if (alreadyError) {
      console.error('Duplicate check error:', alreadyError);
      return res.status(500).json({ error: "Server error" });
    }

    if (already) return res.status(400).json({ error: "Already applied for this job" });

    // 4) Insert the application with simplified fields
    const applicationData = {
      job_id: finalJobId,
      student_id: userId,
      resume_url: resumeUrl || null,
      cover_letter: coverLetter || null,
      status: 'submitted',
      applied_at: new Date().toISOString(),
    };

    const { error: insertError } = await db
      .from('job_applications')
      .insert(applicationData);

    if (insertError) {
      console.error('Insert application error:', insertError);
      if (insertError.code === '23505') {
        return res.status(409).json({ error: "Already applied for this job" });
      }
      return res.status(500).json({ error: "Server error" });
    }

    return res.status(201).json({ message: "Job application submitted successfully" });
  } catch (err) {
    console.error("applyJob error:", err);
    return res.status(500).json({ error: "Server error while applying to job" });
  }
};

// Get jobs that the authenticated student has applied to
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    const { data, error } = await db
      .from('job_applications')
      .select(
        `job_id,student_id,resume_url,cover_letter,status,applied_at,jobs(title,description,created_at,companies(name,website))`
      )
      .eq('student_id', userId)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('getAppliedJobs query error:', error);
      return res.status(500).json({ error: "Server error while fetching applied jobs" });
    }

    return res.status(200).json({
      success: true,
      count: data?.length || 0,
      applications: data || [],
    });
  } catch (err) {
    console.error("getAppliedJobs error:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching applied jobs" });
  }
};

// Withdraw a job application (Student only)
const withdrawApplication = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    const { job_id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    const { data: application, error: fetchError } = await db
      .from('job_applications')
      .select('job_id')
      .eq('job_id', job_id)
      .eq('student_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('withdrawApplication fetch error:', fetchError);
      return res.status(500).json({ error: "Failed to fetch application" });
    }

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const { error: deleteError } = await db
      .from('job_applications')
      .delete()
      .eq('job_id', job_id)
      .eq('student_id', userId);

    if (deleteError) {
      console.error('withdrawApplication delete error:', deleteError);
      return res.status(500).json({ error: "Failed to withdraw application" });
    }

    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.error("Withdraw application error:", err);
    res.status(500).json({ error: "Server error while withdrawing application" });
  }
};

// Get applications for a job (Alumni only)
const getApplicationsForJob = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    const { jobId } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    // Check if the job is posted by this alumni
    const { data: job, error: jobError } = await db
      .from('jobs')
      .select('posted_by')
      .eq('id', jobId)
      .maybeSingle();

    if (jobError) throw jobError;

    if (!job || job.posted_by !== userId) return res.status(403).json({ error: "Forbidden" });

    const { data, error } = await db
      .from('job_applications')
      .select(`
        id, job_id, student_id, resume_url, cover_letter, status, applied_at,
        profiles!job_applications_student_id_fkey(full_name, email),
        student_details(university_branch, grad_year, skills)
      `)
      .eq("job_id", jobId);

    if (error) throw error;

    res.json({ success: true, applications: data });
  } catch (err) {
    console.error("getApplicationsForJob error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update application status (Alumni only)
const updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    const { applicationId, status } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Check if the application is for a job posted by this alumni
    const { data: app, error: appError } = await db
      .from("job_applications")
      .select("job_id, jobs(posted_by)")
      .eq("id", applicationId)
      .single();

    if (appError || !app) return res.status(404).json({ error: "Application not found" });

    if (app.jobs.posted_by !== userId) return res.status(403).json({ error: "Forbidden" });

    const { error } = await db
      .from("job_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", applicationId);

    if (error) throw error;

    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  withdrawApplication,
  getApplicationsForJob,
  updateApplicationStatus,
};
