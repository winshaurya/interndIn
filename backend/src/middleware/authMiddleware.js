// src/middleware/authMiddleware.js
const db = require("../config/db");
const { ensureAppUserRecord } = require("../services/userService");

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    const { data, error } = await db.supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid Supabase session" });
    }

    const appUser = await ensureAppUserRecord(data.user);
    req.user = {
      ...appUser,
      id: data.user.id,
      email: data.user.email,
      supabaseUser: data.user,
      accessToken: token,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
};

module.exports = { authenticate, isAdmin };
