// seed.js - Complete Supabase Database Seeder for interndIn
// Generates realistic, interconnected seed data.
// Usage:
// 1) Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env
// 2) node seed.js

const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

// Safety: refuse to run this seeder in PRODUCTION unless explicitly allowed
const isProduction = process.env.NODE_ENV === 'production' || process.env.SUPABASE_ENV === 'production';
if (isProduction && process.env.ALLOW_SEED_IN_PRODUCTION !== 'true') {
  console.error('⚠️  Aborting: seeder refuses to run in production. Set ALLOW_SEED_IN_PRODUCTION=true to proceed.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration - Adjust for desired scale
const CONFIG = {
  NUM_USERS: parseInt(process.env.SEED_NUM_USERS || '400', 10), // Total users (students + alumni + admins)
  NUM_COMPANIES: parseInt(process.env.SEED_NUM_COMPANIES || '50', 10),
  NUM_JOBS: parseInt(process.env.SEED_NUM_JOBS || '100', 10),
  AVG_APPLICATIONS_PER_JOB: parseInt(process.env.SEED_APPS_PER_JOB || '5', 10),
  MAX_CONVERSATIONS_PER_USER: parseInt(process.env.SEED_MAX_CONVERSATIONS || '10', 10),
  MAX_MESSAGES_PER_CONVERSATION: parseInt(process.env.SEED_MAX_MESSAGES || '15', 10),
  NUM_NOTIFICATIONS: parseInt(process.env.SEED_NUM_NOTIFICATIONS || '200', 10),
};

// Helper functions
function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Small helpers used by many seeding functions
function chunk(array, size) {
  if (!Array.isArray(array) || size <= 0) return [];
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

// Role distribution mimicking real platform
function pickRole() {
  const r = Math.random();
  if (r < 0.5) return 'student'; // 50% students
  if (r < 1.0) return 'alumni'; // 50% alumni
  return 'admin'; // 0% admins
}

// Realistic data pools
const SKILLS_POOL = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Django', 'SQL', 'PostgreSQL',
  'Java', 'Spring Boot', 'C#', '.NET', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Mobile Development', 'DevOps'
];

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract'];
const WORK_MODES = ['remote', 'on-site', 'hybrid'];
const APPLICATION_STATUSES = ['submitted', 'viewed', 'interviewing', 'offer', 'rejected'];

async function createAuthUsers(count) {
  console.log(`🚀 Creating ${count} auth users with realistic profiles...`);
  const users = [];
  let created = 0;

  for (let i = 0; i < count; i++) {
    const fullName = faker.person.fullName();
    const role = pickRole();
    const email = faker.internet.email({ firstName: fullName.split(' ')[0], lastName: fullName.split(' ')[1] });

    try {
      // Use Supabase auth admin API to create user
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: 'password123', // Temporary password
        user_metadata: {
          role: role,
          full_name: fullName,
          avatar_url: faker.image.avatar()
        },
        email_confirm: true // Auto-confirm email
      });

      if (error) {
        console.error(`❌ Error creating user ${i + 1}:`, error.message);
        console.error('Full error object:', error);
        continue;
      }

      users.push({ id: data.user.id, email, role, fullName });
      if (created % 1 === 0) {
        // log the returned data when successful to aid debugging
        console.log('Created user result snippet:', { id: data.user?.id, email: data.user?.email });
      }
      created++;

      if (created % 10 === 0) {
        console.log(`✅ Created ${created}/${count} users`);
      }

      // Rate limiting
      if (created % 20 === 0) await sleep(500);

    } catch (err) {
      console.error(`❌ Exception creating user ${i + 1}:`, err.message);
    }
  }

  console.log(`✅ Successfully created ${users.length} auth users`);
  return users;
}

async function waitForProfiles(userIds, timeoutMs = 30000) {
  console.log('⏳ Waiting for database triggers to create profiles...');
  if (!userIds || userIds.length === 0) {
    console.log('ℹ️ No user IDs to wait for. Skipping profile wait.');
    return;
  }
  const start = Date.now();
  let remaining = new Set(userIds);

  while (remaining.size > 0 && Date.now() - start < timeoutMs) {
    const ids = Array.from(remaining);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .in('id', ids)
      .limit(1000);

    if (!error && data) {
      data.forEach(profile => remaining.delete(profile.id));
    }

    if (remaining.size === 0) break;
    await sleep(1000);
  }

  if (remaining.size > 0) {
    console.warn(`⚠️  Warning: ${remaining.size} profiles not created within timeout`);
  } else {
    console.log('✅ All profiles created successfully');
  }
}

async function seedStudentDetails(students) {
  console.log('📚 Seeding student details with skills and resumes...');
  const details = students.map(student => ({
    id: student.id,
    university_branch: `${faker.company.name()} University - ${pick(['Computer Science', 'Engineering', 'Business', 'Arts', 'Science'])}`,
    grad_year: rand(2024, 2028),
    cgpa: parseFloat((rand(65, 95) / 10).toFixed(1)), // 6.5 to 9.5
    resume_url: `https://uploads.supabase.co/storage/v1/object/public/uploads/${student.id}/resume.pdf`,
    skills: faker.helpers.arrayElements(SKILLS_POOL, rand(3, 8))
  }));

  const batches = chunk(details, 50);
  let inserted = 0;

  for (const batch of batches) {
    const { data, error } = await supabase
      .from('student_details')
      .insert(batch)
      .select();

    if (error) {
      console.error('❌ Error inserting student details:', error.message);
    } else {
      inserted += data.length;
      console.log(`✅ Inserted ${inserted}/${details.length} student details`);
    }

    await sleep(200);
  }

  console.log('✅ Student details seeding complete');
  return details;
}

async function seedAlumniDetails(alumni) {
  console.log('🏢 Seeding alumni details with professional info...');
  const details = alumni.map(alum => ({
    id: alum.id,
    linkedin_url: `https://linkedin.com/in/${alum.fullName.toLowerCase().replace(/\s+/g, '')}`,
    current_position: faker.person.jobTitle(),
    experience_years: rand(1, 25)
  }));

  const batches = chunk(details, 50);
  let inserted = 0;

  for (const batch of batches) {
    const { data, error } = await supabase
      .from('alumni_details')
      .insert(batch)
      .select();

    if (error) {
      console.error('❌ Error inserting alumni details:', error.message);
    } else {
      inserted += data.length;
      console.log(`✅ Inserted ${inserted}/${details.length} alumni details`);
    }

    await sleep(200);
  }

  console.log('✅ Alumni details seeding complete');
  return details;
}

async function seedCompanies(alumni) {
  console.log('🏭 Seeding companies owned by alumni...');
  const companies = [];

  // Distribute companies among alumni
  const alumniWithCompanies = faker.helpers.arrayElements(alumni, Math.min(CONFIG.NUM_COMPANIES, alumni.length));

  alumniWithCompanies.forEach(alum => {
    const numCompanies = rand(1, Math.min(3, CONFIG.NUM_COMPANIES - companies.length));
    for (let i = 0; i < numCompanies && companies.length < CONFIG.NUM_COMPANIES; i++) {
      companies.push({
        owner_id: alum.id,
        name: faker.company.name(),
        website: faker.internet.url(),
        logo_url: faker.image.url({ width: 200, height: 200 }),
        description: faker.company.catchPhrase(),
        location: `${faker.location.city()}, ${faker.location.countryCode()}`,
        is_active: Math.random() > 0.1 // 90% active
      });
    }
  });

  const batches = chunk(companies, 25);
  let inserted = 0;

  for (const batch of batches) {
    const { data, error } = await supabase
      .from('companies')
      .insert(batch)
      .select();

    if (error) {
      console.error('❌ Error inserting companies:', error.message);
    } else {
      inserted += data.length;
      console.log(`✅ Inserted ${inserted}/${companies.length} companies`);
    }

    await sleep(300);
  }

  console.log('✅ Companies seeding complete');
  return companies;
}

async function seedJobs(companies) {
  console.log('💼 Seeding jobs for companies...');
  const jobs = [];

  companies.forEach(company => {
    const numJobs = rand(1, Math.min(5, CONFIG.NUM_JOBS - jobs.length));
    for (let i = 0; i < numJobs && jobs.length < CONFIG.NUM_JOBS; i++) {
      jobs.push({
        company_id: company.id,
        posted_by: company.owner_id,
        title: faker.person.jobTitle(),
        description: faker.lorem.paragraphs({ min: 2, max: 4 }),
        type: pick(JOB_TYPES),
        mode: pick(WORK_MODES),
        location: company.location,
        salary_range: `${rand(30000, 80000)} - ${rand(80001, 150000)}`,
        is_active: Math.random() > 0.2 // 80% active
      });
    }
  });

  const batches = chunk(jobs, 25);
  let inserted = 0;

  for (const batch of batches) {
    const { data, error } = await supabase
      .from('jobs')
      .insert(batch)
      .select();

    if (error) {
      console.error('❌ Error inserting jobs:', error.message);
    } else {
      inserted += data.length;
      console.log(`✅ Inserted ${inserted}/${jobs.length} jobs`);
    }

    await sleep(300);
  }

  console.log('✅ Jobs seeding complete');
  return jobs;
}

async function seedJobApplications(jobs, students) {
  console.log('📝 Seeding job applications from students...');
  const applications = [];

  jobs.forEach(job => {
    const numApps = rand(0, CONFIG.AVG_APPLICATIONS_PER_JOB * 2);
    const applicants = faker.helpers.arrayElements(students, Math.min(numApps, students.length));

    applicants.forEach(student => {
      applications.push({
        job_id: job.id,
        student_id: student.id,
        resume_url: `https://uploads.supabase.co/storage/v1/object/public/uploads/${student.id}/resume.pdf`,
        cover_letter: faker.lorem.paragraphs({ min: 1, max: 2 }),
        status: pick(APPLICATION_STATUSES)
      });
    });
  });

  const batches = chunk(applications, 50);
  let inserted = 0;

  for (const batch of batches) {
    const { data, error } = await supabase
      .from('job_applications')
      .insert(batch)
      .select();

    if (error) {
      console.error('❌ Error inserting applications:', error.message);
    } else {
      inserted += data.length;
      console.log(`✅ Inserted ${inserted}/${applications.length} applications`);
    }

    await sleep(300);
  }

  console.log('✅ Job applications seeding complete');
  return applications;
}

async function seedConversationsAndMessages(profiles, jobs) {
  console.log('💬 Seeding conversations and messages between students and alumni...');
  const conversations = [];
  const messages = [];

  // Create conversations between students and alumni, sometimes linked to jobs
  const students = profiles.filter(p => p.role === 'student');
  const alumni = profiles.filter(p => p.role === 'alumni');

  students.forEach(student => {
    const numConversations = rand(0, CONFIG.MAX_CONVERSATIONS_PER_USER);
    const conversationPartners = faker.helpers.arrayElements(alumni, Math.min(numConversations, alumni.length));

    conversationPartners.forEach(alum => {
      const jobId = Math.random() > 0.5 ? pick(jobs).id : null; // 50% linked to jobs
      conversations.push({
        student_id: student.id,
        alumni_id: alum.id,
        job_id: jobId
      });
    });
  });

  // Insert conversations
  const convBatches = chunk(conversations, 25);
  let convInserted = 0;
  const insertedConversations = [];

  for (const batch of convBatches) {
    const { data, error } = await supabase
      .from('conversations')
      .insert(batch)
      .select();

    if (error) {
      console.error('❌ Error inserting conversations:', error.message);
    } else {
      insertedConversations.push(...data);
      convInserted += data.length;
      console.log(`✅ Inserted ${convInserted}/${conversations.length} conversations`);
    }

    await sleep(300);
  }

  // Create messages for each conversation
  insertedConversations.forEach(conv => {
    const numMessages = rand(1, CONFIG.MAX_MESSAGES_PER_CONVERSATION);
    for (let i = 0; i < numMessages; i++) {
      messages.push({
        conversation_id: conv.id,
        sender_id: Math.random() > 0.5 ? conv.student_id : conv.alumni_id,
        content: faker.lorem.sentences({ min: 1, max: 3 }),
        is_read: Math.random() > 0.3 // 70% read
      });
    }
  });

  // Insert messages
  const msgBatches = chunk(messages, 50);
  let msgInserted = 0;

  for (const batch of msgBatches) {
    const { error } = await supabase
      .from('messages')
      .insert(batch);

    if (error) {
      console.error('❌ Error inserting messages:', error.message);
    } else {
      msgInserted += batch.length;
      console.log(`✅ Inserted ${msgInserted}/${messages.length} messages`);
    }

    await sleep(200);
  }

  console.log('✅ Conversations and messages seeding complete');
  return { conversations: insertedConversations, messages };
}

async function seedNotifications(profiles) {
  console.log('🔔 Seeding notifications for users...');
  const notifications = [];
  const types = ['application_update', 'new_message', 'system'];

  for (let i = 0; i < CONFIG.NUM_NOTIFICATIONS; i++) {
    const user = pick(profiles);
    notifications.push({
      user_id: user.id,
      title: faker.lorem.words({ min: 2, max: 5 }),
      message: faker.lorem.sentences({ min: 1, max: 2 }),
      type: pick(types),
      is_read: Math.random() > 0.5 // 50% read
    });
  }

  const batches = chunk(notifications, 50);
  let inserted = 0;

  for (const batch of batches) {
    const { error } = await supabase
      .from('notifications')
      .insert(batch);

    if (error) {
      console.error('❌ Error inserting notifications:', error.message);
    } else {
      inserted += batch.length;
      console.log(`✅ Inserted ${inserted}/${notifications.length} notifications`);
    }

    await sleep(200);
  }

  console.log('✅ Notifications seeding complete');
}

async function runSeeder() {
  try {
    console.log('🌱 Starting interndIn database seeding...');
    console.log('Configuration:', CONFIG);

    // 1. Create auth users
    const authUsers = await createAuthUsers(CONFIG.NUM_USERS);
    if (!authUsers || authUsers.length === 0) {
      console.error('❌ No auth users were created. Aborting further seeding to avoid inconsistent state.');
      process.exit(1);
    }
    const userIds = authUsers.map(u => u.id);

    // 2. Wait for profiles to be created by trigger
    await waitForProfiles(userIds);

    // 3. Get created profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .in('id', userIds);

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    console.log(`📊 Profiles created: ${profiles.length}`);
    const students = profiles.filter(p => p.role === 'student');
    const alumni = profiles.filter(p => p.role === 'alumni');
    console.log(`👨‍🎓 Students: ${students.length}, 🏢 Alumni: ${alumni.length}, 👑 Admins: ${profiles.length - students.length - alumni.length}`);

    // 4. Seed student and alumni details
    await seedStudentDetails(students);
    await seedAlumniDetails(alumni);

    // 5. Seed companies
    const companies = await seedCompanies(alumni);

    // 6. Seed jobs
    const jobs = await seedJobs(companies);

    // 7. Seed job applications
    await seedJobApplications(jobs, students);

    // 8. Seed conversations and messages
    await seedConversationsAndMessages(profiles, jobs);

    // 9. Seed notifications
    await seedNotifications(profiles);

    console.log('🎉 Database seeding completed successfully!');
    console.log('Summary:');
    console.log(`  - Users: ${authUsers.length}`);
    console.log(`  - Companies: ${companies.length}`);
    console.log(`  - Jobs: ${jobs.length}`);
    console.log(`  - Students: ${students.length}`);
    console.log(`  - Alumni: ${alumni.length}`);

  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the seeder
runSeeder();