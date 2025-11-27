// backend/src/services/dashboardService.js
// Centralized dashboard statistics service

const db = require("../config/db");

/**
 * Get dashboard statistics for admin
 * @returns {Object} Dashboard stats
 */
const getAdminDashboardStats = async () => {
  const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: newUsers }, { count: activeCompanies }, { count: livePostings }, { count: applicationsToday }] =
    await Promise.all([
      db.from('profiles').select('id', { count: 'exact', head: true }).gt('created_at', thirtyDaysAgo()),
      db.from('companies').select('id', { count: 'exact', head: true }).eq('is_active', true),
      db.from('jobs').select('id', { count: 'exact', head: true }),
      db.from('job_applications').select('id', { count: 'exact', head: true }).gt('applied_at', new Date().toISOString().slice(0, 10)),
    ]);

  return {
    newUsers: newUsers ?? 0,
    activeCompanies: activeCompanies ?? 0,
    livePostings: livePostings ?? 0,
    applicationsToday: applicationsToday ?? 0,
  };
};

/**
 * Get dashboard statistics for alumni
 * @param {string} alumniId - Alumni user ID
 * @returns {Object} Alumni dashboard stats
 */
const getAlumniDashboardStats = async (alumniId) => {
  // Get jobs posted by this alumni
  const { count: totalJobs, error: jobsError } = await db
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('posted_by', alumniId);

  if (jobsError) throw jobsError;

  // Get applications received for alumni's jobs
  const { count: totalApplications, error: appsError } = await db
    .from('job_applications')
    .select('id', { count: 'exact', head: true })
    .in('job_id',
      db.from('jobs').select('id').eq('posted_by', alumniId)
    );

  if (appsError) throw appsError;

  // Get active jobs
  const { count: activeJobs, error: activeError } = await db
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('posted_by', alumniId)
    .eq('is_active', true);

  if (activeError) throw activeError;

  // Get recent applications (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: recentApplications, error: recentError } = await db
    .from('job_applications')
    .select('id', { count: 'exact', head: true })
    .in('job_id',
      db.from('jobs').select('id').eq('posted_by', alumniId)
    )
    .gt('applied_at', sevenDaysAgo);

  if (recentError) throw recentError;

  return {
    totalJobs: totalJobs ?? 0,
    totalApplications: totalApplications ?? 0,
    activeJobs: activeJobs ?? 0,
    recentApplications: recentApplications ?? 0,
  };
};

/**
 * Get dashboard statistics for students
 * @param {string} studentId - Student user ID
 * @returns {Object} Student dashboard stats
 */
const getStudentDashboardStats = async (studentId) => {
  // Get applications count
  const { count: applicationsCount, error: applicationsError } = await db
    .from('job_applications')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId);

  if (applicationsError) throw applicationsError;

  // Get interviews count
  const { count: interviewsCount, error: interviewsError } = await db
    .from('job_applications')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('status', 'interviewing');

  // Get offers count
  const { count: offersCount, error: offersError } = await db
    .from('job_applications')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('status', 'offer');

  if (interviewsError) throw interviewsError;
  if (offersError) throw offersError;

  return {
    applicationsCount: applicationsCount ?? 0,
    interviewsCount: interviewsCount ?? 0,
    offersCount: offersCount ?? 0,
  };
};

module.exports = {
  getAdminDashboardStats,
  getAlumniDashboardStats,
  getStudentDashboardStats,
};
