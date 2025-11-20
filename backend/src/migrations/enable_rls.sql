-- Enable Row Level Security and create policies for production-ready security
-- Run this in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- ===============================
-- USERS TABLE POLICIES
-- ===============================
-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow insert for registration (signup)
CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ===============================
-- STUDENT PROFILES POLICIES
-- ===============================
-- Students can view their own profile
CREATE POLICY "Students can view own profile" ON student_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Students can update their own profile
CREATE POLICY "Students can update own profile" ON student_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Students can insert their own profile
CREATE POLICY "Students can create own profile" ON student_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===============================
-- ALUMNI PROFILES POLICIES
-- ===============================
-- Alumni can view their own profile
CREATE POLICY "Alumni can view own profile" ON alumni_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Alumni can update their own profile
CREATE POLICY "Alumni can update own profile" ON alumni_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Alumni can insert their own profile
CREATE POLICY "Alumni can create own profile" ON alumni_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===============================
-- COMPANIES POLICIES
-- ===============================
-- Alumni can view their own company
CREATE POLICY "Alumni can view own company" ON companies
  FOR SELECT USING (
    alumni_id IN (
      SELECT id FROM alumni_profiles WHERE user_id = auth.uid()
    )
  );

-- Alumni can update their own company
CREATE POLICY "Alumni can update own company" ON companies
  FOR UPDATE USING (
    alumni_id IN (
      SELECT id FROM alumni_profiles WHERE user_id = auth.uid()
    )
  );

-- Alumni can create their own company
CREATE POLICY "Alumni can create own company" ON companies
  FOR INSERT WITH CHECK (
    alumni_id IN (
      SELECT id FROM alumni_profiles WHERE user_id = auth.uid()
    )
  );

-- Public read access for approved companies (for job listings)
CREATE POLICY "Public can view approved companies" ON companies
  FOR SELECT USING (status = 'approved');

-- ===============================
-- JOBS POLICIES
-- ===============================
-- Alumni can view their own jobs
CREATE POLICY "Alumni can view own jobs" ON jobs
  FOR SELECT USING (
    posted_by_alumni_id IN (
      SELECT id FROM alumni_profiles WHERE user_id = auth.uid()
    )
  );

-- Alumni can update their own jobs
CREATE POLICY "Alumni can update own jobs" ON jobs
  FOR UPDATE USING (
    posted_by_alumni_id IN (
      SELECT id FROM alumni_profiles WHERE user_id = auth.uid()
    )
  );

-- Alumni can create jobs
CREATE POLICY "Alumni can create jobs" ON jobs
  FOR INSERT WITH CHECK (
    posted_by_alumni_id IN (
      SELECT id FROM alumni_profiles WHERE user_id = auth.uid()
    )
  );

-- Alumni can delete their own jobs
CREATE POLICY "Alumni can delete own jobs" ON jobs
  FOR DELETE USING (
    posted_by_alumni_id IN (
      SELECT id FROM alumni_profiles WHERE user_id = auth.uid()
    )
  );

-- Public read access for all jobs (students can browse)
CREATE POLICY "Public can view jobs" ON jobs
  FOR SELECT USING (true);

-- ===============================
-- JOB APPLICATIONS POLICIES
-- ===============================
-- Students can view their own applications
CREATE POLICY "Students can view own applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Students can create applications
CREATE POLICY "Students can create applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students can delete their own applications
CREATE POLICY "Students can delete own applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Alumni can view applications for their jobs
CREATE POLICY "Alumni can view applications for own jobs" ON job_applications
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM jobs WHERE posted_by_alumni_id IN (
        SELECT id FROM alumni_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ===============================
-- CONNECTIONS POLICIES
-- ===============================
-- Users can view connections they're involved in
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can create connection requests
CREATE POLICY "Users can create connection requests" ON connections
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update connections they're involved in
CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ===============================
-- MESSAGES POLICIES
-- ===============================
-- Users can view messages in connections they're part of
CREATE POLICY "Users can view messages in own connections" ON messages
  FOR SELECT USING (
    connection_id IN (
      SELECT id FROM connections
      WHERE sender_id = auth.uid() OR receiver_id = auth.uid()
    )
  );

-- Users can send messages in connections they're part of
CREATE POLICY "Users can send messages in own connections" ON messages
  FOR INSERT WITH CHECK (
    connection_id IN (
      SELECT id FROM connections
      WHERE sender_id = auth.uid() OR receiver_id = auth.uid()
    )
    AND auth.uid() = sender_id
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- ===============================
-- NOTIFICATIONS POLICIES
-- ===============================
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow system to create notifications
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ===============================
-- OTP VERIFICATIONS POLICIES
-- ===============================
-- Users can view their own OTP verifications
CREATE POLICY "Users can view own OTP" ON otp_verifications
  FOR SELECT USING (auth.uid()::text = email OR email IN (
    SELECT email FROM users WHERE id = auth.uid()
  ));

-- Allow OTP creation for password reset and email verification
CREATE POLICY "Allow OTP creation" ON otp_verifications
  FOR INSERT WITH CHECK (true);

-- Users can update their own OTP (mark as used)
CREATE POLICY "Users can update own OTP" ON otp_verifications
  FOR UPDATE USING (auth.uid()::text = email OR email IN (
    SELECT email FROM users WHERE id = auth.uid()
  ));

-- ===============================
-- PASSWORD RESET TOKENS POLICIES
-- ===============================
-- Users can view their own reset tokens
CREATE POLICY "Users can view own reset tokens" ON password_reset_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Allow reset token creation
CREATE POLICY "Allow reset token creation" ON password_reset_tokens
  FOR INSERT WITH CHECK (true);

-- Users can update their own reset tokens
CREATE POLICY "Users can update own reset tokens" ON password_reset_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- ===============================
-- STORAGE POLICIES (for Supabase Storage)
-- ===============================
-- Note: These would be set up in Supabase Dashboard under Storage > Buckets > Policies
-- For the 'uploads' bucket:
-- - Allow authenticated users to upload files
-- - Allow public read access for resume files
-- - Allow users to delete their own files

-- Example storage policy SQL (run in Storage SQL Editor):
/*
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public read access for certain file types
CREATE POLICY "Public can view files" ON storage.objects
  FOR SELECT USING (true);

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
*/
