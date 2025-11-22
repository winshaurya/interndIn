// Session management is now handled by AuthContext and Supabase directly
// This file is deprecated and can be removed

export const sessionManager = {
  initialize: () => {},
  destroy: () => {},
  onSessionWarning: () => () => {},
  onSessionExpiry: () => () => {},
  getSessionStatus: () => 'active',
  refreshSession: () => Promise.resolve(true),
};

export default sessionManager;</content>
