import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const createClient = () => new PrismaClient({ log: ["error", "warn"] });

const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const ensurePrisma = () => prisma;

export { prisma, ensurePrisma };
