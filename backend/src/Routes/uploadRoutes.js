const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile, deleteFile, validateFile } = require('../services/storageService');
const { authenticate } = require('../middleware/authMiddleware');

// Configure multer for memory storage (required for Supabase)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
    const fileExt = file.originalname.split('.').pop().toLowerCase();

    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  }
});

// ==================== FILE UPLOAD ROUTES ====================

/**
 * Upload a resume file
 * POST /api/upload/resume
 */
router.post('/resume', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const userId = req.user.id;

    // Validate file
    const validation = validateFile(file.originalname, file.size);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Upload to Supabase Storage
    const { url, error } = await uploadFile(
      file.buffer,
      file.originalname,
      'uploads',
      `resumes/${userId}`
    );

    if (error) {
      console.error('Resume upload error:', error);
      return res.status(500).json({ error: 'Failed to upload resume' });
    }

    // Update user's resume URL in database
    const db = require('../config/db');
    const { error: updateError } = await db
      .from('student_details')
      .update({ resume_url: url })
      .eq('id', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      // Try to delete the uploaded file since DB update failed
      await deleteFile(`resumes/${userId}/${file.originalname.split('/').pop()}`, 'uploads');
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      message: 'Resume uploaded successfully',
      url: url
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Upload a company document
 * POST /api/upload/company-document
 */
router.post('/company-document', authenticate, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const userId = req.user.id;

    // Validate file
    const validation = validateFile(file.originalname, file.size);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if user has a company
    const db = require('../config/db');
    const { data: company, error: companyError } = await db
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found. Please create a company first.' });
    }

    // Upload to Supabase Storage
    const { url, error } = await uploadFile(
      file.buffer,
      file.originalname,
      'uploads',
      `companies/${company.id}`
    );

    if (error) {
      console.error('Document upload error:', error);
      return res.status(500).json({ error: 'Failed to upload document' });
    }

    // Update company's document URL in database
    const { error: updateError } = await db
      .from('companies')
      .update({ document_url: url })
      .eq('id', company.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      // Try to delete the uploaded file since DB update failed
      await deleteFile(`companies/${company.id}/${file.originalname.split('/').pop()}`, 'uploads');
      return res.status(500).json({ error: 'Failed to update company' });
    }

    res.json({
      message: 'Document uploaded successfully',
      url: url
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Upload a job application resume
 * POST /api/upload/job-application/:jobId
 */
router.post('/job-application/:jobId', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const userId = req.user.id;
    const jobId = req.params.jobId;

    // Validate file
    const validation = validateFile(file.originalname, file.size);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if job exists
    const db = require('../config/db');
    const { data: job, error: jobError } = await db
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Upload to Supabase Storage
    const { url, error } = await uploadFile(
      file.buffer,
      file.originalname,
      'uploads',
      `applications/${jobId}/${userId}`
    );

    if (error) {
      console.error('Application resume upload error:', error);
      return res.status(500).json({ error: 'Failed to upload resume' });
    }

    // Create or update job application
    const { error: applicationError } = await db
      .from('job_applications')
      .upsert({
        job_id: jobId,
        user_id: userId,
        resume_url: url
      }, {
        onConflict: 'job_id,user_id'
      });

    if (applicationError) {
      console.error('Application creation error:', applicationError);
      // Try to delete the uploaded file since application creation failed
      await deleteFile(`applications/${jobId}/${userId}/${file.originalname.split('/').pop()}`, 'uploads');
      return res.status(500).json({ error: 'Failed to create application' });
    }

    res.json({
      message: 'Application submitted successfully',
      url: url
    });

  } catch (error) {
    console.error('Job application upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete a file
 * DELETE /api/upload/file
 * Body: { filePath: string, bucket?: string }
 */
router.delete('/file', authenticate, async (req, res) => {
  try {
    const { filePath, bucket = 'uploads' } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const { success, error } = await deleteFile(filePath, bucket);

    if (!success) {
      return res.status(500).json({ error: 'Failed to delete file' });
    }

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;