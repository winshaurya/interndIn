import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getRoleHome } from '@/lib/auth';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
        } else if (session) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const role = authUser.user_metadata?.role || 'student';
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              email: authUser.email,
              role: role,
              full_name: authUser.user_metadata?.full_name || `${authUser.user_metadata?.first_name || ''} ${authUser.user_metadata?.last_name || ''}`.trim() || '',
            });

          if (insertError) {
            console.error('Profile creation error:', insertError);
            throw insertError;
          }

          // Create role-specific details
          if (role === 'student') {
            await supabase.from('student_details').insert({ id: authUser.id });
          } else if (role === 'alumni') {
            await supabase.from('alumni_details').insert({ id: authUser.id });
          }

          // Retry loading profile
          const { data: newProfile, error: newError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (newError) throw newError;
          profile = newProfile;
        } else {
          throw error;
        }
      }

      const userData = {
        id: authUser.id,
        email: authUser.email,
        role: profile.role,
        fullName: profile.full_name || '',
        avatarUrl: profile.avatar_url || '',
        headline: profile.headline || '',
        about: profile.about || '',
        isVerified: profile.is_verified || false,
      };

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Profile load error:', error);
      // If profile creation/loading fails, set basic user data
      setUser({
        id: authUser.id,
        email: authUser.email,
        role: authUser.user_metadata?.role || 'student',
        fullName: authUser.user_metadata?.full_name || '',
      });
      setIsAuthenticated(true);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Profile will be loaded via auth state change listener
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            full_name: `${userData.firstName} ${userData.lastName}`
          }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        throw new Error(error.message || 'Registration failed');
      }

      console.log('User registered successfully:', data.user?.id);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(prev => ({ ...prev, ...data }));
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
