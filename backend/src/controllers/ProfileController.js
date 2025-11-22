// Profile Controller - Industry Standard Profile Management
const db = require('../config/db');
const Joi = require('joi');

// ==================== VALIDATION SCHEMAS ====================
const studentProfileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(''),
  student_id: Joi.string().min(1).max(50).trim(),
  branch: Joi.string().valid(
    'CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'MCA', 'MBA',
    'Computer Science & Engineering', 'Information Technology',
    'Electronics & Communication Engineering', 'Electrical Engineering',
    'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
    'Master of Computer Applications', 'Master of Business Administration'
  ),
  grad_year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 10),
  bio: Joi.string().max(500).allow(''),
  skills: Joi.array().items(Joi.string().trim()).max(20),
  linkedin_url: Joi.string().uri().allow(''),
  github_url: Joi.string().uri().allow(''),
  portfolio_url: Joi.string().uri().allow(''),
  resume_url: Joi.string().uri().allow('')
});

const alumniProfileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(''),
  current_title: Joi.string().min(1).max(100).trim(),
  company_name: Joi.string().min(1).max(100).trim(),
  grad_year: Joi.number().integer().min(1950).max(new Date().getFullYear()),
  bio: Joi.string().max(500).allow(''),
  skills: Joi.array().items(Joi.string().trim()).max(20),
  experience_years: Joi.number().integer().min(0).max(50),
  linkedin_url: Joi.string().uri().allow(''),
  github_url: Joi.string().uri().allow(''),
  portfolio_url: Joi.string().uri().allow(''),
  company_website: Joi.string().uri().allow('')
});

// ==================== HELPER FUNCTIONS ====================
const getCurrentUserId = (req) => {
  // In Supabase-first architecture, user ID comes from auth middleware
  return req.user?.id;
};

const buildProfileResponse = (userData, profileData) => {
  return {
    id: userData.id,
    email: userData.email,
    role: userData.role,
    status: userData.status,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    profile: profileData ? {
      ...profileData,
      skills: profileData.skills || [],
      updated_at: profileData.updated_at
    } : null
  };
};

// ==================== GET PROFILE ====================
const getProfile = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Get user data from auth.users
    const { data: userData, error: userError } = await db
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    let profileData = null;

    // Get profile data based on role
    if (userData.role === 'student') {
      const { data, error } = await db
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        profileData = data;
      }
    } else if (userData.role === 'alumni') {
      const { data, error } = await db
        .from('alumni_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        profileData = data;
      }
    }

    const response = buildProfileResponse(userData, profileData);

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile',
      code: 'INTERNAL_ERROR'
    });
  }
};

// ==================== UPDATE STUDENT PROFILE ====================
const updateStudentProfile = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Validate input
    const { error: validationError, value } = studentProfileUpdateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (validationError) {
      const errors = validationError.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await db
      .from('student_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await db
        .from('student_profiles')
        .update({
          ...value,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const { data, error } = await db
        .from('student_profiles')
        .insert({
          ...value,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Get updated user data
    const { data: userData } = await db
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const response = buildProfileResponse(userData, result);

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: response
    });

  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      error: 'Failed to update student profile',
      code: 'INTERNAL_ERROR'
    });
  }
};

// ==================== UPDATE ALUMNI PROFILE ====================
const updateAlumniProfile = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Validate input
    const { error: validationError, value } = alumniProfileUpdateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (validationError) {
      const errors = validationError.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await db
      .from('alumni_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await db
        .from('alumni_profiles')
        .update({
          ...value,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const { data, error } = await db
        .from('alumni_profiles')
        .insert({
          ...value,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Get updated user data
    const { data: userData } = await db
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const response = buildProfileResponse(userData, result);

    res.status(200).json({
      success: true,
      message: 'Alumni profile updated successfully',
      data: response
    });

  } catch (error) {
    console.error('Update alumni profile error:', error);
    res.status(500).json({
      error: 'Failed to update alumni profile',
      code: 'INTERNAL_ERROR'
    });
  }
};

// ==================== UPLOAD PROFILE PICTURE ====================
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        code: 'NO_FILE'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed',
        code: 'INVALID_FILE_TYPE'
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: 'File too large. Maximum size is 5MB',
        code: 'FILE_TOO_LARGE'
      });
    }

    // Upload to Supabase Storage
    const fileName = `profile-${userId}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
    const filePath = `profiles/${fileName}`;

    const { data, error } = await db.supabase.storage
      .from('uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = db.supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    // Update user profile with picture URL
    const { error: updateError } = await db
      .from('users')
      .update({
        profile_picture_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profile_picture_url: urlData.publicUrl
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      error: 'Failed to upload profile picture',
      code: 'INTERNAL_ERROR'
    });
  }
};

// ==================== DELETE PROFILE PICTURE ====================
const deleteProfilePicture = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Get current profile picture URL
    const { data: userData, error: fetchError } = await db
      .from('users')
      .select('profile_picture_url')
      .eq('id', userId)
      .single();

    if (fetchError || !userData?.profile_picture_url) {
      return res.status(404).json({
        error: 'No profile picture found',
        code: 'NO_PROFILE_PICTURE'
      });
    }

    // Extract file path from URL
    const urlParts = userData.profile_picture_url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `profiles/${fileName}`;

    // Delete from storage
    const { error: deleteError } = await db.supabase.storage
      .from('uploads')
      .remove([filePath]);

    if (deleteError) {
      console.warn('Failed to delete file from storage:', deleteError);
    }

    // Update user profile
    const { error: updateError } = await db
      .from('users')
      .update({
        profile_picture_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });

  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      error: 'Failed to delete profile picture',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  getProfile,
  updateStudentProfile,
  updateAlumniProfile,
  uploadProfilePicture,
  deleteProfilePicture
};
