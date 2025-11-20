import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
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
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
      } else if (session?.user) {
        // Fetch additional user data from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          setUser({
            ...session.user,
            ...userData,
            role: userData?.role || 'student'
          });
        }
      }

      setLoading(false);
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;

    // User data will be set by the auth state change listener
    return { user: data.user, session: data.session };
  };

  const signup = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password_hash || userData.password,
      options: {
        data: {
          role: userData.role || 'student',
          name: userData.name,
        }
      }
    });

    if (error) throw error;

    // For signup, we might need to create additional profile data
    // This will be handled by database triggers or additional API calls
    return { user: data.user, session: data.session };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // User will be set to null by the auth state change listener
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
