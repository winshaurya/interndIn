const db = require("../config/db.js");
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Middleware to verify Supabase JWT and extract user info
 */
const verifySupabaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Ensure user exists in our database
 */
const ensureUserExists = async (supabaseUser, role = 'student') => {
  try {
    // Check if user exists
    const { data: existingUser, error: checkError } = await db
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      return existingUser;
    }

    // Create user record
    const { data: newUser, error: insertError } = await db
      .from('users')
      .insert({
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: role,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Create profile based on role
    if (role === 'student') {
      await db.from('student_profiles').insert({
        user_id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Student',
        email: supabaseUser.email,
        student_id: `STU${Date.now()}`,
        branch: 'Computer Science',
        grad_year: new Date().getFullYear() + 4,
      });
    } else if (role === 'alumni') {
      await db.from('alumni_profiles').insert({
        user_id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Alumni',
        grad_year: new Date().getFullYear() - 2,
      });
    }

    return newUser;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
};

/**
 * Get current user session with profile
 */
const getSession = async (req, res) => {
  try {
    const supabaseUser = req.user;
    if (!supabaseUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Ensure user exists in our DB
    const dbUser = await ensureUserExists(supabaseUser);

    // Get profile
    let profile = null;
    if (dbUser.role === 'student') {
      const { data } = await db
        .from('student_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();
      profile = data;
    } else if (dbUser.role === 'alumni') {
      const { data } = await db
        .from('alumni_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();
      profile = data;
    }

    res.json({
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: dbUser.role,
        name: profile?.name || supabaseUser.user_metadata?.name,
      },
      profile,
      isNewUser: !profile || Object.keys(profile).length === 0
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
};

/**
 * Handle OAuth callback and user creation
 */
const handleOAuthCallback = async (req, res) => {
  try {
    const { code, role = 'student' } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      return res.status(400).json({ error: 'Failed to exchange code for session' });
    }

    // Ensure user exists
    const dbUser = await ensureUserExists(data.session.user, role);

    // Get profile
    let profile = null;
    if (dbUser.role === 'student') {
      const { data: profileData } = await db
        .from('student_profiles')
        .select('*')
        .eq('user_id', data.session.user.id)
        .maybeSingle();
      profile = profileData;
    } else if (dbUser.role === 'alumni') {
      const { data: profileData } = await db
        .from('alumni_profiles')
        .select('*')
        .eq('user_id', data.session.user.id)
        .maybeSingle();
      profile = profileData;
    }

    res.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
        role: dbUser.role,
        name: profile?.name || data.session.user.user_metadata?.name,
      },
      profile,
      isNewUser: !profile || Object.keys(profile).length === 0
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
};

/**
 * Sign out user
 */
const signOut = async (req, res) => {
  try {
    // Note: Frontend handles Supabase sign out directly
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Sign out failed' });
  }
};

module.exports = {
  verifySupabaseToken,
  getSession,
  handleOAuthCallback,
  signOut,
  ensureUserExists,
};
