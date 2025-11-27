// backend/src/utils/authUtils.js
// Shared authentication utilities to eliminate code duplication

/**
 * Extract user ID from request object
 * Supports both { userId } and { id } formats for backward compatibility
 * @param {Object} req - Express request object
 * @returns {string|null} User ID or null if not found
 */
const getUserId = (req) => req.user?.userId ?? req.user?.id;

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp string
 */
const getCurrentTimestamp = () => new Date().toISOString();

/**
 * Check if user is authenticated
 * @param {Object} req - Express request object
 * @returns {boolean} True if authenticated
 */
const isAuthenticated = (req) => !!getUserId(req);

/**
 * Get user role from request
 * @param {Object} req - Express request object
 * @returns {string|null} User role or null
 */
const getUserRole = (req) => req.user?.role || null;

/**
 * Validate user has required role
 * @param {Object} req - Express request object
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean} True if user has required role
 */
const hasRole = (req, requiredRoles) => {
  const userRole = getUserRole(req);
  if (!userRole) return false;

  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }

  return userRole === requiredRoles;
};

/**
 * Fetch complete user profile with role-specific details
 * @param {string} userId - User ID
 * @param {Object} db - Supabase database client
 * @returns {Object|null} Complete profile data or null if not found
 */
const fetchCompleteProfile = async (userId, db) => {
  const { data, error } = await db
    .from('profiles')
    .select('*, student_details(*), alumni_details(*)')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Fetch basic user profile
 * @param {string} userId - User ID
 * @param {Object} db - Supabase database client
 * @returns {Object|null} Basic profile data or null if not found
 */
const fetchBasicProfile = async (userId, db) => {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

module.exports = {
  getUserId,
  getCurrentTimestamp,
  isAuthenticated,
  getUserRole,
  hasRole,
  fetchCompleteProfile,
  fetchBasicProfile,
};
