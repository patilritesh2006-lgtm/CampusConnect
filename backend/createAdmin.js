const prisma = require('./config/prisma');
const bcrypt = require('bcrypt');

const createAdmin = async () => {
  try {
    console.log('========== CREATE ADMIN ==========');

    const email = 'admin@campusconnect.com';
    const password = 'admin123';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingAdmin) {
      console.log('Admin already exists.');
      console.log('Updating admin password and role...');

      const updatedAdmin = await prisma.user.update({
        where: {
          email,
        },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log('=================================');
      console.log('ADMIN UPDATED SUCCESSFULLY');
      console.log('Email:', updatedAdmin.email);
      console.log('Password:', password);
      console.log('Role:', updatedAdmin.role);
      console.log('=================================');

      return;
    }

    // Create new admin
    const admin = await prisma.user.create({
      data: {
        fullName: 'CampusConnect Admin',
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('=================================');
    console.log('ADMIN CREATED SUCCESSFULLY');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('Role:', admin.role);
    console.log('=================================');
  } catch (error) {
    console.error('========== CREATE ADMIN ERROR ==========');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();