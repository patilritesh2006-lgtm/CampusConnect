const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const request = require("supertest");
const app = require("../server");
const prisma = require("../config/prisma");

async function runTests() {
  console.log("\n🧪 RUNNING PHASE 1 & 21 AUTHENTICATION & SECURITY TEST SUITE\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // 1. Health Check (Phase 21)
  try {
    const res = await request(app).get("/api/health");
    assert(
      res.status === 200 && res.body.status === "OK" && res.body.database.status === "UP",
      "GET /api/health returns 200 OK and database UP"
    );
  } catch (err) {
    assert(false, "GET /api/health", err.message);
  }

  const testEmail = `sec_test_${Date.now()}@campusconnect.test`;
  const strongPassword = "SecurePassword123!@#";
  const weakPassword = "123";

  // 2. Register with weak password (Zod validation check)
  try {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      email: testEmail,
      password: weakPassword,
    });
    assert(
      res.status === 400 && res.body.success === false,
      "POST /api/auth/register rejects weak password with 400 Bad Request"
    );
  } catch (err) {
    assert(false, "Weak password validation", err.message);
  }

  // 3. Register with strong password (Happy path + tokens)
  let accessToken = "";
  let cookieHeader = "";
  try {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Security Test Student",
      email: testEmail,
      password: strongPassword,
      department: "Computer Science",
      year: 3,
    });

    const cookies = res.headers["set-cookie"];
    if (cookies && cookies.length > 0) {
      cookieHeader = cookies[0];
    }
    accessToken = res.body.token;

    assert(
      res.status === 201 && res.body.success === true && !!accessToken && !!cookieHeader,
      "POST /api/auth/register creates user, returns access token and sets HTTP-only cookie"
    );
  } catch (err) {
    assert(false, "Strong password registration", err.message);
  }

  // 4. Duplicate email prevention (409 Conflict)
  try {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Duplicate User",
      email: testEmail,
      password: strongPassword,
    });
    assert(
      res.status === 409 && res.body.success === false,
      "POST /api/auth/register rejects duplicate email with 409 Conflict"
    );
  } catch (err) {
    assert(false, "Duplicate email check", err.message);
  }

  // 5. Login happy path
  try {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: strongPassword,
    });

    const cookies = res.headers["set-cookie"];
    if (cookies && cookies.length > 0) {
      cookieHeader = cookies[0];
    }
    accessToken = res.body.token;

    assert(
      res.status === 200 && res.body.success === true && !!accessToken,
      "POST /api/auth/login verifies password and returns new access token"
    );
  } catch (err) {
    assert(false, "Login happy path", err.message);
  }

  // 6. Access protected route /me with Bearer token
  try {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    assert(
      res.status === 200 && res.body.user.email === testEmail,
      "GET /api/auth/me authenticates Bearer token and returns user profile"
    );
  } catch (err) {
    assert(false, "Protected route /me", err.message);
  }

  // 7. Token Refresh Rotation with HTTP-only cookie
  try {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookieHeader);

    const cookies = res.headers["set-cookie"];
    if (cookies && cookies.length > 0) {
      cookieHeader = cookies[0];
    }
    const newAccessToken = res.body.token;

    assert(
      res.status === 200 && res.body.success === true && !!newAccessToken,
      "POST /api/auth/refresh rotates refresh token and issues new access token"
    );
  } catch (err) {
    assert(false, "Token refresh rotation", err.message);
  }

  // 8. Account Lockout Protection (locks after 5 failed attempts)
  const lockoutEmail = `lockout_${Date.now()}@campusconnect.test`;
  try {
    // Create dedicated user for lockout test
    await request(app).post("/api/auth/register").send({
      fullName: "Lockout Test User",
      email: lockoutEmail,
      password: strongPassword,
    });

    let finalStatus = 0;
    for (let i = 0; i < 5; i++) {
      const failRes = await request(app).post("/api/auth/login").send({
        email: lockoutEmail,
        password: "WrongPassword999!",
      });
      finalStatus = failRes.status;
    }

    assert(
      finalStatus === 403,
      "POST /api/auth/login locks account with 403 Forbidden after 5 failed attempts"
    );
  } catch (err) {
    assert(false, "Account lockout verification", err.message);
  }

  // Clean up test data
  try {
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, lockoutEmail] } },
    });
  } catch (e) {}

  console.log(`\n======================================================`);
  console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
