// SessionManager.js - Integrated session management with Supabase
class SessionManager {
  constructor() {
    this.checkInterval = null;
    this.supabase = null;
    this.warningCallbacks = [];
    this.expiryCallbacks = [];
  }

  // Initialize with Supabase client
  initialize(supabaseClient) {
    this.supabase = supabaseClient;
    this.startSessionMonitoring();
    this.setupStorageListeners();
  }

  // Clean up session monitoring
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.warningCallbacks = [];
    this.expiryCallbacks = [];
  }

  // Start monitoring session expiry using Supabase
  startSessionMonitoring() {
    // Check session every minute
    this.checkInterval = setInterval(() => {
      this.checkSessionExpiry();
    }, 60000);

    // Initial check
    this.checkSessionExpiry();
  }

  // Check if session is about to expire using Supabase
  async checkSessionExpiry() {
    if (!this.supabase) return;

    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();

      if (error || !session) {
        this.expiryCallbacks.forEach(callback => callback());
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      const minutesUntilExpiry = timeUntilExpiry / 60;

      // Warn when less than 5 minutes remaining
      if (minutesUntilExpiry <= 5 && minutesUntilExpiry > 0) {
        this.warningCallbacks.forEach(callback => callback(minutesUntilExpiry));
      }

      // Session expired
      if (minutesUntilExpiry <= 0) {
        this.expiryCallbacks.forEach(callback => callback());
      }
    } catch (error) {
      // Handle error silently
    }
  }

  // Get session data from Supabase
  async getSessionData() {
    if (!this.supabase) return null;

    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      return error ? null : session;
    } catch (error) {
      console.error('Error getting session data:', error);
      return null;
    }
  }

  // Register callback for session expiry warnings
  onSessionWarning(callback) {
    this.warningCallbacks.push(callback);
    return () => {
      this.warningCallbacks = this.warningCallbacks.filter(cb => cb !== callback);
    };
  }

  // Register callback for session expiry
  onSessionExpiry(callback) {
    this.expiryCallbacks.push(callback);
    return () => {
      this.expiryCallbacks = this.expiryCallbacks.filter(cb => cb !== callback);
    };
  }

  // Setup storage event listeners for cross-tab session sync
  setupStorageListeners() {
    window.addEventListener('storage', (event) => {
      if (event.key?.includes('auth-token')) {
        // Session changed in another tab
        this.checkSessionExpiry();
      }
    });
  }

  // Get session status
  async getSessionStatus() {
    const sessionData = await this.getSessionData();

    if (!sessionData) {
      return 'no-session';
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = sessionData.expires_at;
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry <= 0) {
      return 'expired';
    }

    if (timeUntilExpiry <= 300) { // 5 minutes
      return 'expiring-soon';
    }

    return 'active';
  }

  // Force refresh session (call Supabase refresh)
  async refreshSession() {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }

      return !!data.session;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
export default sessionManager;