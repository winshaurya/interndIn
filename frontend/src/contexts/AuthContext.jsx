import React, { createContext, useContext, useState, useEffect } from 'react';
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
        // Check for JWT token in localStorage
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Validate token with backend
          try {
            const response = await fetch('http://localhost:5004/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
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
            } else {
              // Token invalid, remove it
              localStorage.removeItem('accessToken');
            }
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
      const response = await fetch('http://localhost:5004/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

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
      const response = await fetch('http://localhost:5004/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

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
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5004/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Profile update failed');
      }

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
