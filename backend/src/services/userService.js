const db = require('../config/db');

const fetchAppUserProfile = async (userId) => {
  const { data, error } = await db
    .from('users')
    .select('id, email, role, status, created_at, updated_at')
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
    status: options.status || 'active',
  };

  const { data: inserted, error: insertError } = await db
    .from('users')
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
  status: appUser?.status || 'active',
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
