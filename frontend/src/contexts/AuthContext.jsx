import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";
import { getRoleHome } from "@/lib/auth";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          // persist supabase session into our apiClient/localStorage so API requests include auth tokens
          try {
            apiClient.persistSession({
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: session.expires_at,
              user: session.user,
            });
          } catch (e) {
            console.error('Error persisting session to apiClient:', e);
          }
          await loadUserData(session.user);
        }
      } catch (err) {
        console.error('getInitialSession error:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state changed:', event);
          if (session?.user) {
            // persist session on updates as well
            try {
              apiClient.persistSession({
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                expiresAt: session.expires_at,
                user: session.user,
              });
            } catch (e) {
              console.error('Error persisting session to apiClient on auth change:', e);
            }
            await loadUserData(session.user);
          } else {
            // ensure API client clears tokens when user signed out
            try { apiClient.clearSession(); } catch (e) { /* noop */ }
            setUser(null);
          }
        } catch (err) {
          console.error('onAuthStateChange handler error:', err);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (supabaseUser) => {
    try {
      // Fetch user data from our database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
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
      console.error('Error loading user data:', error);
    }
  };

  const createUserProfile = async (supabaseUser) => {
    try {
      // Extract role from user metadata or default to student
      const role = supabaseUser.user_metadata?.role || 'student';
      const name = supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User';

      // Create user profile via API
      await apiClient.request('/auth/create-profile', {
        method: 'POST',
        body: JSON.stringify({
          id: supabaseUser.id,
          email: supabaseUser.email,
          role,
          name
        })
      });

      // Reload user data
      await loadUserData(supabaseUser);
    } catch (error) {
      console.error('Error creating user profile:', error);
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

    // If signUp returns an active session (rare for email-confirm flows), persist it for API calls
    if (data?.session) {
      try {
        apiClient.persistSession({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
          user: data.session.user,
        });
      } catch (e) {
        console.error('Error persisting session on signUp:', e);
      }
    }
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data?.session) {
      try {
        apiClient.persistSession({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
          user: data.session.user,
        });
      } catch (e) {
        console.error('Error persisting session on signIn:', e);
      }
    }
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
      console.error('Google OAuth error:', error);
      throw error;
    }
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Clear persisted API client session as well
    try { apiClient.clearSession(); } catch (e) { /* noop */ }
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
    loading,
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
