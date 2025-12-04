import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRoleHome } from '@/lib/auth';
import { apiClient } from '@/lib/api';

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
        // Check for JWT token in localStorage
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Validate token with backend
          try {
            const data = await apiClient.request('/auth/profile');

            const userData = {
              id: data.user.id,
              email: data.user.email,
              role: data.user.role,
              fullName: data.user.fullName || '',
              avatarUrl: data.user.avatarUrl || '',
              headline: data.user.headline || '',
              about: data.user.about || '',
              isVerified: data.user.isVerified || false,
            };
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Token validation error:', error);
            localStorage.removeItem('accessToken');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);



  const login = async (email, password) => {
    try {
      const result = await apiClient.request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      // Store token and set user
      if (result.token) {
        localStorage.setItem('accessToken', result.token);
        const userData = {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          fullName: result.user.fullName || '',
          avatarUrl: result.user.avatarUrl || '',
          headline: result.user.headline || '',
          about: result.user.about || '',
          isVerified: result.user.isVerified || false,
        };
        setUser(userData);
        setIsAuthenticated(true);
      }

      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const result = await apiClient.request('/auth/register', {
        method: 'POST',
        body: {
          email: userData.email,
          password: userData.password,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      });

      // Store token and set user
      if (result.token) {
        localStorage.setItem('accessToken', result.token);
        const userDataResponse = {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          fullName: result.user.fullName || '',
        };
        setUser(userDataResponse);
        setIsAuthenticated(true);
      }

      console.log('User registered successfully:', result.user?.id);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      // Clear JWT token from localStorage
      localStorage.removeItem('accessToken');

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const result = await apiClient.request('/auth/profile', {
        method: 'PUT',
        body: profileData,
      });

      // Update local user state
      setUser(prev => ({ ...prev, ...result.user }));
      return result.user;
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
