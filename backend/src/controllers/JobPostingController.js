// JobPostingController.js - Handles alumni job posting and management operations
const db = require("../config/db");

// Post a new job (Alumni only)
const postJob = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Unauthenticated user." });

    // 1) Ensure user is an alumni (profile exists)
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('id, full_name, role, alumni_details(*)')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile || profile.role !== 'alumni') {
      return res.status(400).json({
        error: "Alumni profile not found or user is not an alumni. Complete your profile first.",
      });
    }

    // 2) Find companies owned by this alumni
    const { data: companies, error: companyError } = await db
      .from('companies')
      .select('id, owner_id, name, website, description, is_active')
      .eq('owner_id', profile.id);

    if (companyError) {
      console.error('Company fetch error:', companyError);
      return res.status(500).json({ error: "Failed to fetch company" });
    }

    // If company info is missing, create a placeholder company record so alumni can post jobs
    // If no company exists, create a placeholder company so alumni can post jobs
    let company = companies && companies.length ? companies[0] : null;
    if (!company) {
      try {
        const placeholder = {
          owner_id: profile.id,
          name: profile.full_name || 'My Company',
          website: null,
          description: null,
          is_active: false,
        };
        const { data: insertedCompany, error: insertCompanyErr } = await db
          .from('companies')
          .insert(placeholder)
          .select('id, owner_id, name')
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
    if (profile?.alumni_details?.experience_years) completionPercent += 30;
    if (profile?.full_name) completionPercent += 20;
    if (company?.description) completionPercent += 25;
    if (company?.website) completionPercent += 25;

    if (completionPercent < 70) {
      return res.status(400).json({
        error: "Complete at least 70% of your profile before posting jobs.",
        completionPercent,
      });
    }

    // 4) Validate job input
    const { title, description, location, salary_range, type, mode } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "title and description are required." });
    }

    // 5) Insert job
    const { error: insertError } = await db
      .from('jobs')
      .insert({
        company_id: company.id,
        posted_by: profile.id,
        title: title,
        description: description,
        location: location || null,
        type: type || 'full-time',
        mode: mode || 'on-site',
        salary_range: salary_range || null,
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
const getMyJobs = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Unauthenticated user." });

    // 1️⃣ Ensure profile exists and is an alumni
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
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
      .eq('posted_by', profile.id)
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
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1️⃣ Find the alumni profile for this user
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
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
      .eq('posted_by', profile.id)
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
      .select('id, name, website, description')
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
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1️⃣ Find alumni profile for this user
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
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
    const { title, description, location, salary_range, job_type, work_mode, status } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (salary_range !== undefined) updateData.salary_range = salary_range;
    if (job_type) updateData.job_type = job_type;
    if (work_mode) updateData.work_mode = work_mode;
    if (status) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field required to update." });
    }

    // 3️⃣ Ensure this job belongs to the logged-in alumni
    const { data: job, error: jobError } = await db
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('posted_by', profile.id)
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
    // map legacy keys
    if (updateData.job_type) { updateData.type = updateData.job_type; delete updateData.job_type; }
    if (updateData.work_mode) { updateData.mode = updateData.work_mode; delete updateData.work_mode; }
    if (updateData.status) {
      // allow 'active'|'inactive' or boolean
      if (typeof updateData.status === 'string') {
        updateData.is_active = updateData.status === 'active';
      } else if (typeof updateData.status === 'boolean') {
        updateData.is_active = updateData.status;
      }
      delete updateData.status;
    }

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
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1) Get this user's alumni profile (jobs use alumni_profiles.id)
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
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
      .eq('posted_by', profile.id);

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

module.exports = { postJob, getMyJobs, getJobById, updateJob, deleteJob };
