const request = require("supertest");
const app = require("../server");
const prisma = require("../config/prisma");

describe("🚀 CampusConnect v3.0 Master Flagship Test Suite", () => {
  let collegeA, collegeB;
  let studentA, studentB, adminA;
  let tokenA, tokenB, adminTokenA;
  let testEventA;
  let testCredential;

  beforeAll(async () => {
    // 1. Setup Tenant Colleges
    collegeA = await prisma.college.upsert({
      where: { email: "tenant_a@campusconnect.edu" },
      update: {},
      create: {
        name: "Institute of Technology Alpha",
        code: "ALPHA",
        email: "tenant_a@campusconnect.edu",
      },
    });

    collegeB = await prisma.college.upsert({
      where: { email: "tenant_b@campusconnect.edu" },
      update: {},
      create: {
        name: "University Beta",
        code: "BETA",
        email: "tenant_b@campusconnect.edu",
      },
    });

    // 2. Setup Student A (College A)
    const resA = await request(app).post("/api/auth/register").send({
      fullName: "Student Alpha",
      email: "student_alpha@test.com",
      password: "Password123!@#",
      department: "Computer Science",
      year: 3,
    });
    if (resA.body.user) {
      studentA = await prisma.user.update({
        where: { id: resA.body.user.id },
        data: { collegeId: collegeA.id, username: "studentalpha" },
      });
    }

    const loginA = await request(app).post("/api/auth/login").send({
      email: "student_alpha@test.com",
      password: "Password123!@#",
    });
    tokenA = loginA.body.token;

    // 3. Setup Student B (College B)
    const resB = await request(app).post("/api/auth/register").send({
      fullName: "Student Beta",
      email: "student_beta@test.com",
      password: "Password123!@#",
      department: "Mechanical",
      year: 2,
    });
    if (resB.body.user) {
      studentB = await prisma.user.update({
        where: { id: resB.body.user.id },
        data: { collegeId: collegeB.id, username: "studentbeta" },
      });
    }

    const loginB = await request(app).post("/api/auth/login").send({
      email: "student_beta@test.com",
      password: "Password123!@#",
    });
    tokenB = loginB.body.token;

    // 4. Setup Admin A (College A)
    const resAdmin = await request(app).post("/api/auth/register").send({
      fullName: "Dean Alpha",
      email: "dean_alpha@test.com",
      password: "Password123!@#",
      department: "Administration",
      year: 4,
    });
    if (resAdmin.body.user) {
      adminA = await prisma.user.update({
        where: { id: resAdmin.body.user.id },
        data: { collegeId: collegeA.id, role: "ADMIN", username: "deanalpha" },
      });
    }

    const loginAdmin = await request(app).post("/api/auth/login").send({
      email: "dean_alpha@test.com",
      password: "Password123!@#",
    });
    adminTokenA = loginAdmin.body.token;

    // 5. Setup Test Event for College A
    testEventA = await prisma.event.create({
      data: {
        title: "Alpha AI Hackathon 2026",
        description: "Intensive 24-hour hackathon for Python and Machine Learning developers.",
        category: "Hackathon",
        venue: "Lab Alpha",
        eventDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        collegeId: collegeA.id,
      },
    });
  });

  afterAll(async () => {
    // Cleanup test records
    try {
      await prisma.credential.deleteMany({ where: { userId: { in: [studentA?.id, studentB?.id, adminA?.id].filter(Boolean) } } });
      await prisma.attendanceRisk.deleteMany({ where: { userId: { in: [studentA?.id, studentB?.id, adminA?.id].filter(Boolean) } } });
      await prisma.registration.deleteMany({ where: { userId: { in: [studentA?.id, studentB?.id, adminA?.id].filter(Boolean) } } });
      if (testEventA) await prisma.event.delete({ where: { id: testEventA.id } });
      await prisma.user.deleteMany({ where: { email: { in: ["student_alpha@test.com", "student_beta@test.com", "dean_alpha@test.com"] } } });
    } catch (e) {}
  });

  // ====================================================
  // 1. CAMPUS PASSPORT & PRIVACY
  // ====================================================
  describe("🎓 Campus Passport Engine", () => {
    it("should fetch authenticated student Campus Passport", async () => {
      const res = await request(app)
        .get("/api/passport/me")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.passport.identity.fullName).toBe("Student Alpha");
      expect(res.body.passport.identity.institution).toBe("Institute of Technology Alpha");
      expect(res.body.passport.gamification).toBeDefined();
    });

    it("should fetch public passport with zero PII leaks", async () => {
      const res = await request(app).get("/api/passport/studentalpha");

      expect(res.status).toBe(200);
      expect(res.body.passport.identity.fullName).toBe("Student Alpha");
      // Must not leak private sensitive fields
      expect(res.body.passport.identity.email).toBeUndefined();
      expect(res.body.passport.identity.password).toBeUndefined();
      expect(res.body.passport.identity.id).toBeUndefined();
    });
  });

  // ====================================================
  // 2. STUDENT SKILL GRAPH & EVIDENCE
  // ====================================================
  describe("🎯 Student Skill Graph & Evidence Calculation", () => {
    it("should add verifiable skill evidence and compute score", async () => {
      const res = await request(app)
        .post("/api/skills/evidence")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          skillName: "Python",
          sourceType: "PROJECT",
          sourceTitle: "Distributed Microservices Architecture",
          weightPoints: 15,
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
      expect(res.body.skills[0].skill.name).toBe("Python");
    });
  });

  // ====================================================
  // 3. CRYPTOGRAPHIC VERIFIABLE CREDENTIALS
  // ====================================================
  describe("📜 Verifiable Credential System", () => {
    it("should allow Admin to issue a cryptographically hashed credential", async () => {
      const res = await request(app)
        .post("/api/credentials/issue")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          userId: studentA.id,
          eventId: testEventA.id,
          title: "Certified AI Systems Architect",
          description: "Demonstrated mastery of distributed AI agents.",
          skills: ["Python", "Artificial Intelligence"],
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
          reason: "Academic integrity audit failure",
        });

      expect(res.status).toBe(200);
      expect(res.body.credential.status).toBe("REVOKED");

      // Verify public verification reflects revocation
      const verifyRes = await request(app).get(`/api/credentials/verify/${testCredential.credentialId}`);
      expect(verifyRes.body.valid).toBe(false);
      expect(verifyRes.body.status).toBe("REVOKED");
    });
  });

  // ====================================================
  // 4. ATTENDANCE FRAUD ANOMALY ENGINE
  // ====================================================
  describe("🚨 Attendance Fraud Detection", () => {
    it("should log fraud risk when scanning invalid QR token", async () => {
      const res = await request(app)
        .post("/api/attendance/checkin-qr")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          eventId: testEventA.id,
          qrToken: "MALICIOUS_REPLAY_FORGED_TOKEN",
        });

      expect(res.status).toBe(400);

      // Verify incident in admin console
      const alerts = await request(app)
        .get("/api/fraud/alerts")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(alerts.status).toBe(200);
      expect(alerts.body.incidents.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ====================================================
  // 5. AI COPILOT 2.0 & EVENT CREATOR
  // ====================================================
  describe("🧠 AI Campus Copilot 2.0 & Event Creator", () => {
    it("should answer student queries using real database context", async () => {
      const res = await request(app)
        .post("/api/ai/copilot")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "What events should I attend this week?" });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.suggestedActions.length).toBeGreaterThan(0);
    });

    it("should generate structured event draft blueprint for Admin", async () => {
      const res = await request(app)
        .post("/api/ai/event-draft")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ prompt: "Create a 2-hour React and TypeScript workshop for second-year students" });

      expect(res.status).toBe(200);
      expect(res.body.draft.title).toContain("React");
      expect(res.body.draft.prerequisites.length).toBeGreaterThan(0);
      expect(res.body.draft.learningOutcomes.length).toBeGreaterThan(0);
    });
  });

  // ====================================================
  // 6. INSTITUTIONAL INTELLIGENCE & CLUBS
  // ====================================================
  describe("📊 Institutional Intelligence & Clubs Hub", () => {
    it("should provide data-grounded KPIs and AI trend insights", async () => {
      const res = await request(app)
        .get("/api/intelligence")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.kpis.totalStudents).toBeGreaterThanOrEqual(1);
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
          description: "Premier coding and algorithmic society.",
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