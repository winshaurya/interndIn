BEGIN;

WITH
-- ======================
-- USERS
-- ======================

-- Admin
admin_user AS (
  INSERT INTO users (email, password_hash, role, status, is_verified)
  VALUES (
    'admin@sgsits.ac.in',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'approved',
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET role = EXCLUDED.role,
      status = EXCLUDED.status,
      is_verified = EXCLUDED.is_verified,
      updated_at = now()
  RETURNING id
),

-- Student 1
student1_user AS (
  INSERT INTO users (email, password_hash, role, status, is_verified)
  VALUES (
    'rahul.sharma@student.sgsits.ac.in',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'student',
    'active',
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET status = EXCLUDED.status,
      is_verified = EXCLUDED.is_verified
  RETURNING id
),

-- Student 2
student2_user AS (
  INSERT INTO users (email, password_hash, role, status, is_verified)
  VALUES (
    'meera.patel@student.sgsits.ac.in',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'student',
    'active',
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET status = EXCLUDED.status,
      is_verified = EXCLUDED.is_verified
  RETURNING id
),

-- Alumni 1
alumni1_user AS (
  INSERT INTO users (email, password_hash, role, status, is_verified)
  VALUES (
    'ananya.rao@alumni.sgsits.ac.in',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'alumni',
    'approved',
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET status = EXCLUDED.status,
      updated_at = now()
  RETURNING id
),

-- Alumni 2
alumni2_user AS (
  INSERT INTO users (email, password_hash, role, status, is_verified)
  VALUES (
    'rohit.verma@alumni.sgsits.ac.in',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'alumni',
    'approved',
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET status = EXCLUDED.status
  RETURNING id
),

-- ======================
-- STUDENT PROFILES
-- ======================

student1_profile AS (
  INSERT INTO student_profiles (
    user_id, name, student_id, branch, grad_year, resume_url,
    skills, email, phone, current_year, cgpa,
    desired_roles, preferred_locations, work_mode
  )
  SELECT
    su.id,
    'Rahul Sharma',
    'CS2021001',
    'Computer Science',
    2025,
    'https://example.com/resume/rahul.pdf',
    'Java, Node.js, PostgreSQL, Docker',
    'rahul.sharma@student.sgsits.ac.in',
    '+91-9876543210',
    4,
    8.7,
    ARRAY['Backend Engineer','Full Stack Engineer'],
    ARRAY['Remote','Indore'],
    'hybrid'
  FROM student1_user su
  ON CONFLICT (user_id) DO UPDATE SET
    skills = EXCLUDED.skills,
    updated_at = now()
  RETURNING user_id
),

student2_profile AS (
  INSERT INTO student_profiles (
    user_id, name, student_id, branch, grad_year, resume_url,
    skills, email, phone, current_year, cgpa,
    desired_roles, preferred_locations, work_mode
  )
  SELECT
    su.id,
    'Meera Patel',
    'IT2021023',
    'Information Technology',
    2026,
    'https://example.com/resume/meera.pdf',
    'Python, ML, TensorFlow, SQL',
    'meera.patel@student.sgsits.ac.in',
    '+91-9123456780',
    3,
    9.1,
    ARRAY['Data Analyst','ML Engineer'],
    ARRAY['Remote','Bangalore'],
    'remote'
  FROM student2_user su
  ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
  RETURNING user_id
),

-- ======================
-- ALUMNI PROFILES
-- ======================

alumni1_profile AS (
  INSERT INTO alumni_profiles (user_id, name, grad_year, current_title, linkedin_url)
  SELECT
    au.id,
    'Ananya Rao',
    2018,
    'Senior Data Scientist at DataInsights',
    'https://www.linkedin.com/in/ananyarao'
  FROM alumni1_user au
  ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
  RETURNING id, user_id
),

alumni2_profile AS (
  INSERT INTO alumni_profiles (user_id, name, grad_year, current_title, linkedin_url)
  SELECT
    au.id,
    'Rohit Verma',
    2017,
    'Engineering Manager at CloudNova',
    'https://www.linkedin.com/in/rohitverma'
  FROM alumni2_user au
  ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
  RETURNING id, user_id
),

-- ======================
-- COMPANIES
-- ======================

company1 AS (
  INSERT INTO companies (
    alumni_id, user_id, name, website, industry, company_size,
    about, document_url, logo_url, status
  )
  SELECT
    ap.id,
    ap.user_id,
    'DataInsights Pvt Ltd',
    'https://datainsights.in',
    'Analytics',
    '51-200',
    'Enterprise analytics solutions.',
    'https://files.example.com/datainsights.pdf',
    'https://files.example.com/datainsights-logo.png',
    'approved'
  FROM alumni1_profile ap
  ON CONFLICT (alumni_id) DO UPDATE SET updated_at = now()
  RETURNING id, alumni_id
),

company2 AS (
  INSERT INTO companies (
    alumni_id, user_id, name, website, industry, company_size,
    about, document_url, logo_url, status
  )
  SELECT
    ap.id,
    ap.user_id,
    'CloudNova Technologies',
    'https://cloudnova.dev',
    'Cloud Computing',
    '200-500',
    'Cloud infrastructure + developer tooling.',
    'https://files.example.com/cloudnova.pdf',
    'https://files.example.com/cloudnova-logo.png',
    'approved'
  FROM alumni2_profile ap
  ON CONFLICT (alumni_id) DO UPDATE SET updated_at = now()
  RETURNING id, alumni_id
),

-- ======================
-- JOBS
-- ======================

job1 AS (
  INSERT INTO jobs (
    company_id, posted_by_alumni_id, job_title, job_description,
    location, employment_type, salary_range, closes_at
  )
  SELECT
    c.id,
    c.alumni_id,
    'Full Stack Engineer',
    'Build internal analytics dashboards using Supabase & React.',
    'Remote',
    'full-time',
    '18-24 LPA',
    now() + interval '30 days'
  FROM company1 c
  ON CONFLICT DO NOTHING
  RETURNING id
),

job2 AS (
  INSERT INTO jobs (
    company_id, posted_by_alumni_id, job_title, job_description,
    location, employment_type, salary_range, closes_at
  )
  SELECT
    c.id,
    c.alumni_id,
    'Machine Learning Engineer',
    'Develop scalable ML models for cloud infra optimization.',
    'Bangalore',
    'full-time',
    '20-28 LPA',
    now() + interval '45 days'
  FROM company2 c
  ON CONFLICT DO NOTHING
  RETURNING id
),

-- ======================
-- APPLICATIONS
-- ======================

app1 AS (
  INSERT INTO job_applications (
    job_id, user_id, resume_url, cover_letter, applicant_count, status
  )
  SELECT
    j1.id,
    sp1.user_id,
    'https://example.com/resume/rahul.pdf',
    'Excited to contribute.',
    1,
    'submitted'
  FROM job1 j1
  CROSS JOIN student1_profile sp1
  ON CONFLICT (job_id, user_id) DO UPDATE SET updated_at = now()
  RETURNING job_id, user_id
),

app2 AS (
  INSERT INTO job_applications (
    job_id, user_id, resume_url, cover_letter, applicant_count, status
  )
  SELECT
    j2.id,
    sp2.user_id,
    'https://example.com/resume/meera.pdf',
    'Looking forward to ML challenges.',
    1,
    'submitted'
  FROM job2 j2
  CROSS JOIN student2_profile sp2
  ON CONFLICT (job_id, user_id) DO UPDATE SET updated_at = now()
  RETURNING job_id, user_id
),

-- ======================
-- CONNECTIONS
-- ======================

connection1 AS (
  INSERT INTO connections (sender_id, receiver_id, status)
  SELECT sp1.user_id, ap1.user_id, 'accepted'
  FROM student1_profile sp1
  CROSS JOIN alumni1_profile ap1
  ON CONFLICT (sender_id, receiver_id) DO UPDATE SET updated_at = now()
  RETURNING id
),

connection2 AS (
  INSERT INTO connections (sender_id, receiver_id, status)
  SELECT sp2.user_id, ap2.user_id, 'accepted'
  FROM student2_profile sp2
  CROSS JOIN alumni2_profile ap2
  ON CONFLICT (sender_id, receiver_id) DO UPDATE SET updated_at = now()
  RETURNING id
),

-- ======================
-- MESSAGES (now CTEs inside same WITH)
-- ======================

messages1 AS (
  INSERT INTO messages (sender_id, receiver_id, connection_id, content)
  SELECT
    sp1.user_id,
    ap1.user_id,
    c1.id,
    'Hi Ananya, I applied for the Full Stack role. Looking forward!'
  FROM student1_profile sp1
  CROSS JOIN alumni1_profile ap1
  CROSS JOIN connection1 c1
  ON CONFLICT DO NOTHING
  RETURNING id
),

messages2 AS (
  INSERT INTO messages (sender_id, receiver_id, connection_id, content)
  SELECT
    sp2.user_id,
    ap2.user_id,
    c2.id,
    'Hello Rohit, I applied to the ML Engineer role. Excited to connect!'
  FROM student2_profile sp2
  CROSS JOIN alumni2_profile ap2
  CROSS JOIN connection2 c2
  ON CONFLICT DO NOTHING
  RETURNING id
),

-- ======================
-- NOTIFICATIONS (also CTEs)
-- ======================

notifications1 AS (
  INSERT INTO notifications (user_id, type, title, message, metadata)
  SELECT
    sp1.user_id,
    'application',
    'Application submitted',
    'Your application for Full Stack Engineer has been received.',
    jsonb_build_object('job','Full Stack Engineer')
  FROM student1_profile sp1
  RETURNING id
),

notifications2 AS (
  INSERT INTO notifications (user_id, type, title, message, metadata)
  SELECT
    sp2.user_id,
    'application',
    'Application submitted',
    'Your application for Machine Learning Engineer has been received.',
    jsonb_build_object('job','Machine Learning Engineer')
  FROM student2_profile sp2
  RETURNING id
)

-- Final SELECT to execute the entire WITH block
SELECT 1;

COMMIT;