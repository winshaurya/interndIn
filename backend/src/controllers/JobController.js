// const asyncHandler = require("express-async-handler");
// const Job = require("../models/Job");
const knex = require("../config/db");
const db = require("../config/db");

//alumni jobs section
exports.postJob = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Unauthenticated user." });

    // 1) Alumni profile by user
    const profile = await db("alumni_profiles")
      .select("id", "grad_year", "current_title")
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res.status(400).json({
        error: "Alumni profile not found. Complete your profile first.",
      });
    }

    // 2) Company for that alumni (companies PK = alumni_id)
    const company = await db("companies")
      .select(
        "id",
        "alumni_id",
        "document_url",
        "about",
        "name",
        "website",
        "status"
      )
      .where({ alumni_id: profile.id })
      .first();

    if (!company) {
      return res.status(400).json({
        error: "Company info not found. Submit your company details first.",
      });
    }

    // 3) Completion score
    let completionPercent = 0;
    if (profile.grad_year) completionPercent += 25;
    if (profile.current_title) completionPercent += 25;
    if (company.document_url) completionPercent += 20;
    if (company.about && company.name && company.website)
      completionPercent += 30;

    if (completionPercent < 70) {
      return res.status(400).json({
        error: "Complete at least 70% of your profile before posting jobs.",
        completionPercent,
      });
    }

    // 4) Validate job input
    const { job_title, job_description } = req.body;
    if (!job_title || !job_description) {
      return res
        .status(400)
        .json({ error: "job_title and job_description are required." });
    }

    const role = req.user?.role || roleToAssign;
    console.log("USEr ROLE:", role);

    // 5) Insert job
    await db("jobs").insert({
      company_id: company.id, // ✅ references companies.alumni_id
      posted_by_alumni_id: profile.id, // ✅ references alumni_profiles.id
      job_title,
      job_description,
      created_at: db.fn.now(),
    });

    return res.json({ message: "Job posted successfully" });
  } catch (error) {
    console.error("Post Job Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Unauthenticated user." });

    // 1️⃣ Find the alumni profile linked to this user
    const profile = await db("alumni_profiles")
      .select("id")
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res
        .status(400)
        .json({ error: "Alumni profile not found for this user." });
    }

    // 2️⃣ Fetch jobs posted by this alumni
    const jobs = await db("jobs")
      .where({ posted_by_alumni_id: profile.id })
      .orderBy("created_at", "desc");

    // 3️⃣ Return jobs
    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error("getMyJobs error:", err);
    return res.status(500).json({ error: "Server error while fetching jobs" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1️⃣ Find the alumni profile for this user
    const profile = await db("alumni_profiles")
      .select("id")
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res
        .status(400)
        .json({ error: "Alumni profile not found for this user." });
    }

    // 2️⃣ Fetch the job only if it belongs to this alumni
    const job = await db("jobs")
      .where({
        id,
        posted_by_alumni_id: profile.id,
      })
      .first();

    if (!job) {
      return res.status(404).json({ error: "Job not found or unauthorized." });
    }

    // 3️⃣ Optionally, fetch related company info
    const company = await db("companies")
      .select("id", "name", "website", "about")
      .where({ id: job.company_id })
      .first();

    return res.status(200).json({
      success: true,
      job: {
        ...job,
        company,
      },
    });
  } catch (err) {
    console.error("getJobById error:", err);
    res.status(500).json({ error: "Server error while fetching job" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1️⃣ Find alumni profile for this user
    const profile = await db("alumni_profiles")
      .select("id")
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res
        .status(400)
        .json({ error: "Alumni profile not found for this user." });
    }

    // 2️⃣ Extract only allowed fields for update
    const { job_title, job_description } = req.body;
    const updateData = {};

    if (job_title) updateData.job_title = job_title;
    if (job_description) updateData.job_description = job_description;

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field (job_title/job_description) required to update." });
    }

    // 3️⃣ Ensure this job belongs to the logged-in alumni
    const job = await db("jobs")
      .where({ id, posted_by_alumni_id: profile.id })
      .first();

    if (!job) {
      return res
        .status(404)
        .json({ error: "Job not found or unauthorized to update." });
    }

    // 4️⃣ Update job record
    await db("jobs")
      .where({ id })
      .update(updateData);

    return res.status(200).json({ message: "Job updated successfully" });
  } catch (err) {
    console.error("Update Job Error:", err);
    return res.status(500).json({ error: "Internal server error while updating job." });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1) Get this user's alumni profile (jobs use alumni_profiles.id)
    const profile = await db("alumni_profiles")
      .select("id")
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res.status(400).json({ error: "Alumni profile not found for this user." });
    }

    // 2) Delete only if the job belongs to this alumni
    const deleted = await db("jobs")
      .where({ id, posted_by_alumni_id: profile.id })
      .del();

    if (!deleted) {
      return res.status(404).json({ error: "Job not found or unauthorized to delete." });
    }

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Delete Job Error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error while deleting job." });
  }
};

//student jobs section 

exports.getAllJobsStudent = async (req, res) => {
  try {
    // ✅ Fetch all jobs, joining with company & alumni info for context
    const jobs = await db("jobs as j")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .leftJoin("alumni_profiles as a", "j.posted_by_alumni_id", "a.id")
      .select(
        "j.id as job_id",
        "j.job_title",
        "j.job_description",
        "j.created_at",
        "c.name as company_name",
        "c.website as company_website",
        "c.about as company_about",
        "a.name as alumni_name",
        "a.current_title as alumni_designation",
        "a.grad_year as alumni_grad_year"
      )
      .orderBy("j.created_at", "desc");

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error("getAllJobsStudent error:", err);
    res.status(500).json({ error: "Server error while fetching all jobs" });
  }
};

exports.getJobByIdStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Fetch job + company + alumni details
    const job = await db("jobs as j")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .leftJoin("alumni_profiles as a", "j.posted_by_alumni_id", "a.id")
      .select(
        "j.id as job_id",
        "j.job_title",
        "j.job_description",
        "j.created_at",
        "c.id as company_id",
        "c.name as company_name",
        "c.website as company_website",
        "c.about as company_about",
        "a.id as alumni_profile_id",
        "a.name as alumni_name",
        "a.current_title as alumni_designation",
        "a.grad_year as alumni_grad_year"
      )
      .where("j.id", id)
      .first();

    // 2️⃣ Handle missing job
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // 3️⃣ Send result
    return res.status(200).json({
      success: true,
      job,
    });
  } catch (err) {
    console.error("getJobByIdStudent error:", err);
    return res.status(500).json({ error: "Server error while fetching job details" });
  }
};

exports.applyJob = async (req, res) => {
  const userId = req.user?.userId ?? req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthenticated user." });

  const job_id = req.body.job_id || req.body.jobId;
  const resume_url = req.body.resume_url || null;
  if (!job_id) return res.status(400).json({ error: "job_id is required" });

  try {
    await db.transaction(async (trx) => {
      // 1) Ensure the job exists
      const job = await trx("jobs").select("id").where({ id: job_id }).first();
      if (!job) throw { status: 404, message: "Job not found" };

      // 2) Capacity check based on current applications count
      const countRow = await trx("job_applications")
        .where({ job_id })
        .count("* as c")
        .first();
      const currentCount = Number(countRow?.c || 0);
      if (currentCount >= 50) {
        throw { status: 400, message: "Applications are closed for this job (capacity reached)." };
      }

      // 3) Prevent duplicate application by same user
      const already = await trx("job_applications")
        .where({ job_id, user_id: userId })
        .first();
      if (already) throw { status: 400, message: "Already applied for this job" };

      // 4) Insert the application
      await trx("job_applications").insert({
        job_id,
        user_id: userId,
        resume_url,
        applied_at: trx.fn.now(),
      });

      // 5) Recompute + write back the total into job_applications."No_of_applicants"
      const newCountRow = await trx("job_applications")
        .where({ job_id })
        .count("* as c")
        .first();
      const newCount = Number(newCountRow?.c || 0);

      // Use raw to be safe with the mixed-case column name
      await trx.raw(
        'UPDATE job_applications SET "No_of_applicants" = ? WHERE job_id = ?',
        [newCount, job_id]
      );
    });

    return res.status(201).json({ message: "Job application submitted" });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    if (err && err.code === "23505") {
      return res.status(409).json({ error: "Already applied for this job" });
    }
    console.error("applyJob error:", err);
    return res.status(500).json({ error: "Server error while applying to job" });
  }
};

exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    const rows = await db("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .select(
        "ja.job_id",
        "ja.user_id",
        "ja.resume_url",
        db.raw('"ja"."No_of_applicants" as no_of_applicants'),
        "ja.applied_at",
        "j.job_title",
        "j.job_description",
        "j.created_at as job_created_at",
        "c.name as company_name",
        "c.website as company_website"
      )
      .where("ja.user_id", userId)
      .orderBy("ja.applied_at", "desc");

    return res.status(200).json({
      success: true,
      count: rows.length,
      applications: rows,
    });
  } catch (err) {
    console.error("getAppliedJobs error:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching applied jobs" });
  }
};



//application 
exports.withdrawApplication = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    const { job_id } = req.params; // we'll withdraw by job_id instead of applicationId

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // 1️⃣ Find the application
    const application = await db("job_applications")
      .where({ job_id, user_id: userId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // 2️⃣ Start a transaction for consistency
    await db.transaction(async (trx) => {
      // Delete the application
      await trx("job_applications")
        .where({ job_id, user_id: userId })
        .del();

      // 3️⃣ Recount remaining applicants for that job
      const countRow = await trx("job_applications")
        .where({ job_id })
        .count("* as c")
        .first();
      const updatedCount = Number(countRow?.c || 0);

      // 4️⃣ Update the No_of_applicants column for all remaining rows of that job
      await trx.raw(
        'UPDATE job_applications SET "No_of_applicants" = ? WHERE job_id = ?',
        [updatedCount, job_id]
      );
    });

    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.error("Withdraw application error:", err);
    res.status(500).json({ error: "Server error while withdrawing application" });
  }
};

exports.viewApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user?.userId ?? req.user?.id;
    const role = (req.user?.role || "").toLowerCase();

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    // ---------------------------
    // Authorization (admin bypass)
    // ---------------------------
    if (role === "alumni") {
      // get this user's alumni_profile id
      const profile = await db("alumni_profiles")
        .select("id")
        .where({ user_id: userId })
        .first();

      if (!profile) {
        return res.status(400).json({ error: "Alumni profile not found for this user." });
      }

      // verify the job is posted by this alumni
      const ownsJob = await db("jobs")
        .where({ id: jobId, posted_by_alumni_id: profile.id })
        .first();

      if (!ownsJob) {
        return res
          .status(403)
          .json({ error: "Not authorized to view applicants of this job" });
      }
    }
    // role === 'admin' → allowed. For other roles, forbid:
    else if (role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    // ---------------------------
    // Fetch applicants
    // ---------------------------
    const applicants = await db("job_applications as ja")
      .join("users as u", "ja.user_id", "u.id")
      .leftJoin("student_profiles as sp", "sp.user_id", "u.id")
      .select(
        "ja.job_id",
        "ja.user_id as student_user_id",
        "ja.resume_url",
        db.raw('"ja"."No_of_applicants" as no_of_applicants'), // mixed-case column
        "ja.applied_at",
        "u.email as student_email",
        "sp.name as student_name",
        "sp.branch as student_branch",
        "sp.grad_year as student_grad_year"
      )
      .where("ja.job_id", jobId)
      .orderBy("ja.applied_at", "desc");

    return res.status(200).json({
      success: true,
      count: applicants.length,
      applicants,
    });
  } catch (err) {
    console.error("View applicants error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


