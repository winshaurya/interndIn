-- Supabase seed script for interndIn
-- Run in the Supabase SQL editor after executing schema.sql
-- Provides a baseline admin, alumni, student, and related entities

BEGIN;

WITH admin_user AS (
  INSERT INTO users (email, password_hash, role, status, is_verified, created_at, updated_at)
  VALUES (
    'admin@sgsits.ac.in',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'approved',
    true,
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET role = EXCLUDED.role,
      status = EXCLUDED.status,
      is_verified = EXCLUDED.is_verified,
      updated_at = now()
  RETURNING id
),
student_user AS (
  INSERT INTO users (email, password_hash, role, status, is_verified, created_at, updated_at)
  VALUES (
    'rahul.sharma@student.sgsits.ac.in',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'student',
    'active',
    true,
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET role = EXCLUDED.role,
      status = EXCLUDED.status,
      is_verified = EXCLUDED.is_verified,
      updated_at = now()
  RETURNING id
),
alumni_user AS (
  INSERT INTO users (email, password_hash, role, status, is_verified, created_at, updated_at)
  VALUES (
    'ananya.rao@alumni.sgsits.ac.in',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'alumni',
    'approved',
    true,
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET role = EXCLUDED.role,
      status = EXCLUDED.status,
      is_verified = EXCLUDED.is_verified,
      updated_at = now()
  RETURNING id
),
student_profile AS (
  INSERT INTO student_profiles (
    user_id, name, student_id, branch, grad_year, resume_url,
    skills, email, phone, current_year, cgpa, desired_roles, preferred_locations, work_mode
  )
  SELECT
    su.id,
    'Rahul Sharma',
    'CS2021001',
    'Computer Science',
    2025,
    'https://example.com/resume/rahul.pdf',
    'Java, Node.js, PostgreSQL',
    'rahul.sharma@student.sgsits.ac.in',
    '+91-9876543210',
    4,
    8.7,
    ARRAY['Backend Engineer','Full Stack Engineer'],
    ARRAY['Remote','Indore'],
    'hybrid'
  FROM student_user su
  ON CONFLICT (user_id) DO UPDATE
  SET name = EXCLUDED.name,
      branch = EXCLUDED.branch,
      grad_year = EXCLUDED.grad_year,
      resume_url = EXCLUDED.resume_url,
      skills = EXCLUDED.skills,
      updated_at = now()
  RETURNING user_id
),
alumni_profile AS (
  INSERT INTO alumni_profiles (user_id, name, grad_year, current_title, linkedin_url)
  SELECT
    au.id,
    'Ananya Rao',
    2018,
    'Senior Data Scientist at DataInsights',
    'https://www.linkedin.com/in/ananyarao'
  FROM alumni_user au
  ON CONFLICT (user_id) DO UPDATE
  SET name = EXCLUDED.name,
      grad_year = EXCLUDED.grad_year,
      current_title = EXCLUDED.current_title,
      linkedin_url = EXCLUDED.linkedin_url,
      updated_at = now()
  RETURNING id, user_id
),
company_row AS (
  INSERT INTO companies (
    alumni_id, user_id, name, website, industry, company_size,
    about, document_url, logo_url, status, created_at, updated_at
  )
  SELECT
    ap.id,
    ap.user_id,
    'DataInsights Pvt Ltd',
    'https://datainsights.in',
    'Data Analytics',
    '51-200',
    'Full-stack analytics partner for enterprise product teams.',
    'https://files.example.com/datainsights-deck.pdf',
    'https://files.example.com/datainsights-logo.png',
    'approved',
    now(),
    now()
  FROM alumni_profile ap
  ON CONFLICT (alumni_id) DO UPDATE
  SET name = EXCLUDED.name,
      website = EXCLUDED.website,
      industry = EXCLUDED.industry,
      company_size = EXCLUDED.company_size,
      about = EXCLUDED.about,
      status = EXCLUDED.status,
      updated_at = now()
  RETURNING id, alumni_id
),
job_row AS (
  INSERT INTO jobs (
    company_id, posted_by_alumni_id, job_title, job_description,
    location, employment_type, salary_range, closes_at, created_at, updated_at
  )
  SELECT
    c.id,
    c.alumni_id,
    'Full Stack Engineer',
    'Own the analytics platform UI + APIs. Work with Supabase & React.',
    'Remote (India)',
    'full-time',
    '18-24 LPA',
    now() + interval '30 days',
    now(),
    now()
  FROM company_row c
  ON CONFLICT DO NOTHING
  RETURNING id
),
application_row AS (
  INSERT INTO job_applications (
    job_id, user_id, resume_url, cover_letter, applicant_count, status, applied_at, updated_at
  )
  SELECT
    jr.id,
    su.user_id,
    'https://example.com/resume/rahul.pdf',
    'Excited to contribute to your analytics roadmap.',
    1,
    'submitted',
    now(),
    now()
  FROM job_row jr
  CROSS JOIN student_profile su
  ON CONFLICT (job_id, user_id) DO UPDATE
  SET resume_url = EXCLUDED.resume_url,
      cover_letter = EXCLUDED.cover_letter,
      updated_at = now()
  RETURNING job_id, user_id
),
connection_row AS (
  INSERT INTO connections (sender_id, receiver_id, status, created_at, updated_at)
  SELECT
    su.user_id,
    ap.user_id,
    'accepted',
    now(),
    now()
  FROM student_profile su
  CROSS JOIN alumni_profile ap
  ON CONFLICT (sender_id, receiver_id) DO UPDATE
  SET status = EXCLUDED.status,
      updated_at = now()
  RETURNING id
)
INSERT INTO messages (sender_id, receiver_id, connection_id, content, is_read, created_at, updated_at)
SELECT
  su.user_id,
  ap.user_id,
  cr.id,
  'Hi Ananya, thanks for posting the Full Stack Engineer role. I have applied and would love to discuss.',
  false,
  now(),
  now()
FROM student_profile su
CROSS JOIN alumni_profile ap
CROSS JOIN connection_row cr
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at, updated_at)
SELECT
  su.user_id,
  'application',
  'Application submitted',
  'Your application for Full Stack Engineer has been received.',
  jsonb_build_object('job_title', 'Full Stack Engineer'),
  false,
  now(),
  now()
FROM student_profile su
ON CONFLICT DO NOTHING;

COMMIT;
