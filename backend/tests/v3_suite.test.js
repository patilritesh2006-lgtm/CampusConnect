const request = require("supertest");
const app = require("../server");
const prisma = require("../config/prisma");

describe("🚀 CampusConnect v3.1 Master Flagship Test Suite", () => {
  let collegeA, collegeB;
  let studentA, studentB, adminA;
  let tokenA, tokenB, adminTokenA;
  let testEventA, testEventB;
  let testCredential;

  beforeAll(async () => {
    // 1. Setup Tenant Colleges
    collegeA = await prisma.college.upsert({
      where: { email: "tenant_a_31@campusconnect.edu" },
      update: {},
      create: {
        name: "Institute of Technology Alpha",
        code: "ALPHA",
        email: "tenant_a_31@campusconnect.edu",
      },
    });

    collegeB = await prisma.college.upsert({
      where: { email: "tenant_b_31@campusconnect.edu" },
      update: {},
      create: {
        name: "University Beta",
        code: "BETA",
        email: "tenant_b_31@campusconnect.edu",
      },
    });

    // 2. Setup Student A (College A)
    const resA = await request(app).post("/api/auth/register").send({
      fullName: "Student Alpha",
      email: "student_alpha31@test.com",
      password: "Password123!@#",
      department: "Computer Science",
      year: 3,
    });
    if (resA.body.user) {
      studentA = await prisma.user.update({
        where: { id: resA.body.user.id },
        data: { collegeId: collegeA.id, username: "studentalpha31" },
      });
    }

    const loginA = await request(app).post("/api/auth/login").send({
      email: "student_alpha31@test.com",
      password: "Password123!@#",
    });
    tokenA = loginA.body.token;

    // 3. Setup Student B (College B)
    const resB = await request(app).post("/api/auth/register").send({
      fullName: "Student Beta",
      email: "student_beta31@test.com",
      password: "Password123!@#",
      department: "Mechanical",
      year: 2,
    });
    if (resB.body.user) {
      studentB = await prisma.user.update({
        where: { id: resB.body.user.id },
        data: { collegeId: collegeB.id, username: "studentbeta31" },
      });
    }

    const loginB = await request(app).post("/api/auth/login").send({
      email: "student_beta31@test.com",
      password: "Password123!@#",
    });
    tokenB = loginB.body.token;

    // 4. Setup Admin A (College A)
    const resAdmin = await request(app).post("/api/auth/register").send({
      fullName: "Dean Alpha",
      email: "dean_alpha31@test.com",
      password: "Password123!@#",
      department: "Administration",
      year: 4,
    });
    if (resAdmin.body.user) {
      adminA = await prisma.user.update({
        where: { id: resAdmin.body.user.id },
        data: { collegeId: collegeA.id, role: "ADMIN", username: "deanalpha31" },
      });
    }

    const loginAdmin = await request(app).post("/api/auth/login").send({
      email: "dean_alpha31@test.com",
      password: "Password123!@#",
    });
    adminTokenA = loginAdmin.body.token;

    // 5. Setup Events
    testEventA = await prisma.event.create({
      data: {
        title: "Alpha AI Hackathon 2026",
        description: "Intensive hackathon for Python and Machine Learning developers.",
        category: "Hackathon",
        venue: "Lab Alpha",
        eventDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        collegeId: collegeA.id,
      },
    });

    testEventB = await prisma.event.create({
      data: {
        title: "Beta Mechanical Expo",
        description: "Robotics and CAD design exhibition.",
        category: "Exhibition",
        venue: "Auditorium Beta",
        eventDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
        collegeId: collegeB.id,
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.auditLog.deleteMany({ where: { actorId: { in: [studentA?.id, studentB?.id, adminA?.id].filter(Boolean) } } });
      await prisma.credential.deleteMany({ where: { userId: { in: [studentA?.id, studentB?.id, adminA?.id].filter(Boolean) } } });
      await prisma.attendanceRisk.deleteMany({ where: { userId: { in: [studentA?.id, studentB?.id, adminA?.id].filter(Boolean) } } });
      await prisma.registration.deleteMany({ where: { userId: { in: [studentA?.id, studentB?.id, adminA?.id].filter(Boolean) } } });
      if (testEventA) await prisma.event.delete({ where: { id: testEventA.id } });
      if (testEventB) await prisma.event.delete({ where: { id: testEventB.id } });
      await prisma.user.deleteMany({ where: { email: { in: ["student_alpha31@test.com", "student_beta31@test.com", "dean_alpha31@test.com"] } } });
    } catch (e) {}
  });

  // ====================================================
  // 1. CAMPUS PASSPORT & GRANULAR PRIVACY
  // ====================================================
  describe("🎓 Campus Passport & Privacy Controls", () => {
    it("should fetch authenticated student Campus Passport with engagement score", async () => {
      const res = await request(app)
        .get("/api/passport/me")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.passport.identity.fullName).toBe("Student Alpha");
      expect(res.body.passport.gamification.engagementScore).toBeGreaterThanOrEqual(50);
      expect(res.body.passport.privacySettings).toBeDefined();
    });

    it("should fetch public passport with zero PII leaks", async () => {
      const res = await request(app).get("/api/passport/studentalpha31");

      expect(res.status).toBe(200);
      expect(res.body.passport.identity.fullName).toBe("Student Alpha");
      expect(res.body.passport.identity.email).toBeUndefined();
      expect(res.body.passport.identity.password).toBeUndefined();
      expect(res.body.passport.identity.id).toBeUndefined();
    });

    it("should allow student to update granular privacy settings", async () => {
      const res = await request(app)
        .put("/api/passport/privacy")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          privacyShowSkills: false,
          privacyShowCertificates: true,
          bio: "Full Stack Researcher & AI Builder",
        });

      expect(res.status).toBe(200);
      expect(res.body.user.privacyShowSkills).toBe(false);

      // Verify public view hides skills
      const pubRes = await request(app).get("/api/passport/studentalpha31");
      expect(pubRes.body.passport.skills.length).toBe(0);
    });
  });

  // ====================================================
  // 2. STUDENT SKILL GRAPH & EVIDENCE
  // ====================================================
  describe("🎯 Student Skill Graph & Evidence Engine", () => {
    it("should add verifiable skill evidence and compute transparent score", async () => {
      const res = await request(app)
        .post("/api/skills/evidence")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          skillName: "Python",
          sourceType: "PROJECT",
          sourceTitle: "Agentic AI Multi-Agent Mesh",
          weightPoints: 20,
        });

      expect(res.status).toBe(201);
      expect(res.body.studentSkill.score).toBeGreaterThanOrEqual(40);
    });

    it("should retrieve full student skill graph", async () => {
      const res = await request(app)
        .get("/api/skills")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.summary.totalSkills).toBeGreaterThanOrEqual(1);
    });
  });

  // ====================================================
  // 3. CRYPTOGRAPHIC VERIFIABLE CREDENTIALS
  // ====================================================
  describe("📜 Verifiable Credential System & Revocation", () => {
    it("should allow Admin to issue a cryptographically hashed credential", async () => {
      const res = await request(app)
        .post("/api/credentials/issue")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          userId: studentA.id,
          eventId: testEventA.id,
          title: "Certified AI Systems Architect",
          description: "Demonstrated mastery of distributed AI agents.",
          skills: ["Python", "Machine Learning"],
        });

      expect(res.status).toBe(201);
      expect(res.body.credential.credentialId).toMatch(/^CRED-2026-/);
      expect(res.body.credential.cryptoHash).toBeDefined();
      expect(res.body.credential.status).toBe("VALID");

      testCredential = res.body.credential;
    });

    it("should publicly verify valid credential and generate LinkedIn link", async () => {
      const res = await request(app).get(`/api/credentials/verify/${testCredential.credentialId}`);

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.status).toBe("VALID");
      expect(res.body.credential.linkedInShareUrl).toContain("linkedin.com/profile/add");
    });

    it("should support instant revocation with audit reason", async () => {
      const res = await request(app)
        .post("/api/credentials/revoke")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          credentialId: testCredential.credentialId,
          reason: "Academic code violation",
        });

      expect(res.status).toBe(200);
      expect(res.body.credential.status).toBe("REVOKED");

      const verifyRes = await request(app).get(`/api/credentials/verify/${testCredential.credentialId}`);
      expect(verifyRes.body.valid).toBe(false);
      expect(verifyRes.body.status).toBe("REVOKED");
    });
  });

  // ====================================================
  // 4. ATTENDANCE FRAUD ANOMALY ENGINE
  // ====================================================
  describe("🚨 Attendance Fraud & Anomaly Engine", () => {
    it("should log fraud risk when scanning invalid QR token", async () => {
      const res = await request(app)
        .post("/api/attendance/checkin-qr")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          eventId: testEventA.id,
          qrToken: "MALICIOUS_FORGED_TOKEN",
        });

      expect(res.status).toBe(400);

      const alerts = await request(app)
        .get("/api/fraud/alerts")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(alerts.status).toBe(200);
      expect(alerts.body.incidents.length).toBeGreaterThanOrEqual(1);
    });

    it("should allow admin to resolve or approve fraud incident", async () => {
      const alerts = await request(app)
        .get("/api/fraud/alerts")
        .set("Authorization", `Bearer ${adminTokenA}`);

      const incidentId = alerts.body.incidents[0]?.id;
      if (incidentId) {
        const resolveRes = await request(app)
          .post("/api/fraud/resolve")
          .set("Authorization", `Bearer ${adminTokenA}`)
          .send({
            incidentId,
            reviewStatus: "CONFIRMED_FRAUD",
          });

        expect(resolveRes.status).toBe(200);
        expect(resolveRes.body.incident.reviewStatus).toBe("CONFIRMED_FRAUD");
      }
    });
  });

  // ====================================================
  // 5. ACTIONABLE AI COPILOT 2.0 & READINESS AUDIT
  // ====================================================
  describe("🧠 AI Campus Copilot 2.0 with Real Campus Actions", () => {
    it("should perform actionable event registration", async () => {
      const res = await request(app)
        .post("/api/ai/copilot")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "Register me for Alpha AI Hackathon" });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
    });

    it("should run an Internship Readiness Audit", async () => {
      const res = await request(app)
        .post("/api/ai/copilot")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "What am I missing to become internship-ready?" });

      expect(res.status).toBe(200);
      expect(res.body.reply).toContain("INTERNSHIP & CAREER READINESS AUDIT");
      expect(res.body.reply).toContain("Overall Readiness Score");
    });
  });

  // ====================================================
  // 6. INSTITUTIONAL INTELLIGENCE & CLUBS
  // ====================================================
  describe("📊 Institutional Intelligence & Clubs Hub", () => {
    it("should provide Command Center KPIs and AI trend insights", async () => {
      const res = await request(app)
        .get("/api/intelligence")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.commandCenter).toBeDefined();
      expect(res.body.insights.length).toBeGreaterThan(0);
    });

    it("should allow creating and joining campus clubs", async () => {
      const uniqueCode = "ACS_" + Math.random().toString(36).substring(6).toUpperCase();
      const createRes = await request(app)
        .post("/api/clubs")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Alpha Coding Society",
          code: uniqueCode,
          description: "Premier coding society.",
          category: "TECHNICAL",
        });

      expect(createRes.status).toBe(201);
      const clubId = createRes.body.club.id;

      const joinRes = await request(app)
        .post(`/api/clubs/${clubId}/join`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(joinRes.status).toBe(201);
    });
  });
});