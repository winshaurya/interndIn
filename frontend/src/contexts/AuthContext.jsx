import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";
import { loadUser as loadStoredUser, saveUser as saveStoredUser, clearUser as clearStoredUser } from '@/lib/state';
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
        // Prefer server-side session hydration (cookie-based)
        const resp = await apiClient.request('/auth/me', { method: 'GET', skipAuthRefresh: true });
        const serverUser = resp?.data?.user;
        const profile = resp?.data?.profile;
        if (serverUser) {
          const merged = { ...serverUser, profile };
          setUser(merged);
          saveStoredUser(merged);
        } else {
          // try load from local cache
          const cached = loadStoredUser();
          if (cached) setUser(cached);
        }
      } catch (err) {
        // Fallback to supabase client session if backend not reachable
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (!error && session?.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (!userError) {
              const merged = { ...session.user, ...userData, role: userData?.role || 'student' };
              setUser(merged);
              saveStoredUser(merged);
            }
          }
        } catch (e) {
          console.error('Session hydration fallback failed', e);
        }
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        if (session?.user) {
          // Fetch additional user data from users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
            setUser({
              ...session.user,
              role: 'student' // fallback
            });
          } else {
            setUser({
              ...session.user,
              ...userData,
              role: userData?.role || 'student'
            });
          }
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials) => {
    // Use backend login which sets httpOnly cookies and returns user/session
    const resp = await apiClient.login({ email: credentials.email, password: credentials.password });
    // resp.data.user shape similar to buildUserResponse
    if (resp?.data?.user) {
      setUser({ ...resp.data.user, profile: resp.data.profile });
    }
    return resp;
  };

  const signup = async (userData) => {
    return apiClient.signup(userData);
  };

  const logout = async () => {
    await apiClient.logout();
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

  const isAuthenticated = Boolean(user);

  const value = useMemo(() => ({
    user,
    role: user?.role || null,
    isAuthenticated,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    loading,
    getHomeRoute: () => getRoleHome(user?.role),
    authStatus: loading ? "loading" : isAuthenticated ? "authenticated" : "unauthenticated",
  }), [user, loading, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
