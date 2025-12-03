const db = require('../config/db');
const jwt = require('jsonwebtoken');

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-simple-jwt-secret';

/**
 * Generate JWT token for authenticated user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { email, password, role, firstName, lastName }
 */
const register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: email, password, role, firstName, lastName'
      });
    }

    // Validate role
    if (!['student', 'alumni'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "student" or "alumni"'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    console.log('Registering user:', { email, role, firstName, lastName });

    // Register user with Supabase Auth (regular signup)
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
          full_name: `${firstName} ${lastName}`
        }
      }
    });

    if (error) {
      console.error('Supabase auth signup error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.log('User created successfully:', data.user?.id);

    // Ensure profile exists (trigger should handle this, but let's be safe)
    try {
      // Check if profile already exists
      const { data: existingProfile } = await db
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await db
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            role: role,
            full_name: `${firstName} ${lastName}`
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Try to delete the auth user if profile creation fails
          await db.auth.admin.deleteUser(data.user.id);
          return res.status(500).json({
            success: false,
            message: 'Failed to create user profile'
          });
        }

        // Create role-specific details
        if (role === 'student') {
          const { error: studentError } = await db
            .from('student_details')
            .insert({ id: data.user.id });

          if (studentError) {
            console.error('Student details creation error:', studentError);
          }
        } else if (role === 'alumni') {
          const { error: alumniError } = await db
            .from('alumni_details')
            .insert({ id: data.user.id });

          if (alumniError) {
            console.error('Alumni details creation error:', alumniError);
          }
        }

        console.log('Profile and role details created successfully');
      } else {
        console.log('Profile already exists');
      }
    } catch (profileCreationError) {
      console.error('Profile creation error:', profileCreationError);
      // Try to delete the auth user if profile creation fails
      try {
        await db.auth.admin.deleteUser(data.user.id);
      } catch (deleteError) {
        console.error('Failed to cleanup auth user:', deleteError);
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to create user profile'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: data.user.id,
      email: data.user.email,
      role
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: role,
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`
      },
      token: token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    console.log('Logging in user:', email);

    // Authenticate with Supabase
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        success: false,
        message: 'User profile not found'
      });
    }

    console.log('User logged in successfully:', data.user.id);

    // Generate JWT token
    const token = generateToken({
      id: data.user.id,
      email: data.user.email,
      role: profile.role
    });

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        fullName: profile.full_name || '',
        avatarUrl: profile.avatar_url || '',
        headline: profile.headline || '',
        about: profile.about || '',
        isVerified: profile.is_verified || false,
        createdAt: profile.created_at
      },
      token: token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 * Headers: Authorization: Bearer <token>
 */
const getProfile = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const userId = decoded.userId;

    // Get user profile
    const { data: profile, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Get role-specific details
    let details = null;
    if (profile.role === 'student') {
      const { data: studentData } = await db
        .from('student_details')
        .select('*')
        .eq('id', userId)
        .single();
      details = studentData;
    } else if (profile.role === 'alumni') {
      const { data: alumniData } = await db
        .from('alumni_details')
        .select('*')
        .eq('id', userId)
        .single();
      details = alumniData;
    }

    res.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        headline: profile.headline,
        about: profile.about,
        isVerified: profile.is_verified,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        details: details
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 * Headers: Authorization: Bearer <token>
 * Body: { fullName, headline, about, ... }
 */
const updateProfile = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const userId = decoded.userId;
    const { fullName, headline, about, avatarUrl } = req.body;

    // Update profile
    const { data: profile, error } = await db
      .from('profiles')
      .update({
        full_name: fullName,
        headline: headline,
        about: about,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        headline: profile.headline,
        about: profile.about,
        isVerified: profile.is_verified,
        updatedAt: profile.updated_at
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Logout user (client-side token removal, but we can log the action)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is mainly client-side
    // But we can log the action or perform any cleanup if needed
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout
};
