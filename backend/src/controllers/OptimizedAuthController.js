// Optimized Auth Controller - Only handles server-side auth operations
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const emailService = require('../services/emailService');

class OptimizedAuthController {
  // Handle signup with email verification
  async signup(req, res) {
    try {
      const { email, password, role = 'student', name } = req.body;

      // Check if user already exists
      const { data: existingUser } = await db
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in Supabase Auth (server-side)
      const { data: authUser, error: authError } = await db.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { role, name }
      });

      if (authError) throw authError;

      // Create user record in our database
      const { data: userRecord, error: dbError } = await db
        .from('users')
        .insert({
          id: authUser.user.id,
          email,
          password_hash: hashedPassword,
          role,
          status: 'pending',
          is_verified: false
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Send verification email
      await emailService.sendVerificationEmail(email, authUser.user.id);

      res.status(201).json({
        message: 'User created successfully. Please check your email for verification.',
        user: { id: userRecord.id, email: userRecord.email, role: userRecord.role }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // Handle password reset (server-side only)
  async resetPassword(req, res) {
    try {
      const { email } = req.body;

      const { data: user } = await db
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store reset token
      await db
        .from('password_reset_tokens')
        .insert({
          user_id: user.id,
          token: resetToken,
          expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
        });

      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken);

      res.json({ message: 'Password reset email sent' });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to send reset email' });
    }
  }

  // Verify email (server-side)
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== 'email_verification') {
        return res.status(400).json({ error: 'Invalid token type' });
      }

      // Update user verification status
      const { error } = await db
        .from('users')
        .update({
          is_verified: true,
          status: 'active'
        })
        .eq('id', decoded.userId);

      if (error) throw error;

      res.json({ message: 'Email verified successfully' });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  }

  // Admin operations (server-side only)
  async getAllUsers(req, res) {
    try {
      // Only allow admin users
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { data: users, error } = await db
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ users });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async updateUserStatus(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId } = req.params;
      const { status } = req.body;

      const { error } = await db
        .from('users')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;

      res.json({ message: 'User status updated successfully' });

    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }
}

module.exports = new OptimizedAuthController();
