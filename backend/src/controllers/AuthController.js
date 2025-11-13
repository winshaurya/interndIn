const db = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

// ==================== REGISTER STUDENT ====================
const registerStudent = async (req, res) => {
  try {
    const { name, role, email, password_hash, branch, gradYear, student_id } =
      req.body;

    if (
      !name ||
      !email ||
      !password_hash ||
      !branch ||
      !gradYear ||
      !student_id
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (email.split("@")[1] !== "sgsits.ac.in") {
      return res.status(400).json({ error: "Email is not authorised" });
    }

    const validBranches = [
      "computer science",
      "information technology",
      "electronics and telecommunication",
      "electronics and instrumentation",
      "electrical",
      "mechanical",
      "civil",
      "industrial production",
    ];

    function isValidBranch(branch) {
      return validBranches.includes(branch.toLowerCase().trim());
    }

    if (!isValidBranch(branch)) {
      return res.status(400).json({ error: "Branch is incorrect" });
    }

    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10);

    // ✅ Use transaction to ensure atomicity
    await db.transaction(async (trx) => {
      // Insert user and return its generated id (UUID)
      const [newUser] = await trx("users").insert(
        {
          email,
          password_hash: hashedPassword,
          role,
        },
        ["id"] // important: this returns the id (Postgres syntax)
      );

      // Insert into student_profiles with the fetched user_id
      await trx("student_profiles").insert({
        name,
        user_id: newUser.id, // fetched from the previous insert
        student_id,
        branch,
        grad_year: gradYear,
      });
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Student Registration Error:", error);
    res.status(500).json({ error: "An error occurred during registration." });
  }
};

// // ==================== LOGIN ====================
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await db("users").where({ email }).first();
  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: "Invalid password" });

  const roleToAssign = user.role.toLowerCase();

  const token = jwt.sign(
    { id: user.id, email: user.email, role: roleToAssign },
    SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  // Remove password from user object
  const { password_hash, ...userWithoutPassword } = user;

  res.json({
    token,
    user: {
      ...userWithoutPassword,
      role: roleToAssign
    }
  });
};

// ==================== REGISTER ALUMNI ====================
const registerAlumni = async (req, res) => {
  const { name, role, grad_year, email, password_hash, current_title } =
    req.body;

  if (
    !name ||
    !role ||
    !email ||
    !password_hash ||
    !current_title ||
    !grad_year
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // ✅ Enforce business/company email
  const corporateDomains = [
    // "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "sgsits.ac.in",
    "mailnator.com",
    "tempmail.com",
    "10minutemail.com",
  ];

  function isBusinessEmail(email) {
    const domain = email.split("@")[1].toLowerCase();
    return !corporateDomains.includes(domain);
  }

  if (!isBusinessEmail(email)) {
    return res
      .status(400)
      .json({ error: "Please use a valid business/company email ID" });
  }

  try {
    const existingAlumni = await db("users").where({ email }).first();
    if (existingAlumni) {
      return res.status(409).json({
        error:
          "An account with this email already exists or is pending verification.",
      });
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10);
    await db.transaction(async (trx) => {
      const [newUser] = await trx("users").insert(
        {
          email,
          password_hash: hashedPassword,
          role,
        },
        ["id"] // important: this returns the id (Postgres syntax)
      );

      const [newAlumni] = await trx("alumni_profiles").insert(
        {
          name,
          user_id: newUser.id,
          grad_year,
          current_title,
          // status: "pending", // will update after admin approval
        },
        ["id"]
      );

      await trx("companies").insert({
        alumni_id: newAlumni.id,
        user_id: newUser.id,
      });
    });

    res.status(201).json({
      message:
        "Registration submitted successfully. You will receive an email once your account has been verified by an administrator.",
    });
  } catch (error) {
    console.error("Alumni Registration Error:", error);
    res.status(500).json({
      error: "An error occurred during registration. Please try again.",
    });
  }
};

// ==================== OTP GENERATION ====================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // always 6 digits
};

// ==================== EMAIL SENDER ====================
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

// ==================== FORGOT PASSWORD: GENERATE OTP ====================
const forgotPasswordGenerateOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await db("users").where({ email }).first();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP(); // a 6-digit string
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(otp + "????????LLLLL");

    await db("otp_verifications").where({ email: user.email }).del();

    //Insert OTP record
    await db("otp_verifications").insert({
      email: user.email,
      otp,
      expires_at: expiryTime,
    });
    console.log(user.email + "????????LLLLL");

    try {
      await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);
    } catch (err) {
      console.error("Email send error:", {
        code: err.code,
        command: err.command,
        response: err.response,
      });
      return res.status(502).json({ error: "Failed to send email" });
    }

    return res.status(200).json({
      message: "OTP sent successfully to registered email",
      expiry: expiryTime,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// // ==================== RESET PASSWORD WITH OTP ====================
const resetPasswordWithOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ error: "Email, OTP, and new password are required" });
  }

  try {
    const otpEntry = await db("otp_verifications")
      .where({ email, otp })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!otpEntry)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db("users")
      .where({ email })
      .update({ password_hash: hashedPassword });

    await db("otp_verifications").where({ email, otp }).del();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password Reset Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== EMAIL VERIFICATION OTP =================
const generateEmailVerificationOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log(otp + "????????LLLLL");

    await db("otp_verifications").insert({
      email,
      otp,
      expires_at: expiresAt,
    });

    await sendEmail(
      email,
      "<h1>Email Verification OTP,</h1>",
      `<h2>Your verification OTP is: ${otp}</h2>`
    );

    return res.json({ message: "Verification OTP sent to email." });
  } catch (error) {
    console.error("Email Verification OTP Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== VERIFY EMAIL WITH OTP ====================
const verifyEmailWithOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ error: "Email and OTP are required" });

  try {
    const otpEntry = await db("otp_verifications")
      .where({ email, otp })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!otpEntry)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    await db("users").where({ email }).update({ is_verified: true });
    await db("otp_verifications").where({ email, otp }).del();

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ================== Logout ==================
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    // Optional: verify the token before logout (for safety)
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Since JWTs are stateless, you can't actually invalidate it on the server
    // unless you use a blacklist table or cache (e.g., Redis).
    // For now, just instruct the client to delete it.

    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};

module.exports = {
  registerStudent,
  login,
  registerAlumni,
  forgotPasswordGenerateOtp,
  resetPasswordWithOTP,
  generateEmailVerificationOTP,
  verifyEmailWithOTP,
  logout,
};
