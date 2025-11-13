// // src/controllers/JobApplicationController.js
// const knex = require('../config/db');

// // DELETE /jobs/apply/:applicationId
// exports.withdrawApplication = async (req, res) => {
//   try {
//     const userId = req.user?.userId ?? req.user?.id;
//     const { job_id } = req.params; // we'll withdraw by job_id instead of applicationId

//     if (!userId) {
//       return res.status(401).json({ error: "Unauthenticated user." });
//     }

//     // 1️⃣ Find the application
//     const application = await db("job_applications")
//       .where({ job_id, user_id: userId })
//       .first();

//     if (!application) {
//       return res.status(404).json({ error: "Application not found" });
//     }

//     // 2️⃣ Start a transaction for consistency
//     await db.transaction(async (trx) => {
//       // Delete the application
//       await trx("job_applications")
//         .where({ job_id, user_id: userId })
//         .del();

//       // 3️⃣ Recount remaining applicants for that job
//       const countRow = await trx("job_applications")
//         .where({ job_id })
//         .count("* as c")
//         .first();
//       const updatedCount = Number(countRow?.c || 0);

//       // 4️⃣ Update the No_of_applicants column for all remaining rows of that job
//       await trx.raw(
//         'UPDATE job_applications SET "No_of_applicants" = ? WHERE job_id = ?',
//         [updatedCount, job_id]
//       );
//     });

//     res.status(200).json({ message: "Application withdrawn successfully" });
//   } catch (err) {
//     console.error("Withdraw application error:", err);
//     res.status(500).json({ error: "Server error while withdrawing application" });
//   }
// };

// // GET /jobs/:jobId/applicants
// exports.viewApplicants = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const user = req.user;

//     // Check if alumni owns the job (unless admin)
//     if (user.role === 'alumni') {
//       const job = await knex('jobs').where({ id: jobId, alumni_id: user.id }).first();
//       if (!job) {
//         return res.status(403).json({ error: 'Not authorized to view applicants of this job' });
//       }
//     }

//     const applicants = await knex('job_applications as ja')
//       .join('students as s', 'ja.student_id', 's.id')
//       .select('ja.id as applicationId', 's.id as studentId', 's.name', 's.email', 'ja.status', 'ja.created_at')
//       .where('ja.job_id', jobId);

//     res.json({ applicants });
//   } catch (err) {
//     console.error('View applicants error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // view application ststus, no of applicants reached 

