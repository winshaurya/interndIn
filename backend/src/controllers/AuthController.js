const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateTokens } = require('../config/jwt');

// Helper function to hash passwords
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Helper function to verify passwords
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Register a new user (student or alumni)
const register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, ...profileData } = req.body;

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, role, firstName, and lastName are required'
      });
    }

    // Validate role
    if (!['student', 'alumni'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either student or alumni'
      });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await db
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const { data: newUser, error: userError } = await db
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        role,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, email, role, first_name, last_name')
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // Create profile based on role
    if (role === 'student') {
      const { error: profileError } = await db
        .from('student_profiles')
        .insert({
          user_id: newUser.id,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Student profile creation error:', profileError);
        // Don't fail the registration, just log the error
      }
    } else if (role === 'alumni') {
      const { error: profileError } = await db
        .from('alumni_profiles')
        .insert({
          user_id: newUser.id,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Alumni profile creation error:', profileError);
        // Don't fail the registration, just log the error
      }
    }

    // Generate tokens
    const tokens = generateTokens(newUser);

    // Store refresh token (you might want to store this in a database for better security)
    // For now, we'll just return both tokens

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.first_name,
        lastName: newUser.last_name
      },
      tokens
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
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
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const { data: user, error: userError } = await db
      .from('users')
      .select('id, email, password_hash, role, first_name, last_name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      tokens
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user, error: userError } = await db
      .from('users')
      .select('id, email, role, first_name, last_name, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get profile data based on role
    let profileData = null;
    if (user.role === 'student') {
      const { data: profile } = await db
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      profileData = profile;
    } else if (user.role === 'alumni') {
      const { data: profile } = await db
        .from('alumni_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      profileData = profile;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        profile: profileData
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const { verifyRefreshToken } = require('../config/jwt');
    const decoded = verifyRefreshToken(token);

    // Get user data
    const { data: user, error: userError } = await db
      .from('users')
      .select('id, email, role, first_name, last_name')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      tokens
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refreshToken
};
