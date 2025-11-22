import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";
import { getRoleHome, determineRedirectAfterAuth } from "@/lib/auth";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setUser(null);
        } else if (session?.user) {
          await loadUserSession(session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            return;
          }

          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserSession(session.user);
          }

          if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Update session data but don't reload user data
            if (user) {
              setUser(prev => prev ? { ...prev, session } : null);
            }
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserSession = async (supabaseUser) => {
    try {
      // Get session data from our backend
      const sessionData = await apiClient.request('/auth/me');

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        ...sessionData.user,
        profile: sessionData.profile,
        isNewUser: sessionData.isNewUser,
        session: supabaseUser
      });
    } catch (error) {
      console.error('Failed to load user session:', error);
      setUser(null);
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
        }
      }
    });

    if (error) throw error;
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

  const getRedirectPath = () => {
    if (!user) return '/login';
    return determineRedirectAfterAuth(user, user.isNewUser);
  };

  const value = {
    user,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    logout: signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    role: user?.role || null,
    getHomeRoute: () => getRoleHome(user?.role),
    getRedirectPath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
