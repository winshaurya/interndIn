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

    // Alumni profile
    const { data: profile, error: profileError } = await db
      .from("alumni_profiles")
      .select("id, name, grad_year, current_title, created_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Fetch alumni profile error:", profileError);
      return res.status(500).json({ error: "Failed to fetch alumni profile" });
    }

    // Company (companies PK may reference alumni_id)
    let company = null;
    if (profile?.id) {
      const { data: companyData, error: companyError } = await db
        .from("companies")
        .select("id, name, website, industry, company_size, about, document_url, status, created_at")
        .eq("alumni_id", profile.id)
        .maybeSingle();

      if (companyError) {
        console.error("Fetch company error:", companyError);
      }
      company = companyData || null;
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
 * Partial update of alumni profile & company info (if fields provided)
 */
const upsertProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const {
      name,
      website,
      industry,
      company_size,
      about,
      linkedin, // document_url
      currentTitle,
      gradYear,
    } = req.body;

    // Update alumni profile fields if provided
    const alumniUpdate = {};
    if (gradYear !== undefined) alumniUpdate.grad_year = gradYear;
    if (currentTitle !== undefined) alumniUpdate.current_title = currentTitle;
    if (name !== undefined) alumniUpdate.name = name;

    if (Object.keys(alumniUpdate).length) {
      const { error: alumniError } = await db
        .from("alumni_profiles")
        .update(alumniUpdate)
        .eq("user_id", userId);

      if (alumniError) {
        console.error("Alumni update error:", alumniError);
        return res.status(500).json({ error: "Failed to update alumni profile" });
      }
    }

    // Need alumni profile id for company operations
    const { data: profile, error: fetchProfileError } = await db
      .from("alumni_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchProfileError || !profile) {
      if (fetchProfileError) console.error("Fetch profile error:", fetchProfileError);
      // Continue but cannot update company without profile
    } else {
      // Upsert company record by alumni_id
      const companyUpdate = {};
      if (website !== undefined) companyUpdate.website = website;
      if (industry !== undefined) companyUpdate.industry = industry;
      if (company_size !== undefined) companyUpdate.company_size = company_size;
      if (about !== undefined) companyUpdate.about = about;
      if (linkedin !== undefined) companyUpdate.document_url = linkedin;
      if (name !== undefined) companyUpdate.name = name;

      if (Object.keys(companyUpdate).length) {
        companyUpdate.updated_at = new Date().toISOString();

        // Check existing
        const { data: existingCompany, error: existingCompanyErr } = await db
          .from("companies")
          .select("id")
          .eq("alumni_id", profile.id)
          .maybeSingle();

        if (existingCompanyErr) {
          console.error("Company existence check error:", existingCompanyErr);
        } else if (existingCompany) {
          const { error: companyError } = await db
            .from("companies")
            .update(companyUpdate)
            .eq("alumni_id", profile.id);

          if (companyError) {
            console.error("Company update error:", companyError);
            return res.status(500).json({ error: "Failed to update company" });
          }
        } else {
          const { error: insertCompanyErr } = await db
            .from("companies")
            .insert({
              ...companyUpdate,
              alumni_id: profile.id,
              created_at: new Date().toISOString(),
            });

          if (insertCompanyErr) {
            console.error("Company insert error:", insertCompanyErr);
            return res.status(500).json({ error: "Failed to create company" });
          }
        }
      }
    }

    return res.json({ message: "Alumni profile updated", success: true });
  } catch (err) {
    console.error("upsertProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /alumni/company
 * Explicit endpoint to create/update company data.
 */
const createOrUpdateCompany = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const {
      name,
      website,
      industry,
      company_size,
      about,
      document_url,
      linkedin,
    } = req.body;

    // Fetch alumni profile
    const { data: profile, error: profileError } = await db
      .from("alumni_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return res.status(400).json({ error: "Alumni profile not found" });
    }

    const payload = {
      name,
      website,
      industry,
      company_size,
      about,
      document_url: document_url || linkedin,
      alumni_id: profile.id,
      updated_at: new Date().toISOString(),
    };

    // Check existing company
    const { data: existing, error: existingErr } = await db
      .from("companies")
      .select("id")
      .eq("alumni_id", profile.id)
      .maybeSingle();

    if (existingErr) {
      console.error("Existing company check error:", existingErr);
      return res.status(500).json({ error: "Failed to check existing company" });
    }

    if (existing) {
      const { error: updateErr } = await db
        .from("companies")
        .update(payload)
        .eq("alumni_id", profile.id);

      if (updateErr) {
        console.error("Company update error:", updateErr);
        return res.status(500).json({ error: "Failed to update company" });
      }
      return res.json({ message: "Company updated", success: true });
    } else {
      payload.created_at = new Date().toISOString();
      const { error: insertErr } = await db.from("companies").insert(payload);
      if (insertErr) {
        console.error("Company insert error:", insertErr);
        return res.status(500).json({ error: "Failed to create company" });
      }
      return res.json({ message: "Company created", success: true });
    }
  } catch (err) {
    console.error("createOrUpdateCompany error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /alumni/companies
 * Returns list of companies (could be filtered later). For now returns basic fields.
 */
const listCompanies = async (_req, res) => {
  try {
    const { data, error } = await db
      .from("companies")
      .select("id, name, website, industry, company_size, about, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("List companies error:", error);
      return res.status(500).json({ error: "Failed to fetch companies" });
    }

    return res.json({ success: true, count: data.length, companies: data });
  } catch (err) {
    console.error("listCompanies error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Existing completeProfile (legacy create) - preserved for backward compatibility.
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

    // Update alumni profile
    const { error: alumniError } = await db
      .from("alumni_profiles")
      .update({
        grad_year: gradYear,
        current_title: currentTitle,
        name: name,
        created_at: new Date().toISOString(),
      })
      .eq("user_id", id);

    if (alumniError) {
      console.error("Update alumni profile error:", alumniError);
      return res.status(500).json({ error: "Failed to update alumni profile" });
    }

    // First get alumni profile to find company by alumni_id
    const { data: alumniProfile, error: alumniFetchError } = await db
      .from("alumni_profiles")
      .select("id")
      .eq("user_id", id)
      .maybeSingle();

    if (alumniFetchError || !alumniProfile) {
      console.error("Alumni profile fetch error:", alumniFetchError);
      return res.status(500).json({ error: "Failed to fetch alumni profile" });
    }

    const { error: companyError } = await db
      .from("companies")
      .update({
        name: name,
        website: website,
        industry: industry,
        company_size: company_size,
        about: about,
        document_url: linkedin,
        updated_at: new Date().toISOString(),
      })
      .eq("alumni_id", alumniProfile.id);

    if (companyError) {
      console.error("Update company error:", companyError);
      return res.status(500).json({ error: "Failed to update company info" });
    }

    // Notify admin (email)
    const { data: user, error: userError } = await db
      .from("users")
      .select("email")
      .eq("id", id)
      .single();

    if (userError) {
      console.error("Fetch user error:", userError);
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
      .from("alumni_profiles")
      .update(req.body)
      .eq("user_id", id);

    if (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    // Get alumni profile first
    const { data: profile, error: profileError } = await db
      .from("alumni_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res.status(400).json({ error: "Alumni profile not found" });
    }

    // Jobs posted by this alumni
    const { count: jobsCount, error: jobsError } = await db
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("posted_by_alumni_id", profile.id);

    if (jobsError) {
      console.error("Jobs count error:", jobsError);
      return res.status(500).json({ error: "Failed to get jobs count" });
    }

    // Job ids for applications
    const { data: jobs, error: jobsDataError } = await db
      .from("jobs")
      .select("id")
      .eq("posted_by_alumni_id", profile.id);

    if (jobsDataError) {
      console.error("Jobs data error:", jobsDataError);
      return res.status(500).json({ error: "Failed to get jobs data" });
    }

    let applicationsReceived = 0;
    if (jobs && jobs.length > 0) {
      const jobIds = jobs.map((j) => j.id);
      const { count: appCount, error: appError } = await db
        .from("job_applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds);

      if (appError) {
        console.error("Applications count error:", appError);
        return res.status(500).json({ error: "Failed to get applications count" });
      }
      applicationsReceived = appCount || 0;
    }

    // Company analytics placeholder
    const { data: company, error: companyError } = await db
      .from("companies")
      .select("created_at")
      .eq("alumni_id", profile.id)
      .maybeSingle();

    if (companyError) {
      console.error("Company fetch error:", companyError);
    }

    // Pipeline data
    const pipelineData = {
      draftPostings: 2,
      livePostings: jobsCount || 0,
      applicantsInReview: Math.floor(applicationsReceived * 0.7) || 0,
      interviewsScheduled: Math.floor(applicationsReceived * 0.2) || 0,
    };

    // Insights data
    const insightsData = {
      avgResponseTime: "12h",
      offerAcceptance: "78%",
      topSource: "Referral program",
    };

    // Upcoming actions
    const upcomingActions = [
      {
        title: "Interview sync with Ruchi",
        time: "Tomorrow · 4:00 PM",
        detail: "Full Stack Internship",
      },
      {
        title: "Share shortlist with placement cell",
        time: "Friday · 11:30 AM",
        detail: "Product Analyst role",
      },
      {
        title: "Feedback reminder",
        time: "Monday · 9:00 AM",
        detail: "7 candidates pending notes",
      },
    ];

    // Checklist items
    const checklistItems = [
      {
        title: "Update stipend band for UI/UX internship",
        priority: "High",
      },
      {
        title: "Record intro video for company profile",
        priority: "Medium",
      },
      {
        title: "Invite co-founders to reviewer workspace",
        priority: "Low",
      },
    ];

    res.json({
      // Basic stats
      jobsPosted: jobsCount || 0,
      applicationsReceived: applicationsReceived,
      companyViews: 1240,
      responseRate: 85,

      // Pipeline data
      ...pipelineData,

      // Insights data
      ...insightsData,

      // Additional dashboard data
      upcomingActions,
      checklistItems,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  // New
  getProfile,
  upsertProfile,
  createOrUpdateCompany,
  listCompanies,
  // Legacy / existing
  completeProfile,
  updateProfile,
  getDashboardStats,
};
