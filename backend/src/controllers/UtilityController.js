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
      .from("student_profiles")
      .select(
        `id,name,student_id,branch,grad_year,skills,resume_url,created_at,users(email)`
      , { count: "exact" })
      .order("created_at", { ascending: false });

    if (name) query = query.ilike("name", `%${name}%`);
    if (branch) query = query.eq("branch", branch);
    if (year) query = query.eq("grad_year", Number(year));

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
      .from("alumni_profiles")
      .select(
        `id,name,grad_year,current_title,created_at,users(email),companies!left(name,industry,website)`
      , { count: "exact" })
      .order("created_at", { ascending: false });

    if (name) query = query.ilike("name", `%${name}%`);
    if (company) query = query.ilike("companies.name", `%${company}%`);
    if (year) query = query.eq("grad_year", Number(year));

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