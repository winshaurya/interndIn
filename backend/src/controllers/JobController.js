// const asyncHandler = require("express-async-handler");
// const Job = require("../models/Job");
const db = require("../config/db");

//alumni jobs section
exports.postJob = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Unauthenticated user." });

    // 1) Alumni profile by user
    const { data: profile, error: profileError } = await db
      .from('alumni_profiles')
      .select('id, grad_year, current_title')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res.status(400).json({
        error: "Alumni profile not found. Complete your profile first.",
      });
    }

    // 2) Company for that alumni (companies PK = alumni_id)
    const { data: company, error: companyError } = await db
      .from('companies')
      .select('id, alumni_id, document_url, about, name, website, status')
      .eq('alumni_id', profile.id)
      .maybeSingle();

    if (companyError) {
      console.error('Company fetch error:', companyError);
      return res.status(500).json({ error: "Failed to fetch company" });
    }

    if (!company) {
      return res.status(400).json({
        error: "Company info not found. Submit your company details first.",
      });
    }

    // 3) Completion score
    let completionPercent = 0;
    if (profile.grad_year) completionPercent += 25;
    if (profile.current_title) completionPercent += 25;
    if (company.document_url) completionPercent += 20;
    if (company.about && company.name && company.website)
      completionPercent += 30;

    if (completionPercent < 70) {
      return res.status(400).json({
        error: "Complete at least 70% of your profile before posting jobs.",
        completionPercent,
      });
    }

    // 4) Validate job input
    const { job_title, job_description } = req.body;
    if (!job_title || !job_description) {
      return res
        .status(400)
        .json({ error: "job_title and job_description are required." });
    }

    const role = req.user?.role || roleToAssign;
    console.log("USEr ROLE:", role);

    // 5) Insert job
    const { error: insertError } = await db
      .from('jobs')
      .insert({
        company_id: company.id, // ✅ references companies.alumni_id
        posted_by_alumni_id: profile.id, // ✅ references alumni_profiles.id
        job_title,
        job_description,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Job insert error:', insertError);
      return res.status(500).json({ error: "Failed to post job" });
    }

    return res.json({ message: "Job posted successfully" });
  } catch (error) {
    console.error("Post Job Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Unauthenticated user." });

    // 1️⃣ Find the alumni profile linked to this user
    const { data: profile, error: profileError } = await db
      .from('alumni_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res
        .status(400)
        .json({ error: "Alumni profile not found for this user." });
    }

    // 2️⃣ Fetch jobs posted by this alumni
    const { data: jobs, error: jobsError } = await db
      .from('jobs')
      .select('*')
      .eq('posted_by_alumni_id', profile.id)
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Jobs fetch error:', jobsError);
      return res.status(500).json({ error: "Failed to fetch jobs" });
    }

    // 3️⃣ Return jobs
    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error("getMyJobs error:", err);
    return res.status(500).json({ error: "Server error while fetching jobs" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1️⃣ Find the alumni profile for this user
    const { data: profile, error: profileError } = await db
      .from('alumni_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res
        .status(400)
        .json({ error: "Alumni profile not found for this user." });
    }

    // 2️⃣ Fetch the job only if it belongs to this alumni
    const { data: job, error: jobError } = await db
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('posted_by_alumni_id', profile.id)
      .maybeSingle();

    if (jobError) {
      console.error('Job fetch error:', jobError);
      return res.status(500).json({ error: "Failed to fetch job" });
    }

    if (!job) {
      return res.status(404).json({ error: "Job not found or unauthorized." });
    }

    // 3️⃣ Optionally, fetch related company info
    const { data: company, error: companyError } = await db
      .from('companies')
      .select('id, name, website, about')
      .eq('id', job.company_id)
      .maybeSingle();

    if (companyError) {
      console.error('Company fetch error:', companyError);
      return res.status(500).json({ error: "Failed to fetch company" });
    }

    return res.status(200).json({
      success: true,
      job: {
        ...job,
        company,
      },
    });
  } catch (err) {
    console.error("getJobById error:", err);
    res.status(500).json({ error: "Server error while fetching job" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1️⃣ Find alumni profile for this user
    const { data: profile, error: profileError } = await db
      .from('alumni_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res
        .status(400)
        .json({ error: "Alumni profile not found for this user." });
    }

    // 2️⃣ Extract only allowed fields for update
    const { job_title, job_description } = req.body;
    const updateData = {};

    if (job_title) updateData.job_title = job_title;
    if (job_description) updateData.job_description = job_description;

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field (job_title/job_description) required to update." });
    }

    // 3️⃣ Ensure this job belongs to the logged-in alumni
    const { data: job, error: jobError } = await db
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('posted_by_alumni_id', profile.id)
      .maybeSingle();

    if (jobError) {
      console.error('Job fetch error:', jobError);
      return res.status(500).json({ error: "Failed to fetch job" });
    }

    if (!job) {
      return res
        .status(404)
        .json({ error: "Job not found or unauthorized to update." });
    }

    // 4️⃣ Update job record
    const { error: updateError } = await db
      .from('jobs')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Job update error:', updateError);
      return res.status(500).json({ error: "Failed to update job" });
    }

    return res.status(200).json({ message: "Job updated successfully" });
  } catch (err) {
    console.error("Update Job Error:", err);
    return res.status(500).json({ error: "Internal server error while updating job." });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1) Get this user's alumni profile (jobs use alumni_profiles.id)
    const { data: profile, error: profileError } = await db
      .from('alumni_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res.status(400).json({ error: "Alumni profile not found for this user." });
    }

    // 2) Delete only if the job belongs to this alumni
    const { error: deleteError } = await db
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('posted_by_alumni_id', profile.id);

    if (deleteError) {
      console.error('Job delete error:', deleteError);
      return res.status(500).json({ error: "Failed to delete job" });
    }

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Delete Job Error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error while deleting job." });
  }
};

//student jobs section 

exports.getAllJobsStudent = async (req, res) => {
  try {
    // ✅ Fetch all jobs, joining with company & alumni info for context
    const { data: jobs, error: jobsError } = await db
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Jobs fetch error:', jobsError);
      return res.status(500).json({ error: "Failed to fetch jobs" });
    }

    // Enrich with company and alumni info
    const enrichedJobs = await Promise.all(jobs.map(async (job) => {
      const { data: company, error: companyError } = await db
        .from('companies')
        .select('name, website, about')
        .eq('id', job.company_id)
        .maybeSingle();

      const { data: alumni, error: alumniError } = await db
        .from('alumni_profiles')
        .select('name, current_title, grad_year')
        .eq('id', job.posted_by_alumni_id)
        .maybeSingle();

      return {
        job_id: job.id,
        job_title: job.job_title,
        job_description: job.job_description,
        created_at: job.created_at,
        company_name: company?.name,
        company_website: company?.website,
        company_about: company?.about,
        alumni_name: alumni?.name,
        alumni_designation: alumni?.current_title,
        alumni_grad_year: alumni?.grad_year,
      };
    }));

    return res.status(200).json({
      success: true,
      count: enrichedJobs.length,
      jobs: enrichedJobs,
    });
  } catch (err) {
    console.error("getAllJobsStudent error:", err);
    res.status(500).json({ error: "Server error while fetching all jobs" });
  }
};

exports.getJobByIdStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Fetch job + company + alumni details
    const { data: job, error: jobError } = await db
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (jobError) {
      console.error('Job fetch error:', jobError);
      return res.status(500).json({ error: "Failed to fetch job" });
    }

    // 2️⃣ Handle missing job
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Fetch company and alumni
    const { data: company, error: companyError } = await db
      .from('companies')
      .select('id, name, website, about')
      .eq('id', job.company_id)
      .maybeSingle();

    const { data: alumni, error: alumniError } = await db
      .from('alumni_profiles')
      .select('id, name, current_title, grad_year')
      .eq('id', job.posted_by_alumni_id)
      .maybeSingle();

    const enrichedJob = {
      job_id: job.id,
      job_title: job.job_title,
      job_description: job.job_description,
      created_at: job.created_at,
      company_id: company?.id,
      company_name: company?.name,
      company_website: company?.website,
      company_about: company?.about,
      alumni_profile_id: alumni?.id,
      alumni_name: alumni?.name,
      alumni_designation: alumni?.current_title,
      alumni_grad_year: alumni?.grad_year,
    };

    // 3️⃣ Send result
    return res.status(200).json({
      success: true,
      job: enrichedJob,
    });
  } catch (err) {
    console.error("getJobByIdStudent error:", err);
    return res.status(500).json({ error: "Server error while fetching job details" });
  }
};

exports.applyJob = async (req, res) => {
  const userId = req.user?.userId ?? req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthenticated user." });

  const job_id = req.body.job_id || req.body.jobId;
  const resume_url = req.body.resume_url || null;
  if (!job_id) return res.status(400).json({ error: "job_id is required" });

  try {
    // 1) Ensure the job exists
    const { data: job, error: jobError } = await db
      .from('jobs')
      .select('id')
      .eq('id', job_id)
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
      .eq('job_id', job_id);

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
      .eq('job_id', job_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (alreadyError) {
      console.error('Duplicate check error:', alreadyError);
      return res.status(500).json({ error: "Server error" });
    }

    if (already) return res.status(400).json({ error: "Already applied for this job" });

    // 4) Insert the application
    const { error: insertError } = await db
      .from('job_applications')
      .insert({
        job_id,
        user_id: userId,
        resume_url,
        applied_at: new Date().toISOString(),
      });

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
      .eq('job_id', job_id);

    if (newCountError) {
      console.error('New count error:', newCountError);
      // Continue, as application is inserted
    }

    // Update applicant_count for all rows of that job
    const { error: updateError } = await db
      .from('job_applications')
      .update({ applicant_count: newCount })
      .eq('job_id', job_id);

    if (updateError) {
      console.error('Update count error:', updateError);
      // Continue
    }

    return res.status(201).json({ message: "Job application submitted" });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    console.error("applyJob error:", err);
    return res.status(500).json({ error: "Server error while applying to job" });
  }
};

exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    const rows = await db("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .select(
        "ja.job_id",
        "ja.user_id",
        "ja.resume_url",
        db.raw('ja.applicant_count as no_of_applicants'),
        "ja.applied_at",
        "j.job_title",
        "j.job_description",
        "j.created_at as job_created_at",
        "c.name as company_name",
        "c.website as company_website"
      )
      .where("ja.user_id", userId)
      .orderBy("ja.applied_at", "desc");

    return res.status(200).json({
      success: true,
      count: rows.length,
      applications: rows,
    });
  } catch (err) {
    console.error("getAppliedJobs error:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching applied jobs" });
  }
};



//application 
exports.withdrawApplication = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    const { job_id } = req.params; // we'll withdraw by job_id instead of applicationId

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1️⃣ Find the application
    const application = await db("job_applications")
      .where({ job_id, user_id: userId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // 2️⃣ Start a transaction for consistency
    await db.transaction(async (trx) => {
      // Delete the application
      await trx("job_applications")
        .where({ job_id, user_id: userId })
        .del();

      // 3️⃣ Recount remaining applicants for that job
      const countRow = await trx("job_applications")
        .where({ job_id })
        .count("* as c")
        .first();
      const updatedCount = Number(countRow?.c || 0);

      // 4️⃣ Update the applicant_count column for all remaining rows of that job
      await trx.raw(
        'UPDATE job_applications SET applicant_count = ? WHERE job_id = ?',
        [updatedCount, job_id]
      );
    });

    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.error("Withdraw application error:", err);
    res.status(500).json({ error: "Server error while withdrawing application" });
  }
};

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
      // get this user's alumni_profile id
      const profile = await db("alumni_profiles")
        .select("id")
        .where({ user_id: userId })
        .first();

      if (!profile) {
        return res.status(400).json({ error: "Alumni profile not found for this user." });
      }

      // verify the job is posted by this alumni
      const ownsJob = await db("jobs")
        .where({ id: jobId, posted_by_alumni_id: profile.id })
        .first();

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
    const applicants = await db("job_applications as ja")
      .join("users as u", "ja.user_id", "u.id")
      .leftJoin("student_profiles as sp", "sp.user_id", "u.id")
      .select(
        "ja.job_id",
        "ja.user_id as student_user_id",
        "ja.resume_url",
        db.raw('ja.applicant_count as no_of_applicants'), // renamed column
        "ja.applied_at",
        "u.email as student_email",
        "sp.name as student_name",
        "sp.branch as student_branch",
        "sp.grad_year as student_grad_year"
      )
      .where("ja.job_id", jobId)
      .orderBy("ja.applied_at", "desc");

    return res.status(200).json({
      success: true,
      count: applicants.length,
      applicants,
    });
  } catch (err) {
    console.error("View applicants error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


