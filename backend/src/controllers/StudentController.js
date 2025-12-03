// src/controllers/StudentController.js
const db = require("../config/db");

// helper: support both { userId } and { id } in JWT
const getUserIdFromReq = (req) => req?.user?.userId || req?.user?.id;

/**
 * GET /student/profile
 * Fetch the logged-in student's profile (if exists).
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { data: profile, error } = await db
      .from('profiles')
      .select(`*, student_details(*)`)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Flatten student_details into the profile
    let flattenedProfile = null;
    if (profile) {
      const { student_details, ...profileData } = profile;
      flattenedProfile = {
        ...profileData,
        ...(student_details || {}),
      };
    }

    return res.status(200).json({
      exists: !!profile,
      profile: flattenedProfile,
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PUT /student/profile
 * Upsert student profile
 */
const upsertProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { full_name, university_branch, grad_year, skills, resume_url, cgpa } = req.body || {};

    // Update profiles table
    if (full_name !== undefined) {
      const { error: profileError } = await db
        .from('profiles')
        .update({ full_name })
        .eq('id', userId);

      if (profileError) throw profileError;
    }

    // Upsert student_details
    const studentData = {};
    if (university_branch !== undefined) studentData.university_branch = university_branch;
    if (grad_year !== undefined) studentData.grad_year = Number(grad_year);
    if (cgpa !== undefined) studentData.cgpa = parseFloat(cgpa);
    if (resume_url !== undefined) studentData.resume_url = resume_url;
    if (skills !== undefined) studentData.skills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s=>s.trim()) : null);

    if (Object.keys(studentData).length > 0) {
      const { error: studentError } = await db
        .from('student_details')
        .upsert({ id: userId, ...studentData });

      if (studentError) throw studentError;
    }

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Upsert Student Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /student/dashboard
 * Returns dashboard statistics for the logged-in student.
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Get student profile with details
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('*, student_details(*)')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    // Flatten student_details into the profile
    let flattenedProfile = null;
    if (profile) {
      const { student_details, ...profileData } = profile;
      flattenedProfile = {
        ...profileData,
        ...(student_details || {}),
      };
    }

    // Get applications count
    const { count: applicationsCount, error: applicationsError } = await db
      .from('job_applications')
      .select("*", { count: "exact", head: true })
      .eq('student_id', userId);

    if (applicationsError) {
      console.error("Applications count error:", applicationsError);
      return res.status(500).json({ error: "Failed to get applications count" });
    }

    // Get interviews count
    const { count: interviewsCount, error: interviewsError } = await db
      .from('job_applications')
      .select("*", { count: "exact", head: true })
      .eq('student_id', userId)
      .eq('status', 'interviewing');

    // Get offers count
    const { count: offersCount, error: offersError } = await db
      .from('job_applications')
      .select("*", { count: "exact", head: true })
      .eq('student_id', userId)
      .eq('status', 'offer');

    // Bookmarks count - not implemented
    const bookmarksCount = 0;

    // Quick actions
    const quickActions = [];
    if (!profile?.resume_url) {
      quickActions.push({ label: "Upload Resume", to: "/student/profile" });
    }
    if (!profile?.skills || profile.skills.length === 0) {
      quickActions.push({ label: "Add Skills", to: "/student/profile" });
    }
    quickActions.push({ label: "Browse Jobs", to: "/jobs" });
    if (applicationsCount > 0) {
      quickActions.push({ label: "View Applications", to: "/student/applications" });
    }

    // Timeline
    const timeline = [];
    if (profile?.created_at) {
      timeline.push({
        title: "Profile created",
        date: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: "completed"
      });
    }

    if (applicationsCount > 0) {
      const { data: firstApp, error: firstAppError } = await db
        .from('job_applications')
        .select('applied_at')
        .eq('student_id', userId)
        .order('applied_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!firstAppError && firstApp) {
        timeline.push({
          title: "First application submitted",
          date: new Date(firstApp.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: "completed"
        });
      }
    }

    res.json({
      profile: profile || {},
      applications_count: applicationsCount || 0,
      interviews_count: interviewsCount || 0,
      offers_count: offersCount || 0,
      bookmarks_count: bookmarksCount,
      quickActions,
      timeline,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /student/profile/:userId
 * Returns public profile information for a student
 */
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = getUserIdFromReq(req);

    if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

    // Get student profile
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select(`*, student_details(*)`)
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error("Public profile fetch error:", profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Check if current user is connected to this student
    let isConnected = false;
    try {
      const { data: conv } = await db.from('conversations').select('id').or(
        `and(student_id.eq.${currentUserId},alumni_id.eq.${userId}),and(student_id.eq.${userId},alumni_id.eq.${currentUserId})`
      ).limit(1);
      if (conv && conv.length) isConnected = true;
    } catch (e) { /* ignore */ }

    return res.json({
      profile: {
        ...profile,
        isConnected,
        userId,
      }
    });
  } catch (err) {
    console.error("Public profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = { getMyProfile, upsertProfile, getDashboardStats, getPublicProfile };
