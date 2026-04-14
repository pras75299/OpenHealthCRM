require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { randomBytes, scryptSync } = require("crypto");

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

async function main() {
  console.log("Starting seed...");

  let defaultOrg = await prisma.organization.findFirst();
  if (!defaultOrg) {
    defaultOrg = await prisma.organization.create({
      data: {
        name: "Acme Clinic",
        timezone: "America/New_York",
        currency: "USD",
      },
    });
  }
  console.log("Organization:", defaultOrg.id);

  let doctorRole = await prisma.role.findFirst({
    where: { organizationId: defaultOrg.id, name: "Doctor" },
  });
  if (!doctorRole) {
    doctorRole = await prisma.role.create({
      data: {
        organizationId: defaultOrg.id,
        name: "Doctor",
      },
    });
  }

  let adminUser = await prisma.user.findFirst({
    where: { organizationId: defaultOrg.id },
  });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        organizationId: defaultOrg.id,
        email: "admin@acmeclinic.com",
        name: "Admin Doctor",
        passwordHash: hashPassword("admin123"),
      },
    });
  }

  const existingUr = await prisma.userRole.findFirst({
    where: { userId: adminUser.id, roleId: doctorRole.id },
  });
  if (!existingUr) {
    await prisma.userRole.create({
      data: { userId: adminUser.id, roleId: doctorRole.id },
    });
  }

  const permCount = await prisma.rolePermission.count({
    where: { roleId: doctorRole.id },
  });
  if (permCount === 0) {
    await prisma.rolePermission.createMany({
      data: [
        { roleId: doctorRole.id, action: "patients:read", resource: "patients" },
        { roleId: doctorRole.id, action: "patients:write", resource: "patients" },
        { roleId: doctorRole.id, action: "appointments:read", resource: "appointments" },
        { roleId: doctorRole.id, action: "appointments:write", resource: "appointments" },
        { roleId: doctorRole.id, action: "encounters:read", resource: "encounters" },
        { roleId: doctorRole.id, action: "encounters:write", resource: "encounters" },
        { roleId: doctorRole.id, action: "billing:read", resource: "billing" },
        { roleId: doctorRole.id, action: "billing:write", resource: "billing" },
      ],
    });
  }

  const roomCount = await prisma.room.count({
    where: { organizationId: defaultOrg.id },
  });
  if (roomCount === 0) {
    await prisma.room.createMany({
      data: [
        { organizationId: defaultOrg.id, name: "Operatory 1", type: "operatory" },
        { organizationId: defaultOrg.id, name: "Consultation Room A", type: "consultation" },
      ],
    });
  }

  const equipCount = await prisma.equipment.count({
    where: { organizationId: defaultOrg.id },
  });
  if (equipCount === 0) {
    await prisma.equipment.createMany({
      data: [
        { organizationId: defaultOrg.id, name: "X-Ray Machine 1", type: "xray" },
        { organizationId: defaultOrg.id, name: "ECG Monitor", type: "diagnostic" },
      ],
    });
  }

  const patientCount = await prisma.patient.count({
    where: { organizationId: defaultOrg.id },
  });
  if (patientCount === 0) {
    await prisma.patient.createMany({
      data: [
        {
          organizationId: defaultOrg.id,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "555-0101",
          mrn: "MRN-1001",
          passwordHash: hashPassword("patient123"),
          dateOfBirth: new Date("1980-05-15"),
        },
        {
          organizationId: defaultOrg.id,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "555-0202",
          mrn: "MRN-1002",
          passwordHash: hashPassword("patient123"),
          dateOfBirth: new Date("1992-11-20"),
        },
        {
          organizationId: defaultOrg.id,
          firstName: "Alice",
          lastName: "Johnson",
          email: "alice.j@example.com",
          phone: "555-0303",
          mrn: "MRN-1003",
          passwordHash: hashPassword("patient123"),
          dateOfBirth: new Date("1975-02-10"),
        },
      ],
    });
    console.log("Created 3 patients");
  } else {
    console.log("Patients already exist");
    await prisma.patient.updateMany({
      where: { organizationId: defaultOrg.id, passwordHash: null },
      data: { passwordHash: hashPassword("patient123") },
    });
  }
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
