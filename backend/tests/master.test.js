const request = require('supertest');
const app = require('../server');
const prisma = require('../config/prisma');

describe('👑 CampusConnect Master Integration Test Suite', () => {
  const studentEmail = `master_std_${Date.now()}@campusconnect.test`;
  const adminEmail = `master_adm_${Date.now()}@campusconnect.test`;
  const testPassword = 'SuperPassword123!@#';

  let studentToken = '';
  let adminToken = '';
  let studentUser = null;
  let testEvent = null;
  let registration = null;
  let certCode = '';

  beforeAll(async () => {
    // 1. Create Student
    const studentRes = await request(app).post('/api/auth/register').send({
      fullName: 'Master Test Student',
      email: studentEmail,
      password: testPassword,
      role: 'STUDENT',
      department: 'Computer Science',
      year: 3,
    });
    studentToken = studentRes.body.token;
    studentUser = studentRes.body.user;

    // 2. Create Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      fullName: 'Master Test Admin',
      email: adminEmail,
      password: testPassword,
      role: 'ADMIN',
    });
    adminToken = adminRes.body.token;

    // 3. Create College & Event
    const college =
      (await prisma.college.findFirst()) ||
      (await prisma.college.create({
        data: {
          name: 'Master Engineering College',
          email: `master_col_${Date.now()}@test.edu`,
        },
      }));

    testEvent = await prisma.event.create({
      data: {
        title: 'National AI Hackathon 2026',
        description: 'Annual coding and AI hackathon for Computer Science students.',
        venue: 'Tech Auditorium',
        category: 'Hackathon',
        capacity: 100,
        eventDate: new Date(Date.now() + 86400000),
        collegeId: college.id,
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { in: [studentEmail, adminEmail] } },
      });
      if (testEvent) {
        await prisma.event.delete({ where: { id: testEvent.id } });
      }
      await prisma.$disconnect();
    } catch (e) {}
  });

  it('GET /api-docs should serve Swagger OpenAPI documentation', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Swagger UI');
  });

  it('RBAC: STUDENT should be blocked from Admin Analytics with 403', async () => {
    const res = await request(app)
      .get('/api/analytics/admin-overview')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('RBAC: ADMIN should be granted access to Admin Analytics with 200', async () => {
    const res = await request(app)
      .get('/api/analytics/admin-overview')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Student should register for the event', async () => {
    registration = await prisma.registration.create({
      data: {
        userId: studentUser.id,
        eventId: testEvent.id,
        attended: false,
      },
    });
    expect(registration.id).toBeDefined();
  });

  it('Admin generates live rotating QR token & Student checks in', async () => {
    const qrRes = await request(app)
      .get(`/api/attendance/events/${testEvent.id}/rotating-qr`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(qrRes.status).toBe(200);
    expect(qrRes.body.qrToken).toBeDefined();

    const checkinRes = await request(app)
      .post('/api/attendance/checkin-qr')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        eventId: testEvent.id,
        qrToken: qrRes.body.qrToken,
      });

    expect(checkinRes.status).toBe(200);
    expect(checkinRes.body.success).toBe(true);

    // Prevent duplicate checkin
    const dupRes = await request(app)
      .post('/api/attendance/checkin-qr')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        eventId: testEvent.id,
        qrToken: qrRes.body.qrToken,
      });
    expect(dupRes.status).toBe(400);
  });

  it('Admin issues certificate & public verifies it', async () => {
    const issueRes = await request(app)
      .post('/api/certificates/issue')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ registrationId: registration.id });

    expect(issueRes.status).toBe(201);
    certCode = issueRes.body.certificate.certificateCode;
    expect(certCode).toBeDefined();

    const verifyRes = await request(app).get(`/api/certificates/verify/${certCode}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.valid).toBe(true);
    expect(verifyRes.body.certificate.linkedInShareUrl).toBeDefined();
  });

  it('Public student portfolio returns verified achievements without PII', async () => {
    const username = `master_std_${Date.now()}`;
    await prisma.user.update({
      where: { id: studentUser.id },
      data: {
        username,
        bio: 'Full Stack Engineer',
        skills: ['React', 'Node.js'],
        portfolioPublic: true,
      },
    });

    const res = await request(app).get(`/api/users/portfolio/${username}`);
    expect(res.status).toBe(200);
    expect(res.body.portfolio.fullName).toBe('Master Test Student');
    expect(res.body.portfolio.badges.length).toBeGreaterThan(0);
    expect(res.body.portfolio.email).toBeUndefined();
  });

  it('AI Recommendations and Assistant return structured data', async () => {
    const recRes = await request(app)
      .get('/api/ai/recommendations')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(recRes.status).toBe(200);
    expect(Array.isArray(recRes.body.recommendations)).toBe(true);

    const askRes = await request(app)
      .post('/api/ai/assistant')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ message: 'What hackathons are upcoming?' });
    expect(askRes.status).toBe(200);
    expect(askRes.body.reply).toBeDefined();
  });

  it('Attended student submits 5-star feedback and summary updates', async () => {
    const fbRes = await request(app)
      .post(`/api/feedback/events/${testEvent.id}/feedback`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        rating: 5,
        experience: 'EXCELLENT',
        organization: 5,
        speakerQuality: 5,
        wouldRecommend: true,
        comments: 'Outstanding hackathon organization!',
      });
    expect(fbRes.status).toBe(201);

    const summaryRes = await request(app).get(`/api/feedback/events/${testEvent.id}/feedback`);
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.summary.avgRating).toBe(5);
  });
});
