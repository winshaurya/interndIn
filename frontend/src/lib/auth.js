const ROLE_HOME = {
  student: "/student",
  alumni: "/alumni",
  admin: "/admin",
};

const ROLE_SETUP_PAGES = {
  student: "/student/profile",
  alumni: "/alumni/profile",
};

export const getRoleHome = (role) => {
  if (!role) return "/";
  const normalized = String(role).toLowerCase();
  return ROLE_HOME[normalized] || "/";
};

export const getRoleSetupPage = (role) => {
  if (!role) return "/";
  const normalized = String(role).toLowerCase();
  return ROLE_SETUP_PAGES[normalized] || getRoleHome(role);
};

export const isRoleAllowed = (role, allowedRoles = []) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  if (!role) {
    return false;
  }
  return allowedRoles.includes(role);
};

export const getRedirectForAuthState = ({ isAuthenticated, role, hasProfile, isNewUser = false }) => {
  if (!isAuthenticated) {
    return "/login";
  }

  // New users should complete their profile first
  if (isNewUser || !hasProfile) {
    return getRoleSetupPage(role);
  }

  // Existing users go to their dashboard
  return getRoleHome(role);
};

export const determineRedirectAfterAuth = (user, isNewUser = false) => {
  if (!user) return "/login";

  const role = user.role;
  const hasProfile = user.profile && Object.keys(user.profile).length > 0;

  return getRedirectForAuthState({
    isAuthenticated: true,
    role,
    hasProfile,
    isNewUser
  });
};

export default {
  getRoleHome,
  getRoleSetupPage,
  isRoleAllowed,
  getRedirectForAuthState,
  determineRedirectAfterAuth,
};
