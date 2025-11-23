/**
 * Authentication utility functions
 */

/**
 * Get the home route for a user based on their role
 * @param {string} role - The user's role ('student' or 'alumni')
 * @returns {string} - The home route path
 */
export const getRoleHome = (role) => {
  switch (role) {
    case 'student':
      return '/student';
    case 'alumni':
      return '/alumni';
    default:
      return '/';
  }
};

/**
 * Check if a user has the required role
 * @param {Object} user - The user object
 * @param {string|string[]} requiredRoles - The required role(s)
 * @returns {boolean} - Whether the user has the required role
 */
export const hasRole = (user, requiredRoles) => {
  if (!user || !user.role) return false;

  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }

  return user.role === requiredRoles;
};

/**
 * Get user display name
 * @param {Object} user - The user object
 * @returns {string} - The display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'Guest';

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  if (user.name) {
    return user.name;
  }

  return user.email || 'User';
};

/**
 * Check if user profile is complete
 * @param {Object} user - The user object
 * @returns {boolean} - Whether the profile is complete
 */
export const isProfileComplete = (user) => {
  if (!user) return false;

  // Basic required fields for any user
  const basicFields = ['email', 'role'];
  for (const field of basicFields) {
    if (!user[field]) return false;
  }

  // Role-specific required fields
  if (user.role === 'student') {
    const studentFields = ['firstName', 'lastName'];
    for (const field of studentFields) {
      if (!user[field]) return false;
    }
  } else if (user.role === 'alumni') {
    const alumniFields = ['firstName', 'lastName'];
    for (const field of alumniFields) {
      if (!user[field]) return false;
    }
  }

  return true;
};