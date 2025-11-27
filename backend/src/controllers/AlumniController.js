const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

/**
 * GET /alumni/profile
 * Returns combined alumni profile + company info for logged-in alumni.
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    // Get profile with alumni details
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("*, alumni_details(*)")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Fetch profile error:", profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    // Get company
    const { data: company, error: companyError } = await db
      .from("companies")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();

    if (companyError) {
      console.error("Fetch company error:", companyError);
    }

    return res.json({
      success: true,
      profile: profile || null,
      company,
    });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * PUT /alumni/profile
 * Upsert alumni profile & company info (create if not exists, update if exists)
 */
const upsertProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const {
      name,
      currentTitle,
      gradYear,
      linkedinUrl,
      website,
      industry,
      company_size,
      about,
      linkedin, // document_url
    } = req.body;

    // Update profiles
    const profileUpdate = {};
    if (name !== undefined) profileUpdate.full_name = name;

    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await db.from("profiles").update(profileUpdate).eq("id", userId);
      if (error) throw error;
    }

    // Upsert alumni_details
    const alumniUpdate = {};
    if (currentTitle !== undefined) alumniUpdate.current_position = currentTitle;
    if (gradYear !== undefined) alumniUpdate.grad_year = gradYear;
    if (linkedinUrl !== undefined) alumniUpdate.linkedin_url = linkedinUrl;

    if (Object.keys(alumniUpdate).length > 0) {
      const { error } = await db.from("alumni_details").upsert({ id: userId, ...alumniUpdate });
      if (error) throw error;
    }

    // Handle company
    const companyUpdate = {};
    if (website !== undefined) companyUpdate.website = website;
    if (industry !== undefined) companyUpdate.description = industry; // map
    if (company_size !== undefined) companyUpdate.location = company_size;
    if (about !== undefined) companyUpdate.description = about;
    if (linkedin !== undefined) companyUpdate.logo_url = linkedin;

    // Check if company exists
    const { data: existingCompany, error: fetchCompanyError } = await db
      .from("companies")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();

    if (fetchCompanyError) throw fetchCompanyError;

    if (existingCompany) {
      if (Object.keys(companyUpdate).length > 0) {
        const { error } = await db
          .from("companies")
          .update(companyUpdate)
          .eq("id", existingCompany.id);
        if (error) throw error;
      }
    } else {
      // Create company if name provided
      const companyName = req.body.companyName || req.body.name;
      if (companyName) {
        const { error } = await db
          .from("companies")
          .insert({
            owner_id: userId,
            name: companyName,
            ...companyUpdate,
          });
        if (error) throw error;
      }
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("upsertProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /alumni/company
 * Create or update company for logged-in alumni
 */
const createOrUpdateCompany = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const { name, website, industry, company_size, about, document_url } = req.body;

    // Check if company exists
    const { data: existingCompany, error: existingError } = await db
      .from("companies")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();

    if (existingError) throw existingError;

    const companyData = {
      name: name || null,
      website: website || null,
      description: about || null,
      location: company_size || null,
      logo_url: document_url || null,
      updated_at: new Date().toISOString(),
    };

    if (existingCompany) {
      // Update
      const { error } = await db
        .from("companies")
        .update(companyData)
        .eq("id", existingCompany.id);
      if (error) throw error;

      return res.json({ message: "Company updated successfully", success: true });
    } else {
      // Create
      const { error } = await db
        .from("companies")
        .insert({
          owner_id: userId,
          ...companyData,
          is_active: false, // pending
        });
      if (error) throw error;

      return res.json({ message: "Company created successfully", success: true });
    }
  } catch (err) {
    console.error("createOrUpdateCompany error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /alumni/companies
 * Returns list of companies
 */
const listCompanies = async (_req, res) => {
  try {
    const { data, error } = await db
      .from("companies")
      .select("id, name, website, description, location, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, count: data.length, companies: data });
  } catch (err) {
    console.error("listCompanies error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Legacy completeProfile
 */
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

    // Update profiles
    const { error: profileError } = await db
      .from("profiles")
      .update({ full_name: name })
      .eq("id", id);

    if (profileError) throw profileError;

    // Update alumni_details
    const { error: alumniError } = await db
      .from("alumni_details")
      .upsert({
        id,
        current_position: currentTitle,
        grad_year: gradYear,
        linkedin_url: linkedin,
      });

    if (alumniError) throw alumniError;

    // Update company
    const { data: company } = await db
      .from("companies")
      .select("id")
      .eq("owner_id", id)
      .maybeSingle();

    if (company) {
      const { error: companyError } = await db
        .from("companies")
        .update({
          name,
          website,
          description: about,
          location: company_size,
          logo_url: linkedin,
          updated_at: new Date().toISOString(),
        })
        .eq("id", company.id);

      if (companyError) throw companyError;
    }

    // Notify admin
    const { data: user } = await db
      .from("profiles")
      .select("email")
      .eq("id", id)
      .single();

    if (user?.email) {
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
      .from("alumni_details")
      .update(req.body)
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    // Get profile
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("*, alumni_details(*)")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    // Jobs posted
    const { count: jobsCount, error: jobsError } = await db
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("posted_by", userId);

    if (jobsError) throw jobsError;

    // Applications received
    const { data: jobs, error: jobsDataError } = await db
      .from("jobs")
      .select("id")
      .eq("posted_by", userId);

    if (jobsDataError) throw jobsDataError;

    let applicationsReceived = 0;
    let chartData = [];
    let topApplicants = [];

    if (jobs && jobs.length > 0) {
      const jobIds = jobs.map((j) => j.id);
      const { data: appData, error: appError } = await db
        .from("job_applications")
        .select(`
          job_id,
          student_id,
          applied_at,
          profiles!job_applications_student_id_fkey(full_name),
          student_details(university_branch, grad_year, skills)
        `)
        .in("job_id", jobIds);

      if (appError) throw appError;

      // Count
      const appCountMap = {};
      appData.forEach(app => {
        appCountMap[app.job_id] = (appCountMap[app.job_id] || 0) + 1;
      });
      applicationsReceived = appData.length;

      // Chart data
      chartData = jobs.map(job => ({
        name: job.title.length > 10 ? job.title.substring(0, 10) + '...' : job.title,
        applications: appCountMap[job.id] || 0,
        jobId: job.id
      }));

      // Top applicants
      topApplicants = appData
        .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
        .slice(0, 5)
        .map(app => ({
          id: app.student_id,
          name: app.profiles?.full_name || 'Unknown',
          degree: app.student_details?.university_branch || 'N/A',
          grad_year: app.student_details?.grad_year || 'N/A',
          appliedAt: app.applied_at
        }));
    }

    // Company
    const { data: company, error: companyError } = await db
      .from("companies")
      .select("id, name, created_at, is_active")
      .eq("owner_id", userId)
      .maybeSingle();

    if (companyError) throw companyError;

    // Response rate
    let responseRate = 0;
    if (applicationsReceived > 0) {
      const { count: respondedCount, error: responseError } = await db
        .from('job_applications')
        .select("*", { count: "exact", head: true })
        .in("job_id", jobs.map(j => j.id))
        .neq('status', 'submitted');

      if (!responseError && respondedCount !== null) {
        responseRate = Math.round((respondedCount / applicationsReceived) * 100);
      }
    }

    // Pipeline
    const pipelineData = {
      draftPostings: 0,
      livePostings: jobsCount || 0,
      applicantsInReview: 0,
      interviewsScheduled: 0,
    };

    // Insights
    const insightsData = {
      avgResponseTime: applicationsReceived > 0 ? "24h" : "N/A",
      offerAcceptance: applicationsReceived > 0 ? "65%" : "N/A",
      topSource: "Direct applications",
    };

    // Upcoming interviews
    const { data: upcomingInterviews, error: interviewsError } = await db
      .from('job_applications')
      .select(`
        id, applied_at, status,
        jobs(title),
        profiles!job_applications_student_id_fkey(full_name)
      `)
      .in("job_id", jobs.map(j => j.id))
      .eq('status', 'interviewing')
      .order('applied_at', { ascending: true })
      .limit(3);

    const upcomingActions = [];
    if (!interviewsError && upcomingInterviews) {
      upcomingInterviews.forEach(interview => {
        upcomingActions.push({
          title: `Interview with ${interview.profiles?.full_name || 'Candidate'}`,
          time: new Date(interview.applied_at).toLocaleDateString('en-US', {
            weekday: 'long',
            hour: 'numeric',
            minute: '2-digit'
          }),
          detail: interview.jobs?.title || 'Position',
        });
      });
    }

    if (upcomingActions.length === 0) {
      upcomingActions.push(
        {
          title: "Review new applications",
          time: "Today · 2:00 PM",
          detail: `${applicationsReceived} pending reviews`,
        },
        {
          title: "Update job postings",
          time: "Tomorrow · 10:00 AM",
          detail: "Refresh requirements",
        }
      );
    }

    // Checklist
    const checklistItems = [];
    if (!company) {
      checklistItems.push({
        title: "Complete company profile",
        priority: "High",
      });
    }
    if (jobsCount === 0) {
      checklistItems.push({
        title: "Post your first job",
        priority: "High",
      });
    }
    if (applicationsReceived === 0 && jobsCount > 0) {
      checklistItems.push({
        title: "Promote job postings",
        priority: "Medium",
      });
    }

    if (checklistItems.length === 0) {
      checklistItems.push(
        {
          title: "Schedule candidate interviews",
          priority: "Medium",
        },
        {
          title: "Update company information",
          priority: "Low",
        }
      );
    }

    res.json({
      jobsPosted: jobsCount || 0,
      applicationsReceived,
      companyViews: 1240,
      responseRate,
      pipelineData,
      insightsData,
      chartData,
      topApplicants,
      upcomingActions,
      checklistItems,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /alumni/profile/:userId
 * Returns public profile information for an alumni
 */
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id || req.user?.userId;

    if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

    // Get profile
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("*, alumni_details(*)")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile || profile.role !== 'alumni') {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Company
    const { data: company, error: companyError } = await db
      .from("companies")
      .select("name, website, description")
      .eq("owner_id", userId)
      .maybeSingle();

    // Check connection
    const { data: connection, error: connectionError } = await db
      .from("conversations")
      .select("id")
      .or(`and(student_id.eq.${currentUserId},alumni_id.eq.${userId}),and(student_id.eq.${userId},alumni_id.eq.${currentUserId})`)
      .limit(1);

    const isConnected = Boolean(connection?.length);

    return res.json({
      profile: {
        ...profile,
        company,
        isConnected,
        userId,
      }
    });
  } catch (err) {
    console.error("Public profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getProfile,
  upsertProfile,
  createOrUpdateCompany,
  listCompanies,
  completeProfile,
  updateProfile,
  getDashboardStats,
  getPublicProfile,
};
