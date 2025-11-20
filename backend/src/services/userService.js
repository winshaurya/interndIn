const bcrypt = require('bcrypt');
const db = require('../config/db');

const PLACEHOLDER_SECRET = process.env.SUPABASE_OAUTH_PLACEHOLDER || '__supabase_oauth_placeholder__';

const fetchAppUserProfile = async (userId) => {
  const { data, error } = await db
    .from('users')
    .select('id, email, role, status, is_verified, last_login_at')
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

  const hashedPassword = await bcrypt.hash(
    options.password || `${PLACEHOLDER_SECRET}-${supabaseUser.id}`,
    10
  );

  const insertPayload = {
    id: supabaseUser.id,
    email: supabaseUser.email,
    password_hash: hashedPassword,
    role: roleHint,
    status: options.status || 'pending',
    is_verified: Boolean(supabaseUser.email_confirmed_at),
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
  status: appUser?.status || 'pending',
  is_verified: appUser?.is_verified ?? Boolean(supabaseUser.email_confirmed_at),
  last_login_at: appUser?.last_login_at || supabaseUser.last_sign_in_at,
});

const updateLastLogin = async (userId) => {
  if (!userId) return;
  await db
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId);
};

module.exports = {
  ensureAppUserRecord,
  fetchAppUserProfile,
  buildUserResponse,
  updateLastLogin,
};
