const prisma = require("./config/prisma");
const bcrypt = require("bcrypt");

async function createAdmin() {
  try {
    console.log("=================================");
    console.log("      CREATE ADMIN USER");
    console.log("=================================");

    const email = "admin@campusconnect.com";
    const password = "Admin@123";
    const fullName = "CampusConnect Admin";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      console.log("---------------------------------");
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
      console.log("---------------------------------");

      await prisma.$disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await prisma.user.create({
      data: {
        fullName: fullName,
        email: email,
        password: hashedPassword,
        role: "ADMIN",
        collegeId: null,
      },
    });

    console.log("✅ ADMIN CREATED SUCCESSFULLY");
    console.log("---------------------------------");
    console.log("Name:", admin.fullName);
    console.log("Email:", admin.email);
    console.log("Password:", password);
    console.log("Role:", admin.role);
    console.log("---------------------------------");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ ERROR CREATING ADMIN");
    console.error(error);

    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();