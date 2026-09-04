const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CampusConnect v3.1 Database Seeding...\n');

  // 1. Create or Find College (Tenant A)
  let college = await prisma.college.upsert({
    where: { email: 'admin@niet.edu' },
    update: {
      name: 'National Institute of Engineering & Technology',
      domain: 'niet.edu',
    },
    create: {
      name: 'National Institute of Engineering & Technology',
      code: 'MAIN',
      email: 'admin@niet.edu',
      domain: 'niet.edu',
      address: 'Knowledge Park II, Greater Noida',
    },
  });
  console.log('✅ Seeded Main Institution:', college.name);

  // 1b. Create Second College for Multi-Tenant Testing (Tenant B)
  const collegeB = await prisma.college.upsert({
    where: { email: 'admissions@stanford.edu' },
    update: {},
    create: {
      name: 'Stanford School of Engineering',
      code: 'STANFORD',
      email: 'admissions@stanford.edu',
      domain: 'stanford.edu',
      address: 'Stanford, California',
    },
  });
  console.log('✅ Seeded Secondary Institution:', collegeB.name);

  // Common Password Hash
  const hashedPassword = await bcrypt.hash('Password123!@#', 10);

  // 2. Seed SuperAdmin & Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@campusconnect.edu' },
    update: { isVerified: true, role: 'ADMIN', collegeId: college.id },
    create: {
      fullName: 'Dr. Rajesh Sharma (Dean)',
      email: 'admin@campusconnect.edu',
      username: 'deansharma',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      collegeId: college.id,
      department: 'Administration',
    },
  });
  console.log('✅ Seeded Admin User:', adminUser.email);

  // 3. Seed Faculty
  const facultyUser = await prisma.user.upsert({
    where: { email: 'faculty@campusconnect.edu' },
    update: { isVerified: true, role: 'FACULTY', collegeId: college.id },
    create: {
      fullName: 'Prof. Sunita Rao (HOD CS)',
      email: 'faculty@campusconnect.edu',
      username: 'profrao',
      password: hashedPassword,
      role: 'FACULTY',
      isVerified: true,
      department: 'Computer Science',
      collegeId: college.id,
    },
  });
  console.log('✅ Seeded Faculty User:', facultyUser.email);

  // 4. Seed Event Coordinator
  const coordUser = await prisma.user.upsert({
    where: { email: 'coordinator@campusconnect.edu' },
    update: { isVerified: true, role: 'EVENT_COORDINATOR', collegeId: college.id },
    create: {
      fullName: 'Vikram Malhotra (Lead Organizer)',
      email: 'coordinator@campusconnect.edu',
      username: 'vikramlead',
      password: hashedPassword,
      role: 'EVENT_COORDINATOR',
      isVerified: true,
      department: 'Information Technology',
      collegeId: college.id,
    },
  });
  console.log('✅ Seeded Coordinator User:', coordUser.email);

  // 5. Seed Flagship Student User
  const student = await prisma.user.upsert({
    where: { email: 'student@campusconnect.edu' },
    update: {
      collegeId: college.id,
      username: 'riteshpatil',
      xp: 550,
      level: 5,
      engagementScore: 87,
      streakDays: 7,
      portfolioPublic: true,
      privacyShowSkills: true,
      privacyShowCertificates: true,
      privacyShowAchievements: true,
      privacyShowEvents: true,
      privacyShowEmail: false,
      onboardingCompleted: true,
      interests: ['Artificial Intelligence', 'Web Development', 'Machine Learning', 'Leadership'],
      careerGoals: ['Internship Ready', 'Hackathon Winner', 'Verifiable Credentials'],
    },
    create: {
      fullName: 'Ritesh Patil',
      email: 'student@campusconnect.edu',
      username: 'riteshpatil',
      password: hashedPassword,
      role: 'STUDENT',
      department: 'Computer Science',
      year: 3,
      xp: 550,
      level: 5,
      engagementScore: 87,
      streakDays: 7,
      isVerified: true,
      collegeId: college.id,
      bio: 'Full Stack Engineer & AI Systems Builder. Developing production-grade campus ecosystems and distributed hackathon projects.',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Python', 'Machine Learning', 'Docker'],
      interests: ['Artificial Intelligence', 'Web Development', 'Machine Learning', 'Leadership'],
      careerGoals: ['Internship Ready', 'Hackathon Winner', 'Verifiable Credentials'],
      githubUrl: 'https://github.com/patilritesh2006-lgtm',
      linkedinUrl: 'https://linkedin.com',
    },
  });
  console.log('✅ Seeded Flagship Student:', student.username);

  // 6. Seed Default Achievements
  const achievementsList = [
    {
      code: 'FIRST_STEP',
      name: 'First Step',
      description: 'Attended your first verified campus event or workshop.',
      icon: 'Footprints',
      rarity: 'COMMON',
      xpReward: 50,
      criteriaType: 'ATTENDANCE_COUNT',
      criteriaValue: 1,
    },
    {
      code: 'TECH_EXPLORER',
      name: 'Technical Explorer',
      description: 'Attended 3 technical workshops across different technology domains.',
      icon: 'Compass',
      rarity: 'RARE',
      xpReward: 100,
      criteriaType: 'ATTENDANCE_COUNT',
      criteriaValue: 3,
    },
    {
      code: 'HACKATHON_HERO',
      name: 'Hackathon Hero',
      description: 'Participated and checked in to an official campus Hackathon.',
      icon: 'Trophy',
      rarity: 'EPIC',
      xpReward: 150,
      criteriaType: 'HACKATHON_COUNT',
      criteriaValue: 1,
    },
    {
      code: 'CREDENTIAL_HUNTER',
      name: 'Credential Hunter',
      description: 'Earned 2 or more cryptographically verified credentials.',
      icon: 'Award',
      rarity: 'EPIC',
      xpReward: 200,
      criteriaType: 'CERTIFICATE_COUNT',
      criteriaValue: 2,
    },
    {
      code: 'CAMPUS_LEGEND',
      name: 'Campus Legend',
      description: 'Demonstrated campus excellence by reaching Level 5 with 10+ verified events.',
      icon: 'Crown',
      rarity: 'LEGENDARY',
      xpReward: 500,
      criteriaType: 'ATTENDANCE_COUNT',
      criteriaValue: 10,
    },
  ];

  for (const ach of achievementsList) {
    const createdAch = await prisma.achievement.upsert({
      where: { code: ach.code },
      update: {},
      create: ach,
    });

    if (ach.code === 'FIRST_STEP' || ach.code === 'HACKATHON_HERO') {
      await prisma.studentAchievement.upsert({
        where: { userId_achievementId: { userId: student.id, achievementId: createdAch.id } },
        update: {},
        create: {
          userId: student.id,
          achievementId: createdAch.id,
          isVerified: true,
        },
      });
    }
  }
  console.log('✅ Seeded Achievements Catalog & Student Badges');

  // 7. Seed Skills & Verified Evidence for Student
  const skillList = [
    { name: 'Python', category: 'TECHNICAL' },
    { name: 'React', category: 'TECHNICAL' },
    { name: 'Machine Learning', category: 'TECHNICAL' },
    { name: 'Leadership', category: 'LEADERSHIP' },
  ];

  for (const sk of skillList) {
    const skill = await prisma.skill.upsert({
      where: { name: sk.name },
      update: {},
      create: { name: sk.name, category: sk.category, description: `Competency in ${sk.name}` },
    });

    const studentSkill = await prisma.studentSkill.upsert({
      where: { userId_skillId: { userId: student.id, skillId: skill.id } },
      update: { score: 88, proficiency: 'ADVANCED', evidenceCount: 3, isVerified: true },
      create: {
        userId: student.id,
        skillId: skill.id,
        score: 88,
        proficiency: 'ADVANCED',
        isVerified: true,
        evidenceCount: 3,
      },
    });

    await prisma.skillEvidence.createMany({
      data: [
        {
          studentSkillId: studentSkill.id,
          skillId: skill.id,
          sourceType: 'EVENT_ATTENDANCE',
          sourceTitle: `Annual Hackathon 2026 - ${sk.name} Track`,
          weightPoints: 20,
        },
      ],
      skipDuplicates: true,
    });
  }
  console.log('✅ Seeded Verified Skill Graph & Evidence Records');

  // 8. Seed Events
  const hackathon = await prisma.event.upsert({
    where: { id: 'evt-hackathon-2026' },
    update: {},
    create: {
      id: 'evt-hackathon-2026',
      title: 'Annual Campus Hackathon 2026',
      description: '36-hour hackathon bringing together students to solve real-world industry challenges.',
      venue: 'Innovation Hub Auditorium',
      category: 'Hackathon',
      capacity: 200,
      eventDate: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      collegeId: college.id,
      coordinatorId: coordUser.id,
    },
  });

  const aiWorkshop = await prisma.event.upsert({
    where: { id: 'evt-ai-workshop-2026' },
    update: {},
    create: {
      id: 'evt-ai-workshop-2026',
      title: 'Deep Learning & Agentic AI Workshop',
      description: 'Hands-on session on building autonomous multi-agent systems and fine-tuning LLMs.',
      venue: 'Computer Science Lab 3',
      category: 'Workshop',
      capacity: 80,
      eventDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      collegeId: college.id,
      coordinatorId: coordUser.id,
    },
  });
  console.log('✅ Seeded Events (Hackathon & AI Workshop)');

  // 9. Seed Registrations with Granular Roles & Verified Contributions
  await prisma.registration.upsert({
    where: { userId_eventId: { userId: student.id, eventId: aiWorkshop.id } },
    update: {
      attended: true,
      role: 'SPEAKER',
      contributionHours: 4.0,
      contributionNotes: 'Delivered technical keynote on LangChain & Agent Orchestration',
    },
    create: {
      userId: student.id,
      eventId: aiWorkshop.id,
      attended: true,
      role: 'SPEAKER',
      contributionHours: 4.0,
      contributionNotes: 'Delivered technical keynote on LangChain & Agent Orchestration',
      attendanceMarkedAt: new Date(),
      checkinMethod: 'QR_SCAN',
    },
  });

  await prisma.registration.upsert({
    where: { userId_eventId: { userId: student.id, eventId: hackathon.id } },
    update: {
      attended: true,
      role: 'WINNER',
      contributionHours: 36.0,
      contributionNotes: 'First place in Open Innovation track',
    },
    create: {
      userId: student.id,
      eventId: hackathon.id,
      attended: true,
      role: 'WINNER',
      contributionHours: 36.0,
      contributionNotes: 'First place in Open Innovation track',
      attendanceMarkedAt: new Date(),
      checkinMethod: 'QR_SCAN',
    },
  });
  console.log('✅ Seeded Verified Experience (Speaker & Winner Roles)');

  // 10. Seed Verifiable Cryptographic Credential
  const credSecret = process.env.JWT_SECRET || 'secret';
  const credId = 'CRED-2026-AI-ARCH-7F8A';
  const hashPayload = `${credId}:${student.id}:${college.id}:${new Date().toISOString()}:${credSecret}`;
  const cryptoHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

  await prisma.credential.upsert({
    where: { credentialId: credId },
    update: {},
    create: {
      credentialId: credId,
      collegeId: college.id,
      userId: student.id,
      eventId: aiWorkshop.id,
      title: 'Certified Agentic AI Systems Practitioner',
      description: 'Demonstrated practical competence in developing autonomous agents, vector embeddings, and LLM orchestration.',
      issuerName: 'CampusConnect AI Certification Board',
      cryptoHash,
      status: 'VALID',
    },
  });
  console.log('✅ Seeded Cryptographic Verifiable Credential:', credId);

  // 11. Seed Campus Clubs
  const codingClub = await prisma.club.upsert({
    where: { collegeId_code: { collegeId: college.id, code: 'GDSC' } },
    update: {},
    create: {
      collegeId: college.id,
      name: 'Google Developer Student Club',
      code: 'GDSC',
      description: 'Official campus developer chapter empowering students with modern web, cloud, and AI technologies.',
      category: 'TECHNICAL',
    },
  });

  await prisma.clubMember.upsert({
    where: { clubId_userId: { clubId: codingClub.id, userId: student.id } },
    update: { role: 'CLUB_COORDINATOR' },
    create: {
      clubId: codingClub.id,
      userId: student.id,
      role: 'CLUB_COORDINATOR',
    },
  });
  console.log('✅ Seeded Club & Coordinator Membership:', codingClub.name);

  // 12. Seed Suspicious Attendance Anomaly for Admin Fraud Console Demo
  await prisma.attendanceRisk.create({
    data: {
      userId: student.id,
      eventId: hackathon.id,
      riskScore: 78,
      riskLevel: 'HIGH',
      reason: 'QR token replay detected with multiple rapid failed attempts.',
      riskFactors: ['QR_REPLAY', 'MULTIPLE_ATTEMPTS'],
      deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      attemptCount: 3,
      reviewStatus: 'PENDING',
    },
  });
  console.log('✅ Seeded Attendance Anomaly for Fraud Console Demo');

  // 13. Seed Audit Log Entry
  await prisma.auditLog.create({
    data: {
      collegeId: college.id,
      actorId: adminUser.id,
      action: 'CREDENTIAL_ISSUED',
      entity: 'Credential',
      entityId: credId,
      metadata: { recipient: student.email, title: 'Certified Agentic AI Systems Practitioner' },
    },
  });
  console.log('✅ Seeded Institutional Audit Log');

  console.log('\n🎉 CampusConnect v3.1 Database Seeding Completed Successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });