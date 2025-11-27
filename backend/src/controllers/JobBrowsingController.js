const db = require("../config/db");

// Get all jobs for students with filtering and sorting
const getAllJobsStudent = async (req, res) => {
  try {
    let query = db.from('jobs').select(`

      id, company_id, posted_by, title, description, type, mode, location, salary_range, is_active, created_at,

      companies(name, website, description),

      posted_by:profiles(id, full_name, email, alumni_details(current_position))

    `).eq('is_active', true);

    // Apply filters
    const { search, sort, job_type, location } = req.query;

    // Search filter - search in title and description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Job type filter
    if (job_type) {
      const types = Array.isArray(job_type) ? job_type : [job_type];
      query = query.in('type', types);
    }

    // Location filter
    if (location) {
      const locations = Array.isArray(location) ? location : [location];
      query = query.in('location', locations);
    }

    // Apply sorting
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sort === 'title') {
      query = query.order('title', { ascending: true });
    } else {
      // Default: newest first
      query = query.order('created_at', { ascending: false });
    }

    const { data: jobs, error: jobsError } = await query;

    if (jobsError) {
      console.error('Jobs fetch error:', jobsError);
      return res.status(500).json({ error: "Failed to fetch jobs" });
    }

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs: jobs,
    });
  } catch (err) {
    console.error("getAllJobsStudent error:", err);
    res.status(500).json({ error: "Server error while fetching all jobs" });
  }
};

// Get detailed job information for students
const getJobByIdStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch job + company + alumni details
    const { data: job, error: jobError } = await db
      .from('jobs')
      .select(`

        id, company_id, posted_by, title, description, type, mode, location, salary_range, is_active, created_at,

        companies(id, name, website, description),

        posted_by:profiles(id, full_name, email, alumni_details(current_position, linkedin_url))

      `)
      .eq('id', id)
      .maybeSingle();

    if (jobError) {
      console.error('Job fetch error:', jobError);
      return res.status(500).json({ error: "Failed to fetch job" });
    }

    // Handle missing job
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // 3️⃣ Send result
    return res.status(200).json({
      success: true,
      job: job,
    });
  } catch (err) {
    console.error("getJobByIdStudent error:", err);
    return res.status(500).json({ error: "Server error while fetching job details" });
  }
};

// Get alumni profile for a job
const getAlumniForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get the job to find posted_by
    const { data: job, error: jobError } = await db
      .from('jobs')
      .select('posted_by')
      .eq('id', jobId)
      .maybeSingle();

    if (jobError) throw jobError;

    if (!job) return res.status(404).json({ error: "Job not found" });

    // Get alumni profile
    const { data, error } = await db
      .from('profiles')
      .select('*, alumni_details(*), companies(*)')
      .eq('id', job.posted_by)
      .maybeSingle();

    if (error) throw error;

    res.json({ success: true, alumni: data });
  } catch (err) {
    console.error("getAlumniForJob error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get company details
const getCompanyDetails = async (req, res) => {
  try {
    const { companyId } = req.params;

    const { data, error } = await db
      .from('companies')
      .select('*, owner_id:profiles(id, full_name, email, alumni_details(current_position, linkedin_url))')
      .eq('id', companyId)
      .maybeSingle();

    if (error) throw error;

    if (!data) return res.status(404).json({ error: "Company not found" });

    res.json({ success: true, company: data });
  } catch (err) {
    console.error("getCompanyDetails error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getAllJobsStudent,
  getJobByIdStudent,
  getAlumniForJob,
  getCompanyDetails,
};