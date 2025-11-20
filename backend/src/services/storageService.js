// src/services/storageService.js
const db = require('../config/db');
const supabase = db.supabase;
const hasServiceRoleKey = db.hasServiceRoleKey;

const STORAGE_DOCS_URL = 'https://supabase.com/docs/guides/storage';

const buildDashboardBucketUrl = (bucketName) => {
  const url = process.env.SUPABASE_URL || '';
  const projectRefMatch = url.match(/https?:\/\/(.+)\.supabase\.co/);
  const projectRef = process.env.SUPABASE_PROJECT_REF || (projectRefMatch ? projectRefMatch[1] : 'YOUR_PROJECT');
  return `https://supabase.com/dashboard/project/${projectRef}/storage/buckets/${bucketName}`;
};

/**
 * Ensure the uploads bucket exists
 */
const ensureBucketExists = async (bucketName = 'uploads') => {
  if (!supabase) {
    console.error('❌ Supabase client is not initialised.');
    return false;
  }

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }

    const bucketExists = buckets.some((bucket) => bucket.name === bucketName);
    if (bucketExists) {
      console.log(`✅ Bucket "${bucketName}" exists and is accessible.`);
      return true;
    } else {
      console.error(`❌ Bucket "${bucketName}" does not exist. Please create it manually in Supabase Dashboard at ${buildDashboardBucketUrl(bucketName)}`);
      console.log(`   Reference: ${STORAGE_DOCS_URL}`);
      return false;
    }
  } catch (err) {
    console.error('Error checking bucket existence:', err);
    console.log(`⚠️  Please verify the bucket "${bucketName}" inside ${buildDashboardBucketUrl(bucketName)}`);
    console.log(`   Reference: ${STORAGE_DOCS_URL}`);
    return false;
  }
};

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The original file name
 * @param {string} bucket - The storage bucket name
 * @param {string} folder - The folder path within the bucket
 * @returns {Promise<{url: string, error: any}>}
 */
const uploadFile = async (fileBuffer, fileName, bucket = 'uploads', folder = '') => {
  try {
    // Generate a unique file name to avoid conflicts
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: getContentType(fileName),
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return { url: null, error };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('File upload error:', err);
    return { url: null, error: err };
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - The file path in storage
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<{success: boolean, error: any}>}
 */
const deleteFile = async (filePath, bucket = 'uploads') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('File delete error:', err);
    return { success: false, error: err };
  }
};

/**
 * Get content type based on file extension
 * @param {string} fileName - The file name
 * @returns {string} - The content type
 */
const getContentType = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  const contentTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };

  return contentTypes[ext] || 'application/octet-stream';
};

/**
 * Validate file type and size
 * @param {string} fileName - The file name
 * @param {number} fileSize - The file size in bytes
 * @param {Array<string>} allowedTypes - Array of allowed file extensions
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} - Validation result
 */
const validateFile = (fileName, fileSize, allowedTypes = ['pdf', 'doc', 'docx', 'txt'], maxSize = 5 * 1024 * 1024) => {
  const fileExt = fileName.split('.').pop().toLowerCase();

  if (!allowedTypes.includes(fileExt)) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }

  if (fileSize > maxSize) {
    return { valid: false, error: `File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB` };
  }

  return { valid: true, error: null };
};

module.exports = {
  uploadFile,
  deleteFile,
  validateFile,
  ensureBucketExists
};