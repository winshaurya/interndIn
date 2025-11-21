// src/middleware/authMiddleware.js
const db = require("../config/db");
const { ensureAppUserRecord } = require("../services/userService");

const authenticate = async (req, res, next) => {
  // Try Authorization header first, then fallback to cookie named accessToken
  let token = req.headers.authorization?.split(" ")[1];
  if (!token && req.headers.cookie) {
    // naive cookie parse to avoid adding cookie-parser dependency
    const match = req.headers.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('accessToken='));
    if (match) token = decodeURIComponent(match.split('=')[1]);
  }
  if (!token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    // Create a session-scoped Supabase client using the provided access token
    const sessionClient = db.getSessionClient(token);
    if (!sessionClient) {
      return res.status(401).json({ error: "Invalid Supabase session" });
    }

    const { data, error } = await sessionClient.auth.getUser();
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid Supabase session" });
    }

    const supabaseUser = data.user;
    const appUser = await ensureAppUserRecord(supabaseUser);

    req.user = {
      ...appUser,
      id: supabaseUser.id,
      userId: supabaseUser.id,
      email: supabaseUser.email,
      supabaseUser,
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
