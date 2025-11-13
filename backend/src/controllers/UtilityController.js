// controllers/UtilityController.js
const db = require("../config/db");

// GET /search/students?name=&branch=&year=&page=&limit=
exports.searchStudents = async (req, res) => {
  try {
    const { name, branch, year, page = 1, limit = 20 } = req.query;

    const q = db("student_profiles as sp")
      .join("users as u", "sp.user_id", "u.id")
      .select(
        "sp.id",
        "sp.name",
        "u.email",
        "sp.student_id",
        "sp.branch",
        "sp.grad_year",
        "sp.skills",
        "sp.resume_url",
        "sp.created_at"
      );

    if (name) q.whereILike("sp.name", `%${name}%`);
    if (branch) q.where("sp.branch", branch);
    if (year) q.where("sp.grad_year", Number(year));

    // pagination + sorting (newest first)
    const pageNum = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const [data, [{ count }]] = await Promise.all([
      q.clone().orderBy("sp.created_at", "desc").limit(pageSize).offset(offset),
      q.clone().clearSelect().count({ count: "*" })
    ]);

    res.json({
      success: true,
      page: pageNum,
      limit: pageSize,
      total: Number(count),
      data
    });
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /search/alumni?name=&company=&year=&page=&limit=
exports.searchAlumni = async (req, res) => {
  try {
    const { name, company, year, page = 1, limit = 20 } = req.query;

    const q = db("alumni_profiles as ap")
      .join("users as u", "ap.user_id", "u.id")
      .leftJoin("companies as c", "ap.id", "c.alumni_id")
      .select(
        "ap.id",
        "ap.name",
        "u.email",
        "ap.grad_year",
        "ap.current_title",
        "ap.created_at",
        db.raw("c.name as company"),
        "c.industry",
        "c.website"
      );

    if (name) q.whereILike("ap.name", `%${name}%`);
    if (company) q.whereILike("c.name", `%${company}%`);
    if (year) q.where("ap.grad_year", Number(year));

    const pageNum = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const [data, [{ count }]] = await Promise.all([
      q.clone().orderBy("ap.created_at", "desc").limit(pageSize).offset(offset),
      q.clone().clearSelect().count({ count: "*" })
    ]);

    res.json({
      success: true,
      page: pageNum,
      limit: pageSize,
      total: Number(count),
      data
    });
  } catch (error) {
    console.error("Error searching alumni:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};