const prisma = require('../config/prisma');

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL Database!');
  } catch (error) {
    console.error('❌ Database Connection Failed');
    console.error(error);
  }
}

connectDB();

module.exports = prisma;