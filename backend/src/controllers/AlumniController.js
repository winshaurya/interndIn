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
 * Upsert alumni profile & company info (create if not exists, update if exists)
 */
const upsertProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const {
      name,
      phone,
      currentTitle,
      companyName,
      gradYear,
      bio,
      skills,
      experienceYears,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      companyWebsite,
      dateOfBirth,
      address,
      website,
      industry,
      company_size,
      about,
      linkedin, // document_url
    } = req.body;

    // Check if alumni profile exists
    const { data: existingProfile, error: fetchProfileError } = await db
      .from("alumni_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchProfileError) {
      console.error("Fetch profile error:", fetchProfileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    let profileId;

    if (existingProfile) {
      // Update existing profile
      const alumniUpdate = {};
      if (name !== undefined) alumniUpdate.name = name;
      if (phone !== undefined) alumniUpdate.phone = phone;
      if (currentTitle !== undefined) alumniUpdate.current_title = currentTitle;
      if (companyName !== undefined) alumniUpdate.company_name = companyName;
      if (gradYear !== undefined) alumniUpdate.grad_year = gradYear;
      if (bio !== undefined) alumniUpdate.bio = bio;
      if (skills !== undefined) alumniUpdate.skills = Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s=>s.trim()) : []);
      if (experienceYears !== undefined) alumniUpdate.experience_years = experienceYears;
      if (linkedinUrl !== undefined) alumniUpdate.linkedin_url = linkedinUrl;
      if (githubUrl !== undefined) alumniUpdate.github_url = githubUrl;
      if (portfolioUrl !== undefined) alumniUpdate.portfolio_url = portfolioUrl;
      if (companyWebsite !== undefined) alumniUpdate.company_website = companyWebsite;
      if (dateOfBirth !== undefined) alumniUpdate.date_of_birth = dateOfBirth;
      if (address !== undefined) alumniUpdate.address = address;

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
      profileId = existingProfile.id;
    } else {
      // Create new profile
      const alumniInsert = {
        user_id: userId,
        name: name || null,
        phone: phone || null,
        current_title: currentTitle || null,
        company_name: companyName || null,
        grad_year: gradYear || null,
        bio: bio || null,
        skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s=>s.trim()) : []),
        experience_years: experienceYears || null,
        linkedin_url: linkedinUrl || null,
        github_url: githubUrl || null,
        portfolio_url: portfolioUrl || null,
        company_website: companyWebsite || null,
        date_of_birth: dateOfBirth || null,
        address: address || null,
      };

      const { data: newProfile, error: insertError } = await db
        .from("alumni_profiles")
        .insert(alumniInsert)
        .select("id")
        .single();

      if (insertError) {
        console.error("Alumni insert error:", insertError);
        return res.status(500).json({ error: "Failed to create alumni profile" });
      }
      profileId = newProfile.id;
    }

    // Handle company info if provided
    if (profileId && (website || industry || company_size || about || linkedin || companyName)) {
      const companyUpdate = {};
      if (website !== undefined) companyUpdate.website = website;
      if (industry !== undefined) companyUpdate.industry = industry;
      if (company_size !== undefined) companyUpdate.company_size = company_size;
      if (about !== undefined) companyUpdate.about = about;
      if (linkedin !== undefined) companyUpdate.document_url = linkedin;
      if (companyName !== undefined) companyUpdate.name = companyName;

      if (Object.keys(companyUpdate).length) {
        companyUpdate.updated_at = new Date().toISOString();

        // Check existing company
        const { data: existingCompany, error: existingCompanyErr } = await db
          .from("companies")
          .select("id")
          .eq("alumni_id", profileId)
          .maybeSingle();

        if (existingCompanyErr) {
          console.error("Company existence check error:", existingCompanyErr);
        } else if (existingCompany) {
          const { error: companyError } = await db
            .from("companies")
            .update(companyUpdate)
            .eq("alumni_id", profileId);

          if (companyError) {
            console.error("Company update error:", companyError);
            return res.status(500).json({ error: "Failed to update company" });
          }
        } else {
          const { error: insertCompanyErr } = await db
            .from("companies")
            .insert({
              ...companyUpdate,
              alumni_id: profileId,
              created_at: new Date().toISOString(),
            });

          if (insertCompanyErr) {
            console.error("Company insert error:", insertCompanyErr);
            return res.status(500).json({ error: "Failed to create company" });
          }
        }
      }
    }

    return res.json({ message: existingProfile ? "Alumni profile updated" : "Alumni profile created", success: true });
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
      return res.status(400).json({ error: "Alumni profile not found. Complete your profile first." });
    }

    const { name, website, industry, company_size, about, document_url } = req.body;

    // Check if company exists
    const { data: existingCompany, error: existingError } = await db
      .from("companies")
      .select("id")
      .eq("alumni_id", profile.id)
      .maybeSingle();

    if (existingError) {
      console.error("Company existence check error:", existingError);
      return res.status(500).json({ error: "Failed to check company existence" });
    }

    const companyData = {
      name: name || null,
      website: website || null,
      industry: industry || null,
      company_size: company_size || null,
      about: about || null,
      document_url: document_url || null,
      updated_at: new Date().toISOString(),
    };

    if (existingCompany) {
      // Update existing company
      const { error: updateError } = await db
        .from("companies")
        .update(companyData)
        .eq("alumni_id", profile.id);

      if (updateError) {
        console.error("Company update error:", updateError);
        return res.status(500).json({ error: "Failed to update company" });
      }

      return res.json({ message: "Company updated successfully", success: true });
    } else {
      // Create new company
      const { error: insertError } = await db
        .from("companies")
        .insert({
          ...companyData,
          alumni_id: profile.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Company insert error:", insertError);
        return res.status(500).json({ error: "Failed to create company" });
      }

      return res.json({ message: "Company created successfully", success: true });
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
    let chartData = [];
    let topApplicants = [];
    if (jobs && jobs.length > 0) {
      const jobIds = jobs.map((j) => j.id);
      const { data: appData, error: appError } = await db
        .from("job_applications")
        .select(`
          job_id,
          user_id,
          applied_at,
          student_profiles(name, branch, grad_year, skills, academics)
        `)
        .in("job_id", jobIds);

      if (appError) {
        console.error("Applications data error:", appError);
      } else {
        // Count applications per job
        const appCountMap = {};
        appData.forEach(app => {
          appCountMap[app.job_id] = (appCountMap[app.job_id] || 0) + 1;
        });
        applicationsReceived = appData.length;

        // Create chart data
        chartData = jobs.map(job => ({
          name: job.job_title.length > 10 ? job.job_title.substring(0, 10) + '...' : job.job_title,
          applications: appCountMap[job.id] || 0,
          jobId: job.id
        }));

        // Get top applicants (by recent application, limit 5)
        topApplicants = appData
          .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
          .slice(0, 5)
          .map(app => ({
            id: app.user_id,
            name: app.student_profiles?.name || 'Unknown',
            degree: app.student_profiles?.branch || 'N/A',
            skills: app.student_profiles?.skills || [],
            cgpa: app.student_profiles?.academics?.[0]?.gpa || 'N/A',
            appliedAt: app.applied_at
          }));
      }
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

      // Chart data
      chartData,

      // Top applicants
      topApplicants,

      // Additional dashboard data
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
 * Returns public profile information for an alumni (viewable by students)
 */
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id || req.user?.userId;

    if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

    // Get alumni profile
    const { data: profile, error: profileError } = await db
      .from("alumni_profiles")
      .select(`
        id, name, current_title, company_name, grad_year, skills, experience_years,
        linkedin_url, github_url, portfolio_url, company_website, bio
      `)
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Public profile fetch error:", profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get user info
    const { data: user, error: userError } = await db
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user || user.role !== "alumni") {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get company info
    const { data: company, error: companyError } = await db
      .from("companies")
      .select("name, website, industry, company_size, about")
      .eq("alumni_id", profile.id)
      .maybeSingle();

    // Check if current user is connected to this alumni
    const { data: connection, error: connectionError } = await db
      .from("connections")
      .select("status")
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
      .eq("status", "accepted")
      .maybeSingle();

    const isConnected = !!connection;

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
  // New
  getProfile,
  upsertProfile,
  createOrUpdateCompany,
  listCompanies,
  // Legacy / existing
  completeProfile,
  updateProfile,
  getDashboardStats,
  getPublicProfile,
};
