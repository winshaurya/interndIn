// Profile Controller - Simplified to match schema
const db = require('../config/db');

// ==================== HELPER FUNCTIONS ====================
const getCurrentUserId = (req) => req.user?.userId ?? req.user?.id;

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

    // Get profile with details based on role
    const { data: profile, error } = await db
      .from('profiles')
      .select('*, student_details(*), alumni_details(*)')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        error: 'Failed to retrieve profile',
        code: 'INTERNAL_ERROR'
      });
    }

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
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

    const {
      full_name, email, phone, roll_no, date_of_birth, address,
      university_branch, grad_year, cgpa, resume_url, skills,
      experiences, academics, preferences, consent
    } = req.body;

    // Update profiles table
    const profileUpdates = {};
    if (full_name !== undefined) profileUpdates.full_name = full_name;
    if (email !== undefined) profileUpdates.email = email;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await db
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);

      if (profileError) throw profileError;
    }

    // Upsert student_details
    const studentData = {};
    if (roll_no !== undefined) studentData.roll_no = roll_no;
    if (date_of_birth !== undefined) studentData.date_of_birth = date_of_birth;
    if (phone !== undefined) studentData.phone = phone;
    if (address !== undefined) studentData.address = address;
    if (university_branch !== undefined) studentData.university_branch = university_branch;
    if (grad_year !== undefined) studentData.grad_year = grad_year;
    if (cgpa !== undefined) studentData.cgpa = cgpa;
    if (resume_url !== undefined) studentData.resume_url = resume_url;
    if (skills !== undefined) studentData.skills = skills;
    if (experiences !== undefined) studentData.experiences = experiences;
    if (academics !== undefined) studentData.academics = academics;
    if (preferences !== undefined) studentData.preferences = preferences;
    if (consent !== undefined) studentData.consent = consent;

    if (Object.keys(studentData).length > 0) {
      const { error: studentError } = await db
        .from('student_details')
        .upsert({ id: userId, ...studentData });

      if (studentError) throw studentError;
    }

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully'
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

    const { full_name, linkedin_url, current_position, experience_years } = req.body;

    // Update profiles table
    if (full_name !== undefined) {
      const { error: profileError } = await db
        .from('profiles')
        .update({ full_name })
        .eq('id', userId);

      if (profileError) throw profileError;
    }

    // Upsert alumni_details
    const alumniData = {};
    if (linkedin_url !== undefined) alumniData.linkedin_url = linkedin_url;
    if (current_position !== undefined) alumniData.current_position = current_position;
    if (experience_years !== undefined) alumniData.experience_years = experience_years;

    if (Object.keys(alumniData).length > 0) {
      const { error: alumniError } = await db
        .from('alumni_details')
        .upsert({ id: userId, ...alumniData });

      if (alumniError) throw alumniError;
    }

    res.status(200).json({
      success: true,
      message: 'Alumni profile updated successfully'
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
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await db.storage
      .from('uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = db.storage
      .from('uploads')
      .getPublicUrl(filePath);

    // Update profile with avatar URL
    const { error: updateError } = await db
      .from('profiles')
      .update({
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        avatar_url: urlData.publicUrl
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

    // Get current avatar URL
    const { data: profile, error: fetchError } = await db
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (fetchError || !profile?.avatar_url) {
      return res.status(404).json({
        error: 'No profile picture found',
        code: 'NO_PROFILE_PICTURE'
      });
    }

    // Extract file path from URL
    const urlParts = profile.avatar_url.split('/');
    const filePath = `${userId}/${urlParts[urlParts.length - 1]}`;

    // Delete from storage
    const { error: deleteError } = await db.storage
      .from('uploads')
      .remove([filePath]);

    if (deleteError) {
      console.warn('Failed to delete file from storage:', deleteError);
    }

    // Update profile
    const { error: updateError } = await db
      .from('profiles')
      .update({
        avatar_url: null,
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
