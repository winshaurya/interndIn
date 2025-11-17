-- Test Data Inserts for Supabase (India-based, interconnected)
-- Run after schema.sql
-- Passwords are bcrypt hashed for 'password123' (change as needed)
-- Emails are unique and fictional

-- Users (mix of students and alumni)
INSERT INTO users (id, email, password_hash, role, is_verified, status, created_at) VALUES
(gen_random_uuid(), 'rahul.sharma@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'priya.patel@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'arjun.verma@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'kavita.singh@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'vikas.gupta@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'ananya.rao@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'rohit.kumar@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'meera.joshi@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'sandeep.das@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'neha.bhatt@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'amit.chopra@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'pallavi.mehta@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'rajesh.naidu@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'sunita.agarwal@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'karan.thakur@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'divya.shukla@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'manish.yadav@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'ruchi.pandey@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'vikrant.singh@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'alisha.khan@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'suresh.raina@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'pooja.saxena@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'aditya.mishra@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'nidhi.tiwari@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'ravi.shankar@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'kiran.bansal@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'tanvi.garg@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'harsh.jain@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now()),
(gen_random_uuid(), 'isha.roy@student.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, 'active', now()),
(gen_random_uuid(), 'vivek.dubey@alumni.sgsits.ac.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'alumni', true, 'active', now());

-- Student Profiles (link to users)
INSERT INTO student_profiles (id, user_id, name, student_id, branch, grad_year, skills, resume_url, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'rahul.sharma@student.sgsits.ac.in'), 'Rahul Sharma', 'CS2021001', 'Computer Science', 2025, 'Java, Python, Machine Learning', 'https://example.com/resume1.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'priya.patel@student.sgsits.ac.in'), 'Priya Patel', 'ME2021002', 'Mechanical Engineering', 2025, 'CAD, SolidWorks, Project Management', 'https://example.com/resume2.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'vikas.gupta@student.sgsits.ac.in'), 'Vikas Gupta', 'EE2021003', 'Electrical Engineering', 2025, 'Circuit Design, MATLAB, IoT', 'https://example.com/resume3.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'rohit.kumar@student.sgsits.ac.in'), 'Rohit Kumar', 'CE2021004', 'Civil Engineering', 2025, 'AutoCAD, Structural Analysis', 'https://example.com/resume4.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'sandeep.das@student.sgsits.ac.in'), 'Sandeep Das', 'BT2021005', 'Biotechnology', 2025, 'Molecular Biology, Bioinformatics', 'https://example.com/resume5.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'amit.chopra@student.sgsits.ac.in'), 'Amit Chopra', 'CS2021006', 'Computer Science', 2025, 'Web Development, React, Node.js', 'https://example.com/resume6.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'rajesh.naidu@student.sgsits.ac.in'), 'Rajesh Naidu', 'ME2021007', 'Mechanical Engineering', 2025, 'Thermodynamics, Fluid Mechanics', 'https://example.com/resume7.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'karan.thakur@student.sgsits.ac.in'), 'Karan Thakur', 'EE2021008', 'Electrical Engineering', 2025, 'Power Systems, Renewable Energy', 'https://example.com/resume8.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'manish.yadav@student.sgsits.ac.in'), 'Manish Yadav', 'CE2021009', 'Civil Engineering', 2025, 'Geotechnical Engineering, GIS', 'https://example.com/resume9.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'vikrant.singh@student.sgsits.ac.in'), 'Vikrant Singh', 'BT2021010', 'Biotechnology', 2025, 'Genomics, Data Analysis', 'https://example.com/resume10.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'suresh.raina@student.sgsits.ac.in'), 'Suresh Raina', 'CS2021011', 'Computer Science', 2025, 'AI, Deep Learning, TensorFlow', 'https://example.com/resume11.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'aditya.mishra@student.sgsits.ac.in'), 'Aditya Mishra', 'ME2021012', 'Mechanical Engineering', 2025, 'Robotics, Control Systems', 'https://example.com/resume12.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'ravi.shankar@student.sgsits.ac.in'), 'Ravi Shankar', 'EE2021013', 'Electrical Engineering', 2025, 'Embedded Systems, C++', 'https://example.com/resume13.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'tanvi.garg@student.sgsits.ac.in'), 'Tanvi Garg', 'CE2021014', 'Civil Engineering', 2025, 'Urban Planning, Sustainability', 'https://example.com/resume14.pdf', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'isha.roy@student.sgsits.ac.in'), 'Isha Roy', 'BT2021015', 'Biotechnology', 2025, 'Immunology, Lab Techniques', 'https://example.com/resume15.pdf', now());

-- Alumni Profiles (link to users)
INSERT INTO alumni_profiles (id, user_id, name, grad_year, current_title, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'arjun.verma@alumni.sgsits.ac.in'), 'Arjun Verma', 2015, 'Software Engineer at Google India', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'kavita.singh@alumni.sgsits.ac.in'), 'Kavita Singh', 2016, 'Product Manager at Flipkart', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'ananya.rao@alumni.sgsits.ac.in'), 'Ananya Rao', 2017, 'Data Scientist at Infosys', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'meera.joshi@alumni.sgsits.ac.in'), 'Meera Joshi', 2018, 'Consultant at Deloitte India', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'neha.bhatt@alumni.sgsits.ac.in'), 'Neha Bhatt', 2019, 'Engineer at Tata Steel', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'pallavi.mehta@alumni.sgsits.ac.in'), 'Pallavi Mehta', 2020, 'Marketing Lead at Reliance Industries', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'sunita.agarwal@alumni.sgsits.ac.in'), 'Sunita Agarwal', 2014, 'HR Manager at HDFC Bank', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'divya.shukla@alumni.sgsits.ac.in'), 'Divya Shukla', 2013, 'Research Scientist at DRDO', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'ruchi.pandey@alumni.sgsits.ac.in'), 'Ruchi Pandey', 2012, 'Professor at IIT Delhi', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'alisha.khan@alumni.sgsits.ac.in'), 'Alisha Khan', 2011, 'CEO at StartupXYZ', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'pooja.saxena@alumni.sgsits.ac.in'), 'Pooja Saxena', 2010, 'VP Engineering at Wipro', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'nidhi.tiwari@alumni.sgsits.ac.in'), 'Nidhi Tiwari', 2009, 'Finance Director at ICICI Bank', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'kiran.bansal@alumni.sgsits.ac.in'), 'Kiran Bansal', 2008, 'Operations Head at Air India', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'harsh.jain@alumni.sgsits.ac.in'), 'Harsh Jain', 2007, 'Tech Lead at Microsoft India', now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'vivek.dubey@alumni.sgsits.ac.in'), 'Vivek Dubey', 2006, 'Entrepreneur at Own Startup', now());

-- Companies (linked to alumni and users)
INSERT INTO companies (id, alumni_id, user_id, name, website, industry, company_size, about, document_url, status, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM alumni_profiles WHERE name = 'Arjun Verma'), (SELECT id FROM users WHERE email = 'arjun.verma@alumni.sgsits.ac.in'), 'TechNova Solutions', 'https://technova.in', 'Technology', '51-200', 'Leading software solutions in India', 'https://example.com/doc1.pdf', 'active', now()),
(gen_random_uuid(), (SELECT id FROM alumni_profiles WHERE name = 'Kavita Singh'), (SELECT id FROM users WHERE email = 'kavita.singh@alumni.sgsits.ac.in'), 'EcomHub India', 'https://ecomhub.in', 'E-commerce', '201-500', 'E-commerce platform connecting buyers and sellers', 'https://example.com/doc2.pdf', 'active', now()),
(gen_random_uuid(), (SELECT id FROM alumni_profiles WHERE name = 'Ananya Rao'), (SELECT id FROM users WHERE email = 'ananya.rao@alumni.sgsits.ac.in'), 'DataInsights Pvt Ltd', 'https://datainsights.in', 'Data Analytics', '11-50', 'Providing data-driven insights for businesses', 'https://example.com/doc3.pdf', 'active', now()),
(gen_random_uuid(), (SELECT id FROM alumni_profiles WHERE name = 'Meera Joshi'), (SELECT id FROM users WHERE email = 'meera.joshi@alumni.sgsits.ac.in'), 'ConsultPro Services', 'https://consultpro.in', 'Consulting', '51-200', 'Management consulting for Indian enterprises', 'https://example.com/doc4.pdf', 'active', now()),
(gen_random_uuid(), (SELECT id FROM alumni_profiles WHERE name = 'Neha Bhatt'), (SELECT id FROM users WHERE email = 'neha.bhatt@alumni.sgsits.ac.in'), 'SteelTech Industries', 'https://steeltech.in', 'Manufacturing', '501-1000', 'Steel manufacturing and engineering solutions', 'https://example.com/doc5.pdf', 'active', now()),
(gen_random_uuid(), (SELECT id FROM alumni_profiles WHERE name = 'Pallavi Mehta'), (SELECT id FROM users WHERE email = 'pallavi.mehta@alumni.sgsits.ac.in'), 'MarketMasters India', 'https://marketmasters.in', 'Marketing', '11-50', 'Digital marketing agency for brands', 'https://example.com/doc6.pdf', 'active', now()),
(gen_random_uuid(), (SELECT id FROM alumni_profiles WHERE name = 'Sunita Agarwal'), (SELECT id FROM users WHERE email = 'sunita.agarwal@alumni.sgsits.ac.in'), 'HR Solutions Ltd', 'https://hrsolutions.in', 'Human Resources', '51-200', 'HR consulting and recruitment services', 'https://example.com/doc7.pdf', 'active', now()),
(gen_random_uuid(), (SELECT id FROM alumni_profiles WHERE name = 'Divya Shukla'), (SELECT id FROM users WHERE email = 'divya.shukla@alumni.sgsits.ac.in'), 'ResearchLabs India', 'https://researchlabs.in', 'Research', '11-50', 'Scientific research and development', 'https://example.com/doc8.pdf', 'active', now()),
(gen_random_uuid(), (SELECT id FROM alumni_profiles WHERE name = 'Ruchi Pandey'), (SELECT id FROM users WHERE email = 'ruchi.pandey@alumni.sgsits.ac.in'), 'EduTech Innovations', 'https://edutech.in', 'Education', '51-200', 'Educational technology solutions', 'https://example.com/doc9.pdf', 'active', now()),
(gen_random_uuid(), (SELECT id FROM alumni_profiles WHERE name = 'Alisha Khan'), (SELECT id FROM users WHERE email = 'alisha.khan@alumni.sgsits.ac.in'), 'StartupXYZ', 'https://startupxyz.in', 'Technology', '11-50', 'Innovative tech startup in Mumbai', 'https://example.com/doc10.pdf', 'active', now());

-- Jobs (linked to companies and alumni)
INSERT INTO jobs (id, company_id, posted_by_alumni_id, job_title, job_description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'TechNova Solutions'), (SELECT id FROM alumni_profiles WHERE name = 'Arjun Verma'), 'Software Engineer', 'Develop and maintain software applications using Java and Python. Work in a team of 10 in Delhi office.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'EcomHub India'), (SELECT id FROM alumni_profiles WHERE name = 'Kavita Singh'), 'Product Manager', 'Manage product lifecycle for e-commerce platform. Collaborate with engineering and design teams in Bangalore.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'DataInsights Pvt Ltd'), (SELECT id FROM alumni_profiles WHERE name = 'Ananya Rao'), 'Data Analyst', 'Analyze large datasets to provide business insights. Proficiency in SQL, Python, and Tableau required.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'ConsultPro Services'), (SELECT id FROM alumni_profiles WHERE name = 'Meera Joshi'), 'Business Consultant', 'Provide strategic consulting to clients in Mumbai. Experience in management consulting preferred.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'SteelTech Industries'), (SELECT id FROM alumni_profiles WHERE name = 'Neha Bhatt'), 'Mechanical Engineer', 'Design and test mechanical systems for steel manufacturing. Based in Jamshedpur.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'MarketMasters India'), (SELECT id FROM alumni_profiles WHERE name = 'Pallavi Mehta'), 'Digital Marketing Specialist', 'Create and execute digital marketing campaigns. Knowledge of SEO, SEM, and social media marketing.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'HR Solutions Ltd'), (SELECT id FROM alumni_profiles WHERE name = 'Sunita Agarwal'), 'HR Recruiter', 'Recruit talent for various roles. Experience in recruitment and HR processes in Pune.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'ResearchLabs India'), (SELECT id FROM alumni_profiles WHERE name = 'Divya Shukla'), 'Research Associate', 'Conduct research in biotechnology. PhD or Masters in relevant field required.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'EduTech Innovations'), (SELECT id FROM alumni_profiles WHERE name = 'Ruchi Pandey'), 'Content Developer', 'Develop educational content for online platforms. Teaching experience preferred.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'StartupXYZ'), (SELECT id FROM alumni_profiles WHERE name = 'Alisha Khan'), 'Full Stack Developer', 'Build web applications using MERN stack. Startup environment in Mumbai.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'TechNova Solutions'), (SELECT id FROM alumni_profiles WHERE name = 'Arjun Verma'), 'DevOps Engineer', 'Manage CI/CD pipelines and cloud infrastructure. AWS experience required.', now()),
(gen_random_uuid(), (SELECT id FROM companies WHERE name = 'EcomHub India'), (SELECT id FROM alumni_profiles WHERE name = 'Kavita Singh'), 'UI/UX Designer', 'Design user interfaces for mobile and web apps. Proficiency in Figma and Adobe XD.', now());

-- Job Applications (linked to jobs and users, with applicant_count updated)
INSERT INTO job_applications (job_id, user_id, resume_url, applied_at) VALUES
((SELECT id FROM jobs WHERE job_title = 'Software Engineer'), (SELECT id FROM users WHERE email = 'rahul.sharma@student.sgsits.ac.in'), 'https://example.com/resume1.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Software Engineer'), (SELECT id FROM users WHERE email = 'priya.patel@student.sgsits.ac.in'), 'https://example.com/resume2.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Product Manager'), (SELECT id FROM users WHERE email = 'vikas.gupta@student.sgsits.ac.in'), 'https://example.com/resume3.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Data Analyst'), (SELECT id FROM users WHERE email = 'rohit.kumar@student.sgsits.ac.in'), 'https://example.com/resume4.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Business Consultant'), (SELECT id FROM users WHERE email = 'sandeep.das@student.sgsits.ac.in'), 'https://example.com/resume5.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Mechanical Engineer'), (SELECT id FROM users WHERE email = 'amit.chopra@student.sgsits.ac.in'), 'https://example.com/resume6.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Digital Marketing Specialist'), (SELECT id FROM users WHERE email = 'rajesh.naidu@student.sgsits.ac.in'), 'https://example.com/resume7.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'HR Recruiter'), (SELECT id FROM users WHERE email = 'karan.thakur@student.sgsits.ac.in'), 'https://example.com/resume8.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Research Associate'), (SELECT id FROM users WHERE email = 'manish.yadav@student.sgsits.ac.in'), 'https://example.com/resume9.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Content Developer'), (SELECT id FROM users WHERE email = 'vikrant.singh@student.sgsits.ac.in'), 'https://example.com/resume10.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Full Stack Developer'), (SELECT id FROM users WHERE email = 'suresh.raina@student.sgsits.ac.in'), 'https://example.com/resume11.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'DevOps Engineer'), (SELECT id FROM users WHERE email = 'aditya.mishra@student.sgsits.ac.in'), 'https://example.com/resume12.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'UI/UX Designer'), (SELECT id FROM users WHERE email = 'ravi.shankar@student.sgsits.ac.in'), 'https://example.com/resume13.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Software Engineer'), (SELECT id FROM users WHERE email = 'tanvi.garg@student.sgsits.ac.in'), 'https://example.com/resume14.pdf', now()),
((SELECT id FROM jobs WHERE job_title = 'Product Manager'), (SELECT id FROM users WHERE email = 'isha.roy@student.sgsits.ac.in'), 'https://example.com/resume15.pdf', now());

-- Update applicant_count for jobs (simulate the controller logic)
UPDATE job_applications SET applicant_count = (
  SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = job_applications.job_id
) WHERE job_id IN (SELECT id FROM jobs);

-- OTP Verifications (sample)
INSERT INTO otp_verifications (id, email, otp, expires_at, is_used) VALUES
(gen_random_uuid(), 'rahul.sharma@student.sgsits.ac.in', '123456', now() + interval '10 minutes', false),
(gen_random_uuid(), 'priya.patel@student.sgsits.ac.in', '654321', now() + interval '10 minutes', false);

-- Password Reset Tokens (sample)
INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'arjun.verma@alumni.sgsits.ac.in'), 'hashed_token_1', now() + interval '1 hour', false, now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'kavita.singh@alumni.sgsits.ac.in'), 'hashed_token_2', now() + interval '1 hour', false, now());

-- Notifications (sample)
INSERT INTO notifications (id, user_id, title, message, is_read, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'rahul.sharma@student.sgsits.ac.in'), 'Application Submitted', 'Your application for Software Engineer at TechNova Solutions has been submitted.', false, now(), now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'priya.patel@student.sgsits.ac.in'), 'New Job Posted', 'A new job matching your skills has been posted.', false, now(), now()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'arjun.verma@alumni.sgsits.ac.in'), 'Company Profile Updated', 'Your company profile has been successfully updated.', true, now(), now());

-- End of test data inserts