// src/controllers/StudentController.js
const db = require("../config/db");

// helper: support both { userId } and { id } in JWT
const getUserIdFromReq = (req) => req?.user?.userId || req?.user?.id;

// normalize skills to text column (allow string or array)
const normalizeSkills = (skills) => {
  if (skills == null) return null;
  return Array.isArray(skills) ? skills.join(", ") : String(skills);
};

/**
 * GET /student/profile
 * Fetch the logged-in student's profile (if exists).
 * 200: { exists: boolean, profile: {...} | null }
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { data: profile, error } = await db
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: "Internal server error" });
    }

    return res.status(200).json({
      exists: !!profile,
      profile: profile || null,
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PUT /student/profile
 * Upsert behavior:
 *  - If profile exists => partial update allowed
 *  - If profile doesn't exist => requires minimal fields to create (name, studentId, branch, gradYear)
 *
 * Body fields (all optional for update):
 *  - name: string
 *  - studentId: string
 *  - branch: string
 *  - gradYear: number
 *  - skills: string | string[]   (stored as comma-separated text)
 *  - resumeUrl: string (URL)
 */
const upsertProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, studentId, branch, gradYear, skills, resumeUrl, email, phone, dateOfBirth, currentYear, cgpa, achievements, experiences, desiredRoles, preferredLocations, workMode, academics } =
      req.body || {};

    const { data: existing, error: existingError } = await db
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError) {
      console.error('Check existing profile error:', existingError);
      return res.status(500).json({ error: "Internal server error" });
    }

    // map camelCase -> snake_case
    const patch = {
      ...(name !== undefined && { name }),
      ...(studentId !== undefined && { student_id: studentId }),
      ...(branch !== undefined && { branch }),
      ...(gradYear !== undefined && { grad_year: Number(gradYear) }),
      ...(skills !== undefined && { skills: normalizeSkills(skills) }),
      ...(resumeUrl !== undefined && { resume_url: resumeUrl }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(dateOfBirth !== undefined && { date_of_birth: dateOfBirth }),
      ...(currentYear !== undefined && { current_year: Number(currentYear) }),
      ...(cgpa !== undefined && { cgpa: parseFloat(cgpa) }),
      ...(achievements !== undefined && { achievements }),
      ...(experiences !== undefined && { experiences }),
      ...(academics !== undefined && { academics }),
    };

    // Handle preferences JSONB field
    if (desiredRoles !== undefined || preferredLocations !== undefined || workMode !== undefined) {
      const currentPreferences = existing?.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        ...(desiredRoles !== undefined && { desired_roles: desiredRoles }),
        ...(preferredLocations !== undefined && { preferred_locations: preferredLocations }),
        ...(workMode !== undefined && { work_mode: workMode }),
      };
      patch.preferences = updatedPreferences;
    }

    if (existing) {
      // UPDATE (edit / completion continued)
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: "No fields provided to update" });
      }

      const { error: updateError } = await db
        .from('student_profiles')
        .update(patch)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Update profile error:', updateError);
        return res.status(500).json({ error: "Failed to update profile" });
      }

      const { data: updated, error: fetchError } = await db
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Fetch updated profile error:', fetchError);
        return res.status(500).json({ error: "Failed to fetch updated profile" });
      }

      return res
        .status(200)
        .json({ message: "Profile updated successfully", profile: updated });
    }

    // CREATE (first-time completion) — enforce minimal required fields
    const missing = [];
    if (!name) missing.push("name");
    if (!studentId) missing.push("studentId");
    if (!branch) missing.push("branch");
    if (
      gradYear === undefined ||
      gradYear === null ||
      Number.isNaN(Number(gradYear))
    )
      missing.push("gradYear");

    if (missing.length) {
      return res.status(400).json({
        error: "Missing required fields for first-time profile creation",
        required: ["name", "studentId", "branch", "gradYear"],
        missing,
      });
    }

    const insertRow = {
      user_id: userId,
      name,
      student_id: studentId,
      branch,
      grad_year: Number(gradYear),
      skills: normalizeSkills(skills) || null,
      resume_url: resumeUrl || null,
      email: email || null,
      phone: phone || null,
      date_of_birth: dateOfBirth || null,
      current_year: currentYear ? Number(currentYear) : null,
      cgpa: cgpa ? parseFloat(cgpa) : null,
      achievements: achievements || null,
      experiences: experiences || null,
      preferences: {
        desired_roles: desiredRoles || null,
        preferred_locations: preferredLocations || null,
        work_mode: workMode || null,
      },
    };

    const { error: insertError } = await db
      .from('student_profiles')
      .insert(insertRow);

    if (insertError) {
      console.error('Insert profile error:', insertError);
      return res.status(500).json({ error: "Failed to create profile" });
    }

    const { data: created, error: fetchCreatedError } = await db
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchCreatedError) {
      console.error('Fetch created profile error:', fetchCreatedError);
      return res.status(500).json({ error: "Failed to fetch created profile" });
    }

    return res
      .status(201)
      .json({ message: "Profile created successfully", profile: created });
  } catch (error) {
    console.error("Upsert Student Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /student/dashboard
 * Returns dashboard statistics and data for the logged-in student.
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Get student profile
    const { data: profile, error: profileError } = await db
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    // Get applications count
    const { count: applicationsCount, error: applicationsError } = await db
      .from('job_applications')
      .select("*", { count: "exact", head: true })
      .eq('user_id', userId);

    if (applicationsError) {
      console.error("Applications count error:", applicationsError);
      return res.status(500).json({ error: "Failed to get applications count" });
    }

    // Get interviews count (mock for now)
    const interviewsCount = Math.floor(applicationsCount * 0.3) || 0;

    // Get offers count (mock for now)
    const offersCount = Math.floor(applicationsCount * 0.1) || 0;

    // Get bookmarks count (mock for now)
    const bookmarksCount = Math.floor(applicationsCount * 0.2) || 0;

    // Quick actions
    const quickActions = [
      { label: "Update Profile", to: "/student/profile" },
      { label: "Browse Jobs", to: "/jobs" },
      { label: "View Applications", to: "/student/applications" },
    ];

    // Timeline (mock data)
    const timeline = [
      { title: "Profile created", date: "Jan 06", status: "completed" },
      { title: "First application", date: "Jan 10", status: "completed" },
      { title: "Upcoming interview", date: "Jan 24", status: "upcoming" },
    ];

    res.json({
      profile: profile || {},
      applications_count: applicationsCount || 0,
      interviews_count: interviewsCount,
      offers_count: offersCount,
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
 * Returns public profile information for a student (viewable by alumni)
 */
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = getUserIdFromReq(req);

    if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

    // Get student profile
    const { data: profile, error: profileError } = await db
      .from('student_profiles')
      .select(`
        id, name, branch, grad_year, skills, resume_url, academics,
        experiences, achievements, preferences
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error("Public profile fetch error:", profileError);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Extract preferences fields
    const preferences = profile.preferences || {};
    const publicProfile = {
      ...profile,
      desired_roles: preferences.desired_roles,
      preferred_locations: preferences.preferred_locations,
      work_mode: preferences.work_mode,
    };
    delete publicProfile.preferences;

    // Get user info
    const { data: user, error: userError } = await db
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user || user.role !== 'student') {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Check if current user is connected to this student
    const { data: connection, error: connectionError } = await db
      .from('connections')
      .select('status')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
      .eq('status', 'accepted')
      .maybeSingle();

    const isConnected = !!connection;

    return res.json({
      profile: {
        ...publicProfile,
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
