const { verifyAccessToken } = require('../config/jwt');
const db = require('../config/db');

const { verifyAccessToken } = require('../config/jwt');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to authenticate JWT tokens (both custom and Supabase)
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    let userInfo;

    // First try to verify as custom JWT
    try {
      const decoded = verifyAccessToken(token);
      userInfo = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        id: decoded.id || decoded.userId
      };
    } catch (customJwtError) {
      // If custom JWT verification fails, try to get user from Supabase
      try {
        const { data: user, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) throw error;

        // Get role from database
        const { data: profile } = await db
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        userInfo = {
          userId: user.id,
          email: user.email,
          role: profile?.role || 'student',
          id: user.id
        };
      } catch (supabaseError) {
        throw new Error('Invalid token');
      }
    }

    // Attach user info to request
    req.user = userInfo;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        id: decoded.id || decoded.userId
      };
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
    console.log('Optional auth failed:', error.message);
  }
  next();
};

module.exports = {
  authenticate,
  isAdmin,
  optionalAuth
};
