// src/controllers/AuthUtilityController.js
const db = require("../config/db");
const bcrypt = require("bcrypt");
const {
  generateRandomToken,
  hashToken,
  verifyTokenHash,
} = require("../services/tokenService");
const { sendEmail } = require("../services/emailService");
const RESET_TOKEN_EXPIRY_MINUTES = 60; // 1 hour
// POST /auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const emailNorm = String(req.body.email || "")
      .trim()
      .toLowerCase();
    if (!emailNorm) return res.status(400).json({ error: "Email required" });

    const { data: user, error: userError } = await db
      .from("users")
      .select("id, email")
      .eq("email", emailNorm)
      .maybeSingle();

    if (userError && userError.code !== "PGRST116") {
      console.error("Failed to lookup user", userError);
      return res.status(500).json({ error: "Unable to look up user" });
    }

    // Always generic
    if (!user) {
      return res.json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    // (Optional) clear old unused tokens for this user
    const { error: cleanupError } = await db
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", user.id)
      .eq("used", false);
    if (cleanupError) {
      console.warn("Failed to cleanup existing reset tokens", cleanupError);
    }

    const plainToken = generateRandomToken(); // secure random
    const tokenHash = hashToken(plainToken); // store only hash
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    const { error: insertError } = await db
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        used: false,
        created_at: new Date().toISOString(),
      });
    if (insertError) {
      console.error("Failed to persist reset token", insertError);
      return res.status(500).json({ error: "Unable to create reset token" });
    }

    const base = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${base}/reset-password?token=${encodeURIComponent(
      plainToken
    )}&uid=${encodeURIComponent(user.id)}`;

    try {
      await sendEmail(
        user.email,
        "Password Reset Request",
        `You requested a password reset. Click the link:\n\n${resetLink}\n\nThis link expires in ${RESET_TOKEN_EXPIRY_MINUTES} minutes.`
      );
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      await db
        .from("password_reset_tokens")
        .delete()
        .eq("token_hash", tokenHash);
    }

    return res.json({
      message: "If this email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("forgotPassword error", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /auth/reset-password      role of this particular api is still ambiguous so let it be, soon we will delete it
// const resetPassword = async (req, res) => {
//   try {
//     const { uid, token, newPassword } = req.body;
//     if (!uid || !token || !newPassword) {
//       return res
//         .status(400)
//         .json({ error: "uid, token and newPassword are required" });
//     }

//     const record = await knex("password_reset_tokens")
//       .where({ user_id: uid, used: false })
//       .andWhere("expires_at", ">", new Date())
//       .orderBy("created_at", "desc")
//       .first();

//     if (!record)
//       return res.status(400).json({ error: "Invalid or expired token" });

//     const match = verifyTokenHash(token, record.token_hash);
//     if (!match)
//       return res.status(400).json({ error: "Invalid or expired token" });

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     await knex("users").where({ id: uid }).update({ password: hashedPassword });

//     await knex("password_reset_tokens")
//       .where({ id: record.id })
//       .update({ used: true });

//     const user = await knex("users").where({ id: uid }).first();
//     if (user) {
//       try {
//         await sendEmail(
//           user.email,
//           "Password Changed",
//           "Your password has been changed. If this wasn’t you, contact support immediately."
//         );
//       } catch (e) {
//         console.error("Notification email failed", e);
//       }
//     }

//     res.json({ message: "Password reset successful" });
//   } catch (err) {
//     console.error("resetPassword error", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

// POST /auth/change-password (authenticated)
const changePassword = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { currentPassword, newPassword } = req.body || {};
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword.trim() ||
      !newPassword.trim()
    ) {
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword required" });
    }

    const { data: user, error: userErr } = await db
      .from("users")
      .select("id, password_hash")
      .eq("id", req.user.id)
      .maybeSingle();

    if (userErr) {
      console.error("Failed to fetch user for password change", userErr);
      return res.status(500).json({ error: "Unable to fetch user" });
    }

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.password_hash) {
      // <-- change this if using password_hash
      console.error("User row has no password column value");
      return res.status(500).json({ error: "Password not set for user" });
    }

    const ok = await bcrypt.compare(
      String(currentPassword),
      String(user.password_hash)
    );
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);

    const { error: authUpdateError } = await db.supabase.auth.admin.updateUserById(
      req.user.id,
      { password: String(newPassword) }
    );

    if (authUpdateError) {
      console.error("Supabase password update failed", authUpdateError);
      return res.status(500).json({ error: "Unable to update Supabase password" });
    }

    const { error: updateError } = await db
      .from("users")
      .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
      .eq("id", req.user.id);

    if (updateError) {
      console.error("Failed to update password", updateError);
      return res.status(500).json({ error: "Unable to update password" });
    }

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error", err);
    return res.status(500).json({ error: "Server error" });
  }
  // try {
  //   if (!req.user || !req.user.id)
  //     return res.status(401).json({ error: "Unauthorized" });
  //   const userId = req.user.id;
  //   const { currentPassword, newPassword } = req.body;
  //   if (!currentPassword || !newPassword) {
  //     return res
  //       .status(400)
  //       .json({ error: "currentPassword and newPassword required" });
  //   }

  //   const user = await knex("users").where({ id: userId }).first();
  //   if (!user) return res.status(404).json({ error: "User not found" });

  //   const ok = await bcrypt.compare(currentPassword, user.password_hash);
  //   if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  //   const hashedPassword = await bcrypt.hash(newPassword, 10);
  //   await knex("users")
  //     .where({ id: userId })
  //     .update({ password: hashedPassword });

  //   res.json({ message: "Password changed successfully" });
  // } catch (err) {
  //   console.error("changePassword error", err);
  //   return res.status(500).json({ error: "Server error" });
  // }
};

module.exports = {
  forgotPassword,
  changePassword,
};
