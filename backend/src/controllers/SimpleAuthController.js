const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Simple JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-simple-jwt-secret';

// Generate JWT token
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

// Register user
const register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!['student', 'alumni'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Use Supabase Auth
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
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Create user profile
    if (data.user) {
      try {
        await db.from('profiles').insert({
          id: data.user.id,
          email,
          role,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString()
        });
      } catch (profileError) {
        console.log('Profile creation failed, but continuing:', profileError);
      }
    }

    const token = generateToken({
      id: data.user.id,
      email: data.user.email,
      role
    });

    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        role,
        firstName,
        lastName
      },
      token
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

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    // Use Supabase Auth
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get user profile
    const { data: profile } = await db
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const token = generateToken({
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || 'student'
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'student',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || ''
      },
      token
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

// Get profile
const getProfile = async (req, res) => {
  try {
    // Get user from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
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
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        firstName: profile.first_name,
        lastName: profile.last_name,
        createdAt: profile.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
