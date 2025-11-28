// controllers/UtilityController.js
const db = require("../config/db");

const safePage = (value, def = 1) => Math.max(Number(value) || def, 1);
const safeLimit = (value, def = 20) => Math.min(Math.max(Number(value) || def, 1), 100);

// GET /search/students?name=&branch=&year=&page=&limit=
exports.searchStudents = async (req, res) => {
  try {
    const { name, branch, year, page = 1, limit = 20 } = req.query;

    const pageNum = safePage(page);
    const pageSize = safeLimit(limit);
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = db
      .from("profiles")
      .select(
        `*, student_details(*)`,
        { count: "exact" }
      )
      .eq('role', 'student')
      .order("created_at", { ascending: false });

    if (name) query = query.ilike("full_name", `%${name}%`);
    if (branch) query = query.ilike("student_details.university_branch", `%${branch}%`);
    if (year) query = query.eq("student_details.grad_year", Number(year));

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    res.json({
      success: true,
      page: pageNum,
      limit: pageSize,
      total: count ?? 0,
      data: data || [],
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

    const pageNum = safePage(page);
    const pageSize = safeLimit(limit);
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = db
      .from("profiles")
      .select(
        `*, alumni_details(*), companies(*)`,
        { count: "exact" }
      )
      .eq('role', 'alumni')
      .order("created_at", { ascending: false });

    if (name) query = query.ilike("full_name", `%${name}%`);
    if (company) query = query.ilike("companies.name", `%${company}%`);
    if (year) query = query.eq("alumni_details.grad_year", Number(year));

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    res.json({
      success: true,
      page: pageNum,
      limit: pageSize,
      total: count ?? 0,
      data: data || [],
    });
  } catch (error) {
    console.error("Error searching alumni:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reuse the `exports.*` assignments above for module exports.
module.exports = exports;
