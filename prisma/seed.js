require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Create a default organization
  const defaultOrg = await prisma.organization.create({
    data: {
      name: 'Acme Clinic',
    },
  });

  console.log('Created Default Organization:', defaultOrg.id);

  // Create a default admin user
  const adminUser = await prisma.user.create({
    data: {
      organizationId: defaultOrg.id,
      email: 'admin@acmeclinic.com',
      name: 'Admin Doctor',
      passwordHash: 'hashed_password_placeholder',
    },
  });

  console.log('Created Admin User:', adminUser.id);

  // Create a few dummy patients
  const patients = await prisma.patient.createMany({
    data: [
      {
        organizationId: defaultOrg.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0101',
        dateOfBirth: new Date('1980-05-15'),
      },
      {
        organizationId: defaultOrg.id,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-0202',
        dateOfBirth: new Date('1992-11-20'),
      },
       {
        organizationId: defaultOrg.id,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.j@example.com',
        phone: '555-0303',
        dateOfBirth: new Date('1975-02-10'),
      }
    ],
  });

  console.log('Created Dummy Patients:', patients.count);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
