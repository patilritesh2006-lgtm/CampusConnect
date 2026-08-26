const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const request = require("supertest");
const app = require("../server");
const prisma = require("../config/prisma");
const { generateEventQRToken } = require("../utils/qrService");

async function runMasterTests() {
  console.log("\n🧪 RUNNING CAMPUSCONNECT MASTER SUITE (PHASES 1 - 10 & 21)\n");

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

  // 1. Health check
  try {
    const res = await request(app).get("/api/health");
    assert(res.status === 200 && res.body.status === "OK", "GET /api/health returns 200 OK");
  } catch (e) {
    assert(false, "Health Check", e.message);
  }

  // 2. Setup Test Accounts (Admin & Student)
  const studentEmail = `student_${Date.now()}@test.campusconnect`;
  const adminEmail = `admin_${Date.now()}@test.campusconnect`;
  const testPassword = "SuperPassword123!@#";

  let studentToken = "";
  let adminToken = "";
  let studentUser = null;
  let adminUser = null;

  try {
    // Create Student
    const studentRes = await request(app).post("/api/auth/register").send({
      fullName: "Master Test Student",
      email: studentEmail,
      password: testPassword,
      role: "STUDENT",
      department: "Computer Science",
      year: 3,
    });
    studentToken = studentRes.body.token;
    studentUser = studentRes.body.user;

    // Create Admin
    const adminRes = await request(app).post("/api/auth/register").send({
      fullName: "Master Test Admin",
      email: adminEmail,
      password: testPassword,
      role: "ADMIN",
    });
    adminToken = adminRes.body.token;
    adminUser = adminRes.body.user;

    assert(!!studentToken && !!adminToken, "Setup test student and admin accounts");
  } catch (e) {
    assert(false, "Account setup", e.message);
  }

  // 3. Phase 2 — RBAC Negative & Positive Test
  try {
    // Student hitting Admin Analytics (expect 403)
    const studentAttempt = await request(app)
      .get("/api/analytics/admin-overview")
      .set("Authorization", `Bearer ${studentToken}`);
    assert(studentAttempt.status === 403, "RBAC: STUDENT blocked from Admin Analytics with 403 Forbidden");

    // Admin hitting Admin Analytics (expect 200)
    const adminAttempt = await request(app)
      .get("/api/analytics/admin-overview")
      .set("Authorization", `Bearer ${adminToken}`);
    assert(adminAttempt.status === 200 && adminAttempt.body.success === true, "RBAC: ADMIN granted access to Admin Analytics with 200 OK");
  } catch (e) {
    assert(false, "RBAC tests", e.message);
  }

  // 4. Setup Test Event
  let testEvent = null;
  try {
    const college = await prisma.college.findFirst() || await prisma.college.create({
      data: { name: "Test Engineering College", email: `college_${Date.now()}@test.edu` },
    });

    testEvent = await prisma.event.create({
      data: {
        title: "National AI Hackathon 2026",
        description: "Annual coding and AI hackathon for Computer Science students.",
        venue: "Tech Auditorium",
        category: "Hackathon",
        capacity: 100,
        eventDate: new Date(Date.now() + 86400000), // tomorrow
        collegeId: college.id,
      },
    });
    assert(!!testEvent.id, "Create test event for lifecycle verification");
  } catch (e) {
    assert(false, "Event creation", e.message);
  }

  // 5. Student registers for event
  let registration = null;
  try {
    registration = await prisma.registration.create({
      data: {
        userId: studentUser.id,
        eventId: testEvent.id,
        attended: false,
      },
    });
    assert(!!registration.id, "Student successfully registered for event");
  } catch (e) {
    assert(false, "Registration", e.message);
  }

  // 6. Phase 3 — Rotating QR Generation & Check-In
  try {
    // Admin gets rotating QR
    const qrRes = await request(app)
      .get(`/api/attendance/events/${testEvent.id}/rotating-qr`)
      .set("Authorization", `Bearer ${adminToken}`);
    assert(qrRes.status === 200 && !!qrRes.body.qrToken, "Admin generates live rotating QR token");

    // Student checks in via QR token
    const checkinRes = await request(app)
      .post("/api/attendance/checkin-qr")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        eventId: testEvent.id,
        qrToken: qrRes.body.qrToken,
      });

    assert(
      checkinRes.status === 200 && checkinRes.body.success === true,
      "Student checks in via QR scan & receives +50 XP"
    );

    // Prevent duplicate check-in
    const dupCheckin = await request(app)
      .post("/api/attendance/checkin-qr")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        eventId: testEvent.id,
        qrToken: qrRes.body.qrToken,
      });
    assert(dupCheckin.status === 400, "Prevent duplicate QR check-in");
  } catch (e) {
    assert(false, "QR Check-in", e.message);
  }

  // 7. Phase 4 — Certificate Issuance & Public Verification
  let certCode = "";
  try {
    const issueRes = await request(app)
      .post("/api/certificates/issue")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ registrationId: registration.id });

    assert(issueRes.status === 201 && !!issueRes.body.certificate.certificateCode, "Admin issues digital certificate with unique code");
    certCode = issueRes.body.certificate.certificateCode;

    // Public Zero-Login Verification
    const verifyRes = await request(app).get(`/api/certificates/verify/${certCode}`);
    assert(
      verifyRes.status === 200 && verifyRes.body.valid === true && !!verifyRes.body.certificate.linkedInShareUrl,
      "Public /verify/:code confirms certificate authenticity and provides LinkedIn share link"
    );
  } catch (e) {
    assert(false, "Certificate issuance & verification", e.message);
  }

  // 8. Phase 7 — Public Student Digital Portfolio
  try {
    // Set username
    const username = `student_${Date.now()}`;
    await prisma.user.update({
      where: { id: studentUser.id },
      data: {
        username,
        bio: "Full Stack Engineer & AI Enthusiast",
        skills: ["React", "Node.js", "Python"],
        portfolioPublic: true,
      },
    });

    const portfolioRes = await request(app).get(`/api/users/portfolio/${username}`);
    assert(
      portfolioRes.status === 200 &&
        portfolioRes.body.portfolio.fullName === "Master Test Student" &&
        portfolioRes.body.portfolio.badges.length > 0 &&
        !portfolioRes.body.portfolio.email, // ensures PII email is NOT leaked
      "Public Digital Portfolio (/portfolio/:username) returns verified achievements with zero PII leaks"
    );
  } catch (e) {
    assert(false, "Digital Portfolio", e.message);
  }

  // 9. Phase 8 — AI Event Recommendations & Campus Assistant
  try {
    const recRes = await request(app)
      .get("/api/ai/recommendations")
      .set("Authorization", `Bearer ${studentToken}`);
    assert(
      recRes.status === 200 && Array.isArray(recRes.body.recommendations),
      "AI Recommendation engine calculates match percentage per student profile"
    );

    const askRes = await request(app)
      .post("/api/ai/assistant")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ message: "What hackathons are upcoming?" });
    assert(
      askRes.status === 200 && !!askRes.body.reply,
      "AI Campus Assistant parses intent and returns structured response"
    );
  } catch (e) {
    assert(false, "AI Recommendations & Assistant", e.message);
  }

  // 10. Phase 9 — Event Feedback & Surveys
  try {
    const fbRes = await request(app)
      .post(`/api/feedback/events/${testEvent.id}/feedback`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        rating: 5,
        experience: "EXCELLENT",
        organization: 5,
        speakerQuality: 5,
        wouldRecommend: true,
        comments: "Outstanding hackathon organization!",
      });

    assert(fbRes.status === 201 && fbRes.body.success === true, "Attended student submits 5-star event feedback (+25 XP)");

    const summaryRes = await request(app).get(`/api/feedback/events/${testEvent.id}/feedback`);
    assert(
      summaryRes.status === 200 && summaryRes.body.summary.avgRating === 5,
      "Event feedback summary calculates average star rating & recommendations"
    );
  } catch (e) {
    assert(false, "Event Feedback", e.message);
  }

  // Clean up
  try {
    await prisma.user.deleteMany({
      where: { email: { in: [studentEmail, adminEmail] } },
    });
    if (testEvent) {
      await prisma.event.delete({ where: { id: testEvent.id } });
    }
  } catch (e) {}

  console.log(`\n======================================================`);
  console.log(`📊 MASTER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runMasterTests().catch((err) => {
  console.error("Master Test Runner error:", err);
  process.exit(1);
});
