// src/controllers/StudentController.js
const db = require("../config/db");

// helper: support both { userId } and { id } in JWT
const getUserIdFromReq = (req) => req?.user?.userId || req?.user?.id;

// normalize skills to text column (allow string or array)
const normalizeSkills = (skills) => {
  if (skills == null) return null;
  return Array.isArray(skills) ? skills.join(", ") : String(skills);
};

/**
 * GET /student/profile
 * Fetch the logged-in student's profile (if exists).
 * 200: { exists: boolean, profile: {...} | null }
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const profile = await db("student_profiles")
      .where({ user_id: userId })
      .first();

    return res.status(200).json({
      exists: !!profile,
      profile: profile || null,
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PUT /student/profile
 * Upsert behavior:
 *  - If profile exists => partial update allowed
 *  - If profile doesn't exist => requires minimal fields to create (name, studentId, branch, gradYear)
 *
 * Body fields (all optional for update):
 *  - name: string
 *  - studentId: string
 *  - branch: string
 *  - gradYear: number
 *  - skills: string | string[]   (stored as comma-separated text)
 *  - resumeUrl: string (URL)
 */
const upsertProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, studentId, branch, gradYear, skills, resumeUrl } =
      req.body || {};

    const existing = await db("student_profiles")
      .where({ user_id: userId })
      .first();

    // map camelCase -> snake_case
    const patch = {
      ...(name !== undefined && { name }),
      ...(studentId !== undefined && { student_id: studentId }),
      ...(branch !== undefined && { branch }),
      ...(gradYear !== undefined && { grad_year: Number(gradYear) }),
      ...(skills !== undefined && { skills: normalizeSkills(skills) }),
      ...(resumeUrl !== undefined && { resume_url: resumeUrl }),
    };

    if (existing) {
      // UPDATE (edit / completion continued)
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: "No fields provided to update" });
      }

      await db("student_profiles").where({ user_id: userId }).update(patch);
      const updated = await db("student_profiles")
        .where({ user_id: userId })
        .first();
      return res
        .status(200)
        .json({ message: "Profile updated successfully", profile: updated });
    }

    // CREATE (first-time completion) — enforce minimal required fields
    const missing = [];
    if (!name) missing.push("name");
    if (!studentId) missing.push("studentId");
    if (!branch) missing.push("branch");
    if (
      gradYear === undefined ||
      gradYear === null ||
      Number.isNaN(Number(gradYear))
    )
      missing.push("gradYear");

    if (missing.length) {
      return res.status(400).json({
        error: "Missing required fields for first-time profile creation",
        required: ["name", "studentId", "branch", "gradYear"],
        missing,
      });
    }

    const insertRow = {
      user_id: userId,
      name,
      student_id: studentId,
      branch,
      grad_year: Number(gradYear),
      skills: normalizeSkills(skills) || null,
      resume_url: resumeUrl || null,
    };

    await db("student_profiles").insert(insertRow);
    const created = await db("student_profiles")
      .where({ user_id: userId })
      .first();
    return res
      .status(201)
      .json({ message: "Profile created successfully", profile: created });
  } catch (error) {
    console.error("Upsert Student Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getMyProfile, upsertProfile };
