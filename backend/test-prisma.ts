import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        email: null,
        phone: "9999999999",
        passwordHash: "dummyhash",
        role: "FARMER",
        profile: {
          create: {
            firstName: "Test",
            lastName: "",
            phone: "9999999999",
            languagePref: "mr",
            district: "Nashik",
            taluka: null,
            village: null,
          },
        },
        farmer: { create: { cropTypes: "[]" } },
      },
    });
    console.log("Success:", user);
  } catch (e: any) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
