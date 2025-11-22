// JobBrowsingController.js - Handles student job browsing and viewing operations
const db = require("../config/db");

// Get all jobs for students with filtering and sorting
exports.getAllJobsStudent = async (req, res) => {
  try {
    let query = db.from('jobs').select('*');

    // Apply filters
    const { search, sort, employment_type, location, skills } = req.query;

    // Search filter - search in job title and description
    if (search) {
      query = query.or(`job_title.ilike.%${search}%,job_description.ilike.%${search}%`);
    }

    // Employment type filter
    if (employment_type) {
      const types = Array.isArray(employment_type) ? employment_type : [employment_type];
      query = query.in('employment_type', types);
    }

    // Location filter
    if (location) {
      const locations = Array.isArray(location) ? location : [location];
      query = query.in('location', locations);
    }

    // Skills filter - this would require a more complex query with job skills table
    // For now, we'll skip this as the current schema doesn't have a skills relationship
    // TODO: Add job skills relationship table if needed

    // Apply sorting
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sort === 'title') {
      query = query.order('job_title', { ascending: true });
    } else {
      // Default: newest first
      query = query.order('created_at', { ascending: false });
    }

    const { data: jobs, error: jobsError } = await query;

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
        location: job.location,
        employment_type: job.employment_type,
        salary_range: job.salary_range,
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

// Get detailed job information for students
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