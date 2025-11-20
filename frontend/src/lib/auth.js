const ROLE_HOME = {
  student: "/student",
  alumni: "/alumni",
  admin: "/admin",
};

export const getRoleHome = (role) => {
  if (!role) return "/";
  const normalized = String(role).toLowerCase();
  return ROLE_HOME[normalized] || "/";
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

export const getRedirectForAuthState = ({ isAuthenticated, role }) => {
  if (!isAuthenticated) {
    return "/login";
  }
  return getRoleHome(role);
};

export default {
  getRoleHome,
  isRoleAllowed,
  getRedirectForAuthState,
};
