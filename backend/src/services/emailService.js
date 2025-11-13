const nodemailer = require("nodemailer");
require("dotenv").config();

const host = process.env.EMAIL_HOST;
const port = Number(process.env.EMAIL_PORT || 587);
const user = process.env.EMAIL_USER; // from .env
const pass = process.env.EMAIL_PASS; // from .env

// Only include auth when credentials are provided
const auth = user && pass ? { user, pass } : undefined;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465, false for other ports (STARTTLS on 587)
  auth,
});

// Optional: verify transporter once at startup (logs but does not crash the app)
transporter.verify().then(
  () => console.log("Email transporter is ready"),
  (err) => console.warn("Email transporter verify failed:", err && err.message)
);

/**
 * sendEmail supports:
 * - sendEmail({ to, subject, text, html })
 * - sendEmail(to, subject, text)
 */
const sendEmail = async (...args) => {
  let to, subject, text, html;

  if (typeof args[0] === "object" && args[0] !== null) {
    ({ to, subject, text, html } = args[0]);
  } else {
    [to, subject, text] = args;
  }

  if (!to || !subject) {
    console.error("Email error: 'to' and 'subject' are required");
    return null;
  }

  const from = user ? `Alumni Portal <${user}>` : "Alumni Portal <no-reply@localhost>";

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || "Please view this email in an HTML-compatible viewer.",
      html,
    });

    console.log(
      `Email sent to ${to}${info && info.messageId ? ` (messageId: ${info.messageId})` : ""}`
    );
    return info;
  } catch (err) {
    console.error("Email error:", err && (err.message || err));
    throw err;
  }
};

module.exports = { sendEmail };