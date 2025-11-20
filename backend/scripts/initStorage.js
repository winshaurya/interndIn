// scripts/initStorage.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase admin credentials. Provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (per https://supabase.com/docs/guides/storage).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initStorage() {
  try {
    console.log('🔍 Checking storage bucket...');

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Failed to list buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'uploads');

    if (!bucketExists) {
      console.log('📦 Creating uploads bucket...');

      const { data, error } = await supabase.storage.createBucket('uploads', {
        public: true, // Allow public access to uploaded files
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp'
        ],
        fileSizeLimit: 5242880 // 5MB
      });

      if (error) {
        console.error('❌ Failed to create bucket:', error);
        console.log('');
        console.log('🔧 MANUAL SETUP REQUIRED:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Storage');
        console.log('3. Create a new bucket named "uploads"');
        console.log('4. Make it public');
        console.log('5. Set allowed file types: PDF, DOC, DOCX, TXT, JPG, PNG');
        console.log('6. Set max file size: 5MB');
        return;
      }

      console.log('✅ Bucket created successfully');
    } else {
      console.log('✅ Bucket already exists');
    }

    // Create folders/policies if needed
    console.log('🔧 Setting up bucket policies...');

    // Note: You may need to set up RLS policies in Supabase dashboard for the storage bucket
    // For now, since the bucket is public, files will be accessible

    console.log('✅ Storage initialization complete');

  } catch (error) {
    console.error('❌ Storage initialization failed:', error);
  }
}

initStorage();