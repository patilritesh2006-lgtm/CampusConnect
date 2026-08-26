const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CampusConnect Database Seeding...\n");

  // 1. Create or Find College
  let college = await prisma.college.findFirst();
  if (!college) {
    college = await prisma.college.create({
      data: {
        name: "National Institute of Engineering & Technology",
        email: "admin@niet.edu",
      },
    });
    console.log("✅ Created College:", college.name);
  }

  // Common Password Hash for Seed Accounts
  const hashedPassword = await bcrypt.hash("Password123!@#", 10);

  // 2. Seed SuperAdmin & Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@campusconnect.edu" },
    update: { isVerified: true, role: "ADMIN" },
    create: {
      fullName: "Dr. Rajesh Sharma (Dean)",
      email: "admin@campusconnect.edu",
      password: hashedPassword,
      role: "ADMIN",
      isVerified: true,
      collegeId: college.id,
    },
  });
  console.log("✅ Seeded Admin User:", adminUser.email);

  // 3. Seed Faculty
  const facultyUser = await prisma.user.upsert({
    where: { email: "faculty@campusconnect.edu" },
    update: { isVerified: true, role: "FACULTY" },
    create: {
      fullName: "Prof. Sunita Rao (HOD CS)",
      email: "faculty@campusconnect.edu",
      password: hashedPassword,
      role: "FACULTY",
      isVerified: true,
      department: "Computer Science",
      collegeId: college.id,
    },
  });
  console.log("✅ Seeded Faculty User:", facultyUser.email);

  // 4. Seed Event Coordinator
  const coordUser = await prisma.user.upsert({
    where: { email: "coordinator@campusconnect.edu" },
    update: { isVerified: true, role: "EVENT_COORDINATOR" },
    create: {
      fullName: "Vikram Malhotra (Lead Organizer)",
      email: "coordinator@campusconnect.edu",
      password: hashedPassword,
      role: "EVENT_COORDINATOR",
      isVerified: true,
      department: "Information Technology",
      collegeId: college.id,
    },
  });
  console.log("✅ Seeded Coordinator User:", coordUser.email);

  // 5. Seed Top Students with XP, Badges & Portfolios
  const studentsData = [
    {
      fullName: "Ritesh Patil",
      email: "student@campusconnect.edu",
      username: "riteshpatil",
      department: "Computer Science",
      year: 3,
      xp: 450,
      level: 5,
      bio: "Full Stack Engineer & AI Enthusiast. Building next-gen campus platforms and hackathon projects.",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "Python"],
      githubUrl: "https://github.com/patilritesh2006-lgtm",
      linkedinUrl: "https://linkedin.com",
    },
    {
      fullName: "Aarav Mehta",
      email: "aarav@campusconnect.edu",
      username: "aaravmehta",
      department: "Information Technology",
      year: 4,
      xp: 380,
      level: 4,
      bio: "Competitive programmer & Cloud Architect. President of the University Coding Club.",
      skills: ["Java", "AWS", "Kubernetes", "Algorithms", "Go"],
    },
    {
      fullName: "Priya Nair",
      email: "priya@campusconnect.edu",
      username: "priyanair",
      department: "Data Science",
      year: 2,
      xp: 310,
      level: 4,
      bio: "Machine Learning researcher passionate about NLP and Computer Vision.",
      skills: ["Python", "PyTorch", "Data Analysis", "SQL", "TensorFlow"],
    },
    {
      fullName: "Rohan Verma",
      email: "rohan@campusconnect.edu",
      username: "rohanverma",
      department: "Electronics & Comm",
      year: 3,
      xp: 220,
      level: 3,
      bio: "IoT Developer & Hardware Hacker. Building smart automated devices.",
      skills: ["C++", "Embedded Systems", "Arduino", "Raspberry Pi"],
    },
  ];

  const createdStudents = [];
  for (const s of studentsData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        fullName: s.fullName,
        username: s.username,
        department: s.department,
        year: s.year,
        xp: s.xp,
        level: s.level,
        bio: s.bio,
        skills: s.skills,
        githubUrl: s.githubUrl || null,
        linkedinUrl: s.linkedinUrl || null,
        portfolioPublic: true,
        isVerified: true,
      },
      create: {
        ...s,
        password: hashedPassword,
        role: "STUDENT",
        isVerified: true,
        portfolioPublic: true,
        collegeId: college.id,
      },
    });
    createdStudents.push(student);
  }
  console.log(`✅ Seeded ${createdStudents.length} Students with portfolios & XP.`);

  // 6. Seed Events
  const eventsData = [
    {
      title: "National Hackathon 2026",
      description: "36-hour non-stop hackathon tackling AI, Web3, and Green Energy challenges with prize pool of ₹1,00,000.",
      venue: "Main Campus Auditorium",
      category: "Hackathon",
      capacity: 150,
      eventDate: new Date(Date.now() + 5 * 86400000), // in 5 days
      status: "UPCOMING",
    },
    {
      title: "Generative AI & LLM Masterclass",
      description: "Hands-on workshop exploring prompt engineering, LangChain, RAG architecture, and fine-tuning with industry experts.",
      venue: "CS Seminar Hall 2",
      category: "Workshop",
      capacity: 80,
      eventDate: new Date(Date.now() + 10 * 86400000), // in 10 days
      status: "UPCOMING",
    },
    {
      title: "Cloud Native DevOps Bootcamp",
      description: "Comprehensive training on Docker containerization, CI/CD pipelines with GitHub Actions, and Kubernetes deployments.",
      venue: "Virtual Google Meet",
      category: "Bootcamp",
      capacity: 200,
      eventDate: new Date(Date.now() - 7 * 86400000), // 7 days ago
      status: "COMPLETED",
    },
  ];

  for (const e of eventsData) {
    let ev = await prisma.event.findFirst({ where: { title: e.title } });
    if (!ev) {
      ev = await prisma.event.create({
        data: {
          ...e,
          collegeId: college.id,
        },
      });
    }

    // Seed registrations & certificates for completed event
    if (ev.status === "COMPLETED") {
      for (const student of createdStudents) {
        const reg = await prisma.registration.upsert({
          where: {
            userId_eventId: { userId: student.id, eventId: ev.id },
          },
          update: { attended: true },
          create: {
            userId: student.id,
            eventId: ev.id,
            attended: true,
            attendanceMarkedAt: new Date(ev.eventDate),
            checkinMethod: "QR_SCAN",
          },
        });

        // Issue Certificate
        const certCode = `CC-2026-DEVOPS-${student.id.substring(0, 6).toUpperCase()}`;
        const existingCert = await prisma.certificate.findUnique({
          where: { certificateCode: certCode },
        });

        if (!existingCert) {
          await prisma.certificate.create({
            data: {
              certificateCode: certCode,
              userId: student.id,
              eventId: ev.id,
              registrationId: reg.id,
              issueDate: new Date(),
            },
          });
        }

        // Seed 5-star feedback
        const existingFeedback = await prisma.eventFeedback.findUnique({
          where: {
            userId_eventId: { userId: student.id, eventId: ev.id },
          },
        });

        if (!existingFeedback) {
          await prisma.eventFeedback.create({
            data: {
              userId: student.id,
              eventId: ev.id,
              rating: 5,
              experience: "EXCELLENT",
              organization: 5,
              speakerQuality: 5,
              wouldRecommend: true,
              comments: "Incredible hands-on session! Learned real-world DevOps practices.",
            },
          });
        }
      }
    } else {
      // Register students for upcoming event
      for (const student of createdStudents.slice(0, 3)) {
        await prisma.registration.upsert({
          where: {
            userId_eventId: { userId: student.id, eventId: ev.id },
          },
          update: {},
          create: {
            userId: student.id,
            eventId: ev.id,
            attended: false,
          },
        });
      }
    }
  }

  // 7. Seed Campus Announcements
  const announcements = [
    {
      title: "🎉 National Hackathon 2026 Registrations Open!",
      content: "Teams of 2-4 can now register for the National AI Hackathon. Free food, swag kits, and cash prizes!",
      category: "Event",
    },
    {
      title: "📜 Digital Certificates Now Available for DevOps Bootcamp",
      content: "All attendees of the Cloud Native DevOps Bootcamp can now download their verified certificates with QR authentication.",
      category: "Academic",
    },
  ];

  for (const ann of announcements) {
    const existing = await prisma.announcement.findFirst({ where: { title: ann.title } });
    if (!existing) {
      await prisma.announcement.create({
        data: {
          title: ann.title,
          content: ann.content,
          category: ann.category,
          priority: "HIGH",
        },
      });
    }
  }

  console.log("\n🎉 Database Seeding Completed Successfully!");
  console.log("--------------------------------------------------");
  console.log("🔑 Demo Credentials (Password: Password123!@# for all):");
  console.log("• Admin       : admin@campusconnect.edu");
  console.log("• Faculty     : faculty@campusconnect.edu");
  console.log("• Coordinator : coordinator@campusconnect.edu");
  console.log("• Student     : student@campusconnect.edu (Username: riteshpatil)");
  console.log("--------------------------------------------------\n");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
