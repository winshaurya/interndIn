// JobPostingController.js - Handles alumni job posting and management operations
const db = require("../config/db");

// Post a new job (Alumni only)
exports.postJob = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Unauthenticated user." });

    // 1) Alumni profile by user
    const { data: profile, error: profileError } = await db
      .from('alumni_profiles')
      .select('id, name, grad_year, current_title')
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

    // If company info is missing, create a placeholder company record so alumni can post jobs
    if (!company) {
      try {
        const placeholder = {
          alumni_id: profile.id,
          name: profile.name || 'My Company',
          website: null,
          about: null,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        const { data: insertedCompany, error: insertCompanyErr } = await db
          .from('companies')
          .insert(placeholder)
          .select('id, alumni_id, name')
          .maybeSingle();

        if (insertCompanyErr) {
          console.error('Placeholder company insert error:', insertCompanyErr);
          return res.status(500).json({ error: 'Failed to create company record' });
        }

        company = insertedCompany;
      } catch (e) {
        console.error('Auto-create company error:', e);
        return res.status(500).json({ error: 'Failed to ensure company record' });
      }
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

    // 5) Insert job
    const { error: insertError } = await db
      .from('jobs')
      .insert({
        company_id: company.id, // ✅ references companies.alumni_id
        posted_by_alumni_id: profile.id, // ✅ references alumni_profiles.id
        job_title,
        job_description,
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

// Get jobs posted by the authenticated alumni
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

// Get a specific job posted by the authenticated alumni
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

// Update a job posted by the authenticated alumni
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

// Delete a job posted by the authenticated alumni
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