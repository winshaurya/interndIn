const db = require('../config/db');

const fetchAppUserProfile = async (userId) => {
  const { data, error } = await db
    .from('profiles')
    .select('id, email, role, is_verified, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
};

const ensureAppUserRecord = async (supabaseUser, options = {}) => {
  if (!supabaseUser?.id) {
    throw new Error('Invalid Supabase user reference');
  }

  const roleHint = (options.roleHint || supabaseUser.user_metadata?.role || 'student').toLowerCase();
  const existing = await fetchAppUserProfile(supabaseUser.id);
  if (existing) {
    return existing;
  }

  const insertPayload = {
    id: supabaseUser.id,
    email: supabaseUser.email,
    role: roleHint,
    is_verified: options.is_verified || false,
  };

  const { data: inserted, error: insertError } = await db
    .from('profiles')
    .insert(insertPayload)
    .select('*')
    .single();

  if (insertError) {
    throw insertError;
  }

  return inserted;
};

const buildUserResponse = (supabaseUser, appUser) => ({
  id: supabaseUser.id,
  email: supabaseUser.email,
  role: (appUser?.role || supabaseUser.user_metadata?.role || 'student').toLowerCase(),
  is_verified: appUser?.is_verified || false,
  created_at: appUser?.created_at || supabaseUser.created_at,
  updated_at: appUser?.updated_at || supabaseUser.updated_at,
});

const updateLastLogin = async (userId) => {
  // Not needed with Supabase auth
};

module.exports = {
  ensureAppUserRecord,
  fetchAppUserProfile,
  buildUserResponse,
  updateLastLogin,
};
