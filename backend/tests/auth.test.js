const request = require("supertest");
const app = require("../server");
const prisma = require("../config/prisma");

describe("🔐 Authentication & Security Controller Tests", () => {
  const testEmail = `jest_auth_${Date.now()}@campusconnect.test`;
  const strongPassword = "SecurePassword123!@#";
  const weakPassword = "123";
  let accessToken = "";
  let cookieHeader = "";

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: "jest_auth_" } },
      });
      await prisma.$disconnect();
    } catch (e) {}
  });

  it("GET /api/health should return 200 and OK status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.database.status).toBe("UP");
  });

  it("POST /api/auth/register should reject weak password with 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Jest Test Student",
      email: testEmail,
      password: weakPassword,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/register should successfully register with strong password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Jest Test Student",
      email: testEmail,
      password: strongPassword,
      department: "Computer Science",
      year: 3,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    cookieHeader = cookies[0];
  });

  it("POST /api/auth/register should reject duplicate email with 409 Conflict", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Duplicate Student",
      email: testEmail,
      password: strongPassword,
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/login should authenticate and return access token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: strongPassword,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    accessToken = res.body.token;
  });

  it("POST /api/auth/login should fail on wrong password with 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "WrongPassword999!",
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/auth/me should return authenticated profile", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
  });

  it("POST /api/auth/refresh should rotate token and return new access token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookieHeader);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });
});
