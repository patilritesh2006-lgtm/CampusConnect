const request = require("supertest");
const app = require("../server");
const prisma = require("../config/prisma");

describe("🎯 Core Controllers Integration Tests (Registration, Attendance, Certificates)", () => {
  let studentToken = "";
  let studentUser = null;
  let adminToken = "";
  let testCollege = null;
  let normalEvent = null;
  let limitedCapacityEvent = null;
  let testRegistration = null;

  beforeAll(async () => {
    // 1. Create or Find College
    testCollege =
      (await prisma.college.findFirst()) ||
      (await prisma.college.create({
        data: {
          name: "Test University of Technology",
          email: `univ_${Date.now()}@test.edu`,
        },
      }));

    // 2. Register Student
    const studentRes = await request(app).post("/api/auth/register").send({
      fullName: "Jest Controller Student",
      email: `jest_ctrl_${Date.now()}@test.edu`,
      password: "TestPassword123!@#",
      role: "STUDENT",
      department: "Information Technology",
      year: 2,
    });
    studentToken = studentRes.body.token;
    studentUser = studentRes.body.user;

    // 3. Register Admin
    const adminRes = await request(app).post("/api/auth/register").send({
      fullName: "Jest Controller Admin",
      email: `jest_admin_${Date.now()}@test.edu`,
      password: "TestPassword123!@#",
      role: "ADMIN",
    });
    adminToken = adminRes.body.token;

    // 4. Create Normal Event
    normalEvent = await prisma.event.create({
      data: {
        title: "Jest Web Development Workshop",
        description: "Hands-on session with modern full-stack web development.",
        venue: "Lab 301",
        category: "Workshop",
        capacity: 50,
        eventDate: new Date(Date.now() + 86400000),
        collegeId: testCollege.id,
      },
    });

    // 5. Create Event with 1 Capacity to test limit
    limitedCapacityEvent = await prisma.event.create({
      data: {
        title: "Exclusive VIP Tech Seminar",
        description: "Small exclusive VIP seminar with industry leaders.",
        venue: "Conference Room A",
        category: "Seminar",
        capacity: 1,
        eventDate: new Date(Date.now() + 172800000),
        collegeId: testCollege.id,
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: "jest_" } },
      });
      if (normalEvent) await prisma.event.delete({ where: { id: normalEvent.id } });
      if (limitedCapacityEvent) await prisma.event.delete({ where: { id: limitedCapacityEvent.id } });
      await prisma.$disconnect();
    } catch (e) {}
  });

  // ==========================================
  // REGISTRATION CONTROLLER TESTS
  // ==========================================
  describe("Registration Controller", () => {
    it("POST /api/registrations should allow student to register for an event", async () => {
      const res = await request(app)
        .post("/api/registrations")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ eventId: normalEvent.id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.registration).toBeDefined();
      testRegistration = res.body.registration;
    });

    it("POST /api/registrations should prevent duplicate registration for same event", async () => {
      const res = await request(app)
        .post("/api/registrations")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ eventId: normalEvent.id });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it("POST /api/registrations should enforce event capacity limits", async () => {
      // 1st student fills the 1-capacity event
      await request(app)
        .post("/api/registrations")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ eventId: limitedCapacityEvent.id });

      // Create a 2nd student
      const student2Res = await request(app).post("/api/auth/register").send({
        fullName: "Second Student",
        email: `student2_${Date.now()}@test.edu`,
        password: "TestPassword123!@#",
        role: "STUDENT",
      });

      // 2nd student tries to register for full event
      const overflowRes = await request(app)
        .post("/api/registrations")
        .set("Authorization", `Bearer ${student2Res.body.token}`)
        .send({ eventId: limitedCapacityEvent.id });

      expect(overflowRes.status).toBe(400);
      expect(overflowRes.body.success).toBe(false);
      expect(overflowRes.body.message).toMatch(/full|capacity/i);
    });
  });

  // ==========================================
  // ATTENDANCE CONTROLLER TESTS
  // ==========================================
  describe("Attendance Controller", () => {
    it("POST /api/attendance/mark should toggle single student attendance to PRESENT", async () => {
      const res = await request(app)
        .post("/api/attendance/mark")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          registrationId: testRegistration.id,
          attended: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.registration.attended).toBe(true);
    });

    it("POST /api/attendance/mark-all should bulk mark event attendees as present", async () => {
      const res = await request(app)
        .post("/api/attendance/mark-all")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ eventId: normalEvent.id });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // CERTIFICATE CONTROLLER TESTS
  // ==========================================
  describe("Certificate Controller", () => {
    let issuedCertCode = "";

    it("POST /api/certificates/issue should issue verified certificate for attended student", async () => {
      const res = await request(app)
        .post("/api/certificates/issue")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ registrationId: testRegistration.id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.certificate.certificateCode).toBeDefined();
      issuedCertCode = res.body.certificate.certificateCode;
    });

    it("GET /api/certificates/verify/:code should publicly verify authentic certificate", async () => {
      const res = await request(app).get(`/api/certificates/verify/${issuedCertCode}`);

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.certificate.studentName).toBe(studentUser.fullName);
      expect(res.body.certificate.linkedInShareUrl).toBeDefined();
    });

    it("GET /api/certificates/verify/:code should return 404 for invalid certificate code", async () => {
      const res = await request(app).get("/api/certificates/verify/CC-INVALID-FAKE-CODE");

      expect(res.status).toBe(404);
      expect(res.body.valid).toBe(false);
    });
  });
});
