const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require("./Routes/authRoutes");
const studentRoutes = require("./Routes/studentRoutes");
const alumniRoutes = require("./Routes/alumniRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const JobRoutes = require("./Routes/JobRoutes");
const utilityRoutes = require("./Routes/utilityRoutes");
const uploadRoutes = require("./Routes/uploadRoutes");
const profileRoutes = require("./Routes/profileRoutes");
const connectionRoutes = require("./Routes/connectionRoutes");
const messagingRoutes = require("./Routes/messagingRoutes");
const db = require("./config/db");
const { ensureBucketExists } = require("./services/storageService");

// const app = require("./app");

const PORT = process.env.PORT || 5004;

// Start server only when script is run directly (keeps module testable)
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Test Supabase connection after server starts
  setTimeout(async () => {
    try {
      console.log('🔍 Testing Supabase connection...');

      // Simple test - just try to get the client status
      const { data, error } = await db.from('users').select('count').limit(1).single();

      if (error) {
        console.log('❌ Supabase connection failed:', error.message);
        console.log('🔍 Error details:', error);
      } else {
        console.log('✅ Connected to Supabase successfully');
      }

      // Ensure storage bucket exists
      console.log('🔍 Checking Supabase Storage bucket...');
      const bucketReady = await ensureBucketExists('uploads');
      if (bucketReady) {
        console.log('✅ Supabase Storage bucket ready');
      } else {
        console.log('❌ Failed to setup Supabase Storage bucket');
      }
    } catch (err) {
      console.log('❌ Failed to connect to Supabase:', err.message);
      console.log('🔍 Error details:', err);
    }
  }, 1000);
}


// ==================== MIDDLEWARE ====================
// CORS configuration: read allowed origins from env var `CORS_ALLOWED_ORIGINS`
// Comma-separated list, e.g. "https://interndin.vercel.app,https://interndin-b.vercel.app,http://localhost:8080"
const rawOrigins = process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173,http://localhost:8080,http://localhost:8081,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:8080,http://127.0.0.1:8081,https://interndin.vercel.app,https://interndin-b.vercel.app';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Basic rate limiter for public endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});
app.use(limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/job", JobRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", utilityRoutes);
app.use("/api", connectionRoutes);
app.use("/api", messagingRoutes);

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
