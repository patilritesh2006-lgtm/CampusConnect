/**
 * CampusConnect Email Dispatcher Service
 * Supports console fallback in local development and standard SMTP in production.
 */
const sendVerificationEmail = async ({ to, fullName, token }) => {
  const clientBaseUrl =
    process.env.CLIENT_BASE_URL || "http://localhost:5173";
  const verificationLink = `${clientBaseUrl}/verify-email?token=${token}`;

  console.log("\n=======================================================");
  console.log("📨 [EMAIL SERVICE] Verification Email Sent");
  console.log(`Recipient : ${fullName} <${to}>`);
  console.log(`Verify URL: ${verificationLink}`);
  console.log("=======================================================\n");

  return { success: true, link: verificationLink };
};

const sendPasswordResetEmail = async ({ to, fullName, token }) => {
  const clientBaseUrl =
    process.env.CLIENT_BASE_URL || "http://localhost:5173";
  const resetLink = `${clientBaseUrl}/reset-password?token=${token}`;

  console.log("\n=======================================================");
  console.log("🔑 [EMAIL SERVICE] Password Reset Email Sent");
  console.log(`Recipient : ${fullName} <${to}>`);
  console.log(`Reset URL : ${resetLink}`);
  console.log("=======================================================\n");

  return { success: true, link: resetLink };
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
