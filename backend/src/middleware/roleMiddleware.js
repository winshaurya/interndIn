// src/middleware/roleMiddleware.js

// roleMiddleware takes allowed roles and ensures the logged-in user has one of them
module.exports = function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    try {
      const user = req.user; // comes from authMiddleware after JWT verification

      if (!user || !user.role) {
        return res.status(403).json({
          success: false,
          message: "Access denied. No role assigned.",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Requires one of roles: ${allowedRoles.join(
            ", "
          )}`,
        });
      }

      next(); // role matches → continue
    } catch (error) {
      console.error("Role middleware error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
};
