-- =================================================================
-- Supabase Schema: interndIn
-- Generated/Updated: (by GitHub Copilot assistant)
-- =================================================================

BEGIN;

-- =================================================================
-- 1. EXTENSIONS & SETUP
-- =================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- =================================================================
-- 2. ENUMS (Strict Types)
-- =================================================================
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('student', 'alumni', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE work_mode AS ENUM ('remote', 'on-site', 'hybrid'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'internship', 'contract'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE application_status AS ENUM ('submitted', 'viewed', 'interviewing', 'offer', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Note: 'connection_status' is REMOVED as requested.

-- =================================================================
-- 3. PROFILES (Links to Supabase Auth)
-- =================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email CITEXT,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT,
    avatar_url TEXT,
    headline TEXT,
    about TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sub-tables for specific details
CREATE TABLE IF NOT EXISTS public.student_details (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    roll_no TEXT,
    date_of_birth DATE,
    phone TEXT,
    address TEXT,
    university_branch TEXT,
    grad_year INTEGER,
    cgpa NUMERIC(3,2),
    resume_url TEXT, -- Link to the storage bucket
    skills TEXT[],
    experiences JSONB DEFAULT '[]'::jsonb,
    academics JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    consent JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alumni_details (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    linkedin_url TEXT,
    current_position TEXT,
    experience_years INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =================================================================
-- 4. COMPANIES & JOBS
-- =================================================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website TEXT,
    logo_url TEXT,
    description TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    posted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type job_type DEFAULT 'full-time',
    mode work_mode DEFAULT 'on-site',
    location TEXT,
    salary_range TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    cover_letter TEXT,
    status application_status DEFAULT 'submitted',
    applied_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(job_id, student_id) -- Prevent double application
);

-- =================================================================
-- 5. MESSAGING (Simplified - No Connections Required)
-- =================================================================
-- Group messages into "Conversations" (e.g. Chat about Job X)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id),
    alumni_id UUID NOT NULL REFERENCES public.profiles(id),
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL, -- Optional context
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, alumni_id, job_id) -- One conversation per pair per job
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =================================================================
-- 6. NOTIFICATIONS (Simple Table for Backend)
-- =================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system', -- 'application_update', 'new_message', etc.
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =================================================================
-- 7. STORAGE BUCKET (For Resumes)
-- =================================================================
-- We create the bucket and policies in SQL directly
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', false) 
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage (Secure)
CREATE POLICY "Auth users can upload" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own files" ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =================================================================
-- 8. TRIGGERS (Automation)
-- =================================================================

-- A. Timestamp Updater
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ language 'plpgsql';

CREATE TRIGGER update_profiles_time BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_student_time BEFORE UPDATE ON student_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_alumni_time BEFORE UPDATE ON alumni_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_companies_time BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_jobs_time BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- User Signup Handler (Google/Email -> Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  determined_role user_role;
BEGIN
  determined_role := COALESCE(
    (new.raw_user_meta_data->>'role')::user_role,
    (new.user_metadata->>'role')::user_role,
    'student'
  );
  
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', determined_role);
  
  IF determined_role = 'student' THEN INSERT INTO public.student_details (id) VALUES (new.id);
  ELSIF determined_role = 'alumni' THEN INSERT INTO public.alumni_details (id) VALUES (new.id);
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Edit own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own student details" ON student_details FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view their own student details" ON student_details FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own student details" ON student_details FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own alumni details" ON alumni_details FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view their own alumni details" ON alumni_details FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own alumni details" ON alumni_details FOR UPDATE USING (auth.uid() = id);

-- Company/Job Policies
CREATE POLICY "View companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Alumni create companies" ON companies FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner edit companies" ON companies FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "View jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Owner create jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = posted_by);

-- Application Policies
CREATE POLICY "Students apply" ON job_applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "View applications" ON job_applications FOR SELECT USING (
    auth.uid() = student_id OR 
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND jobs.posted_by = auth.uid())
);

-- Messaging Policies
CREATE POLICY "View conversations" ON conversations FOR SELECT USING (auth.uid() = student_id OR auth.uid() = alumni_id);
CREATE POLICY "Start conversation" ON conversations FOR INSERT WITH CHECK (auth.uid() = student_id OR auth.uid() = alumni_id);

CREATE POLICY "View messages" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.student_id = auth.uid() OR c.alumni_id = auth.uid()))
);
CREATE POLICY "Send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notification Policies
CREATE POLICY "View own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
-- Allow Backend (Service Role) or System to insert, but also allow User for testing if needed
CREATE POLICY "Insert notifications" ON notifications FOR INSERT WITH CHECK (true); 

-- =================================================================
-- FINAL PERFORMANCE INDEXES (Run this last)
-- =================================================================

-- 1. Accelerate Profile Lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Accelerate Job Searches
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON public.jobs(type);

-- 3. Accelerate Application Filtering
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.job_applications(student_id);

-- 4. Accelerate Messaging & Notifications
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(student_id, alumni_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

COMMIT;
BEGIN;

-- Add missing columns to 'companies' to match code expectations
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS document_url TEXT;

COMMIT;