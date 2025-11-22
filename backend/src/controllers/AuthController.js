const db = require("../config/db.js");
const { ensureAppUserRecord } = require("../services/userService");

// Create or update user profile after Supabase auth
const createUserProfile = async (req, res) => {
  try {
    const { id, email, role } = req.body;

    if (!id || !email) {
      return res.status(400).json({ error: "User ID and email are required" });
    }

    // Ensure user record exists in our database
    await ensureAppUserRecord({ id, email, user_metadata: { role } }, {
      roleHint: role || "student",
      status: "active"
    });

    res.json({ success: true, message: "User profile created/updated" });
  } catch (error) {
    console.error("Create user profile error:", error);
    res.status(500).json({ error: "Failed to create user profile" });
  }
};

// Get current user session (for middleware compatibility)
const getSession = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const userId = user.id;
    let profile = null;

    if (user.role === 'student') {
      const { data } = await db.from('student_profiles').select('*').eq('user_id', userId).maybeSingle();
      profile = data || null;
    } else if (user.role === 'alumni') {
      const { data } = await db.from('alumni_profiles').select('*').eq('user_id', userId).maybeSingle();
      profile = data || null;
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        profile
      }
    });
  } catch (err) {
    console.error('Get session error:', err);
    return res.status(500).json({ error: 'Failed to fetch session' });
  }
};

module.exports = {
  createUserProfile,
  getSession,
};
