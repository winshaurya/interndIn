const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

// Alumni completes profile + company info
const completeProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      name,
      website,
      industry,
      company_size,
      about,
      linkedin,
      currentTitle,
      gradYear,
    } = req.body;

    // 1️⃣ Update alumni profile
    const { error: alumniError } = await db
      .from('alumni_profiles')
      .update({
        grad_year: gradYear,
        current_title: currentTitle,
        created_at: new Date().toISOString(),
      })
      .eq('user_id', id);

    if (alumniError) {
      console.error('Update alumni profile error:', alumniError);
      return res.status(500).json({ error: 'Failed to update alumni profile' });
    }

    const { error: companyError } = await db
      .from('companies')
      .update({
        name: name,
        website: website,
        industry: industry,
        company_size: company_size,
        about: about,
        document_url: linkedin,
        created_at: new Date().toISOString(),
      })
      .eq('user_id', id);

    if (companyError) {
      console.error('Update company error:', companyError);
      return res.status(500).json({ error: 'Failed to update company info' });
    }

    // 3️⃣ Notify admin
    const { data: user, error: userError } = await db
      .from('users')
      .select('email')
      .eq('id', id)
      .single();

    if (userError) {
      console.error('Fetch user error:', userError);
    } else if (user?.email) {
      await sendEmail(
        user.email,
        "New Alumni Approval Required",
        `Alumni with user ID ${id} has submitted company info for approval.`
      );
    }

    res.json({ message: "Alumni profile submitted. Awaiting admin approval." });
  } catch (error) {
    console.error("Alumni Profile Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { error } = await db
      .from('alumni_profiles')
      .update(req.body)
      .eq('user_id', id);

    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const { id } = req.user;

    // Get jobs posted by this alumni
    const { count: jobsCount, error: jobsError } = await db
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('posted_by_alumni_id', id);

    if (jobsError) {
      console.error('Jobs count error:', jobsError);
      return res.status(500).json({ error: "Failed to get jobs count" });
    }

    // Get job ids for applications
    const { data: jobs, error: jobsDataError } = await db
      .from('jobs')
      .select('id')
      .eq('posted_by_alumni_id', id);

    if (jobsDataError) {
      console.error('Jobs data error:', jobsDataError);
      return res.status(500).json({ error: "Failed to get jobs data" });
    }

    let applicationsReceived = 0;
    if (jobs && jobs.length > 0) {
      const jobIds = jobs.map(j => j.id);
      const { count: appCount, error: appError } = await db
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .in('job_id', jobIds);

      if (appError) {
        console.error('Applications count error:', appError);
        return res.status(500).json({ error: "Failed to get applications count" });
      }
      applicationsReceived = appCount || 0;
    }

    // Get company views (simplified - using created_at as proxy)
    const { data: company, error: companyError } = await db
      .from('companies')
      .select('created_at')
      .eq('user_id', id)
      .single();

    if (companyError) {
      console.error('Company fetch error:', companyError);
    }

    res.json({
      jobsPosted: jobsCount || 0,
      applicationsReceived: applicationsReceived,
      companyViews: 1240, // Mock for now
      responseRate: 85 // Mock for now
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { completeProfile, updateProfile, getDashboardStats };

// branchwise email,
