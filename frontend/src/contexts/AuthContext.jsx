import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";
import { getRoleHome } from "@/lib/auth";
import { sessionManager } from "@/lib/sessionManager";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initialize session manager with Supabase integration
    sessionManager.initialize(supabase);

    // Get initial session seamlessly
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          setUser(null);
        } else if (session?.user) {
          // Load user data immediately without loading state
          await loadUserData(session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    };

    initializeAuth();

    // Listen for auth changes seamlessly
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {

          if (event === 'SIGNED_OUT') {
            setUser(null);
            setSessionWarning(false);
            return;
          }

          if (event === 'TOKEN_REFRESHED') {
            // Session was refreshed, update user data if needed
            if (session?.user && user) {
              await loadUserData(session.user);
            }
            return;
          }

          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserData(session.user);
          }
        } catch (err) {
          setUser(null);
          setSessionWarning(false);
        }
      }
    );

    // Set up session warning handler
    const unsubscribeWarning = sessionManager.onSessionWarning((minutesLeft) => {
      if (mounted) {
        setSessionWarning(true);
      }
    });

    // Set up session expiry handler
    const unsubscribeExpiry = sessionManager.onSessionExpiry(async () => {
      await supabase.auth.signOut();
      if (mounted) {
        setUser(null);
        setSessionWarning(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      unsubscribeWarning();
      unsubscribeExpiry();
      sessionManager.destroy();
    };
  }, []);

  // Helper function to check if session is valid
  const isSessionValid = (session) => {
    if (!session || !session.expires_at) return false;

    // Check if session expires within next 5 minutes
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    return expiresAt > fiveMinutesFromNow;
  };

  const loadUserData = async (supabaseUser) => {
    try {
      // Fetch user data from our database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        // Create profile if it doesn't exist
        await createUserProfile(supabaseUser);
        return;
      }

      // Load profile data
      let profile = null;
      if (userData.role === 'student') {
        const { data: profileData } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', supabaseUser.id)
          .single();
        profile = profileData;
      } else if (userData.role === 'alumni') {
        const { data: profileData } = await supabase
          .from('alumni_profiles')
          .select('*')
          .eq('user_id', supabaseUser.id)
          .single();
        profile = profileData;
      }

      setUser({
        ...supabaseUser,
        ...userData,
        profile
      });
    } catch (error) {
      // Handle error silently
    }
  };

  const createUserProfile = async (supabaseUser) => {
    try {
      // Extract role from user metadata or default to student
      const role = supabaseUser.user_metadata?.role || 'student';
      const name = supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User';

      // Create user profile via API
      await apiClient.createProfile({
        id: supabaseUser.id,
        email: supabaseUser.email,
        role,
      });

      // Reload user data
      await loadUserData(supabaseUser);
    } catch (error) {
      // Handle error silently
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;

    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return data;
  };

  const signInWithGoogle = async (role = 'student') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          // Domain restriction will be enforced by Google OAuth consent screen
          // Only work/educational emails will be allowed
          hd: '*' // This tells Google to show domain selection, but actual restriction is in Google Console
        }
      }
    });

    if (error) {
      throw error;
    }
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  };

  const value = {
    user,
    isInitializing,
    sessionWarning,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    // keep common naming for consumers expecting `logout`
    logout: signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    role: user?.role || null,
    getHomeRoute: () => getRoleHome(user?.role),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
