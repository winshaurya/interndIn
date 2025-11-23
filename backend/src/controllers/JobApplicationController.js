// JobApplicationController.js - Handles student job application operations
const db = require("../config/db");

// Apply for a job (Student only)
exports.applyJob = async (req, res) => {
  const userId = req.user?.userId ?? req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthenticated user." });

  const {
    jobId,
    job_id,
    firstName,
    lastName,
    email,
    phone,
    coverLetter,
    resumeUrl,
    portfolioUrl,
    customAnswers,
    expectedSalary,
    availableStartDate,
    ndaAccepted
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

    if (!job) throw { status: 404, message: "Job not found" };

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
      .eq('user_id', userId)
      .maybeSingle();

    if (alreadyError) {
      console.error('Duplicate check error:', alreadyError);
      return res.status(500).json({ error: "Server error" });
    }

    if (already) return res.status(400).json({ error: "Already applied for this job" });

    // 4) Insert the application with all provided fields
    const applicationData = {
      job_id: finalJobId,
      user_id: userId,
      resume_url: resumeUrl || null,
      applied_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (firstName) applicationData.first_name = firstName;
    if (lastName) applicationData.last_name = lastName;
    if (email) applicationData.email = email;
    if (phone) applicationData.phone = phone;
    if (coverLetter) applicationData.cover_letter = coverLetter;
    if (portfolioUrl) applicationData.portfolio_url = portfolioUrl;
    if (customAnswers) applicationData.custom_answers = customAnswers;
    if (expectedSalary) applicationData.expected_salary = expectedSalary;
    if (availableStartDate) applicationData.available_start_date = availableStartDate;
    if (ndaAccepted !== undefined) applicationData.nda_accepted = ndaAccepted;

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

    // 5) Recompute + write back the total into job_applications.applicant_count
    const { count: newCount, error: newCountError } = await db
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', finalJobId);

    if (newCountError) {
      console.error('New count error:', newCountError);
      // Continue, as application is inserted
    }

    // Update applicant_count for all rows of that job
    const { error: updateError } = await db
      .from('job_applications')
      .update({ applicant_count: newCount })
      .eq('job_id', finalJobId);

    if (updateError) {
      console.error('Update count error:', updateError);
      // Continue
    }

    return res.status(201).json({ message: "Job application submitted successfully" });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    console.error("applyJob error:", err);
    return res.status(500).json({ error: "Server error while applying to job" });
  }
};

// Get jobs that the authenticated student has applied to
exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    const { data, error } = await db
      .from('job_applications')
      .select(
        `job_id,user_id,resume_url,applicant_count,applied_at,jobs(job_title,job_description,created_at,companies(name,website))`
      )
      .eq('user_id', userId)
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
exports.withdrawApplication = async (req, res) => {
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
      .eq('user_id', userId)
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
      .eq('user_id', userId);

    if (deleteError) {
      console.error('withdrawApplication delete error:', deleteError);
      return res.status(500).json({ error: "Failed to withdraw application" });
    }

    const { count, error: countError } = await db
      .from('job_applications')
      .select('job_id', { count: 'exact', head: true })
      .eq('job_id', job_id);

    if (countError) {
      console.error('withdrawApplication count error:', countError);
    } else {
      await db
        .from('job_applications')
        .update({ applicant_count: count ?? 0 })
        .eq('job_id', job_id);
    }

    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.error("Withdraw application error:", err);
    res.status(500).json({ error: "Server error while withdrawing application" });
  }
};

// // GET /jobs/:jobId/applicants
// exports.viewApplicants = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const user = req.user;

//     // Check if alumni owns the job (unless admin)
//     if (user.role === 'alumni') {
//       const job = await knex('jobs').where({ id: jobId, alumni_id: user.id }).first();
//       if (!job) {
//         return res.status(403).json({ error: 'Not authorized to view applicants of this job' });
//       }
//     }

//     const applicants = await knex('job_applications as ja')
//       .join('students as s', 'ja.student_id', 's.id')
//       .select('ja.id as applicationId', 's.id as studentId', 's.name', 's.email', 'ja.status', 'ja.created_at')
//       .where('ja.job_id', jobId);

//     res.json({ applicants });
//   } catch (err) {
//     console.error('View applicants error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // view application ststus, no of applicants reached
