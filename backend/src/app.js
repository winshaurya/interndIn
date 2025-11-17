const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./Routes/authRoutes");
const studentRoutes = require("./Routes/studentRoutes");
const alumniRoutes = require("./Routes/alumniRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const authUtilityRoutes = require("./Routes/authUtilityRoutes");
const JobRoutes = require("./Routes/JobRoutes");
const utilityRoutes = require("./Routes/utilityRoutes");

// const app = require("./app");

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// ==================== MIDDLEWARE ====================
// CORS configuration: read allowed origins from env var `CORS_ALLOWED_ORIGINS`
// Comma-separated list, e.g. "https://interndin.vercel.app,https://interndin-b.vercel.app,http://localhost:8080"
const rawOrigins = process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:8080,http://127.0.0.1:8080,https://interndin.vercel.app,https://interndin-b.vercel.app';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/authUtil", authUtilityRoutes);
app.use("/api/job", JobRoutes);
app.use("/api", utilityRoutes);

// ==================== HEALTH CHECK ====================
app.get("/", (req, res) => {
  res.send("✅ SGSITS Alumni Job Portal Backend is running...");
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ error: "Internal server error" });


});

module.exports = app;
