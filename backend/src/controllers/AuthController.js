const db = require("../config/db.js");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../services/emailService");
const {
  ensureAppUserRecord,
  fetchAppUserProfile,
  buildUserResponse,
  updateLastLogin,
} = require("../services/userService");

const PUBLIC_CLIENT_ERROR =
  "Supabase anon client is not configured. Set SUPABASE_ANON_KEY to enable password and OAuth flows.";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const requirePublicClient = () => {
  const client = db.getPublicClient?.();
  if (!client) {
    throw new Error(PUBLIC_CLIENT_ERROR);
  }
  return client;
};

const deleteSupabaseUser = async (userId) => {
  try {
    await db.supabase.auth.admin.deleteUser(userId);
  } catch (cleanupError) {
    console.warn("Failed to delete Supabase user during rollback", cleanupError);
  }
};

const getOrCreateAppUser = async (supabaseUser, options = {}) => {
  let appUser = await fetchAppUserProfile(supabaseUser.id);
  if (appUser) {
    return appUser;
  }

  await ensureAppUserRecord(supabaseUser, options);
  return fetchAppUserProfile(supabaseUser.id);
};

const buildSessionPayload = (session, supabaseUser, appUser) => ({
  token: session.access_token,
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
  expiresAt: session.expires_at,
  provider:
    supabaseUser?.app_metadata?.provider || session?.user?.app_metadata?.provider || "email",
  user: buildUserResponse(supabaseUser, appUser),
});

// ==================== REGISTER STUDENT ====================
const registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password_hash: password,
      branch,
      gradYear,
      student_id,
    } = req.body;
    const roleToSave = "student";

    if (!name || !email || !password || !branch || !gradYear || !student_id) {
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
      "cse",
      "it",
      "ece",
      "ee",
      "me",
      "ce",
      "che",
      "mca",
      "mba",
    ];

    if (!validBranches.includes(branch.toLowerCase().trim())) {
      return res.status(400).json({ error: "Branch is incorrect" });
    }

    const normalizedEmail = normalizeEmail(email);

    const { data: existingUser } = await db
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const { data: authResult, error: authError } = await db.supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: { role: roleToSave, name },
    });

    if (authError) {
      console.error("Supabase signup error:", authError);
      return res.status(400).json({ error: authError.message || "Unable to create Supabase user" });
    }

    const supabaseUser = authResult?.user;
    if (!supabaseUser) {
      return res.status(500).json({ error: "Supabase user creation returned no user" });
    }

    let appUserRow;
    try {
      appUserRow = await ensureAppUserRecord(supabaseUser, {
        password,
        roleHint: roleToSave,
        status: "pending",
      });
    } catch (insertError) {
      console.error("Failed to persist user row:", insertError);
      await deleteSupabaseUser(supabaseUser.id);
      await db.from("users").delete().eq("id", supabaseUser.id);
      return res.status(500).json({ error: "Failed to persist user profile" });
    }

    const { error: profileError } = await db.from("student_profiles").insert({
      user_id: supabaseUser.id,
      name,
      student_id,
      branch,
      grad_year: gradYear,
    });

    if (profileError) {
      console.error("Profile insert error:", profileError);
      await deleteSupabaseUser(supabaseUser.id);
      await db.from("users").delete().eq("id", supabaseUser.id);
      return res.status(500).json({ error: "Failed to create profile" });
    }

    res.status(201).json({
      message:
        "Registration submitted successfully. Please verify your email to activate your account.",
      userId: supabaseUser.id,
    });
  } catch (error) {
    console.error("Student Registration Error:", error);
    res.status(500).json({ error: "An error occurred during registration." });
  }
};

// // ==================== LOGIN ====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const publicClient = requirePublicClient();

    const { data, error } = await publicClient.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data?.session) {
      console.warn("Supabase login failed", error);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const session = data.session;
    const supabaseUser = session.user;
    let appUser = await fetchAppUserProfile(supabaseUser.id);
    if (!appUser) {
      await ensureAppUserRecord(supabaseUser, {
        password,
        roleHint: supabaseUser.user_metadata?.role || "student",
      });
      appUser = await fetchAppUserProfile(supabaseUser.id);
    }

    if (!appUser) {
      console.error("Unable to hydrate app user after Supabase login", {
        supabaseId: supabaseUser.id,
      });
      return res.status(500).json({ error: "Unable to sync user profile" });
    }

    await updateLastLogin(supabaseUser.id);

    res.json(buildSessionPayload(session, supabaseUser, appUser));
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};

const refreshSession = async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({ error: "refreshToken is required" });
  }

  try {
    const publicClient = requirePublicClient();
    const { data, error } = await publicClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data?.session?.user) {
      console.warn("Supabase refresh failed", error);
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const session = data.session;
    const supabaseUser = session.user;

    let appUser = await fetchAppUserProfile(supabaseUser.id);
    if (!appUser) {
      await ensureAppUserRecord(supabaseUser, {
        roleHint: supabaseUser.user_metadata?.role || "student",
      });
      appUser = await fetchAppUserProfile(supabaseUser.id);
    }

    if (!appUser) {
      console.error("Unable to hydrate user during refresh", {
        supabaseId: supabaseUser.id,
      });
      return res.status(500).json({ error: "Unable to sync user profile" });
    }

    await updateLastLogin(supabaseUser.id);

    res.json(buildSessionPayload(session, supabaseUser, appUser));
  } catch (error) {
    console.error("Refresh session error:", error);
    res.status(500).json({ error: "Unable to refresh session" });
  }
};

// ==================== REGISTER ALUMNI ====================
const registerAlumni = async (req, res) => {
  const { name, grad_year, email, password_hash: password, current_title } = req.body;
  const roleToSave = "alumni";

  if (!name || !email || !password || !current_title || !grad_year) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const blockedDomains = [
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "sgsits.ac.in",
    "mailnator.com",
    "tempmail.com",
    "10minutemail.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || blockedDomains.includes(domain)) {
    return res
      .status(400)
      .json({ error: "Please use a valid business/company email ID" });
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    const { data: existingAlumni } = await db
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingAlumni) {
      return res.status(409).json({
        error:
          "An account with this email already exists or is pending verification.",
      });
    }

    const { data: authResult, error: authError } = await db.supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: { role: roleToSave, name },
    });

    if (authError) {
      console.error("Supabase signup error:", authError);
      return res.status(400).json({ error: authError.message || "Unable to create Supabase user" });
    }

    const supabaseUser = authResult?.user;
    if (!supabaseUser) {
      return res.status(500).json({ error: "Supabase user creation returned no user" });
    }

    let appUserRow;
    try {
      appUserRow = await ensureAppUserRecord(supabaseUser, {
        password,
        roleHint: roleToSave,
        status: "pending",
      });
    } catch (insertError) {
      console.error("Failed to persist user row:", insertError);
      await deleteSupabaseUser(supabaseUser.id);
      await db.from("users").delete().eq("id", supabaseUser.id);
      return res.status(500).json({ error: "Failed to persist user profile" });
    }

    const { error: alumniError } = await db.from("alumni_profiles").insert({
      user_id: supabaseUser.id,
      name,
      grad_year,
      current_title,
    });

    if (alumniError) {
      console.error("Alumni insert error:", alumniError);
      await deleteSupabaseUser(supabaseUser.id);
      await db.from("users").delete().eq("id", supabaseUser.id);
      return res.status(500).json({ error: "Failed to create alumni profile" });
    }

    res.status(201).json({
      message:
        "Registration submitted successfully. You will receive an email once your account has been verified by an administrator.",
      userId: supabaseUser.id,
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

// Email sending delegated to `services/emailService` (no-op when not configured)

// ==================== FORGOT PASSWORD: GENERATE OTP ====================
const forgotPasswordGenerateOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP(); // a 6-digit string
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing OTP
    await db.from('otp_verifications').delete().eq('email', user.email);

    // Insert OTP record
    const { error: otpError } = await db
      .from('otp_verifications')
      .insert({
        email: user.email,
        otp,
        expires_at: expiryTime,
      });

    if (otpError) {
      console.error('OTP insert error:', otpError);
      return res.status(500).json({ error: 'Failed to generate OTP' });
    }

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
    const { data: otpEntry, error: otpError } = await db
      .from("otp_verifications")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (otpError || !otpEntry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const { data: userRow, error: userLookupError } = await db
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userLookupError) {
      console.error("Password reset user lookup error:", userLookupError);
      return res.status(500).json({ error: "Failed to locate user" });
    }

    if (!userRow) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: authUpdateError } = await db.supabase.auth.admin.updateUserById(
      userRow.id,
      { password: newPassword }
    );

    if (authUpdateError) {
      console.error("Supabase password update error:", authUpdateError);
      return res.status(500).json({ error: "Failed to update Supabase password" });
    }

    const { error: updateError } = await db
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", userRow.id);

    if (updateError) {
      console.error("Password update error:", updateError);
      return res.status(500).json({ error: "Failed to update password" });
    }

    await db.from("otp_verifications").delete().eq("email", email).eq("otp", otp);

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

    // OTP generated (not logged in production)

    const { error: otpError } = await db
      .from('otp_verifications')
      .insert({
        email,
        otp,
        expires_at: expiresAt,
      });

    if (otpError) {
      console.error('OTP insert error:', otpError);
      return res.status(500).json({ error: 'Failed to generate OTP' });
    }

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
    const { data: otpEntry, error: otpError } = await db
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpEntry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const { error: updateError } = await db
      .from('users')
      .update({ is_verified: true })
      .eq('email', email);

    if (updateError) {
      console.error('User update error:', updateError);
      return res.status(500).json({ error: 'Failed to verify email' });
    }

    await db.from('otp_verifications').delete().eq('email', email).eq('otp', otp);

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ================== Logout ==================
const logout = async (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken;

    if (refreshToken) {
      const { error } = await db.supabase.auth.admin.signOut(refreshToken);
      if (error) {
        console.warn("Supabase admin signOut failed", error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};

const startGoogleOAuth = async (req, res) => {
  try {
    const redirectTo =
      req.query.redirectTo ||
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/callback`;
    const publicClient = requirePublicClient();
    const { data, error } = await publicClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        scopes: "email profile",
      },
    });

    if (error) {
      console.error("Google OAuth init error:", error);
      return res.status(500).json({ error: error.message || "Failed to start Google OAuth" });
    }

    if (!data?.url) {
      return res.status(500).json({ error: "Supabase did not return an OAuth URL" });
    }

    res.json({ url: data.url });
  } catch (error) {
    console.error("Google OAuth handler error:", error);
    res.status(500).json({ error: "Unable to start Google OAuth" });
  }
};

module.exports = {
  registerStudent,
  login,
  refreshSession,
  registerAlumni,
  forgotPasswordGenerateOtp,
  resetPasswordWithOTP,
  generateEmailVerificationOTP,
  verifyEmailWithOTP,
  logout,
  startGoogleOAuth,
};
